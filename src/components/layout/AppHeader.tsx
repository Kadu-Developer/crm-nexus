'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/lib/supabase/auth-context';
import { useTheme } from '@/lib/theme-provider';
import {
  Menu,
  ShieldCheck,
  Users,
  RefreshCw,
  Sun,
  Moon,
  UserPlus,
  Plus,
  LogOut,
  Search,
  Kanban,
  CheckSquare,
  CalendarIcon,
  LayoutDashboard,
} from 'lucide-react';
import { toast } from 'sonner';

export default function AppHeader() {
  const { profile, signOut } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const router = useRouter();
  const pathname = usePathname();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [loadingData, setLoadingData] = useState(false);

  const currentView = pathname.replace('/', '') as
    | 'kanban' | 'tasks' | 'calendar' | 'dashboard' | 'clients' | 'suggestions' | '';

  const handleRefresh = async () => {
    setLoadingData(true);
    // Refresh logic here
    setTimeout(() => setLoadingData(false), 1000);
  };

  return (
    <header className="fixed top-0 left-0 right-0 h-16 w-full max-w-full border-b border-slate-200/80 dark:border-slate-800/80 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md px-3 sm:px-6 md:pl-[5.5rem] flex items-center justify-between z-30 transition-colors">
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
        <div className="flex items-center gap-2 sm:gap-3 cursor-pointer select-none shrink-0" onClick={() => router.push('/')}>
          <Image src="/assets/logos/logo-shield-symbol.png" alt="Nexus Flow Tech" width={350} height={138} className="h-7 sm:h-8 w-auto object-contain" priority />
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
            onClick={() => router.push('/')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${currentView === '' || currentView === 'kanban' ? 'bg-white dark:bg-blue-600 text-blue-600 dark:text-white shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'}`}
          >
            <Kanban className="w-3.5 h-3.5" />
            Pipeline
          </button>
          <button
            onClick={() => router.push('/tasks')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${currentView === 'tasks' ? 'bg-white dark:bg-blue-600 text-blue-600 dark:text-white shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'}`}
          >
            <CheckSquare className="w-3.5 h-3.5" />
            Meu Dia
          </button>
          <button
            onClick={() => router.push('/calendar')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${currentView === 'calendar' ? 'bg-white dark:bg-blue-600 text-blue-600 dark:text-white shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'}`}
          >
            <CalendarIcon className="w-3.5 h-3.5" />
            Agenda
          </button>
          <button
            onClick={() => router.push('/dashboard')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${currentView === 'dashboard' ? 'bg-white dark:bg-blue-600 text-blue-600 dark:text-white shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'}`}
          >
            <LayoutDashboard className="w-3.5 h-3.5" />
            Dashboard
          </button>
        </nav>
      </div>

      <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
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

        <div className="hidden sm:flex items-center gap-2 bg-slate-100 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-lg px-2.5 py-1.5">
          {profile?.role === 'admin_ceo' ? (
            <ShieldCheck className="w-4 h-4 text-amber-500" />
          ) : (
            <Users className="w-3.5 h-3.5 text-blue-500" />
          )}
          <span className="text-xs text-slate-700 dark:text-slate-300 font-semibold truncate max-w-[150px]">
            {profile?.name}
          </span>
        </div>

        <button
          onClick={handleRefresh}
          className={`p-1.5 sm:p-2 rounded-lg bg-slate-100 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition cursor-pointer ${loadingData ? 'animate-spin text-blue-500' : ''}`}
          title="Recarregar dados"
        >
          <RefreshCw className="w-3.5 sm:w-4 h-3.5 sm:h-4" />
        </button>

        <button
          onClick={toggleTheme}
          className="p-1.5 sm:p-2 rounded-lg bg-slate-100 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition cursor-pointer"
          title={theme === 'dark' ? 'Mudar para Tema Claro' : 'Mudar para Tema Escuro'}
        >
          {theme === 'dark' ? <Sun className="w-3.5 sm:w-4 h-3.5 sm:h-4 text-amber-400" /> : <Moon className="w-3.5 sm:w-4 h-3.5 sm:h-4 text-slate-700" />}
        </button>

        <button
          onClick={async () => {
            await signOut();
            router.push('/login');
          }}
          className="p-1.5 sm:p-2 rounded-lg bg-slate-100 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-500 hover:text-rose-500 transition cursor-pointer"
          title="Sair"
        >
          <LogOut className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
        </button>
      </div>
    </header>
  );
}
