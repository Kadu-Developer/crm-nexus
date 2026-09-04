'use client';

import React, { useMemo, useState } from 'react';
import { Building2, Search, Users, TrendingUp, CalendarClock, ArrowUpRight, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { Opportunity } from '@/types/crm';
import { formatCurrency, formatDateTime } from '@/lib/utils';
import { useAuth } from '@/lib/supabase/auth-context';
import { crmService } from '@/lib/supabase/crm-service';

function isUUID(str?: string): boolean {
  if (!str) return false;
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(str);
}

interface ClientPortfolioProps {
  opportunities: Opportunity[];
  onSelectOpportunity: (opportunity: Opportunity) => void;
  onDeleteLead?: (params: {
    opportunityIds: string[];
    companyId?: string;
    companyName?: string;
    tradeName?: string;
    cnpj?: string;
  }) => Promise<void> | void;
}

export function ClientPortfolio({ opportunities, onSelectOpportunity, onDeleteLead }: ClientPortfolioProps) {
  const { profile } = useAuth();
  const isAdmin = profile?.role === 'admin_ceo' || profile?.role === 'admin_tech';
  const [search, setSearch] = useState('');
  const [segmentFilter, setSegmentFilter] = useState('all');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDeleteClient = async (client: {
    id: string;
    name: string;
    tradeName?: string;
    legalName: string;
    opportunities: Opportunity[];
  }) => {
    if (!isAdmin) {
      toast.error('Acesso negado: somente administradores podem excluir leads');
      return;
    }

    const leadName = client.name || client.legalName || 'este lead';
    if (!window.confirm(`Tem certeza que deseja excluir o lead "${leadName}" e todas as suas ${client.opportunities.length} oportunidade(s)? Esta ação não pode ser desfeita.`)) {
      return;
    }

    setDeletingId(client.id);
    const toastId = toast.loading(`Excluindo lead "${leadName}"...`);

    try {
      const oppIds = client.opportunities.map((o) => o.id);
      const companyId = client.opportunities.find((o) => o.companyId)?.companyId || (isUUID(client.id) ? client.id : undefined);
      const cnpj = client.opportunities.find((o) => o.cnpj)?.cnpj;

      const payload = {
        opportunityIds: oppIds,
        companyId,
        companyName: client.legalName || client.name,
        tradeName: client.tradeName || client.name,
        cnpj,
      };

      if (onDeleteLead) {
        await onDeleteLead(payload);
      } else {
        const res = await crmService.deleteLead(payload);
        if (!res.success) {
          throw new Error(res.error || 'Falha ao excluir lead');
        }
      }

      toast.success(`Lead "${leadName}" excluído com sucesso!`, { id: toastId });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Tente novamente';
      console.error('Erro ao excluir lead:', err);
      toast.error(`Erro ao excluir lead: ${message}`, { id: toastId });
    } finally {
      setDeletingId(null);
    }
  };

  const clients = useMemo(() => {
    const grouped = new Map<string, Opportunity[]>();
    opportunities.forEach((opportunity) => {
      const key = opportunity.cnpj || opportunity.companyName.toLowerCase();
      grouped.set(key, [...(grouped.get(key) || []), opportunity]);
    });

    return Array.from(grouped.values()).map((clientOpportunities) => {
      const sorted = [...clientOpportunities].sort((a, b) =>
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      );
      const current = sorted[0];
      return {
        id: current.companyId || current.cnpj || current.companyName,
        name: current.tradeName || current.companyName,
        tradeName: current.tradeName || current.companyName,
        legalName: current.companyName,
        segment: current.segment,
        city: current.city,
        state: current.state,
        consultantName: current.consultantName,
        contact: current.contacts[0],
        opportunities: clientOpportunities,
        totalValue: clientOpportunities.reduce((total, opportunity) => total + (opportunity.proposedValue || opportunity.estimatedValue || 0), 0),
        weightedValue: clientOpportunities.reduce((total, opportunity) => total + opportunity.weightedRevenue, 0),
        nextAction: current,
      };
    });
  }, [opportunities]);

  const segments = Array.from(new Set(clients.map((client) => client.segment)));
  const filteredClients = clients.filter((client) => {
    const matchesSearch = `${client.name} ${client.legalName} ${client.contact?.name || ''}`.toLowerCase().includes(search.toLowerCase());
    return matchesSearch && (segmentFilter === 'all' || client.segment === segmentFilter);
  });
  const totalValue = filteredClients.reduce((total, client) => total + client.totalValue, 0);
  const totalWeighted = filteredClients.reduce((total, client) => total + client.weightedValue, 0);

  return (
    <section className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-slate-200 pb-5 dark:border-slate-800">
        <div>
          <p className="mb-1 text-[11px] font-bold uppercase tracking-[0.18em] text-[#0757C9] dark:text-[#24C9FF]">Relacionamento</p>
          <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">Carteira de clientes</h2>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Uma visão consolidada das empresas e oportunidades em andamento.</p>
        </div>
        <div className="flex flex-wrap gap-2 text-xs">
          <div className="border border-slate-200 bg-white px-3 py-2 dark:border-slate-800 dark:bg-slate-900"><span className="mr-2 text-slate-500">Clientes</span><strong>{filteredClients.length}</strong></div>
          <div className="border border-slate-200 bg-white px-3 py-2 dark:border-slate-800 dark:bg-slate-900"><span className="mr-2 text-slate-500">Pipeline</span><strong>{formatCurrency(totalValue)}</strong></div>
          <div className="border border-emerald-200 bg-emerald-50 px-3 py-2 text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-950/30 dark:text-emerald-300"><TrendingUp className="mr-1 inline h-3.5 w-3.5" />{formatCurrency(totalWeighted)} forecast</div>
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <div className="relative min-w-[240px] flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input aria-label="Buscar cliente" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar cliente ou contato..." className="w-full rounded-lg border border-slate-300 bg-white py-2.5 pl-9 pr-3 text-sm outline-none transition focus:border-[#0757C9] focus:ring-2 focus:ring-[#0757C9]/20 dark:border-slate-800 dark:bg-slate-900" />
        </div>
        <select aria-label="Filtrar por segmento" value={segmentFilter} onChange={(event) => setSegmentFilter(event.target.value)} className="rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm capitalize outline-none focus:border-[#0757C9] dark:border-slate-800 dark:bg-slate-900">
          <option value="all">Todos os segmentos</option>
          {segments.map((segment) => <option key={segment} value={segment}>{segment.replace(/_/g, ' ')}</option>)}
        </select>
      </div>

      {filteredClients.length === 0 ? (
        <div className="border border-dashed border-slate-300 bg-white p-12 text-center dark:border-slate-700 dark:bg-slate-900">
          <Building2 className="mx-auto mb-3 h-8 w-8 text-slate-400" />
          <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">Nenhum cliente encontrado</p>
          <p className="mt-1 text-xs text-slate-500">Ajuste a busca ou o segmento selecionado.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 xl:grid-cols-2">
          {filteredClients.map((client) => (
            <article
              key={client.id}
              onClick={() => onSelectOpportunity(client.nextAction)}
              className="border border-slate-200 bg-white p-5 transition-all hover:border-[#24C9FF] hover:shadow-md dark:border-slate-800 dark:bg-slate-900 cursor-pointer rounded-xl group"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex min-w-0 items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#052D72] text-white group-hover:bg-[#0757C9] transition-colors"><Building2 className="h-4 w-4" /></div>
                  <div className="min-w-0"><h3 className="truncate text-sm font-bold text-slate-900 group-hover:text-[#0757C9] dark:text-white dark:group-hover:text-[#24C9FF] transition-colors">{client.name}</h3><p className="truncate text-xs text-slate-500 dark:text-slate-400">{client.legalName}</p><p className="mt-1 text-[11px] capitalize text-slate-500">{client.segment.replace(/_/g, ' ')} · {client.city}/{client.state}</p></div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="shrink-0 border border-blue-200 bg-blue-50 px-2 py-1 text-[10px] font-bold text-blue-700 dark:border-blue-900/60 dark:bg-blue-950/30 dark:text-blue-300">{client.opportunities.length} {client.opportunities.length === 1 ? 'oportunidade' : 'oportunidades'}</span>
                  {isAdmin && (
                    <button
                      type="button"
                      disabled={deletingId === client.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteClient(client);
                      }}
                      className="p-1.5 rounded-lg text-rose-500 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-500/10 transition-colors disabled:opacity-50 cursor-pointer"
                      title="Excluir lead"
                    >
                      <Trash2 className={`w-4 h-4 ${deletingId === client.id ? 'animate-pulse opacity-50' : ''}`} />
                    </button>
                  )}
                </div>
              </div>
              <div className="mt-5 grid grid-cols-2 gap-3 border-y border-slate-100 py-3 text-xs dark:border-slate-800"><div><p className="text-slate-500">Pipeline</p><strong className="mt-1 block text-slate-900 dark:text-white">{formatCurrency(client.totalValue)}</strong></div><div><p className="text-slate-500">Forecast</p><strong className="mt-1 block text-emerald-600 dark:text-emerald-400">{formatCurrency(client.weightedValue)}</strong></div></div>
              <div className="mt-4 flex items-center justify-between gap-3 text-xs"><div className="flex min-w-0 items-center gap-2"><Users className="h-3.5 w-3.5 shrink-0 text-slate-400" /><span className="truncate text-slate-600 dark:text-slate-300">{client.contact?.name || 'Contato não informado'}</span></div><span className="shrink-0 text-slate-500">{client.consultantName.split(' ')[0]}</span></div>
              <button type="button" onClick={() => onSelectOpportunity(client.nextAction)} className="mt-4 flex w-full items-center justify-between border border-slate-200 px-3 py-2 text-left transition-colors hover:border-[#0757C9] hover:text-[#0757C9] dark:border-slate-800 dark:hover:border-[#24C9FF] dark:hover:text-[#24C9FF] cursor-pointer"><span className="min-w-0"><span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">Próxima ação</span><span className="mt-1 block truncate text-xs font-medium">{client.nextAction.nextActionDescription}</span></span><span className="ml-3 flex shrink-0 items-center gap-1 text-[10px] text-slate-500"><CalendarClock className="h-3.5 w-3.5" />{formatDateTime(client.nextAction.nextActionDate)}<ArrowUpRight className="h-3.5 w-3.5" /></span></button>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
