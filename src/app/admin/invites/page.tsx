'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import { useAuth } from '@/lib/supabase/auth-context';
import { useRouter } from 'next/navigation';
import { Toaster, toast } from 'sonner';
import {
  UserPlus,
  Mail,
  Copy,
  Trash2,
  RefreshCw,
  CheckCircle,
  XCircle,
  Loader2,
  Clock,
  Plus,
} from 'lucide-react';

export default function AdminInvitesPage() {
  const { profile } = useAuth();
  const router = useRouter();
  const [invites, setInvites] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [newEmail, setNewEmail] = useState('');

  const isAdmin = profile?.role === 'admin_ceo' || profile?.role === 'admin_tech';

  useEffect(() => {
    if (!profile) return;
    if (!isAdmin) {
      router.push('/');
      return;
    }
    fetchInvites();
  }, [profile, isAdmin, router]);

  const fetchInvites = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('invitations')
        .select(`
          *,
          invited_by_profile:profiles!invitations_invited_by_fkey (name)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setInvites(data || []);
    } catch (err: any) {
      toast.error('Erro ao carregar convites');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail.trim()) return;

    setGenerating(true);
    try {
      const token = crypto.randomUUID();
      const { error } = await supabase
        .from('invitations')
        .insert({
          email: newEmail.trim().toLowerCase(),
          token,
          invited_by: profile?.id,
          role: 'consultant',
          status: 'pending'
        });

      if (error) throw error;

      toast.success('Convite gerado com sucesso!');
      setNewEmail('');
      fetchInvites();

      const inviteLink = `${window.location.origin}/register?token=${token}`;
      navigator.clipboard.writeText(inviteLink);
      toast.info('Link de convite copiado para a área de transferência');
    } catch (err: any) {
      toast.error('Erro ao gerar convite: ' + err.message);
    } finally {
      setGenerating(false);
    }
  };

  const handleDeleteInvite = async (id: string) => {
    if (!confirm('Deseja realmente excluir este convite?')) return;

    try {
      const { error } = await supabase
        .from('invitations')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success('Convite excluído');
      fetchInvites();
    } catch (err: any) {
      toast.error('Erro ao excluir convite');
    }
  };

  const copyToClipboard = (token: string) => {
    const inviteLink = `${window.location.origin}/register?token=${token}`;
    navigator.clipboard.writeText(inviteLink);
    toast.success('Link copiado!');
  };

  if (!profile || !isAdmin) return null;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-4 sm:p-8">
      <Toaster position="top-right" richColors />
      <div className="max-w-5xl mx-auto space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <UserPlus className="h-6 w-6 text-blue-600" />
              Gestão de Convites
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1">
              Crie links de acesso para novos consultores
            </p>
          </div>
        </div>

        {/* Form para novo convite */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm">
          <form onSubmit={handleCreateInvite} className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                E-mail do Consultor
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="email"
                  required
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="consultor@exemplo.com"
                  className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm"
                />
              </div>
            </div>
            <div className="flex items-end">
              <button
                type="submit"
                disabled={generating}
                className="w-full sm:w-auto px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2 text-sm"
              >
                {generating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                Gerar Convite
              </button>
            </div>
          </form>
        </div>

        {/* Lista de convites */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <h2 className="font-bold text-slate-900 dark:text-white">Convites Enviados</h2>
            <button onClick={fetchInvites} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
              <RefreshCw className={`h-4 w-4 text-slate-500 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-950/50 text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider font-bold">
                  <th className="px-6 py-3 border-b border-slate-200 dark:border-slate-800">E-mail</th>
                  <th className="px-6 py-3 border-b border-slate-200 dark:border-slate-800">Status</th>
                  <th className="px-6 py-3 border-b border-slate-200 dark:border-slate-800">Criado por</th>
                  <th className="px-6 py-3 border-b border-slate-200 dark:border-slate-800 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {invites.length === 0 && !loading ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-8 text-center text-slate-500">
                      Nenhum convite encontrado.
                    </td>
                  </tr>
                ) : (
                  invites.map((invite) => (
                    <tr key={invite.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 font-medium text-slate-900 dark:text-white">
                        {invite.email}
                      </td>
                      <td className="px-6 py-4 border-b border-slate-200 dark:border-slate-800">
                        {invite.status === 'pending' ? (
                          <span className="flex items-center gap-1.5 text-amber-600 bg-amber-50 dark:bg-amber-900/20 px-2 py-1 rounded-md text-xs font-bold w-fit">
                            <Clock className="h-3 w-3" /> Pendente
                          </span>
                        ) : invite.status === 'accepted' ? (
                          <span className="flex items-center gap-1.5 text-green-600 bg-green-50 dark:bg-green-900/20 px-2 py-1 rounded-md text-xs font-bold w-fit">
                            <CheckCircle className="h-3 w-3" /> Aceito
                          </span>
                        ) : (
                          <span className="flex items-center gap-1.5 text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-md text-xs font-bold w-fit">
                            <XCircle className="h-3 w-3" /> Cancelado
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 text-slate-500">
                        {invite.invited_by_profile?.name || 'Sistema'}
                      </td>
                      <td className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {invite.status === 'pending' && (
                            <button
                              onClick={() => copyToClipboard(invite.token)}
                              className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                              title="Copiar Link"
                            >
                              <Copy className="h-4 w-4" />
                            </button>
                          )}
                          <button
                            onClick={() => handleDeleteInvite(invite.id)}
                            className="p-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg transition-colors"
                            title="Excluir Convite"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
