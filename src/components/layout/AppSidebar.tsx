'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
  HomeIcon,
  CheckSquare,
  CalendarIcon,
  BarChart3,
  Building2,
  HelpCircle,
  Settings
} from 'lucide-react';

interface AppSidebarProps {
  currentView: 'kanban' | 'tasks' | 'calendar' | 'dashboard' | 'clients' | 'suggestions';
}

export default function AppSidebar({ currentView }: AppSidebarProps) {
  const router = useRouter();

  return (
    <aside className="fixed inset-y-0 left-0 z-40 hidden w-14 flex-col items-center border-r border-[#0b3d8f] bg-[#052D72] pt-20 md:flex">
      <div className="flex flex-col items-center gap-2">
        <Image src="/nexus-shield-cropped.png" alt="Nexus Flow" width={28} height={32} style={{ width: 'auto', height: 'auto' }} className="mb-2 object-contain" priority />
        <button
          type="button"
          onClick={() => router.push('/dashboard')}
          className={`flex h-10 w-10 items-center justify-center rounded-lg transition-colors cursor-pointer ${currentView === 'dashboard' ? 'bg-[#24C9FF] text-[#052D72]' : 'text-white/70 hover:bg-white/10 hover:text-white'}`}
          aria-label="Abrir dashboard"
          title="Dashboard"
        >
          <BarChart3 className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => router.push('/')}
          className={`flex h-10 w-10 items-center justify-center rounded-lg transition-colors cursor-pointer ${currentView === 'kanban' ? 'bg-[#24C9FF] text-[#052D72]' : 'text-white/70 hover:bg-white/10 hover:text-white'}`}
          aria-label="Abrir pipeline"
          title="Pipeline"
        >
          <HomeIcon className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => router.push('/tasks')}
          className={`flex h-10 w-10 items-center justify-center rounded-lg transition-colors cursor-pointer ${currentView === 'tasks' ? 'bg-[#24C9FF] text-[#052D72]' : 'text-white/70 hover:bg-white/10 hover:text-white'}`}
          aria-label="Abrir tarefas"
          title="Meu dia"
        >
          <CheckSquare className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => router.push('/calendar')}
          className={`flex h-10 w-10 items-center justify-center rounded-lg transition-colors cursor-pointer ${currentView === 'calendar' ? 'bg-[#24C9FF] text-[#052D72]' : 'text-white/70 hover:bg-white/10 hover:text-white'}`}
          aria-label="Abrir Agenda Google da Equipe"
          title="Agenda da Equipe (Google)"
        >
          <CalendarIcon className="h-4 w-4" />
        </button>
        <div className="my-1 h-px w-7 bg-white/20" />
        <button
          type="button"
          onClick={() => router.push('/clients')}
          className={`flex h-10 w-10 items-center justify-center rounded-lg transition-colors cursor-pointer ${currentView === 'clients' ? 'bg-[#24C9FF] text-[#052D72]' : 'text-white/70 hover:bg-white/10 hover:text-white'}`}
          aria-label="Empresas"
          title="Empresas"
        >
          <Building2 className="h-4 w-4" />
        </button>
        <div className="my-1 h-px w-7 bg-white/20" />
        <button
          type="button"
          onClick={() => router.push('/')}
          className={`flex h-10 w-10 items-center justify-center rounded-lg transition-colors cursor-pointer ${currentView === 'suggestions' ? 'bg-[#24C9FF] text-[#052D72]' : 'text-white/70 hover:bg-white/10 hover:text-white'}`}
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
  );
}