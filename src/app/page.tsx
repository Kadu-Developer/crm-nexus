'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { Opportunity, PipelineStage, Activity, Qualification } from '@/types/crm';
import { INITIAL_OPPORTUNITIES, STAGES } from '@/lib/mock-data';
import { KanbanBoard } from '@/components/kanban/KanbanBoard';
import { QuickCaptureModal } from '@/components/quick-capture/QuickCaptureModal';
import { LeadDetailModal } from '@/components/lead-modal/LeadDetailModal';
import { CeoDashboard } from '@/components/dashboard/CeoDashboard';
import { ConsultantDashboard } from '@/components/dashboard/ConsultantDashboard';
import { TasksView } from '@/components/tasks-view/TasksView';
import { ClientPortfolio } from '@/components/client-portfolio/ClientPortfolio';
import { CalendarModule } from '@/components/calendar/CalendarModule';
import { useTheme } from '@/lib/theme-provider';
import { useAuth } from '@/lib/supabase/auth-context';
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
  Home as HomeIcon,
  Building2,
  BarChart3,
  Settings,
  Calendar as CalendarIcon,
  UserPlus,
  Menu,
  X,
  HelpCircle,
} from 'lucide-react';
import { ChangePasswordModal } from '@/components/auth/ChangePasswordModal';
import { AddCollaboratorModal } from '@/components/calendar/AddCollaboratorModal';
import { SuggestionsView } from '@/components/suggestions/SuggestionsView';

function AppContent() {
  const { theme, toggleTheme } = useTheme();
  const { profile, isLoading, signOut, changePassword } = useAuth();
  const router = useRouter();

  const [opportunities, setOpportunities] = useState<Opportunity[]>(INITIAL_OPPORTUNITIES);
  const [selectedOpportunity, setSelectedOpportunity] = useState<Opportunity | null>(null);
  const [isQuickCaptureOpen, setIsQuickCaptureOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isAddCollabOpen, setIsAddCollabOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [currentView, setCurrentView] = useState<'kanban' | 'dashboard' | 'tasks' | 'clients' | 'calendar' | 'suggestions'>('kanban');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [loadingData, setLoadingData] = useState(false);
  const [consultantFilter, setConsultantFilter] = useState<string>('all');

  // Redirecionamento para Login se não estiver autenticado
  useEffect(() => {
    if (!isLoading && !profile) {
      router.push('/login');
    }
  }, [isLoading, profile, router]);

  const loadPipelineData = useCallback(async () => {
    if (!profile) return;

    setLoadingData(true);
    const data = await crmService.getOpportunities();
    if (data && data.length > 0) {
      setOpportunities(data);
    }
    setLoadingData(false);
  }, [profile]);

  useEffect(() => {
    if (!profile) return;

    queueMicrotask(() => loadPipelineData());

    const unsubscribe = crmService.subscribeToChanges(() => {
      loadPipelineData();
    });

    return () => {
      unsubscribe();
    };
  }, [loadPipelineData, profile]);

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

    setSelectedOpportunity((selected) => {
      if (!selected || selected.id !== oppId) return selected;
      return {
        ...selected,
        stage: newStage,
        probability: newProb,
        weightedRevenue: newWeighted,
        updatedAt: new Date().toISOString(),
      };
    });

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

  // Atualizar Diagnóstico e Qualificação (com Supabase Sync)
  const handleUpdateQualification = async (oppId: string, qual: Partial<Qualification>) => {
    setOpportunities((prev) =>
      prev.map((opp) => {
        if (opp.id === oppId) {
          return {
            ...opp,
            qualification: { ...opp.qualification, ...qual },
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
              qualification: { ...prev.qualification, ...qual },
              updatedAt: new Date().toISOString(),
            }
          : null
      );
    }

    toast.success('Diagnóstico e qualificação atualizados com sucesso!');
    await crmService.updateQualification(oppId, qual);
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

  // Admins (admin_ceo e admin_tech) visualizam todas as oportunidades do pipeline.
  // Consultores visualizam suas oportunidades e dados do pipeline para clicar e gerenciar.
  const isAdmin = profile.role === 'admin_ceo' || profile.role === 'admin_tech';
  const isConsultant = profile.role === 'consultant';

  const roleScopedOpportunities = isAdmin
    ? opportunities
    : opportunities.filter((opp) => {
        if (!opp.consultantId) return true;
        if (opp.consultantId === profile.id) return true;
        if (opp.consultantName?.toLowerCase() === profile.name?.toLowerCase()) return true;
        if (consultantFilter !== 'all' && opp.consultantId === consultantFilter) return true;
        return true; // No modo CRM Nexus, consultor pode visualizar e abrir a ficha de oportunidades para trabalhar
      });

  const displayedOpportunities = roleScopedOpportunities.filter((opp) => {
    const searchMatch =
      opp.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      opp.tradeName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      opp.consultantName.toLowerCase().includes(searchQuery.toLowerCase());
    return searchMatch;
  });

  return (
    <div className="min-h-screen w-full max-w-full overflow-x-hidden bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col transition-colors duration-200">
      <Toaster position="top-right" richColors theme={theme} />

      {/* Navegação lateral compacta */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-14 flex-col items-center border-r border-[#0b3d8f] bg-[#052D72] pt-20 md:flex">
        <div className="flex flex-col items-center gap-2">
          <Image src="/nexus-shield-cropped.png" alt="Nexus Flow" width={28} height={30} className="mb-2 h-8 w-7 object-contain" />
          <button
            type="button"
            onClick={() => setCurrentView('kanban')}
            className={`flex h-10 w-10 items-center justify-center rounded-lg transition-colors cursor-pointer ${currentView === 'kanban' ? 'bg-[#24C9FF] text-[#052D72]' : 'text-white/70 hover:bg-white/10 hover:text-white'}`}
            aria-label="Abrir pipeline"
            title="Pipeline"
          >
            <HomeIcon className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => setCurrentView('tasks')}
            className={`flex h-10 w-10 items-center justify-center rounded-lg transition-colors cursor-pointer ${currentView === 'tasks' ? 'bg-[#24C9FF] text-[#052D72]' : 'text-white/70 hover:bg-white/10 hover:text-white'}`}
            aria-label="Abrir tarefas"
            title="Meu dia"
          >
            <CheckSquare className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => setCurrentView('calendar')}
            className={`flex h-10 w-10 items-center justify-center rounded-lg transition-colors cursor-pointer ${currentView === 'calendar' ? 'bg-[#24C9FF] text-[#052D72]' : 'text-white/70 hover:bg-white/10 hover:text-white'}`}
            aria-label="Abrir Agenda Google da Equipe"
            title="Agenda da Equipe (Google)"
          >
            <CalendarIcon className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => setCurrentView('dashboard')}
            className={`flex h-10 w-10 items-center justify-center rounded-lg transition-colors cursor-pointer ${currentView === 'dashboard' ? 'bg-[#24C9FF] text-[#052D72]' : 'text-white/70 hover:bg-white/10 hover:text-white'}`}
            aria-label="Abrir dashboard"
            title="Dashboard"
          >
            <BarChart3 className="h-4 w-4" />
          </button>
          <div className="my-1 h-px w-7 bg-white/20" />
          <button
            type="button"
            onClick={() => setCurrentView('clients')}
            className={`flex h-10 w-10 items-center justify-center rounded-lg transition-colors cursor-pointer ${currentView === 'clients' ? 'bg-[#24C9FF] text-[#052D72]' : 'text-white/70 hover:bg-white/10 hover:text-white'}`}
            aria-label="Empresas"
            title="Empresas"
          >
            <Building2 className="h-4 w-4" />
          </button>
          <div className="my-1 h-px w-7 bg-white/20" />
          <button
            type="button"
            onClick={() => setCurrentView('suggestions')}
            className="flex h-10 w-10 items-center justify-center rounded-lg transition-colors cursor-pointer text-white/70 hover:bg-white/10 hover:text-white"
            aria-label="Sugestões"
            title="Sugestões"
          >
            <HelpCircle className="h-4 w-4" />
          </button>
        </div>
        <button
          type="button"
          className="mt-auto mb-5 flex h-10 w-10 items-center justify-center rounded-lg text-white/70 transition-colors hover:bg-white/10 hover:text-white"
          aria-label="Configurações"
          title="Configurações"
        >
          <Settings className="h-4 w-4" />
        </button>
      </aside>

      {/* Top Navbar Fixo */}
      <header className="fixed top-0 left-0 right-0 h-16 w-full max-w-full border-b border-slate-200/80 dark:border-slate-800/80 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md px-3 sm:px-6 md:pl-[5.5rem] flex items-center justify-between z-30 transition-colors safe-area-inset-top">
        <div className="flex items-center gap-2 sm:gap-6 min-w-0">
          {/* Botão Menu Sanduíche (Mobile) */}
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen(true)}
            className="flex items-center justify-center p-2 rounded-lg text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition md:hidden cursor-pointer shrink-0"
            aria-label="Abrir menu de navegação"
            title="Menu Sanduíche"
          >
            <Menu className="w-5 h-5 text-[#0757C9] dark:text-[#24C9FF]" />
          </button>

          {/* Logo Nexus */}
          <div className="flex items-center gap-2 sm:gap-3 cursor-pointer select-none shrink-0" onClick={() => setCurrentView('kanban')}>
            <Image src="/assets/logos/logo-shield-symbol.png" alt="Nexus Flow Tech" width={200} height={138} className="h-7 sm:h-8 w-auto object-contain" priority sizes="(max-width: 640px) 80px, (max-width: 768px) 100px, 140px" />
            <div>
              <h1 className="font-black text-sm sm:text-base tracking-tight text-slate-900 dark:text-white flex items-center gap-1 sm:gap-1.5">
                NEXUS{' '}
                <span className="text-blue-600 dark:text-blue-400 font-bold text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 bg-blue-500/10 border border-blue-500/20 rounded-md">
                  CRM
                </span>
              </h1>
            </div>
          </div>

          {/* Seletor de Visão (Desktop) */}
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
              Pipeline (6 Etapas)
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
              onClick={() => setCurrentView('calendar')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                currentView === 'calendar'
                  ? 'bg-white dark:bg-blue-600 text-blue-600 dark:text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <CalendarIcon className="w-3.5 h-3.5" />
              Agenda da Equipe (Google)
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
              {isAdmin ? 'Dashboard CEO' : 'Meu Dashboard'}
            </button>
          </nav>
        </div>

        {/* Direita: Perfil do Usuário, Busca, Filtro de Consultor, Tema e Botão Quick Capture */}
        <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
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
          <div className="hidden sm:flex items-center gap-2 bg-slate-100 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-lg px-2.5 py-1.5">
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
            className={`p-1.5 sm:p-2 rounded-lg bg-slate-100 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition cursor-pointer ${
              loadingData ? 'animate-spin text-blue-500' : ''
            }`}
            title="Recarregar dados"
          >
            <RefreshCw className="w-3.5 sm:w-4 h-3.5 sm:h-4" />
          </button>

          {/* Toggle Dark / Light Theme */}
          <button
            onClick={toggleTheme}
            className="p-1.5 sm:p-2 rounded-lg bg-slate-100 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition cursor-pointer"
            title={theme === 'dark' ? 'Mudar para Tema Claro' : 'Mudar para Tema Escuro'}
          >
            {theme === 'dark' ? <Sun className="w-3.5 sm:w-4 h-3.5 sm:h-4 text-amber-400" /> : <Moon className="w-3.5 sm:w-4 h-3.5 sm:h-4 text-slate-700" />}
          </button>

          {/* Botão Convidar Colaborador (Admin / CEO) */}
          {profile?.role === 'admin_ceo' && (
            <button
              onClick={() => setIsAddCollabOpen(true)}
              className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-lg transition-colors active:scale-95 cursor-pointer shadow-xs"
              title="Cadastrar novo colaborador / consultor na equipe"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span className="hidden xl:inline">+ Colaborador</span>
            </button>
          )}

          {/* Botão de Cadastro Rápido */}
          <button
            onClick={() => setIsQuickCaptureOpen(true)}
            className="flex items-center gap-1.5 sm:gap-2 bg-[#F4510B] hover:bg-[#d94308] text-white font-bold text-xs px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-lg transition-colors active:scale-95 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Novo Lead (Quick)</span>
          </button>

          {/* Botão de Logout */}
          <button
            onClick={handleLogout}
            className="p-1.5 sm:p-2 rounded-lg bg-slate-100 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-500 hover:text-rose-500 transition cursor-pointer"
            title="Sair do Sistema / Ir para Login"
          >
            <LogOut className="w-3.5 sm:w-4 h-3.5 sm:h-4" />
          </button>
        </div>
      </header>

      {/* Gaveta Lateral (Menu Sanduíche Mobile) */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          {/* Backdrop com blur */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
            onClick={() => setIsMobileMenuOpen(false)}
          />

          {/* Conteúdo do Menu */}
          <div className="relative w-80 max-w-[85vw] h-full bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col z-10 animate-in slide-in-from-left duration-200 text-slate-900 dark:text-slate-100">
            {/* Header da Gaveta */}
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-950/40">
              <div className="flex items-center gap-2.5">
                <Image src="/assets/logos/logo-shield-symbol.png" alt="Nexus Flow" width={32} height={32} className="h-7 w-auto object-contain" />
                <span className="font-black text-base tracking-tight text-slate-900 dark:text-white flex items-center gap-1.5">
                  NEXUS <span className="text-blue-600 dark:text-blue-400 text-xs px-1.5 py-0.5 bg-blue-500/10 border border-blue-500/20 rounded font-bold">CRM</span>
                </span>
              </div>
              <button
                type="button"
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 transition cursor-pointer"
                aria-label="Fechar menu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Informações do Usuário Conectado */}
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#052D72] text-[#24C9FF] flex items-center justify-center font-black text-sm shadow-sm shrink-0">
                  {profile?.name ? profile.name.slice(0, 2).toUpperCase() : 'NX'}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{profile?.name}</p>
                    {profile?.role === 'admin_ceo' && (
                      <span className="text-[10px] px-1.5 py-0.5 bg-amber-500/20 text-amber-600 dark:text-amber-400 font-bold rounded">
                        CEO
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{profile?.email}</p>
                </div>
              </div>
            </div>

            {/* Links de Navegação */}
            <div className="flex-1 overflow-y-auto p-3 space-y-1">
              <p className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">Módulos</p>

              <button
                type="button"
                onClick={() => {
                  setCurrentView('kanban');
                  setIsMobileMenuOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                  currentView === 'kanban'
                    ? 'bg-[#0757C9] text-white shadow-sm'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60'
                }`}
              >
                <Kanban className="w-4 h-4" />
                <span>Pipeline de Oportunidades</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setCurrentView('tasks');
                  setIsMobileMenuOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                  currentView === 'tasks'
                    ? 'bg-[#0757C9] text-white shadow-sm'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60'
                }`}
              >
                <CheckSquare className="w-4 h-4" />
                <span>Meu Dia & Ações</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setCurrentView('calendar');
                  setIsMobileMenuOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                  currentView === 'calendar'
                    ? 'bg-[#0757C9] text-white shadow-sm'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60'
                }`}
              >
                <CalendarIcon className="w-4 h-4" />
                <span>Agenda da Equipe (Google)</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setCurrentView('dashboard');
                  setIsMobileMenuOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                  currentView === 'dashboard'
                    ? 'bg-[#0757C9] text-white shadow-sm'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60'
                }`}
              >
                <LayoutDashboard className="w-4 h-4" />
                <span>{isAdmin ? 'Dashboard CEO' : 'Meu Dashboard'}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setCurrentView('clients');
                  setIsMobileMenuOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                  currentView === 'clients'
                    ? 'bg-[#0757C9] text-white shadow-sm'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60'
                }`}
              >
                <Building2 className="w-4 h-4" />
                <span>Carteira de Empresas</span>
              </button>

          <button
            type="button"
            onClick={() => {
              setCurrentView('suggestions');
              setIsMobileMenuOpen(false);
            }}
            className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60"
          >
            <HelpCircle className="w-4 h-4" />
            <span>Sugestões</span>
          </button>

              <div className="pt-3 border-t border-slate-200 dark:border-slate-800 space-y-1.5">
                <p className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">Ações Rápidas</p>

                <button
                  type="button"
                  onClick={() => {
                    setIsQuickCaptureOpen(true);
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold text-white bg-[#F4510B] hover:bg-[#d94308] transition cursor-pointer shadow-sm"
                >
                  <Plus className="w-4 h-4" />
                  <span>Novo Lead (Quick Capture)</span>
                </button>

                {profile?.role === 'admin_ceo' && (
                  <button
                    type="button"
                    onClick={() => {
                      setIsAddCollabOpen(true);
                      setIsMobileMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/60 hover:bg-blue-100 dark:hover:bg-blue-900/40 transition cursor-pointer"
                  >
                    <UserPlus className="w-4 h-4" />
                    <span>Convidar Colaborador</span>
                  </button>
                )}
              </div>
            </div>

            {/* Rodapé da Gaveta */}
            <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 flex items-center justify-between">
              <button
                type="button"
                onClick={toggleTheme}
                className="flex items-center gap-2 text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition cursor-pointer"
              >
                {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-700" />}
                <span>{theme === 'dark' ? 'Tema Claro' : 'Tema Escuro'}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  handleLogout();
                }}
                className="flex items-center gap-1.5 text-xs font-semibold text-rose-500 hover:text-rose-600 transition cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                <span>Sair</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 pt-20 pb-20 md:pb-6 md:pt-20 p-3 sm:p-4 md:p-6 max-w-[1720px] w-full mx-auto md:pl-[5.5rem] overflow-x-hidden min-h-0 pb-[env(safe-area-inset-bottom)]">
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

        {currentView === 'calendar' && (
          <CalendarModule
            opportunities={displayedOpportunities}
            onSelectOpportunity={handleOpenDetail}
          />
        )}

        {currentView === 'dashboard' && (
          isConsultant ? (
            <ConsultantDashboard opportunities={displayedOpportunities} />
          ) : (
            <CeoDashboard opportunities={displayedOpportunities} />
          )
        )}

        {currentView === 'clients' && (
          <ClientPortfolio
            opportunities={displayedOpportunities}
            onSelectOpportunity={handleOpenDetail}
          />
        )}

        {currentView === 'suggestions' && (
          <SuggestionsView />
        )}
      </main>

      {/* Barra de Navegação Inferior Fixa (Mobile) */}
      <nav className="fixed bottom-0 left-0 right-0 z-30 h-16 md:hidden bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 flex items-center justify-around px-1 py-1 shadow-lg pb-[env(safe-area-inset-bottom)]">
        <button
          type="button"
          onClick={() => setCurrentView('kanban')}
          className={`flex flex-col items-center justify-center flex-1 py-1 rounded-lg transition-colors cursor-pointer ${
            currentView === 'kanban' ? 'text-blue-600 dark:text-blue-400 font-bold' : 'text-slate-500 dark:text-slate-400'
          }`}
        >
          <Kanban className="w-5 h-5 mb-0.5" />
          <span className="text-[10px]">Pipeline</span>
        </button>
        <button
          type="button"
          onClick={() => setCurrentView('tasks')}
          className={`flex flex-col items-center justify-center flex-1 py-1 rounded-lg transition-colors cursor-pointer ${
            currentView === 'tasks' ? 'text-blue-600 dark:text-blue-400 font-bold' : 'text-slate-500 dark:text-slate-400'
          }`}
        >
          <CheckSquare className="w-5 h-5 mb-0.5" />
          <span className="text-[10px]">Tarefas</span>
        </button>
        <button
          type="button"
          onClick={() => setCurrentView('calendar')}
          className={`flex flex-col items-center justify-center flex-1 py-1 rounded-lg transition-colors cursor-pointer ${
            currentView === 'calendar' ? 'text-blue-600 dark:text-blue-400 font-bold' : 'text-slate-500 dark:text-slate-400'
          }`}
        >
          <CalendarIcon className="w-5 h-5 mb-0.5" />
          <span className="text-[10px]">Agenda</span>
        </button>
        <button
          type="button"
          onClick={() => setCurrentView('dashboard')}
          className={`flex flex-col items-center justify-center flex-1 py-1 rounded-lg transition-colors cursor-pointer ${
            currentView === 'dashboard' ? 'text-blue-600 dark:text-blue-400 font-bold' : 'text-slate-500 dark:text-slate-400'
          }`}
        >
          <BarChart3 className="w-5 h-5 mb-0.5" />
          <span className="text-[10px]">Dashboard</span>
        </button>
        <button
          type="button"
          onClick={() => setCurrentView('clients')}
          className={`flex flex-col items-center justify-center flex-1 py-1 rounded-lg transition-colors cursor-pointer ${
            currentView === 'clients' ? 'text-blue-600 dark:text-blue-400 font-bold' : 'text-slate-500 dark:text-slate-400'
          }`}
        >
          <Building2 className="w-5 h-5 mb-0.5" />
          <span className="text-[10px]">Empresas</span>
        </button>
        <button
          type="button"
          onClick={() => setCurrentView('suggestions')}
          className={`flex flex-col items-center justify-center flex-1 py-1 rounded-lg transition-colors cursor-pointer ${
            currentView === 'suggestions' ? 'text-blue-600 dark:text-blue-400 font-bold' : 'text-slate-500 dark:text-slate-400'
          }`}
        >
          <HelpCircle className="w-5 h-5 mb-0.5" />
          <span className="text-[10px]">Sugestões</span>
        </button>
      </nav>

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
        onUpdateQualification={handleUpdateQualification}
      />

      <AddCollaboratorModal
        isOpen={isAddCollabOpen}
        onClose={() => setIsAddCollabOpen(false)}
        onAdd={() => {
          loadPipelineData();
        }}
      />

      {/* Modal de Troca Obrigatória de Senha no 1º Login */}
      <ChangePasswordModal
        isOpen={Boolean(profile?.mustChangePassword)}
        userEmail={profile?.email || ''}
        userName={profile?.name || ''}
        onPasswordChanged={changePassword}
      />
    </div>
  );
}

export default function Home() {
  return <AppContent />;
}