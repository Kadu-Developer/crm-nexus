'use client';

import React from 'react';
import { CalendarEvent, CollaboratorAccount, CalendarCategory } from '@/types/calendar';
import { X, Calendar, Clock, Video, Flame, Users, Repeat, MapPin, Edit3, Trash2, ExternalLink, ArrowRight, UserCheck } from 'lucide-react';

interface EventDetailModalProps {
  event: CalendarEvent | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (event: CalendarEvent) => void;
  onDelete: (eventId: string) => void;
  onOpenOpportunity?: (opportunityId: string) => void;
  accounts: CollaboratorAccount[];
  categories: CalendarCategory[];
}

export function EventDetailModal({
  event,
  isOpen,
  onClose,
  onEdit,
  onDelete,
  onOpenOpportunity,
  accounts,
  categories,
}: EventDetailModalProps) {
  if (!isOpen || !event) return null;

  const start = new Date(event.startTime);
  const end = new Date(event.endTime);

  const formattedDate = start.toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });

  const formattedTime = `${String(start.getHours()).padStart(2, '0')}:${String(start.getMinutes()).padStart(2, '0')} - ${String(end.getHours()).padStart(2, '0')}:${String(end.getMinutes()).padStart(2, '0')}`;

  const getCollabInfo = (collabId?: string) => {
    if (!collabId || collabId === 'all_team' || collabId === 'both') {
      return { name: 'Toda a Equipe', color: '#0284c7', avatar: 'ALL', roleTitle: 'Geral' };
    }
    const found = accounts.find((a) => a.id === collabId || a.id.includes(collabId) || collabId.includes(a.id));
    return found || { name: 'Colaborador', color: '#6366f1', avatar: 'N', roleTitle: 'Membro' };
  };

  const getCategoryInfo = (catId: string) => {
    return categories.find((c) => c.id === catId) || categories[0];
  };

  const collab = getCollabInfo(event.collaboratorId || event.ctoId);
  const cat = getCategoryInfo(event.categoryId);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header com gradiente */}
        <div
          className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-start justify-between relative"
          style={{
            background: `linear-gradient(to right, ${collab.color}15, transparent)`,
          }}
        >
          <div className="space-y-1 pr-6 min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span
                className="text-[10px] font-bold px-2 py-0.5 rounded-md text-white shadow-xs"
                style={{ backgroundColor: collab.color }}
              >
                {collab.name}
              </span>
              <span
                className="text-[10px] font-semibold px-2 py-0.5 rounded-md"
                style={{
                  backgroundColor: `${cat.color}20`,
                  color: cat.color,
                }}
              >
                {cat.name}
              </span>
              {event.source === 'google_calendar' && (
                <span className="text-[10px] text-slate-500 flex items-center gap-1 font-mono">
                  <svg className="w-2.5 h-2.5 inline" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  </svg>
                  Google Workspace
                </span>
              )}
            </div>

            <h2 className="text-base font-black text-slate-900 dark:text-white leading-snug">
              {event.title}
            </h2>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Conteúdo */}
        <div className="p-5 space-y-4 overflow-y-auto flex-1 text-xs">
          {/* Horário & Data */}
          <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60">
            <Calendar className="w-4 h-4 text-blue-500 shrink-0" />
            <div>
              <p className="font-bold text-slate-800 dark:text-slate-200 capitalize">
                {formattedDate}
              </p>
              <p className="text-[11px] font-mono text-slate-500 dark:text-slate-400">
                {formattedTime} (GMT-3)
              </p>
            </div>
          </div>

          {/* Botão de Ação Google Meet */}
          {event.meetUrl && (
            <div className="p-3 rounded-xl bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/80 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                  <Video className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <p className="font-bold text-blue-900 dark:text-blue-200 truncate">
                    Google Meet
                  </p>
                  <p className="text-[11px] font-mono text-blue-600 dark:text-blue-400 truncate">
                    {event.meetUrl}
                  </p>
                </div>
              </div>

              <a
                href={event.meetUrl}
                target="_blank"
                rel="noreferrer"
                className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-1.5 shrink-0 transition shadow-xs"
              >
                <span>Entrar</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          )}

          {/* Card Lead CRM Vinculado */}
          {event.opportunityCompanyName && (
            <div className="p-3.5 rounded-xl bg-gradient-to-r from-amber-500/10 to-orange-500/5 dark:from-amber-950/30 dark:to-orange-950/10 border border-amber-500/30 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 font-bold text-amber-800 dark:text-amber-300">
                  <Flame className="w-4 h-4 text-amber-500" />
                  <span>Lead Vinculado no CRM Nexus</span>
                </div>
                {event.opportunityScore && (
                  <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-800 dark:text-amber-300 font-mono font-bold text-[10px]">
                    🔥 {event.opportunityScore} pts
                  </span>
                )}
              </div>

              <div>
                <p className="font-black text-sm text-slate-900 dark:text-white">
                  {event.opportunityCompanyName}
                </p>
                {event.opportunityTitle && (
                  <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5">
                    {event.opportunityTitle}
                  </p>
                )}
              </div>

              {event.linkedOpportunityId && onOpenOpportunity && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenOpportunity(event.linkedOpportunityId!);
                  }}
                  className="w-full mt-1 py-1.5 px-3 rounded-lg bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition shadow-xs cursor-pointer"
                >
                  <span>Abrir Ficha Completa do Lead no CRM</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          )}

          {/* Descrição / Pauta */}
          {event.description && (
            <div className="space-y-1">
              <span className="font-bold text-slate-700 dark:text-slate-300">
                Pauta & Observações:
              </span>
              <p className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
                {event.description}
              </p>
            </div>
          )}

          {/* Outros Membros Participantes */}
          {event.additionalCollaboratorIds && event.additionalCollaboratorIds.length > 0 && (
            <div className="space-y-1.5">
              <span className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                <UserCheck className="w-3.5 h-3.5 text-blue-500" />
                <span>Membros da Equipe Presentes</span>
              </span>
              <div className="flex items-center gap-1.5 flex-wrap">
                {event.additionalCollaboratorIds.map((collabId) => {
                  const info = getCollabInfo(collabId);
                  return (
                    <div
                      key={collabId}
                      className="px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 flex items-center gap-1.5"
                    >
                      <div
                        className="w-3.5 h-3.5 rounded-full text-white flex items-center justify-center text-[7px] font-black"
                        style={{ backgroundColor: info.color }}
                      >
                        {info.avatar}
                      </div>
                      <span className="font-bold text-slate-800 dark:text-slate-200">{info.name}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Participantes Externos */}
          {event.attendees && event.attendees.length > 0 && (
            <div className="space-y-1.5">
              <span className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                <Users className="w-3.5 h-3.5 text-slate-400" />
                <span>Participantes ({event.attendees.length})</span>
              </span>
              <div className="space-y-1">
                {event.attendees.map((att, idx) => (
                  <div
                    key={idx}
                    className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800 flex items-center justify-between"
                  >
                    <div>
                      <p className="font-bold text-slate-900 dark:text-slate-100">
                        {att.name}
                      </p>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">
                        {att.email}
                      </p>
                    </div>
                    {att.role && (
                      <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 px-1.5 py-0.5 bg-slate-200/60 dark:bg-slate-700/60 rounded">
                        {att.role}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Rodapé de Ações */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-950/40">
          <button
            type="button"
            onClick={() => {
              if (confirm('Tem certeza que deseja cancelar e excluir esta reunião?')) {
                onDelete(event.id);
                onClose();
              }
            }}
            className="flex items-center gap-1 text-rose-600 dark:text-rose-400 hover:text-rose-700 font-bold px-2 py-1.5 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 transition cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Excluir</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                onClose();
                onEdit(event);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 font-bold text-xs transition cursor-pointer"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Editar</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition cursor-pointer"
            >
              Fechar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
