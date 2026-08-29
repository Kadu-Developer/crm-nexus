'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase/client';
import { useAuth } from '@/lib/supabase/auth-context';
import { toast } from 'sonner';
import {
  Mail,
  CheckCircle,
  X,
  Plus,
  Trash2,
  Edit,
  Loader2,
  Sparkles,
  HelpCircle,
  Clock,
  Send,
  MessageSquarePlus,
  RotateCcw,
  CheckCircle2,
  Lightbulb,
  Zap,
  Bug,
  Palette,
} from 'lucide-react';

const STORAGE_KEY = 'nexus_crm_suggestions';

interface SuggestionItem {
  id: string;
  consultant_id: string;
  title: string;
  description: string;
  status: 'pending' | 'reviewed' | 'accepted' | 'rejected';
  admin_response?: string | null;
  responded_by?: string | null;
  responded_at?: string | null;
  created_at: string;
  updated_at?: string;
  consultant?: {
    name?: string;
    email?: string;
  };
}

const CATEGORIES = [
  { id: 'melhoria', label: 'Melhoria', icon: Lightbulb, color: 'text-amber-500 bg-amber-500/10 border-amber-500/30' },
  { id: 'funcionalidade', label: 'Nova Função', icon: Zap, color: 'text-blue-500 bg-blue-500/10 border-blue-500/30' },
  { id: 'bug', label: 'Relato de Bug', icon: Bug, color: 'text-red-500 bg-red-500/10 border-red-500/30' },
  { id: 'ux', label: 'Design / UX', icon: Palette, color: 'text-purple-500 bg-purple-500/10 border-purple-500/30' },
];

const DEFAULT_SUGGESTIONS: SuggestionItem[] = [
  {
    id: 'sug_default_1',
    consultant_id: 'usr_carlos',
    title: '[MELHORIA] Adicionar filtro por valor no Pipeline Kanban',
    description: 'Seria muito produtivo podermos filtrar cards por faixa de valor diretamente no topo do Kanban durante os alinhamentos comerciais.',
    status: 'accepted',
    admin_response: 'Excelente sugestão! Entrou no backlog de melhorias técnicas.',
    responded_by: 'usr_marcel',
    responded_at: new Date(Date.now() - 2 * 86400000).toISOString(),
    created_at: new Date(Date.now() - 4 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 2 * 86400000).toISOString(),
    consultant: {
      name: 'Carlos Eduardo',
      email: 'carlos@nexusflowtech.com.br',
    },
  },
  {
    id: 'sug_default_2',
    consultant_id: 'usr_carlos',
    title: '[NOVA FUNÇÃO] Exportação executiva de diagnósticos em PDF',
    description: 'Possibilidade de gerar um relatório resumido dos diagnósticos realizados para enviar ao cliente no fechamento.',
    status: 'pending',
    admin_response: null,
    responded_by: null,
    responded_at: null,
    created_at: new Date(Date.now() - 1 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 1 * 86400000).toISOString(),
    consultant: {
      name: 'Carlos Eduardo',
      email: 'carlos@nexusflowtech.com.br',
    },
  },
];

function getLocalSuggestions(): SuggestionItem[] {
  if (typeof window === 'undefined') return DEFAULT_SUGGESTIONS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_SUGGESTIONS));
      return DEFAULT_SUGGESTIONS;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : DEFAULT_SUGGESTIONS;
  } catch {
    return DEFAULT_SUGGESTIONS;
  }
}

function saveLocalSuggestions(list: SuggestionItem[]) {
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    } catch (e) {
      console.warn('Erro ao salvar no localStorage:', e);
    }
  }
}

export function SuggestionsView() {
  const { profile } = useAuth();
  const [suggestions, setSuggestions] = useState<SuggestionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState<string>('melhoria');
  const [newSuggestion, setNewSuggestion] = useState<{ title: string; description: string }>({
    title: '',
    description: '',
  });
  const [isCreatingOpen, setIsCreatingOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingSuggestion, setEditingSuggestion] = useState<{ title: string; description: string }>({
    title: '',
    description: '',
  });
  const [respondingId, setRespondingId] = useState<string | null>(null);
  const [responseText, setResponseText] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'accepted' | 'rejected' | 'reviewed'>('all');

  const isConsultant = profile?.role === 'consultant';
  const isAdmin = profile?.role === 'admin_ceo' || profile?.role === 'admin_tech';

  const fetchSuggestions = useCallback(async () => {
    if (!profile) return;
    setLoading(true);
    try {
      let query = supabase.from('suggestions').select(`
        *,
        consultant:consultant_id (name, email)
      `);

      if (profile.role === 'consultant') {
        query = query.eq('consultant_id', profile.id);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (!error && data && data.length > 0) {
        setSuggestions(data as SuggestionItem[]);
        saveLocalSuggestions(data as SuggestionItem[]);
      } else {
        const local = getLocalSuggestions();
        const filtered = profile.role === 'consultant'
          ? local.filter((s) => s.consultant_id === profile.id)
          : local;
        setSuggestions(filtered);
      }
    } catch {
      const local = getLocalSuggestions();
      const filtered = profile.role === 'consultant'
        ? local.filter((s) => s.consultant_id === profile.id)
        : local;
      setSuggestions(filtered);
    } finally {
      setLoading(false);
    }
  }, [profile]);

  useEffect(() => {
    if (!profile) return;
    fetchSuggestions();
  }, [profile, fetchSuggestions]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    if (!newSuggestion.title.trim() || !newSuggestion.description.trim()) {
      toast.error('Por favor, preencha o título e a descrição');
      return;
    }

    setLoading(true);
    const catObj = CATEGORIES.find((c) => c.id === category);
    const catTag = catObj ? `[${catObj.label.toUpperCase()}] ` : '';
    const fullTitle = newSuggestion.title.startsWith('[') ? newSuggestion.title.trim() : `${catTag}${newSuggestion.title.trim()}`;

    const newRecord: SuggestionItem = {
      id: `sug_${Date.now()}`,
      consultant_id: profile.id,
      title: fullTitle,
      description: newSuggestion.description.trim(),
      status: 'pending',
      admin_response: null,
      responded_by: null,
      responded_at: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      consultant: {
        name: profile.name,
        email: profile.email,
      },
    };

    try {
      const { data, error } = await supabase
        .from('suggestions')
        .insert({
          consultant_id: profile.id,
          title: newRecord.title,
          description: newRecord.description,
          status: 'pending',
        })
        .select(`*, consultant:consultant_id (name, email)`)
        .single();

      if (!error && data) {
        setNewSuggestion({ title: '', description: '' });
        setIsCreatingOpen(false);
        toast.success('Sugestão enviada com sucesso!');
        await fetchSuggestions();
        return;
      }
    } catch {
      // fallback to local below
    }

    const local = getLocalSuggestions();
    const updated = [newRecord, ...local];
    saveLocalSuggestions(updated);
    setNewSuggestion({ title: '', description: '' });
    setIsCreatingOpen(false);
    toast.success('Sugestão enviada com sucesso!');
    await fetchSuggestions();
    setLoading(false);
  };

  const handleUpdateSuggestion = async (id: string) => {
    if (!editingSuggestion.title.trim() || !editingSuggestion.description.trim()) {
      toast.error('Por favor, preencha o título e a descrição');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('suggestions')
        .update({
          title: editingSuggestion.title.trim(),
          description: editingSuggestion.description.trim(),
        })
        .eq('id', id);

      if (!error) {
        setEditingId(null);
        toast.success('Sugestão atualizada!');
        await fetchSuggestions();
        return;
      }
    } catch {
      // fallback
    }

    const local = getLocalSuggestions();
    const updated = local.map((s) =>
      s.id === id
        ? {
            ...s,
            title: editingSuggestion.title.trim(),
            description: editingSuggestion.description.trim(),
            updated_at: new Date().toISOString(),
          }
        : s
    );
    saveLocalSuggestions(updated);
    setEditingId(null);
    toast.success('Sugestão atualizada!');
    await fetchSuggestions();
    setLoading(false);
  };

  const handleDeleteSuggestion = async (id: string) => {
    if (!window.confirm('Tem certeza que deseja excluir esta sugestão?')) return;

    setLoading(true);
    try {
      const { error } = await supabase.from('suggestions').delete().eq('id', id);
      if (!error) {
        toast.success('Sugestão excluída!');
        await fetchSuggestions();
        return;
      }
    } catch {
      // fallback
    }

    const local = getLocalSuggestions();
    const updated = local.filter((s) => s.id !== id);
    saveLocalSuggestions(updated);
    toast.success('Sugestão excluída!');
    await fetchSuggestions();
    setLoading(false);
  };

  const handleRespond = async (id: string) => {
    if (!profile) return;
    if (!responseText.trim()) {
      toast.error('Por favor, escreva uma resposta');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('suggestions')
        .update({
          status: 'reviewed',
          admin_response: responseText.trim(),
          responded_by: profile.id,
          responded_at: new Date().toISOString(),
        })
        .eq('id', id);

      if (!error) {
        setRespondingId(null);
        setResponseText('');
        toast.success('Resposta enviada!');
        await fetchSuggestions();
        return;
      }
    } catch {
      // fallback
    }

    const local = getLocalSuggestions();
    const updated = local.map((s) =>
      s.id === id
        ? {
            ...s,
            status: 'reviewed' as const,
            admin_response: responseText.trim(),
            responded_by: profile.id,
            responded_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          }
        : s
    );
    saveLocalSuggestions(updated);
    setRespondingId(null);
    setResponseText('');
    toast.success('Resposta enviada!');
    await fetchSuggestions();
    setLoading(false);
  };

  const handleStatusChange = async (id: string, status: 'pending' | 'accepted' | 'rejected' | 'reviewed') => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('suggestions')
        .update({
          status,
        })
        .eq('id', id);

      if (!error) {
        toast.success(
          `Sugestão marcada como ${
            status === 'accepted'
              ? 'aceita'
              : status === 'rejected'
              ? 'rejeitada'
              : status === 'reviewed'
              ? 'respondida'
              : 'pendente'
          }!`
        );
        await fetchSuggestions();
        return;
      }
    } catch {
      // fallback
    }

    const local = getLocalSuggestions();
    const updated = local.map((s) =>
      s.id === id ? { ...s, status, updated_at: new Date().toISOString() } : s
    );
    saveLocalSuggestions(updated);
    toast.success(
      `Sugestão marcada como ${
        status === 'accepted'
          ? 'aceita'
          : status === 'rejected'
          ? 'rejeitada'
          : status === 'reviewed'
          ? 'respondida'
          : 'pendente'
      }!`
    );
    await fetchSuggestions();
    setLoading(false);
  };

  const filteredSuggestions = suggestions.filter((s) => {
    if (filterStatus === 'all') return true;
    return s.status === filterStatus;
  });

  const pendingCount = suggestions.filter((s) => s.status === 'pending').length;
  const acceptedCount = suggestions.filter((s) => s.status === 'accepted').length;
  const reviewedCount = suggestions.filter((s) => s.status === 'reviewed').length;

  return (
    <div className="w-full space-y-6 animate-in fade-in duration-200">
      {/* Banner de Topo da Página de Sugestões */}
      <div className="rounded-2xl bg-gradient-to-r from-[#052D72] via-[#0757C9] to-blue-700 p-6 text-white shadow-xl relative overflow-hidden">
        {/* Glow de fundo */}
        <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-[#24C9FF]/20 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 backdrop-blur-md shadow-md border border-white/20 shrink-0">
              <Sparkles className="h-6 w-6 text-amber-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white">
                  {isConsultant ? 'Central de Sugestões & Ideias' : 'Gestão de Sugestões dos Consultores'}
                </h1>
                {isAdmin && pendingCount > 0 && (
                  <span className="px-2 py-0.5 rounded-full bg-amber-400 text-slate-950 font-black text-xs">
                    {pendingCount} pendente{pendingCount > 1 ? 's' : ''}
                  </span>
                )}
              </div>
              <p className="mt-1 text-xs sm:text-sm text-blue-100/90 max-w-2xl">
                {isConsultant
                  ? 'Envie melhorias, novas funções ou reporte bugs para aprimorar o CRM Nexus. Cada sugestão é analisada diretamente pela equipe técnica e de produto.'
                  : 'Acompanhe, responda e priorize feedbacks, ideias e melhorias enviadas pelos consultores comerciais.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => fetchSuggestions()}
              className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 text-white transition cursor-pointer"
              title="Atualizar lista"
            >
              <RotateCcw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            </button>

            {isConsultant && (
              <button
                onClick={() => setIsCreatingOpen(!isCreatingOpen)}
                className="flex items-center gap-2 px-4 py-2.5 bg-[#F4510B] hover:bg-[#d94308] text-white font-bold text-xs sm:text-sm rounded-xl transition shadow-lg shadow-orange-500/20 active:scale-95 cursor-pointer"
              >
                {isCreatingOpen ? (
                  <>
                    <X className="h-4 w-4" />
                    <span>Fechar Formulário</span>
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4" />
                    <span>Nova Sugestão</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>

        {/* Métricas Rápidas */}
        <div className="mt-6 pt-4 border-t border-white/15 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="bg-black/20 rounded-xl p-2.5 backdrop-blur-xs border border-white/10">
            <span className="text-blue-200 text-[11px]">Total de Sugestões</span>
            <p className="text-base sm:text-lg font-black text-white">{suggestions.length}</p>
          </div>
          <div className="bg-black/20 rounded-xl p-2.5 backdrop-blur-xs border border-white/10">
            <span className="text-amber-200 text-[11px]">Pendentes</span>
            <p className="text-base sm:text-lg font-black text-amber-300">{pendingCount}</p>
          </div>
          <div className="bg-black/20 rounded-xl p-2.5 backdrop-blur-xs border border-white/10">
            <span className="text-green-200 text-[11px]">Aceitas / Aprovadas</span>
            <p className="text-base sm:text-lg font-black text-green-300">{acceptedCount}</p>
          </div>
          <div className="bg-black/20 rounded-xl p-2.5 backdrop-blur-xs border border-white/10">
            <span className="text-cyan-200 text-[11px]">Respondidas</span>
            <p className="text-base sm:text-lg font-black text-cyan-300">{reviewedCount}</p>
          </div>
        </div>
      </div>

      {/* Formulário de Nova Sugestão (quando aberto) */}
      {isCreatingOpen && isConsultant && (
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 sm:p-6 shadow-md animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <MessageSquarePlus className="w-5 h-5 text-blue-600 dark:text-[#24C9FF]" />
              <h2 className="text-base font-bold text-slate-900 dark:text-white">Cadastrar Nova Ideia ou Melhoria</h2>
            </div>
            <button
              onClick={() => setIsCreatingOpen(false)}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Categoria */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
                Categoria
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {CATEGORIES.map((cat) => {
                  const Icon = cat.icon;
                  const isSelected = category === cat.id;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setCategory(cat.id)}
                      className={`flex items-center gap-2 p-2.5 rounded-xl border text-xs font-bold transition cursor-pointer ${
                        isSelected
                          ? `${cat.color} ring-2 ring-blue-500 shadow-xs`
                          : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                    >
                      <Icon className="w-4 h-4 shrink-0" />
                      <span>{cat.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Título */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1">
                Título Resumido
              </label>
              <input
                type="text"
                value={newSuggestion.title}
                onChange={(e) => setNewSuggestion({ ...newSuggestion, title: e.target.value })}
                placeholder="Ex: Adicionar exportação de dados de diagnóstico em Excel"
                className="w-full px-3.5 py-2.5 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-950 text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            {/* Descrição */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1">
                Descrição Detalhada & Impacto no dia a dia
              </label>
              <textarea
                value={newSuggestion.description}
                onChange={(e) => setNewSuggestion({ ...newSuggestion, description: e.target.value })}
                placeholder="Explique detalhadamente sua sugestão, onde ela deve aparecer e como vai ajudar no fechamento de clientes..."
                className="w-full px-3.5 py-2.5 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-950 text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                rows={4}
                required
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsCreatingOpen(false)}
                className="px-4 py-2 text-xs font-bold text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading || !newSuggestion.title.trim() || !newSuggestion.description.trim()}
                className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs sm:text-sm rounded-xl transition shadow-md shadow-blue-500/20 active:scale-95 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Enviando...</span>
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    <span>Publicar Sugestão</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Barra de Filtros */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3 rounded-2xl shadow-xs">
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
          <button
            onClick={() => setFilterStatus('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
              filterStatus === 'all'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            Todas ({suggestions.length})
          </button>
          <button
            onClick={() => setFilterStatus('pending')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
              filterStatus === 'pending'
                ? 'bg-amber-500 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            Pendentes ({pendingCount})
          </button>
          <button
            onClick={() => setFilterStatus('accepted')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
              filterStatus === 'accepted'
                ? 'bg-green-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            Aceitas ({acceptedCount})
          </button>
          <button
            onClick={() => setFilterStatus('reviewed')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
              filterStatus === 'reviewed'
                ? 'bg-cyan-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            Respondidas ({reviewedCount})
          </button>
        </div>

        <span className="text-[11px] text-slate-500 dark:text-slate-400">
          Exibindo {filteredSuggestions.length} item(s)
        </span>
      </div>

      {/* Lista de Sugestões */}
      {loading && suggestions.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-12 text-center">
          <Loader2 className="h-8 w-8 text-blue-500 animate-spin mx-auto mb-3" />
          <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">Carregando sugestões...</p>
        </div>
      ) : filteredSuggestions.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-12 text-center">
          <HelpCircle className="h-10 w-10 text-slate-400 mx-auto mb-3 stroke-1" />
          <h3 className="text-base font-bold text-slate-900 dark:text-white">Nenhuma sugestão encontrada</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-md mx-auto">
            {isConsultant
              ? 'Você ainda não enviou sugestões nesta categoria. Use o botão "Nova Sugestão" para contribuir!'
              : 'Nenhuma sugestão com esse filtro no momento.'}
          </p>
          {isConsultant && !isCreatingOpen && (
            <button
              onClick={() => setIsCreatingOpen(true)}
              className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl transition cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              <span>Criar Primeira Sugestão</span>
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredSuggestions.map((suggestion) => (
            <div
              key={suggestion.id}
              className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm overflow-hidden transition-all hover:border-slate-300 dark:hover:border-slate-700"
            >
              {/* Header do Card */}
              <div className="bg-slate-50 dark:bg-slate-950/60 px-4 sm:px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-start gap-3 min-w-0">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-[#24C9FF] shrink-0 mt-0.5">
                    <HelpCircle className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white truncate">
                      {suggestion.title}
                    </h3>
                    <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      por{' '}
                      <span className="font-semibold text-slate-700 dark:text-slate-200">
                        {suggestion.consultant?.name || 'Consultor'}
                      </span>
                      <span className="mx-1.5">•</span>
                      <span>{new Date(suggestion.created_at).toLocaleDateString('pt-BR')}</span>
                    </p>
                  </div>
                </div>

                {/* Status Badge & Ações */}
                <div className="flex items-center gap-2 self-end sm:self-center">
                  <span
                    className={`px-2.5 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 ${
                      suggestion.status === 'accepted'
                        ? 'bg-green-500/10 text-green-600 dark:text-green-400 border border-green-500/20'
                        : suggestion.status === 'reviewed'
                        ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20'
                        : suggestion.status === 'rejected'
                        ? 'bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20'
                        : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
                    }`}
                  >
                    {suggestion.status === 'accepted' && <CheckCircle className="w-3 h-3" />}
                    {suggestion.status === 'pending' && <Clock className="w-3 h-3" />}
                    {suggestion.status === 'accepted'
                      ? 'Aceita'
                      : suggestion.status === 'reviewed'
                      ? 'Respondida'
                      : suggestion.status === 'rejected'
                      ? 'Rejeitada'
                      : 'Pendente'}
                  </span>

                  {/* Ações do Consultor */}
                  {isConsultant && suggestion.status === 'pending' && (
                    <div className="flex items-center gap-1 border-l border-slate-200 dark:border-slate-800 pl-2">
                      <button
                        onClick={() => {
                          setEditingId(suggestion.id);
                          setEditingSuggestion({
                            title: suggestion.title,
                            description: suggestion.description,
                          });
                        }}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                        title="Editar sugestão"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteSuggestion(suggestion.id)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                        title="Excluir sugestão"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  )}

                  {/* Ações do Admin */}
                  {isAdmin && (
                    <div className="flex items-center gap-1 border-l border-slate-200 dark:border-slate-800 pl-2">
                      <button
                        onClick={() => {
                          setRespondingId(suggestion.id);
                          setResponseText(suggestion.admin_response || '');
                        }}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                        title="Responder"
                      >
                        <Mail className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => {
                          const nextStatus =
                            suggestion.status === 'pending'
                              ? 'accepted'
                              : suggestion.status === 'accepted'
                              ? 'rejected'
                              : 'pending';
                          handleStatusChange(suggestion.id, nextStatus);
                        }}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-amber-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                        title="Alternar status (Pendente -> Aceita -> Rejeitada)"
                      >
                        <Sparkles className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Corpo da Sugestão */}
              <div className="p-4 sm:p-6 space-y-3">
                <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed">
                  {suggestion.description}
                </p>

                {/* Resposta da Equipe se houver */}
                {suggestion.admin_response && (
                  <div className="mt-4 rounded-xl bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200/60 dark:border-blue-800/50 p-4 space-y-1.5">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-blue-700 dark:text-blue-300">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Resposta da Equipe Técnica / Produto:</span>
                    </div>
                    <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-200 leading-relaxed">
                      {suggestion.admin_response}
                    </p>
                  </div>
                )}
              </div>

              {/* Formulário Inline de Edição (Consultor) */}
              {isConsultant && suggestion.status === 'pending' && editingId === suggestion.id && (
                <div className="p-4 sm:p-6 bg-slate-50 dark:bg-slate-950/80 border-t border-slate-200 dark:border-slate-800 space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                    Editar Sugestão
                  </h4>
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleUpdateSuggestion(suggestion.id);
                    }}
                    className="space-y-3"
                  >
                    <input
                      type="text"
                      value={editingSuggestion.title}
                      onChange={(e) => setEditingSuggestion({ ...editingSuggestion, title: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                    <textarea
                      value={editingSuggestion.description}
                      onChange={(e) => setEditingSuggestion({ ...editingSuggestion, description: e.target.value })}
                      rows={3}
                      className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                      required
                    />
                    <div className="flex items-center gap-2">
                      <button
                        type="submit"
                        disabled={loading}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl transition cursor-pointer"
                      >
                        Salvar Alterações
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditingId(null)}
                        className="px-4 py-2 text-xs font-bold text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer"
                      >
                        Cancelar
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* Formulário Inline de Resposta (Admin) */}
              {isAdmin && respondingId === suggestion.id && (
                <div className="p-4 sm:p-6 bg-slate-50 dark:bg-slate-950/80 border-t border-slate-200 dark:border-slate-800 space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                    Responder ao Consultor
                  </h4>
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleRespond(suggestion.id);
                    }}
                    className="space-y-3"
                  >
                    <textarea
                      value={responseText}
                      onChange={(e) => setResponseText(e.target.value)}
                      placeholder="Escreva a resposta ou encaminhamento desta sugestão..."
                      rows={3}
                      className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                      required
                    />
                    <div className="flex items-center gap-2">
                      <button
                        type="submit"
                        disabled={loading}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl transition cursor-pointer"
                      >
                        Enviar Resposta
                      </button>
                      <button
                        type="button"
                        onClick={() => setRespondingId(null)}
                        className="px-4 py-2 text-xs font-bold text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer"
                      >
                        Cancelar
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
