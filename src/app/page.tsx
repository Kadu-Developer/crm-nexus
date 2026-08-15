'use client';

import React, { useState, useEffect } from 'react';
import { Opportunity, PipelineStage, Activity } from '@/types/crm';
import { INITIAL_OPPORTUNITIES, STAGES } from '@/lib/mock-data';
import { KanbanBoard } from '@/components/kanban/KanbanBoard';
import { QuickCaptureModal } from '@/components/quick-capture/QuickCaptureModal';
import { LeadDetailModal } from '@/components/lead-modal/LeadDetailModal';
import { CeoDashboard } from '@/components/dashboard/CeoDashboard';
import { TasksView } from '@/components/tasks-view/TasksView';
import { ThemeProvider, useTheme } from '@/lib/theme-provider';
import { AuthProvider, useAuth } from '@/lib/supabase/auth-context';
import { crmService } from '@/lib/supabase/crm-service';
import { useRouter } from 'next/navigation';
import { Toaster, toast } from 'sonner';
import {
  LayoutDashboard,
  Kanban,
  CheckSquare,
  Plus,
  Users,
  Search,
  Moon,
  Sun,
  Sparkles,
  LogOut,
  ShieldCheck,
  RefreshCw,
  Lock,
} from 'lucide-react';

function AppContent() {
  const { theme, toggleTheme } = useTheme();
  const { profile, isLoading, signOut } = useAuth();
  const router = useRouter();

  const [opportunities, setOpportunities] = useState<Opportunity[]>(INITIAL_OPPORTUNITIES);
  const [selectedOpportunity, setSelectedOpportunity] = useState<Opportunity | null>(null);
  const [isQuickCaptureOpen, setIsQuickCaptureOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [currentView, setCurrentView] = useState<'kanban' | 'dashboard' | 'tasks'>('kanban');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [loadingData, setLoadingData] = useState(false);
  const [consultantFilter, setConsultantFilter] = useState<string>('all');

  // Redirecionamento para Login se não estiver autenticado
  useEffect(() => {
    if (!isLoading && !profile) {
      router.push('/login');
    }
  }, [isLoading, profile, router]);

  useEffect(() => {
    if (!profile) return;

    let unsubscribe: (() => void) | undefined;
    let isMounted = true;

    const fetchData = async () => {
      setLoadingData(true);
      const data = await crmService.getOpportunities();
      if (isMounted && data && data.length > 0) {
        setOpportunities(data);
      }
      if (isMounted) {
        setLoadingData(false);
      }
    };

    fetchData();

    unsubscribe = crmService.subscribeToChanges(() => {
      fetchData();
    });

    return () => {
      isMounted = false;
      unsubscribe?.();
    };
  }, [profile]);

  if (isLoading || !profile) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-500 animate-pulse flex items-center justify-center text-xl font-black mb-4 shadow-xl shadow-blue-500/20">
          N
        </div>
        <p className="text-sm text-slate-400 font-medium animate-pulse">Carregando CRM Nexus...</p>
      </div>
    );
  }

  // Move stage no Kanban (com Drag and Drop, Otimistic Update & Supabase Sync)
  const handleMoveStage = async (oppId: string, newStage: PipelineStage) => {
    let movedOppName = '';
    const stageDef = STAGES.find((s) => s.id === newStage);
    const newProb = stageDef?.defaultProbability || 10;

    const targetOpp = opportunities.find((o) => o.id === oppId);
    const newWeighted = ((targetOpp?.proposedValue || targetOpp?.estimatedValue || 0) * newProb) / 100;

    setOpportunities((prev) =>
      prev.map((opp) => {
        if (opp.id === oppId) {
          movedOppName = opp.tradeName || opp.companyName;
          return {
            ...opp,
            stage: newStage,
            probability: newProb,
            weightedRevenue: newWeighted,
            updatedAt: new Date().toISOString(),
          };
        }
        return opp;
      })
    );

    toast.success(`${movedOppName || 'Oportunidade'} avançou no funil!`, {
      description: `Nova etapa: ${stageDef?.title} (${newProb}% prob.)`,
      duration: 3500,
    });

    await crmService.updateStage(oppId, newStage, newProb, newWeighted);
  };

  // Salvar novo Lead via Quick Capture (com Supabase Sync)
  const handleSaveNewOpportunity = async (newOpp: Partial<Opportunity>) => {
    const oppWithConsultant = {
      ...newOpp,
      consultantId: profile?.id || newOpp.consultantId || 'usr_tiago',
      consultantName: profile?.name || newOpp.consultantName || 'Tiago Santos',
    };

    setOpportunities((prev) => [oppWithConsultant as Opportunity, ...prev]);

    toast.success('Novo lead cadastrado com sucesso!', {
      description: `${newOpp.tradeName || newOpp.companyName} adicionado ao pipeline com score ${newOpp.score} pts.`,
    });

    await crmService.createOpportunity(oppWithConsultant, profile?.id);
  };

  // Adicionar Atividade / Interação (com Supabase Sync)
  const handleAddActivity = async (oppId: string, newActivity: Activity) => {
    let oppName = '';
    setOpportunities((prev) =>
      prev.map((opp) => {
        if (opp.id === oppId) {
          oppName = opp.tradeName || opp.companyName;
          const updatedActivities = [newActivity, ...opp.activities];
          return {
            ...opp,
            activities: updatedActivities,
            nextActionDescription: newActivity.nextAction || opp.nextActionDescription,
            nextActionDate: newActivity.nextActionDate || opp.nextActionDate,
            updatedAt: new Date().toISOString(),
          };
        }
        return opp;
      })
    );

    if (selectedOpportunity && selectedOpportunity.id === oppId) {
      setSelectedOpportunity((prev) =>
        prev
          ? {
              ...prev,
              activities: [newActivity, ...prev.activities],
              nextActionDescription: newActivity.nextAction || prev.nextActionDescription,
              nextActionDate: newActivity.nextActionDate || prev.nextActionDate,
            }
          : null
      );
    }

    toast.success('Interação registrada na timeline!', {
      description: `Próximo passo: ${newActivity.nextAction} (${newActivity.nextActionDate})`,
    });

    await crmService.addActivity(oppId, newActivity);
  };

  const handleOpenDetail = (opp: Opportunity) => {
    setSelectedOpportunity(opp);
    setIsDetailOpen(true);
  };

  const handleLogout = async () => {
    await signOut();
    toast.info('Sessão encerrada.');
    router.push('/login');
  };

  // Filtragem de busca global (RLS no Supabase já garante que consultores vejam apenas seus leads)
  const displayedOpportunities = opportunities.filter((opp) => {
    const searchMatch =
      opp.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      opp.tradeName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      opp.consultantName.toLowerCase().includes(searchQuery.toLowerCase());
    return searchMatch;
  });

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col transition-colors duration-200">
      <Toaster position="top-right" richColors theme={theme} />

      {/* Top Navbar */}
      <header className="h-16 border-b border-slate-200 dark:border-slate-800/80 bg-white/85 dark:bg-slate-900/80 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-30 transition-colors">
        <div className="flex items-center gap-6">
          {/* Logo Nexus */}
          <div className="flex items-center gap-3 cursor-pointer select-none" onClick={() => setCurrentView('kanban')}>
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-500 flex items-center justify-center font-black text-white text-lg shadow-lg shadow-blue-500/25">
              N
            </div>
            <div>
              <h1 className="font-black text-base tracking-tight text-slate-900 dark:text-white flex items-center gap-1.5">
                NEXUS{' '}
                <span className="text-blue-600 dark:text-blue-400 font-bold text-xs px-2 py-0.5 bg-blue-500/10 border border-blue-500/20 rounded-md">
                  CRM
                </span>
              </h1>
            </div>
          </div>

          {/* Seletor de Visão */}
          <nav className="hidden md:flex items-center bg-slate-200/70 dark:bg-slate-950/80 border border-slate-300/60 dark:border-slate-800 p-1 rounded-xl">
            <button
              onClick={() => setCurrentView('kanban')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                currentView === 'kanban'
                  ? 'bg-white dark:bg-blue-600 text-blue-600 dark:text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <Kanban className="w-3.5 h-3.5" />
              Pipeline (14 Etapas)
            </button>
            <button
              onClick={() => setCurrentView('tasks')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                currentView === 'tasks'
                  ? 'bg-white dark:bg-blue-600 text-blue-600 dark:text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <CheckSquare className="w-3.5 h-3.5" />
              Meu Dia & Ações
            </button>
            <button
              onClick={() => setCurrentView('dashboard')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                currentView === 'dashboard'
                  ? 'bg-white dark:bg-blue-600 text-blue-600 dark:text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              Dashboard CEO
            </button>
          </nav>
        </div>

        {/* Direita: Perfil do Usuário, Busca, Filtro de Consultor, Tema e Botão Quick Capture */}
        <div className="flex items-center gap-3">
          {/* Busca Rápida */}
          <div className="relative hidden lg:block w-44">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar lead..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-100 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-900 dark:text-slate-200 placeholder:text-slate-400 focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Indicador de Usuário */}
          <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-lg px-2.5 py-1.5">
            {profile?.role === 'admin_ceo' ? (
              <ShieldCheck className="w-4 h-4 text-amber-500" />
            ) : (
              <Users className="w-3.5 h-3.5 text-blue-500" />
            )}
            <span className="text-xs text-slate-700 dark:text-slate-300 font-semibold truncate max-w-[150px]">
              {profile?.name}
            </span>
            {profile?.role === 'admin_ceo' && (
              <span className="text-[10px] px-1.5 py-0.5 bg-amber-500/20 text-amber-600 dark:text-amber-400 rounded font-bold">
                CEO
              </span>
            )}
          </div>

          {/* Botão de Refresh Supabase */}
          <button
            onClick={loadPipelineData}
            className={`p-2 rounded-lg bg-slate-100 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition cursor-pointer ${
              loadingData ? 'animate-spin text-blue-500' : ''
            }`}
            title="Recarregar dados"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          {/* Toggle Dark / Light Theme */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg bg-slate-100 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition cursor-pointer"
            title={theme === 'dark' ? 'Mudar para Tema Claro' : 'Mudar para Tema Escuro'}
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-700" />}
          </button>

          {/* Botão de Cadastro Rápido */}
          <button
            onClick={() => setIsQuickCaptureOpen(true)}
            className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs px-4 py-2 rounded-xl shadow-md shadow-blue-500/25 transition active:scale-95 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Novo Lead (Quick)</span>
          </button>

          {/* Botão de Logout */}
          <button
            onClick={handleLogout}
            className="p-2 rounded-lg bg-slate-100 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-500 hover:text-rose-500 transition cursor-pointer"
            title="Sair do Sistema / Ir para Login"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 p-6 max-w-[1720px] w-full mx-auto">
        {currentView === 'kanban' && (
          <KanbanBoard
            opportunities={displayedOpportunities}
            onSelectOpportunity={handleOpenDetail}
            onMoveStage={handleMoveStage}
            consultantFilter={consultantFilter}
          />
        )}

        {currentView === 'tasks' && (
          <TasksView
            opportunities={displayedOpportunities}
            onSelectOpportunity={handleOpenDetail}
            consultantFilter={consultantFilter}
          />
        )}

        {currentView === 'dashboard' && (
          <CeoDashboard opportunities={displayedOpportunities} />
        )}
      </main>

      {/* Modais */}
      <QuickCaptureModal
        isOpen={isQuickCaptureOpen}
        onClose={() => setIsQuickCaptureOpen(false)}
        onSave={handleSaveNewOpportunity}
      />

      <LeadDetailModal
        opportunity={selectedOpportunity}
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        onAddActivity={handleAddActivity}
      />
    </div>
  );
}

export default function Home() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ThemeProvider>
  );
}
