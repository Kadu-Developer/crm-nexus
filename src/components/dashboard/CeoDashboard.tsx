'use client';

import React from 'react';
import { Opportunity } from '@/types/crm';
import { STAGES, USERS } from '@/lib/mock-data';
import { formatCurrency } from '@/lib/utils';
import {
  TrendingUp,
  DollarSign,
  Briefcase,
  Target,
  AlertTriangle,
  Award,
  Activity,
  Layers,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

interface CeoDashboardProps {
  opportunities: Opportunity[];
}

const COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#f97316', '#10b981', '#06b6d4', '#eab308'];

export function CeoDashboard({ opportunities }: CeoDashboardProps) {
  // KPIs
  const totalPipeline = opportunities.reduce(
    (acc, curr) => acc + (curr.proposedValue || curr.estimatedValue || 0),
    0
  );
  const totalWeighted = opportunities.reduce((acc, curr) => acc + curr.weightedRevenue, 0);
  const totalCommission = opportunities.reduce((acc, curr) => acc + (curr.estimatedCommission || 0), 0);

  const diagCount = opportunities.filter((o) =>
    ['pre_diag_agendado', 'pre_diag_realizado', 'diag_proposto', 'diag_contratado', 'diag_realizado'].includes(o.stage)
  ).length;

  // Breakdown por consultor (combina USERS com oportunidades reais)
  const consultantMap = new Map<string, { name: string; total: number; weighted: number; count: number }>();

  USERS.filter((u) => u.role === 'consultant').forEach((u) => {
    consultantMap.set(u.id, {
      name: u.name.split(' ')[0],
      total: 0,
      weighted: 0,
      count: 0,
    });
  });

  opportunities.forEach((o) => {
    const cid = o.consultantId;
    const cname = (o.consultantName || 'Consultor').split(' ')[0];
    const val = o.proposedValue || o.estimatedValue || 0;
    const weighted = o.weightedRevenue || 0;

    let targetKey: string | undefined;
    if (cid && consultantMap.has(cid)) {
      targetKey = cid;
    } else {
      for (const [key, valEntry] of consultantMap.entries()) {
        if (valEntry.name.toLowerCase() === cname.toLowerCase()) {
          targetKey = key;
          break;
        }
      }
    }

    if (targetKey) {
      const entry = consultantMap.get(targetKey)!;
      entry.total += val;
      entry.weighted += weighted;
      entry.count += 1;
    } else {
      const newKey = cid || cname;
      consultantMap.set(newKey, {
        name: cname,
        total: val,
        weighted: weighted,
        count: 1,
      });
    }
  });

  const consultantData = Array.from(consultantMap.values()).filter(
    (c) => c.count > 0 || ['Thiago', 'Larissa', 'Bruno'].includes(c.name)
  );

  // Breakdown por Origem de Lead
  const sourceMap: Record<string, number> = {};
  opportunities.forEach((o) => {
    sourceMap[o.leadSource] = (sourceMap[o.leadSource] || 0) + 1;
  });
  const sourceData = Object.entries(sourceMap).map(([key, value]) => ({
    name: key.toUpperCase(),
    value: value,
  }));

  // Breakdown por Macro-Fases
  const phaseMap = {
    Prospecção: opportunities.filter((o) =>
      ['lead_identificado', 'primeiro_contato', 'contato_realizado'].includes(o.stage)
    ).length,
    Diagnóstico: diagCount,
    'Solução / Proposta': opportunities.filter((o) =>
      ['solucao_identificada', 'proposta_enviada', 'negociacao'].includes(o.stage)
    ).length,
    Conclusão: opportunities.filter((o) =>
      ['fechado_ganho', 'fechado_perdido'].includes(o.stage)
    ).length,
  };
  const phaseData = Object.entries(phaseMap).map(([name, count]) => ({
    name,
    count,
  }));

  return (
    <div className="space-y-6 pb-12">
      {/* Top 4 KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Pipeline Total */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Pipeline Bruto</span>
            <div className="p-2 bg-blue-500/10 rounded-lg text-blue-400">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-2">
            <span className="text-2xl font-bold text-white">{formatCurrency(totalPipeline)}</span>
            <span className="text-xs text-slate-400 block mt-0.5">{opportunities.length} oportunidades ativas</span>
          </div>
        </div>

        {/* Pipeline Ponderado */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Forecast Realista</span>
            <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-400">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-2">
            <span className="text-2xl font-bold text-emerald-400">{formatCurrency(totalWeighted)}</span>
            <span className="text-xs text-slate-400 block mt-0.5">Pipeline Ponderado por Probabilidade</span>
          </div>
        </div>

        {/* Diagnósticos em Curso */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Diagnósticos Nexus</span>
            <div className="p-2 bg-purple-500/10 rounded-lg text-purple-400">
              <Activity className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-2">
            <span className="text-2xl font-bold text-purple-300">{diagCount}</span>
            <span className="text-xs text-slate-400 block mt-0.5">Em fase de Pré-Diag e Diag</span>
          </div>
        </div>

        {/* Comissão Estimada */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Provisão de Comissão</span>
            <div className="p-2 bg-amber-500/10 rounded-lg text-amber-400">
              <Award className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-2">
            <span className="text-2xl font-bold text-amber-300">{formatCurrency(totalCommission)}</span>
            <span className="text-xs text-slate-400 block mt-0.5">Base: 10% do valor proposto</span>
          </div>
        </div>
      </div>

      {/* Gráficos em Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gráfico 1: Performance por Consultor */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-sm">
          <h3 className="text-sm font-bold text-white mb-1">Pipeline por Consultor (Bruto vs Realista)</h3>
          <p className="text-xs text-slate-400 mb-4">Volume total gerado por cada consultor no pipeline</p>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={consultantData}>
                <XAxis dataKey="name" stroke="#64748b" fontSize={12} />
                <YAxis
                  stroke="#64748b"
                  fontSize={12}
                  tickFormatter={(val) => `R$ ${(val / 1000).toFixed(0)}k`}
                />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px' }}
                  formatter={(val: any) => formatCurrency(Number(val))}
                />
                <Bar dataKey="total" name="Pipeline Total" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="weighted" name="Forecast Ponderado" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Gráfico 2: Volume por Macro-Fase */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-sm">
          <h3 className="text-sm font-bold text-white mb-1">Distribuição do Funil por Macro-Fase</h3>
          <p className="text-xs text-slate-400 mb-4">Acompanhe a passagem de bastão no funil de vendas</p>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={phaseData} layout="vertical">
                <XAxis type="number" stroke="#64748b" fontSize={12} />
                <YAxis dataKey="name" type="category" stroke="#64748b" fontSize={11} width={130} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px' }}
                />
                <Bar dataKey="count" name="Qtd Oportunidades" fill="#8b5cf6" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Tabela de Governança: Leads de Atenção */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-sm">
        <div className="flex items-center gap-2 text-sm font-bold text-amber-400 mb-1">
          <AlertTriangle className="w-4 h-4" /> Governança & Radar de Oportunidades
        </div>
        <p className="text-xs text-slate-400 mb-4">
          Todas as oportunidades cadastradas com score de saúde e status da Próxima Ação
        </p>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-800 text-slate-400 uppercase tracking-wider font-semibold">
              <tr>
                <th className="py-2.5 px-3">Empresa</th>
                <th className="py-2.5 px-3">Consultor</th>
                <th className="py-2.5 px-3">Score Nexus</th>
                <th className="py-2.5 px-3">Etapa Atual</th>
                <th className="py-2.5 px-3 text-right">Valor Proposto</th>
                <th className="py-2.5 px-3 text-right">Ponderado</th>
                <th className="py-2.5 px-3">Próxima Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-200">
              {opportunities.map((opp) => (
                <tr key={opp.id} className="hover:bg-slate-800/50 transition">
                  <td className="py-3 px-3 font-semibold text-white">
                    {opp.tradeName || opp.companyName}
                    <span className="block text-[10px] text-slate-400 font-normal">
                      {opp.city}/{opp.state} • {opp.segment}
                    </span>
                  </td>
                  <td className="py-3 px-3">{opp.consultantName}</td>
                  <td className="py-3 px-3">
                    <span
                      className={`inline-flex items-center gap-1 font-bold px-2 py-0.5 rounded text-[11px] ${
                        opp.score >= 80
                          ? 'bg-emerald-500/20 text-emerald-300'
                          : opp.score >= 50
                          ? 'bg-amber-500/20 text-amber-300'
                          : 'bg-rose-500/20 text-rose-300'
                      }`}
                    >
                      {opp.score} pts
                    </span>
                  </td>
                  <td className="py-3 px-3">
                    <span className="px-2 py-1 bg-slate-800 rounded text-slate-300 text-[11px]">
                      {opp.stage.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-right font-mono font-medium">
                    {formatCurrency(opp.proposedValue || opp.estimatedValue)}
                  </td>
                  <td className="py-3 px-3 text-right font-mono font-bold text-emerald-400">
                    {formatCurrency(opp.weightedRevenue)}
                  </td>
                  <td className="py-3 px-3 max-w-xs truncate text-slate-300" title={opp.nextActionDescription}>
                    {opp.nextActionDescription}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
