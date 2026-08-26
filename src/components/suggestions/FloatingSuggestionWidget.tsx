'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/lib/supabase/auth-context';
import { supabase } from '@/lib/supabase/client';
import { useRouter, usePathname } from 'next/navigation';
import { toast } from 'sonner';
import {
  MessageSquarePlus,
  Sparkles,
  X,
  Send,
  Loader2,
  CheckCircle2,
  Clock,
  ExternalLink,
  MessageSquare,
  Lightbulb,
  Bug,
  Zap,
  Palette,
  ChevronRight,
  ShieldCheck,
  RotateCcw,
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
    title: 'Adicionar filtro por valor no Pipeline Kanban',
    description: 'Seria muito produtivo podermos filtrar cards por faixa de valor diretamente no topo do Kanban.',
    status: 'accepted',
    admin_response: 'Excelente sugestão! Entrou no backlog de melhorias técnicas.',
    responded_by: 'usr_marcel',
    responded_at: new Date(Date.now() - 2 * 86400000).toISOString(),
    created_at: new Date(Date.now() - 4 * 86400000).toISOString(),
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

export function FloatingSuggestionWidget() {
  const { profile } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'new' | 'history' | 'admin'>('new');
  const [category, setCategory] = useState<string>('melhoria');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<SuggestionItem[]>([]);
  const [adminResponseText, setAdminResponseText] = useState<{ [key: string]: string }>({});

  const isAdmin = profile?.role === 'admin_ceo' || profile?.role === 'admin_tech';

  // Buscar sugestões
  const fetchSuggestions = useCallback(async () => {
    if (!profile) return;
    setLoading(true);
    try {
      let query = supabase.from('suggestions').select(`
        *,
        consultant:consultant_id (name, email)
      `);

      if (!isAdmin) {
        query = query.eq('consultant_id', profile.id);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (!error && data && data.length > 0) {
        setSuggestions(data as SuggestionItem[]);
        saveLocalSuggestions(data as SuggestionItem[]);
      } else {
        const local = getLocalSuggestions();
        const filtered = isAdmin ? local : local.filter((s) => s.consultant_id === profile.id);
        setSuggestions(filtered);
      }
    } catch {
      const local = getLocalSuggestions();
      const filtered = isAdmin ? local : local.filter((s) => s.consultant_id === profile.id);
      setSuggestions(filtered);
    } finally {
      setLoading(false);
    }
  }, [profile, isAdmin]);

  useEffect(() => {
    if (profile && isOpen) {
      fetchSuggestions();
    }
  }, [profile, isOpen, fetchSuggestions]);

  // Enviar nova sugestão
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    if (!title.trim() || !description.trim()) {
      toast.error('Preencha o título e a descrição da sugestão');
      return;
    }

    setSubmitting(true);
    const fullTitle = `[${category.toUpperCase()}] ${title.trim()}`;
    const newRecord: SuggestionItem = {
      id: `sug_${Date.now()}`,
      consultant_id: profile.id,
      title: fullTitle,
      description: description.trim(),
      status: 'pending',
      admin_response: null,
      responded_by: null,
      responded_at: null,
      created_at: new Date().toISOString(),
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
          title: fullTitle,
          description: description.trim(),
          status: 'pending',
        })
        .select(`*, consultant:consultant_id (name, email)`)
        .single();

      if (!error && data) {
        setTitle('');
        setDescription('');
        toast.success('Sugestão enviada com sucesso!', {
          description: 'Nossa equipe técnica e de produto irá analisar seu feedback.',
        });
        await fetchSuggestions();
        setActiveTab('history');
        setSubmitting(false);
        return;
      }
    } catch {
      // Fallback
    }

    const local = getLocalSuggestions();
    const updated = [newRecord, ...local];
    saveLocalSuggestions(updated);
    setSuggestions((prev) => [newRecord, ...prev]);
    setTitle('');
    setDescription('');
    toast.success('Sugestão enviada com sucesso!');
    setActiveTab('history');
    setSubmitting(false);
  };

  // Admin: Responder sugestão
  const handleAdminRespond = async (id: string) => {
    if (!profile) return;
    const response = adminResponseText[id]?.trim();
    if (!response) {
      toast.error('Escreva uma resposta para enviar');
      return;
    }

    try {
      const { error } = await supabase
        .from('suggestions')
        .update({
          status: 'reviewed',
          admin_response: response,
          responded_by: profile.id,
          responded_at: new Date().toISOString(),
        })
        .eq('id', id);

      if (!error) {
        toast.success('Resposta enviada!');
        setAdminResponseText((prev) => ({ ...prev, [id]: '' }));
        await fetchSuggestions();
        return;
      }
    } catch {
      // ignore
    }

    // Local Storage fallback
    const local = getLocalSuggestions();
    const updated = local.map((s) =>
      s.id === id
        ? {
            ...s,
            status: 'reviewed' as const,
            admin_response: response,
            responded_by: profile.id,
            responded_at: new Date().toISOString(),
          }
        : s
    );
    saveLocalSuggestions(updated);
    setSuggestions(updated);
    setAdminResponseText((prev) => ({ ...prev, [id]: '' }));
    toast.success('Resposta enviada!');
  };

  // Se não houver perfil autenticado ou se já estiver na página de sugestões completa, não exibe
  if (!profile || pathname === '/suggestions' || pathname === '/login') {
    return null;
  }

  const userSuggestions = suggestions.filter((s) => s.consultant_id === profile.id);
  const pendingCount = suggestions.filter((s) => s.status === 'pending').length;

  return (
    <>
      {/* Botão Flutuante (Estilo Chatbot FAB) */}
      <aside aria-label="Widget de Sugestões" className="group fixed bottom-6 right-6 z-50 flex items-center justify-end">
        {/* Tooltip revelado somente no hover */}
        {!isOpen && (
          <div
            className="mr-3 hidden sm:flex items-center gap-2 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md px-3.5 py-2 rounded-full shadow-xl border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-700 dark:text-slate-200 pointer-events-none whitespace-nowrap opacity-0 translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200 ease-out"
          >
            <Sparkles className="w-3.5 h-3.5 text-blue-500 animate-pulse" />
            <span>Sugestões & Ideias</span>
          </div>
        )}

        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          aria-label={isOpen ? 'Fechar janela de sugestões' : 'Abrir janela de sugestões'}
          className={`relative flex h-14 w-14 items-center justify-center rounded-full shadow-2xl transition-all duration-300 cursor-pointer ${
            isOpen
              ? 'bg-slate-800 dark:bg-slate-700 text-white rotate-90 scale-95'
              : 'bg-gradient-to-tr from-blue-600 via-indigo-600 to-blue-500 text-white hover:scale-110 hover:shadow-blue-500/30'
          }`}
        >
          {isOpen ? (
            <X className="h-6 w-6" />
          ) : (
            <>
              <MessageSquarePlus className="h-6 w-6" />
              {/* Badge de notificações / pendências */}
              {isAdmin && pendingCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-amber-500 text-[10px] font-black text-white ring-2 ring-white dark:ring-slate-900">
                  {pendingCount}
                </span>
              )}
            </>
          )}
        </button>
      </aside>

      {/* Janela Flutuante do Chatbot */}
      {isOpen && (
        <div
          role="dialog"
          aria-label="Central de Sugestões e Feedback"
          className="fixed bottom-24 right-6 z-50 w-[92vw] sm:w-[420px] max-h-[600px] flex flex-col rounded-3xl border border-slate-200/80 dark:border-slate-800/90 bg-white/95 dark:bg-slate-900/95 shadow-2xl backdrop-blur-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-6 duration-200"
        >
          {/* Header do Widget */}
          <div className="relative bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 px-5 py-4 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/20 backdrop-blur-md">
                  <Sparkles className="h-5 w-5 text-amber-300" />
                </div>
                <div>
                  <h3 className="text-sm font-bold leading-tight">Central de Sugestões</h3>
                  <p className="text-[11px] text-blue-100/80">Envie suas ideias para o CRM Nexus</p>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => {
                    router.push('/suggestions');
                    setIsOpen(false);
                  }}
                  title="Abrir tela cheia"
                  className="p-1.5 rounded-lg text-white/80 hover:bg-white/10 hover:text-white transition cursor-pointer"
                >
                  <ExternalLink className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  title="Fechar"
                  className="p-1.5 rounded-lg text-white/80 hover:bg-white/10 hover:text-white transition cursor-pointer"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Abas de Navegação */}
            <div className="mt-3 flex items-center bg-black/20 p-1 rounded-xl">
              <button
                type="button"
                onClick={() => setActiveTab('new')}
                className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                  activeTab === 'new' ? 'bg-white text-blue-700 shadow-sm' : 'text-blue-100 hover:text-white'
                }`}
              >
                Nova Ideia
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveTab('history');
                  fetchSuggestions();
                }}
                className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer flex items-center justify-center gap-1.5 ${
                  activeTab === 'history' ? 'bg-white text-blue-700 shadow-sm' : 'text-blue-100 hover:text-white'
                }`}
              >
                <span>Histórico</span>
                {userSuggestions.length > 0 && (
                  <span
                    className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                      activeTab === 'history' ? 'bg-blue-100 text-blue-800' : 'bg-white/20 text-white'
                    }`}
                  >
                    {userSuggestions.length}
                  </span>
                )}
              </button>
              {isAdmin && (
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('admin');
                    fetchSuggestions();
                  }}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer flex items-center justify-center gap-1 ${
                    activeTab === 'admin' ? 'bg-white text-blue-700 shadow-sm' : 'text-blue-100 hover:text-white'
                  }`}
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Admin</span>
                </button>
              )}
            </div>
          </div>

          {/* Conteúdo da Aba 1: Nova Sugestão */}
          {activeTab === 'new' && (
            <form onSubmit={handleSubmit} className="p-4 space-y-3.5 overflow-y-auto max-h-[420px]">
              {/* Seletor de Categoria */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                  Tipo de Sugestão
                </label>
                <div className="grid grid-cols-2 gap-1.5">
                  {CATEGORIES.map((cat) => {
                    const Icon = cat.icon;
                    const isSelected = category === cat.id;
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => setCategory(cat.id)}
                        className={`flex items-center gap-2 p-2 rounded-xl border text-xs font-bold transition cursor-pointer ${
                          isSelected
                            ? `${cat.color} ring-1 ring-blue-500 shadow-xs`
                            : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
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
                <label htmlFor="widget-suggestion-title" className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                  Título Rápido
                </label>
                <input
                  id="widget-suggestion-title"
                  type="text"
                  placeholder="Ex: Adicionar exportação de dados em Excel"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-3.5 py-2 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none transition"
                  required
                />
              </div>

              {/* Descrição */}
              <div>
                <label htmlFor="widget-suggestion-desc" className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                  Como isso ajudaria o seu dia a dia?
                </label>
                <textarea
                  id="widget-suggestion-desc"
                  rows={3}
                  placeholder="Descreva sua sugestão em detalhes ou reporte o que pode ser melhorado..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-3.5 py-2 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none transition resize-none"
                  required
                />
              </div>

              {/* Botão de Envio */}
              <button
                type="submit"
                disabled={submitting || !title.trim() || !description.trim()}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 px-4 py-2.5 text-xs font-bold text-white shadow-md shadow-blue-500/20 transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed active:scale-98"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Enviando sugestão...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Enviar Sugestão</span>
                  </>
                )}
              </button>
            </form>
          )}

          {/* Conteúdo da Aba 2: Histórico do Consultor */}
          {activeTab === 'history' && (
            <div className="p-4 space-y-3 overflow-y-auto max-h-[420px]">
              {loading ? (
                <div className="py-12 text-center">
                  <Loader2 className="w-6 h-6 animate-spin text-blue-500 mx-auto mb-2" />
                  <p className="text-xs text-slate-500">Carregando sugestões...</p>
                </div>
              ) : userSuggestions.length === 0 ? (
                <div className="py-12 text-center space-y-2">
                  <MessageSquare className="w-8 h-8 text-slate-400 mx-auto stroke-1" />
                  <p className="text-xs font-bold text-slate-700 dark:text-slate-300">Nenhuma sugestão enviada ainda</p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Use a aba &ldquo;Nova Ideia&rdquo; para sugerir melhorias!
                  </p>
                </div>
              ) : (
                userSuggestions.map((item) => (
                  <div
                    key={item.id}
                    className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/60 p-3.5 space-y-2 transition hover:border-slate-300 dark:hover:border-slate-700"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 line-clamp-2">
                        {item.title}
                      </h4>
                      <span
                        className={`shrink-0 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          item.status === 'accepted'
                            ? 'bg-green-500/10 text-green-600 dark:text-green-400 border border-green-500/20'
                            : item.status === 'reviewed'
                            ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20'
                            : item.status === 'rejected'
                            ? 'bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20'
                            : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
                        }`}
                      >
                        {item.status === 'accepted'
                          ? 'Aceita'
                          : item.status === 'reviewed'
                          ? 'Respondida'
                          : item.status === 'rejected'
                          ? 'Rejeitada'
                          : 'Pendente'}
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-3">
                      {item.description}
                    </p>

                    {/* Resposta do Admin se houver */}
                    {item.admin_response && (
                      <div className="mt-2 rounded-xl bg-blue-50/80 dark:bg-blue-950/40 border border-blue-200/60 dark:border-blue-800/40 p-2.5 space-y-1">
                        <div className="flex items-center gap-1.5 text-[10px] font-bold text-blue-700 dark:text-blue-300">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Resposta da Equipe Técnica:</span>
                        </div>
                        <p className="text-[11px] text-slate-700 dark:text-slate-300">
                          {item.admin_response}
                        </p>
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-1 text-[10px] text-slate-400">
                      <span>{new Date(item.created_at).toLocaleDateString('pt-BR')}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Conteúdo da Aba 3: Painel Admin */}
          {activeTab === 'admin' && isAdmin && (
            <div className="p-4 space-y-3 overflow-y-auto max-h-[420px]">
              <div className="flex items-center justify-between pb-1 border-b border-slate-200 dark:border-slate-800">
                <span className="text-[11px] font-bold text-slate-500">
                  Todas as Sugestões ({suggestions.length})
                </span>
                <button
                  type="button"
                  onClick={() => fetchSuggestions()}
                  className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition"
                  title="Atualizar lista"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              </div>

              {suggestions.map((item) => (
                <div
                  key={item.id}
                  className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 p-3 space-y-2.5"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">{item.title}</h4>
                      <p className="text-[10px] text-slate-500">
                        por <span className="font-semibold text-slate-700 dark:text-slate-300">{item.consultant?.name || 'Consultor'}</span> ({new Date(item.created_at).toLocaleDateString('pt-BR')})
                      </p>
                    </div>
                    <span
                      className={`shrink-0 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        item.status === 'accepted'
                          ? 'bg-green-500/10 text-green-600 dark:text-green-400'
                          : item.status === 'reviewed'
                          ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400'
                          : item.status === 'rejected'
                          ? 'bg-red-500/10 text-red-600 dark:text-red-400'
                          : 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                      }`}
                    >
                      {item.status}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-300">{item.description}</p>

                  {/* Resposta atual se houver */}
                  {item.admin_response && (
                    <div className="rounded-lg bg-slate-200/60 dark:bg-slate-800/60 p-2 text-[11px] text-slate-700 dark:text-slate-300">
                      <strong>Sua resposta:</strong> {item.admin_response}
                    </div>
                  )}

                  {/* Campo de resposta rápida */}
                  <div className="flex items-center gap-1.5 pt-1">
                    <input
                      type="text"
                      placeholder="Responder ao consultor..."
                      value={adminResponseText[item.id] ?? ''}
                      onChange={(e) =>
                        setAdminResponseText((prev) => ({ ...prev, [item.id]: e.target.value }))
                      }
                      className="flex-1 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 px-2.5 py-1.5 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => handleAdminRespond(item.id)}
                      className="p-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white transition cursor-pointer"
                      title="Enviar resposta"
                    >
                      <Send className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Footer do Widget */}
          <div className="bg-slate-50 dark:bg-slate-900/90 px-4 py-2.5 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
            <span className="text-[11px] text-slate-500">Nexus Feedback v2.0</span>
            <button
              type="button"
              onClick={() => {
                router.push('/suggestions');
                setIsOpen(false);
              }}
              className="flex items-center gap-1 text-blue-600 dark:text-blue-400 font-bold hover:underline cursor-pointer"
            >
              <span>Ver painel completo</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
