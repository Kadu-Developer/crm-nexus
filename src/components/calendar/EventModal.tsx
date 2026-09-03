'use client';

import React, { useState, useEffect } from 'react';
import { CalendarEvent, CollaboratorAccount, CalendarCategory } from '@/types/calendar';
import { Opportunity } from '@/types/crm';
import { X, Calendar, Clock, Video, Flame, Users, Repeat, Sparkles, Check, Lock } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/lib/supabase/auth-context';

interface EventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (event: Partial<CalendarEvent>) => void;
  onDelete?: (eventId: string) => void;
  initialEvent?: Partial<CalendarEvent> | null;
  accounts: CollaboratorAccount[];
  categories: CalendarCategory[];
  opportunities?: Opportunity[];
  isAdmin?: boolean;
  currentCollaboratorId?: string | null;
}

export function EventModal({
  isOpen,
  onClose,
  onSave,
  onDelete,
  initialEvent,
  accounts,
  categories,
  opportunities = [],
  isAdmin = false,
  currentCollaboratorId,
}: EventModalProps) {
  const { profile } = useAuth();
  const isUserAdmin = isAdmin || profile?.role === 'admin_ceo' || profile?.role === 'admin_tech' || profile?.role?.startsWith('admin');

  // Identifica a conta do usuário logado
  const effectiveCollabId = currentCollaboratorId || accounts.find(
    (a) =>
      a.id === profile?.id ||
      a.email?.toLowerCase() === profile?.email?.toLowerCase() ||
      a.name?.toLowerCase() === profile?.name?.toLowerCase()
  )?.id || 'collab_carlos';

  const myAccount = accounts.find((a) => a.id === effectiveCollabId) || accounts[0];

  const [title, setTitle] = useState('');
  const [collaboratorName, setCollaboratorName] = useState('');
  const [description, setDescription] = useState('');
  const [collaboratorId, setCollaboratorId] = useState<string>(myAccount?.id || accounts[0]?.id || 'collab_carlos');
  const [additionalCollaboratorIds, setAdditionalCollaboratorIds] = useState<string[]>([]);
  const [categoryId, setCategoryId] = useState('tech_alignment');
  const [dateStr, setDateStr] = useState('');
  const [startTimeStr, setStartTimeStr] = useState('09:00');
  const [endTimeStr, setEndTimeStr] = useState('10:00');
  const [meetUrl, setMeetUrl] = useState('');
  const [recurrence, setRecurrence] = useState<'none' | 'daily' | 'weekly' | 'monthly'>('none');
  const [linkedOpportunityId, setLinkedOpportunityId] = useState<string>('');

  // Quando o colaborador muda, se não for admin, mantém travado
  const handleCollaboratorChange = (id: string) => {
    if (!isUserAdmin) return;
    setCollaboratorId(id);
    const acc = accounts.find((a) => a.id === id);
    const name = acc?.name || '';
    const cleaned = title.replace(/^[^\s:]+:\s*/, '').trim();
    setTitle(name ? `${name}: ${cleaned}` : cleaned);
  };

  useEffect(() => {
    if (isOpen) {
      if (initialEvent) {
        setTitle(initialEvent.title || '');
        setDescription(initialEvent.description || '');
        // Se não for admin, mantém o responsável original ou a conta própria
        const defaultCollab = isUserAdmin
          ? (initialEvent.collaboratorId || initialEvent.ctoId || myAccount?.id || accounts[0]?.id)
          : (initialEvent.collaboratorId || myAccount?.id || accounts[0]?.id);
        setCollaboratorId(defaultCollab);
        setAdditionalCollaboratorIds(initialEvent.additionalCollaboratorIds || []);
        setCategoryId(initialEvent.categoryId || 'tech_alignment');
        setMeetUrl(initialEvent.meetUrl || '');
        setRecurrence(initialEvent.recurrence || 'none');
        setLinkedOpportunityId(initialEvent.linkedOpportunityId || '');

        if (initialEvent.startTime) {
          const s = new Date(initialEvent.startTime);
          setDateStr(s.toISOString().split('T')[0]);
          setStartTimeStr(`${String(s.getHours()).padStart(2, '0')}:${String(s.getMinutes()).padStart(2, '0')}`);
        } else {
          setDateStr(new Date().toISOString().split('T')[0]);
          setStartTimeStr('09:00');
        }

        if (initialEvent.endTime) {
          const e = new Date(initialEvent.endTime);
          setEndTimeStr(`${String(e.getHours()).padStart(2, '0')}:${String(e.getMinutes()).padStart(2, '0')}`);
        } else {
          setEndTimeStr('10:00');
        }
      } else {
        setTitle('');
        setDescription('');
        // Para novos eventos, se não for admin, o responsável SEMPRE é o criador logado
        const initialCollabId = isUserAdmin ? (accounts[0]?.id || 'collab_carlos') : (myAccount?.id || accounts[0]?.id);
        setCollaboratorId(initialCollabId);
        setAdditionalCollaboratorIds([]);
        if (!isUserAdmin) {
          const name = myAccount?.name || accounts[0]?.name || '';
          setCollaboratorName(name);
          setTitle(name ? `${name}: ` : '');
        }
        setCategoryId('tech_alignment');
        setDateStr(new Date().toISOString().split('T')[0]);
        setStartTimeStr('09:00');
        setEndTimeStr('10:00');
        setMeetUrl(`https://meet.google.com/nex-${Math.random().toString(36).substr(2, 6)}`);
        setRecurrence('none');
        setLinkedOpportunityId('');
      }
    }
  }, [isOpen, initialEvent, accounts, profile, isUserAdmin, myAccount]);

  if (!isOpen) return null;

  const handleGenerateMeet = () => {
    const code = Math.random().toString(36).substring(2, 5) + '-' + Math.random().toString(36).substring(2, 6) + '-' + Math.random().toString(36).substring(2, 5);
    setMeetUrl(`https://meet.google.com/${code}`);
    toast.success('Link do Google Meet gerado com sucesso!');
  };

  const handleToggleAdditionalCollab = (id: string) => {
    setAdditionalCollaboratorIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      toast.error('Informe o título do evento');
      return;
    }

    if (!dateStr || !startTimeStr || !endTimeStr) {
      toast.error('Informe data e horários válidos');
      return;
    }

    // Se for edição, somente o proprietário do evento pode modificar
    if (initialEvent?.id && initialEvent.collaboratorId && initialEvent.collaboratorId !== effectiveCollabId) {
      toast.error('Somente o proprietário deste evento pode alterá-lo.');
      return;
    }

    const [startH, startM] = startTimeStr.split(':').map(Number);
    const [endH, endM] = endTimeStr.split(':').map(Number);
    const [year, month, day] = dateStr.split('-').map(Number);

    const start = new Date(year, month - 1, day, startH, startM, 0, 0);
    const end = new Date(year, month - 1, day, endH, endM, 0, 0);

    if (end <= start) {
      toast.error('O horário de término deve ser posterior ao horário de início');
      return;
    }

    const selectedOpp = opportunities.find((o) => o.id === linkedOpportunityId);

    // Admin pode enviar o título livremente.
    // Consultor: o prefixo "Nome: " é gerado pelo CalendarModule ao salvar.
    let finalTitle = title.trim();
    if (!isAdmin && collaboratorName) {
      finalTitle = finalTitle.replace(new RegExp(`^${collaboratorName}:\\s*`), '').trim();
    }

    const eventPayload: Partial<CalendarEvent> = {
      id: initialEvent?.id,
      title: finalTitle,
      description: description.trim(),
      collaboratorId: initialEvent?.id ? (initialEvent.collaboratorId || effectiveCollabId) : effectiveCollabId,
      ctoId: initialEvent?.id ? (initialEvent.collaboratorId || effectiveCollabId) : effectiveCollabId,
      additionalCollaboratorIds,
      categoryId,
      startTime: start.toISOString(),
      endTime: end.toISOString(),
      meetUrl: meetUrl.trim() || undefined,
      recurrence,
      linkedOpportunityId: linkedOpportunityId || undefined,
      opportunityTitle: selectedOpp?.title,
      opportunityCompanyName: selectedOpp?.tradeName || selectedOpp?.companyName,
      opportunityScore: selectedOpp?.score,
      stageTitle: selectedOpp?.stage,
      source: initialEvent?.source || 'google_calendar',
      status: initialEvent?.status || 'confirmed',
    };

    onSave(eventPayload);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-950/40">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-600 dark:text-cyan-400 flex items-center justify-center font-bold">
              <Calendar className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-black text-slate-900 dark:text-white">
                {initialEvent?.id ? 'Editar Reunião / Compromisso' : 'Agendar Novo Evento da Equipe'}
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Sincronizado diretamente com o Google Workspace & CRM
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Formulário */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 overflow-y-auto flex-1 text-xs">
          {/* Título */}
          <div className="space-y-1">
            <label className="block font-bold text-slate-700 dark:text-slate-300">
              Título do Evento *
            </label>
            <input
              type="text"
              required
              placeholder="Ex: Pré-Diagnóstico Técnico ou Alinhamento Comercial"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Seleção do Colaborador Responsável */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="block font-bold text-slate-700 dark:text-slate-300">
                Agenda Principal do Evento *
              </label>
              <span className="text-[10px] text-blue-600 dark:text-cyan-400 font-bold flex items-center gap-1 bg-blue-500/10 px-2 py-0.5 rounded-full border border-blue-500/20">
                <Lock className="w-3 h-3" /> Sua Agenda
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2 max-h-36 overflow-y-auto pr-1">
              {accounts.map((acc) => {
                const isMine = acc.id === effectiveCollabId;
                return (
                  <button
                    key={acc.id}
                    type="button"
                    disabled={!isMine}
                    onClick={() => setCollaboratorId(acc.id)}
                    className={`p-2 rounded-xl border text-left flex items-center gap-2 transition ${
                      !isMine ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'
                    } ${
                      collaboratorId === acc.id
                        ? 'border-blue-500 bg-blue-50/70 dark:bg-blue-950/40 text-blue-900 dark:text-blue-200 font-bold ring-1 ring-blue-500/30'
                        : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/30 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                  <div
                    className="w-5 h-5 rounded-full flex items-center justify-center text-[8px] font-black text-white shrink-0"
                    style={{ backgroundColor: acc.color }}
                  >
                    {acc.avatar}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[11px] leading-tight font-bold">{acc.name}</p>
                    <p className="truncate text-[9px] opacity-70">{acc.roleTitle}</p>
                  </div>
                </button>
              );
            })}
          </div>
            {!isUserAdmin && (
              <p className="text-[10px] text-slate-500 dark:text-slate-400 italic">
                ℹ️ O criador do evento é definido automaticamente como responsável principal. Apenas Administradores podem selecionar outro colaborador.
              </p>
            )}
          </div>

          {/* Outros Membros da Equipe Participando */}
          <div className="space-y-1">
            <label className="block font-bold text-slate-700 dark:text-slate-300">
              Co-anfitriões / Membros Adicionais
            </label>
            <div className="flex items-center gap-1.5 flex-wrap">
              {accounts
                .filter((a) => a.id !== collaboratorId)
                .map((acc) => {
                  const isChecked = additionalCollaboratorIds.includes(acc.id);
                  return (
                    <button
                      key={acc.id}
                      type="button"
                      onClick={() => handleToggleAdditionalCollab(acc.id)}
                      className={`px-2 py-1 rounded-lg border text-[11px] font-semibold flex items-center gap-1.5 transition cursor-pointer ${
                        isChecked
                          ? 'border-blue-500 bg-blue-500/10 text-blue-700 dark:text-cyan-300'
                          : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                    >
                      <div
                        className="w-3 h-3 rounded-full text-white flex items-center justify-center text-[7px] font-black"
                        style={{ backgroundColor: acc.color }}
                      >
                        {acc.avatar}
                      </div>
                      <span>{acc.name.split(' ')[0]}</span>
                    </button>
                  );
                })}
            </div>
          </div>

          {/* Categoria */}
          <div className="space-y-1">
            <label className="block font-bold text-slate-700 dark:text-slate-300">
              Categoria do Calendário
            </label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
            >
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          {/* Data e Horários */}
          <div className="grid grid-cols-3 gap-2">
            <div className="space-y-1">
              <label className="block font-bold text-slate-700 dark:text-slate-300">
                Data
              </label>
              <input
                type="date"
                required
                value={dateStr}
                onChange={(e) => setDateStr(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl px-2.5 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
              />
            </div>
            <div className="space-y-1">
              <label className="block font-bold text-slate-700 dark:text-slate-300">
                Início
              </label>
              <input
                type="time"
                required
                value={startTimeStr}
                onChange={(e) => setStartTimeStr(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl px-2.5 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 font-mono"
              />
            </div>
            <div className="space-y-1">
              <label className="block font-bold text-slate-700 dark:text-slate-300">
                Término
              </label>
              <input
                type="time"
                required
                value={endTimeStr}
                onChange={(e) => setEndTimeStr(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl px-2.5 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 font-mono"
              />
            </div>
          </div>

          {/* Vínculo com Lead do CRM */}
          <div className="space-y-1">
            <label className="flex items-center gap-1 font-bold text-slate-700 dark:text-slate-300">
              <Flame className="w-3.5 h-3.5 text-amber-500" />
              <span>Vincular a Lead / Oportunidade do CRM (Opcional)</span>
            </label>
            <select
              value={linkedOpportunityId}
              onChange={(e) => setLinkedOpportunityId(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
            >
              <option value="">Nenhum lead vinculado</option>
              {opportunities.map((opp) => (
                <option key={opp.id} value={opp.id}>
                  {opp.tradeName || opp.companyName} (Score: {opp.score} pts • {opp.stage})
                </option>
              ))}
            </select>
          </div>

          {/* Google Meet Link */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-1 font-bold text-slate-700 dark:text-slate-300">
                <Video className="w-3.5 h-3.5 text-blue-500" />
                <span>Link do Google Meet</span>
              </label>
              <button
                type="button"
                onClick={handleGenerateMeet}
                className="text-[10px] text-blue-600 dark:text-cyan-400 font-bold hover:underline cursor-pointer"
              >
                + Gerar Novo Link
              </button>
            </div>
            <input
              type="url"
              placeholder="https://meet.google.com/abc-defg-hij"
              value={meetUrl}
              onChange={(e) => setMeetUrl(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-blue-500 font-mono"
            />
          </div>

          {/* Descrição */}
          <div className="space-y-1">
            <label className="block font-bold text-slate-700 dark:text-slate-300">
              Descrição / Pauta da Reunião
            </label>
            <textarea
              rows={2}
              placeholder="Detalhes, objetivos e pauta da reunião..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-blue-500 resize-none"
            />
          </div>

          {/* Rodapé e Botões */}
          <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3">
            {initialEvent?.id && onDelete ? (
              <button
                type="button"
                onClick={() => {
                  if (confirm('Deseja realmente remover este evento da agenda?')) {
                    onDelete(initialEvent.id!);
                    onClose();
                  }
                }}
                className="px-3 py-2 rounded-xl text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-xs font-bold transition cursor-pointer"
              >
                Excluir
              </button>
            ) : <div />}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 transition cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-md shadow-blue-500/25 transition cursor-pointer active:scale-95"
              >
                {initialEvent?.id ? 'Salvar Alterações' : 'Agendar Compromisso'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
