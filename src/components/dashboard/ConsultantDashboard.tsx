'use client';

import React from 'react';
import { Opportunity } from '@/types/crm';
import { formatCurrency } from '@/lib/utils';
import {
  TrendingUp,
  DollarSign,
  Target,
  Activity,
  Award,
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

interface ConsultantDashboardProps {
  opportunities: Opportunity[];
}

const COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#f97316', '#10b981', '#06b6d4', '#eab308'];

export function ConsultantDashboard({ opportunities }: ConsultantDashboardProps) {
  const myOpps = opportunities;

  const totalPipeline = myOpps.reduce(
    (acc, curr) => acc + (curr.proposedValue || curr.estimatedValue || 0),
    0
  );
  const totalWeighted = myOpps.reduce((acc, curr) => acc + curr.weightedRevenue, 0);
  const totalCommission = myOpps.reduce((acc, curr) => acc + (curr.estimatedCommission || 0), 0);

  const wonOpps = myOpps.filter((o) => o.stage === 'fechado_ganho').length;
  const lostOpps = myOpps.filter((o) => o.stage === 'fechado_perdido').length;
  const winRate = myOpps.length > 0 ? Math.round((wonOpps / (wonOpps + lostOpps)) * 100) : 0;

  const diagCount = myOpps.filter((o) =>
    ['pre_diag_agendado', 'pre_diag_realizado', 'diag_proposto', 'diag_contratado', 'diag_realizado'].includes(o.stage)
  ).length;

  const avgScore = myOpps.length > 0 ? Math.round(myOpps.reduce((acc, o) => acc + o.score, 0) / myOpps.length) : 0;

  // Stage distribution for pie chart
  const stageMap: Record<string, number> = {};
  myOpps.forEach((o) => {
    const label = o.stage.replace(/_/g, ' ');
    stageMap[label] = (stageMap[label] || 0) + 1;
  });
  const stageData = Object.entries(stageMap).map(([name, value]) => ({
    name: name.charAt(0).toUpperCase() + name.slice(1),
    value,
  }));

  // Activity over time (last 30 days)
  const last30Days = Array.from({ length: 30 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (29 - i));
    const dateStr = date.toISOString().split('T')[0];
    const count = myOpps.filter((o) => o.updatedAt.startsWith(dateStr)).length;
    return {
      date: `${date.getMonth() + 1}/${date.getDate()}`,
      atualizacoes: count,
    };
  }).filter((d) => d.atualizacoes > 0);

  return (
    <div className="space-y-6 pb-12">
      {/* Saudação */}
      <div className="bg-gradient-to-r from-[#052D72] to-[#0757C9] rounded-xl p-5 shadow-sm">
        <h2 className="text-xl font-bold text-white">Bem-vindo de volta!</h2>
        <p className="text-sm text-blue-200 mt-1">Aqui está o panorama do seu pipeline de oportunidades.</p>
      </div>

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
            <span className="text-xs text-slate-400 block mt-0.5">{myOpps.length} oportunidades</span>
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
            <span className="text-xs text-slate-400 block mt-0.5">Ponderado por Probabilidade</span>
          </div>
        </div>

        {/* Diagnósticos em Curso */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Diagnósticos</span>
            <div className="p-2 bg-purple-500/10 rounded-lg text-purple-400">
              <Activity className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-2">
            <span className="text-2xl font-bold text-purple-300">{diagCount}</span>
            <span className="text-xs text-slate-400 block mt-0.5">Em fase de Diagnóstico</span>
          </div>
        </div>

        {/* Comissão Estimada */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Provisão Comissão</span>
            <div className="p-2 bg-amber-500/10 rounded-lg text-amber-400">
              <Award className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-2">
            <span className="text-2xl font-bold text-amber-300">{formatCurrency(totalCommission)}</span>
            <span className="text-xs text-slate-400 block mt-0.5">Base: 10% do proposto</span>
          </div>
        </div>
      </div>

      {/* Métricas extras */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Taxa de Conversão</span>
            <div className="p-2 bg-cyan-500/10 rounded-lg text-cyan-400">
              <Target className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-2">
            <span className="text-2xl font-bold text-cyan-300">{winRate}%</span>
            <span className="text-xs text-slate-400 block mt-0.5">{wonOpps} ganhos vs {lostOpps} perdidos</span>
          </div>
        </div>
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Score Médio Nexus</span>
            <div className="p-2 bg-rose-500/10 rounded-lg text-rose-400">
              <Activity className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-2">
            <span className="text-2xl font-bold text-rose-300">{avgScore}</span>
            <span className="text-xs text-slate-400 block mt-0.5">Média dos leads ativos</span>
          </div>
        </div>
      </div>

      {/* Gráficos em Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gráfico: Distribuição por Etapa */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-sm">
          <h3 className="text-sm font-bold text-white mb-1">Distribuição por Etapa</h3>
          <p className="text-xs text-slate-400 mb-4">Seus leads divididos pela fase atual do funil</p>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stageData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="value"
                  nameKey="name"
                  label={({ name, percent }) => `${name} (${((percent ?? 0) * 100).toFixed(0)}%)`}
                  labelLine={{ stroke: '#64748b' }}
                >
                  {stageData.map((_entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Gráfico: Atualizações recentes */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-sm">
          <h3 className="text-sm font-bold text-white mb-1">Atualizações Recentes (30 dias)</h3>
          <p className="text-xs text-slate-400 mb-4">Sua atividade no pipeline</p>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={last30Days}>
                <XAxis dataKey="date" stroke="#64748b" fontSize={11} interval="preserveStartEnd" />
                <YAxis stroke="#64748b" fontSize={12} allowDecimals={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px' }}
                />
                <Bar dataKey="atualizacoes" name="Atualizações" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Tabela: Meus Leads */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-sm">
        <div className="flex items-center gap-2 text-sm font-bold text-[#24C9FF] mb-1">
          <Activity className="w-4 h-4" /> Meus Leads
        </div>
        <p className="text-xs text-slate-400 mb-4">
          Todas as suas oportunidades cadastradas
        </p>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-800 text-slate-400 uppercase tracking-wider font-semibold">
              <tr>
                <th className="py-2.5 px-3">Empresa</th>
                <th className="py-2.5 px-3">Score Nexus</th>
                <th className="py-2.5 px-3">Etapa Atual</th>
                <th className="py-2.5 px-3 text-right">Valor Proposto</th>
                <th className="py-2.5 px-3 text-right">Ponderado</th>
                <th className="py-2.5 px-3">Próxima Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-200">
              {myOpps.map((opp) => (
                <tr key={opp.id} className="hover:bg-slate-800/50 transition">
                  <td className="py-3 px-3 font-semibold text-white">
                    {opp.tradeName || opp.companyName}
                    <span className="block text-[10px] text-slate-400 font-normal">
                      {opp.city}/{opp.state} • {opp.segment}
                    </span>
                  </td>
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
