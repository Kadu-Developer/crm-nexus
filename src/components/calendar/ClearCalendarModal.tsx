'use client';

import React, { useState } from 'react';
import { Trash2, AlertTriangle, X } from 'lucide-react';
import { toast } from 'sonner';
import { calendarService } from '@/lib/supabase/calendar-service';

interface ClearCalendarModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  totalEvents: number;
  currentCollaboratorId?: string | null;
}

export function ClearCalendarModal({
  isOpen,
  onClose,
  onSuccess,
  totalEvents,
  currentCollaboratorId,
}: ClearCalendarModalProps) {
  const [disconnectGoogle, setDisconnectGoogle] = useState(false);
  const [isClearing, setIsClearing] = useState(false);

  if (!isOpen) return null;

  const handleClear = async () => {
    setIsClearing(true);
    try {
      const res = await calendarService.clearAllEvents({
        disconnectGoogle,
        collaboratorId: currentCollaboratorId || undefined,
      });
      if (res.success) {
        toast.success(
          disconnectGoogle
            ? 'Agenda limpa e conta Google desconectada com sucesso!'
            : 'Todos os eventos foram apagados da agenda com sucesso!'
        );
        onSuccess();
        onClose();
      } else {
        toast.error('Ocorreu um erro ao limpar os eventos.');
      }
    } catch {
      toast.error('Erro de conexão ao limpar a agenda.');
    } finally {
      setIsClearing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden p-6 space-y-5">
        {/* Cabeçalho */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-100 dark:bg-red-950/60 border border-red-200 dark:border-red-800/80 flex items-center justify-center text-red-600 dark:text-red-400 shrink-0">
              <Trash2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900 dark:text-white">
                Limpar Base da Agenda
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Apagar compromissos e reiniciar a agenda
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={isClearing}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Alerta explicativo */}
        <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 flex items-start gap-3">
          <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
          <div className="text-xs text-amber-900 dark:text-amber-200 space-y-1">
            <p className="font-bold">Atenção: Esta ação apagará os eventos da base de dados!</p>
            <p className="text-amber-800/80 dark:text-amber-300/80 leading-relaxed">
              Atualmente existem <strong>{totalEvents} eventos</strong> registrados no sistema. Ao confirmar, todos serão removidos do CRM Nexus.
            </p>
          </div>
        </div>

        {/* Opção de Desconectar Google */}
        <div
          onClick={() => setDisconnectGoogle(!disconnectGoogle)}
          className={`p-3 rounded-xl border transition cursor-pointer flex items-start gap-3 select-none ${
            disconnectGoogle
              ? 'bg-blue-50/60 dark:bg-blue-950/30 border-blue-300 dark:border-blue-700'
              : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 hover:border-slate-300'
          }`}
        >
          <input
            type="checkbox"
            checked={disconnectGoogle}
            onChange={(e) => setDisconnectGoogle(e.target.checked)}
            className="mt-0.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
          />
          <div className="text-xs space-y-0.5">
            <span className="font-bold text-slate-900 dark:text-white block">
              Desconectar conta Google Agenda também
            </span>
            <span className="text-slate-500 dark:text-slate-400 text-[11px] block leading-relaxed">
              Remove a autorização OAuth para impedir que os eventos sejam reimportados automaticamente na próxima sincronização.
            </span>
          </div>
        </div>

        {/* Rodapé de botões */}
        <div className="pt-2 flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            disabled={isClearing}
            className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
          >
            Cancelar
          </button>

          <button
            type="button"
            onClick={handleClear}
            disabled={isClearing}
            className="px-4 py-2 rounded-xl text-xs font-black bg-red-600 hover:bg-red-500 text-white shadow-md shadow-red-600/30 flex items-center gap-1.5 transition active:scale-95 cursor-pointer disabled:opacity-50"
          >
            <Trash2 className={`w-3.5 h-3.5 ${isClearing ? 'animate-spin' : ''}`} />
            <span>{isClearing ? 'Apagando eventos...' : 'Confirmar e Limpar Agenda'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
