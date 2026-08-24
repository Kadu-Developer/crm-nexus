import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';

export async function GET() {
  try {
    const { data: profiles, error } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: true });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ profiles });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      name,
      email,
      role = 'consultant',
      department = 'comercial',
      roleTitle = 'Consultor Comercial',
      tempPassword = 'Nexus@2026',
      color = '#0284c7',
    } = body;

    if (!name || !email) {
      return NextResponse.json({ error: 'Nome e e-mail são obrigatórios.' }, { status: 400 });
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanName = name.trim();
    const initials = cleanName
      .split(' ')
      .map((n: string) => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();

    let createdUserId = '';

    // 1. Cria usuário no Supabase Auth com senha provisória e confirmação de e-mail automática
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: cleanEmail,
      password: tempPassword,
      email_confirm: true,
      user_metadata: {
        name: cleanName,
        role,
        department,
        must_change_password: true,
      },
    });

    if (authError) {
      // Se o usuário já existir no Auth, tentamos buscar o ID dele
      if (authError.message.includes('already been registered') || authError.message.includes('already exists')) {
        const { data: listData } = await supabaseAdmin.auth.admin.listUsers();
        const existing = listData.users.find((u) => u.email?.toLowerCase() === cleanEmail);
        if (existing) {
          createdUserId = existing.id;
          // Reseta a senha provisória e marca must_change_password
          await supabaseAdmin.auth.admin.updateUserById(existing.id, {
            password: tempPassword,
            user_metadata: { name: cleanName, role, department, must_change_password: true },
          });
        }
      } else {
        console.warn('Erro ao criar usuário no Supabase Auth:', authError.message);
      }
    } else if (authData.user) {
      createdUserId = authData.user.id;
    }

    // 2. Cria ou atualiza o perfil na tabela `profiles`
    if (createdUserId) {
      await supabaseAdmin.from('profiles').upsert({
        id: createdUserId,
        name: cleanName,
        email: cleanEmail,
        role,
        must_change_password: true,
        updated_at: new Date().toISOString(),
      });
    }

    // 3. Cadastra na tabela `calendar_collaborators` para integração com Google Workspace
    const collabId = `collab_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`;
    await supabaseAdmin.from('calendar_collaborators').upsert({
      id: collabId,
      profile_id: createdUserId || null,
      name: cleanName,
      email: cleanEmail,
      role_title: roleTitle,
      department,
      avatar: initials || 'N',
      color,
      google_calendar_id: cleanEmail,
      google_connected: true,
      sync_status: 'synced',
      is_visible: true,
      last_sync_at: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      message: `Colaborador ${cleanName} cadastrado com sucesso!`,
      collaborator: {
        id: collabId,
        userId: createdUserId,
        name: cleanName,
        email: cleanEmail,
        role,
        department,
        roleTitle,
        tempPassword,
        avatar: initials,
        color,
        mustChangePassword: true,
      },
    });
  } catch (err: any) {
    console.error('Erro na criação de colaborador:', err);
    return NextResponse.json({ error: 'Erro interno ao cadastrar colaborador.', details: err.message }, { status: 500 });
  }
}
