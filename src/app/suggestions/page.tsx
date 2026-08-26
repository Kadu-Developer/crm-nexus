'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import { useAuth } from '@/lib/supabase/auth-context';
import { useRouter } from 'next/navigation';
import { Toaster, toast } from 'sonner';
import {
  Mail,
  CheckCircle,
  X,
  Plus,
  Trash2,
  Edit,
  Loader2,
  Sapphire,
  MapPin,
  Loader,
  Heart,
  Info,
  HelpCircle,
} from 'lucide-react';

export default function SuggestionsPage() {
  const { profile } = useAuth();
  const router = useRouter();
  const [suggestions, setSuggestions] = useState<Array<any>>([]);
  const [loading, setLoading] = useState(true);
  const [newSuggestion, setNewSuggestion] = useState<{ title: string; description: string }>({
    title: '',
    description: '',
  });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingSuggestion, setEditingSuggestion] = useState<{ title: string; description: string }>({
    title: '',
    description: '',
  });
  const [respondingId, setRespondingId] = useState<string | null>(null);
  const [responseText, setResponseText] = useState('');

  useEffect(() => {
    if (!profile) return;
    fetchSuggestions();
  }, [profile]);

  const fetchSuggestions = async () => {
    setLoading(true);
    try {
      let query = supabase.from('suggestions').select(`
        *,
        consultant:consultant_id (name, email)
      `);

      // If consultant, only show their own suggestions
      if (profile.role === 'consultant') {
        query = query.eq('consultant_id', profile.id);
      }
      // Admins (admin_ceo and admin_tech) see all

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;
      setSuggestions(data || []);
    } catch (err: any) {
      console.error('Error fetching suggestions:', err);
      toast.error('Erro ao carregar sugestões', { description: err.message });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSuggestion.title.trim() || !newSuggestion.description.trim()) {
      toast.error('Por favor, preencha título e descrição');
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('suggestions')
        .insert({
          consultant_id: profile.id,
          title: newSuggestion.title.trim(),
          description: newSuggestion.description.trim(),
          status: 'pending',
        });

      if (error) throw error;

      setNewSuggestion({ title: '', description: '' });
      toast.success('Sugestão enviada com sucesso!');
      await fetchSuggestions();
    } catch (err: any) {
      toast.error('Erro ao enviar sugestão', { description: err.message });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateSuggestion = async (id: string) => {
    if (!editingSuggestion.title.trim() || !editingSuggestion.description.trim()) {
      toast.error('Por favor, preencha título e descrição');
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

      if (error) throw error;

      setEditingId(null);
      toast.success('Sugestão atualizada!');
      await fetchSuggestions();
    } catch (err: any) {
      toast.error('Erro ao atualizar sugestão', { description: err.message });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSuggestion = async (id: string) => {
    if (!window.confirm('Tem certeza que deseja excluir esta sugestão?')) return;

    setLoading(true);
    try {
      const { error } = await supabase.from('suggestions').delete().eq('id', id);
      if (error) throw error;

      toast.success('Sugestão excluída!');
      await fetchSuggestions();
    } catch (err: any) {
      toast.error('Erro ao excluir sugestão', { description: err.message });
    } finally {
      setLoading(false);
    }
  };

  const handleRespond = async (id: string) => {
    if (!responseText.trim()) {
      toast.error('Por favor, escreva uma resposta');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('suggestions')
        .update({
          status: 'reviewed', // or 'accepted'/'rejected' based on context? We'll let admin choose in future, for now set to reviewed
          admin_response: responseText.trim(),
          responded_by: profile.id,
          responded_at: new Date().toISOString(),
        })
        .eq('id', id);

      if (error) throw error;

      setRespondingId(null);
      setResponseText('');
      toast.success('Resposta enviada!');
      await fetchSuggestions();
    } catch (err: any) {
      toast.error('Erro ao enviar resposta', { description: err.message });
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id: string, status: 'accepted' | 'rejected') => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('suggestions')
        .update({
          status,
          // Keep existing response if any, or clear? We'll keep it.
        })
        .eq('id', id);

      if (error) throw error;

      toast.success(`Sugestão marcada como ${status === 'accepted' ? 'aceita' : 'rejeitada'}!`);
      await fetchSuggestions();
    } catch (err: any) {
      toast.error('Erro ao atualizar status', { description: err.message });
    } finally {
      setLoading(false);
    }
  };

  if (!profile) {
    return <div className="min-h-screen flex items-center justify-center">Carregando...</div>;
  }

  const isConsultant = profile.role === 'consultant';
  const isAdmin = profile.role === 'admin_ceo' || profile.role === 'admin_tech';

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <Toaster position="top-right" />
      {/* Header */}
      <div className="bg-white dark:bg-slate-800 shadow-sm border-b border-slate-200 dark:border-slate-800">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between border-b pb-4">
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                {isConsultant ? 'Minha Sugestões' : 'Sugestões dos Consultores'}
              </h1>
              <p className="mt-1 text-slate-600 dark:text-slate-300">
                {isConsultant
                  ? 'Envie suas sugestões para melhorar o CRM Nexus. Nossa equipe analisará cada uma.'
                  : 'Visualize e responda às sugestões dos consultores.'}
              </p>
            </div>
            {isConsultant && (
              <button
                onClick={() => {
                  setNewSuggestion({ title: '', description: '' });
                  // Reset editing state
                  setEditingId(null);
                  setEditingSuggestion({ title: '', description: '' });
                }}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md transition"
              >
                <Plus className="h-4 w-4" />
                Nova Sugestão
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="text-center py-12">
            <Loader2 className="h-6 w-6 text-slate-500 mx-auto mb-3" />
            <p className="text-slate-600 dark:text-slate-300">Carregando sugestões...</p>
          </div>
        ) : suggestions.length === 0 ? (
          <div className="text-center py-12">
            <HelpCircle className="h-8 w-8 text-slate-400 mx-auto mb-4" />
            <p className="text-slate-600 dark:text-slate-300">
              {isConsultant
                ? 'Nenhuma sugestão ainda. Seja o primeiro a enviar uma sugestão!'
                : 'Nenhuma sugestão recebida ainda.'}
            </p>
            {isConsultant && (
              <button
                onClick={() => {
                  setNewSuggestion({ title: '', description: '' });
                  setEditingId(null);
                  setEditingSuggestion({ title: '', description: '' });
                }}
                className="mt-4 inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md transition"
              >
                <Plus className="h-4 w-4" />
                Nova Sugestão
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            {/* New Suggestion Form (Consultant only) */}
            {isConsultant && (
              <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md p-6">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">
                  Nova Sugestão
                </h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
                      Título
                    </label>
                    <input
                      type="text"
                      value={newSuggestion.title}
                      onChange={(e) => setNewSuggestion({ ...newSuggestion, title: e.target.value })}
                      placeholder="Título da sugestão"
                      className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 text-sm"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
                      Descrição
                    </label>
                    <textarea
                      value={newSuggestion.description}
                      onChange={(e) => setNewSuggestion({ ...newSuggestion, description: e.target.value })}
                      placeholder="Descreva sua sugestão em detalhes..."
                      className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 text-sm"
                      rows={4}
                      required
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full items-center justify-center px-5 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2" />
                        Enviando...
                      </>
                    ) : (
                      <>
                        <Mail className="h-4 w-4 mr-2" />
                        Enviar Sugestão
                      </>
                    )}
                  </button>
                </form>
              </div>
            )}

            {/* Suggestions List */}
            <div className="space-y-4">
              {suggestions.map((suggestion) => (
                <div
                  key={suggestion.id}
                  className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm"
                >
                  {/* Header */}
                  <div className="bg-slate-50 dark:bg-slate-900/50 px-4 py-3 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/20">
                        <HelpCircle className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <h3 className="text-lg font-medium text-slate-900 dark:text-white truncate max-w-xs">
                          {suggestion.title}
                        </h3>
                        <p className="mt-1 text-slate-500 dark:text-slate-400 text-sm">
                          por{' '}
                          <span className="font-medium">
                            {suggestion.consultant ? suggestion.consultant.name : 'Usuário'}
                          </span>
                          <span className="ml-2 text-xs">
                            ({new Date(suggestion.created_at).toLocaleDateString('pt-BR')})
                          </span>
                        </p>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      {isConsultant && suggestion.status === 'pending' && (
                        <>
                          <button
                            onClick={() => {
                              setEditingId(suggestion.id);
                              setEditingSuggestion({
                                title: suggestion.title,
                                description: suggestion.description,
                              });
                            }}
                            className="p-1 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                            title="Editar"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteSuggestion(suggestion.id)}
                            className="p-1 text-slate-500 dark:text-slate-400 hover:text-red-500 dark:hover:text-red-400"
                            title="Excluir"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </>
                      )}
                      {isAdmin && (
                        <>
                          <button
                            onClick={() => {
                              setRespondingId(suggestion.id);
                              setResponseText(suggestion.admin_response || '');
                            }}
                            className="p-1 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                            title="Responder"
                          >
                            <Mail className="h-4 w-4" />
                          </button>
                          <div className="relative">
                            <button
                              onClick={() => {
                                // Cycle through status: pending -> accepted -> rejected -> pending
                                const nextStatus =
                                  suggestion.status === 'pending'
                                    ? 'accepted'
                                    : suggestion.status === 'accepted'
                                    ? 'rejected'
                                    : 'pending';
                              }}
                              className="p-1 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                              title="Alterar status"
                            >
                              {suggestion.status === 'pending' ? (
                                <Sparkles className="h-4 w-4" />
                              ) : suggestion.status === 'accepted' ? (
                                <CheckCircle className="h-4 w-4 text-green-500" />
                              ) : (
                                <X className="h-4 w-4 text-red-500" />
                              )}
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Body */}
                  <div className="px-4 py-3">
                    <p className="text-slate-700 dark:text-slate-300">
                      {suggestion.description}
                    </p>
                  </div>

                  {/* Status and Response */}
                  <div className="px-4 py-3 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-200 dark:border-slate-800">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                          Status:
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                            suggestion.status === 'pending'
                              ? 'bg-slate-200 text-slate-800 dark:bg-slate-600 dark:text-slate-300'
                              : suggestion.status === 'accepted'
                              ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-200'
                              : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-200'
                          }`}
                        >
                          {suggestion.status === 'pending'
                            ? 'Pendente'
                            : suggestion.status === 'accepted'
                            ? 'Aceita'
                            : 'Rejeitada'}
                        </span>
                      </div>

                      {suggestion.admin_response && (
                        <div className="flex-1 border-l pl-4">
                          <p className="text-slate-700 dark:text-slate-300 text-sm">
                            Resposta da equipe:{' '}
                          </p>
                          <p className="mt-1 text-slate-600 dark:text-slate-400">
                            {suggestion.admin_response}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Edit Form (Consultant only) */}
                  {isConsultant && suggestion.status === 'pending' && editingId === suggestion.id && (
                    <div className="px-4 py-3 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-200 dark:border-slate-800">
                      <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-3">
                        Editar Sugestão
                      </h3>
                      <form onSubmit={e => {
                        e.preventDefault();
                        handleUpdateSuggestion(suggestion.id);
                      }} className="space-y-3">
                        <div>
                          <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
                            Título
                          </label>
                          <input
                            type="text"
                            value={editingSuggestion.title}
                            onChange={(e) => setEditingSuggestion({ ...editingSuggestion, title: e.target.value })}
                            className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 text-sm"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
                            Descrição
                          </label>
                          <textarea
                            value={editingSuggestion.description}
                            onChange={(e) => setEditingSuggestion({ ...editingSuggestion, description: e.target.value })}
                            className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 text-sm"
                            rows={3}
                            required
                          />
                        </div>
                        <div className="flex items-center gap-3">
                          <button
                            type="submit"
                            disabled={loading}
                            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md transition disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {loading ? 'Atualizando...' : 'Salvar Alterações'}
                          </button>
                          <button
                            onClick={() => {
                              setEditingId(null);
                              setEditingSuggestion({ title: '', description: '' });
                            }}
                            className="px-4 py-2 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                          >
                            Cancelar
                          </button>
                        </div>
                      </form>
                    </div>
                  )}

                  {/* Respond Form (Admin only) */}
                  {isAdmin && respondingId === suggestion.id && (
                    <div className="px-4 py-3 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-200 dark:border-slate-800">
                      <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-3">
                        Responder à Sugestão
                      </h3>
                      <form onSubmit={e => {
                        e.preventDefault();
                        handleRespond(suggestion.id);
                      }} className="space-y-3">
                        <div>
                          <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
                            Sua resposta
                          </label>
                          <textarea
                            value={responseText}
                            onChange={(e) => setResponseText(e.target.value)}
                            className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 text-sm"
                            rows={4}
                            required
                          />
                        </div>
                        <div className="flex items-center gap-3">
                          <button
                            type="submit"
                            disabled={loading}
                            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md transition disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {loading ? 'Enviando...' : 'Enviar Resposta'}
                          </button>
                          <button
                            onClick={() => {
                              setRespondingId(null);
                              setResponseText('');
                            }}
                            className="px-4 py-2 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
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
          )
        )}
      </div>
    </div>
  );
}