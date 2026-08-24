import { CollaboratorAccount, CalendarCategory, CalendarEvent, GoogleIntegrationSettings } from '@/types/calendar';

export const DEFAULT_COLLABORATORS: CollaboratorAccount[] = [
  {
    id: 'collab_carlos',
    name: 'Carlos Eduardo',
    roleTitle: 'Diretor / CTO',
    department: 'executivo',
    email: 'carlos@nexustechflow.com.br',
    avatar: 'CE',
    color: '#0284c7',
    googleCalendarId: 'carlos@nexustechflow.com.br',
    googleConnected: false,
    syncStatus: 'disconnected',
    lastSyncAt: '',
    isVisible: true,
  },
];

export const DEFAULT_CTO_ACCOUNTS = DEFAULT_COLLABORATORS;

export const DEFAULT_CATEGORIES: CalendarCategory[] = [
  {
    id: 'crm_diagnostico',
    name: 'Pré-Diagnósticos & Clientes CRM',
    color: '#2563eb',
    borderColor: 'border-blue-500',
    bgLight: 'bg-blue-50 text-blue-900 border-blue-200',
    bgDark: 'dark:bg-blue-950/70 dark:text-blue-200 dark:border-blue-800/80',
    textLight: 'text-blue-700',
    textDark: 'dark:text-blue-300',
    isVisible: true,
  },
  {
    id: 'tech_alignment',
    name: 'Alinhamento Técnico & Engenharia',
    color: '#7c3aed',
    borderColor: 'border-purple-500',
    bgLight: 'bg-purple-50 text-purple-900 border-purple-200',
    bgDark: 'dark:bg-purple-950/70 dark:text-purple-200 dark:border-purple-800/80',
    textLight: 'text-purple-700',
    textDark: 'dark:text-purple-300',
    isVisible: true,
  },
  {
    id: 'comercial_discovery',
    name: 'Discovery & Fechamento Comercial',
    color: '#db2777',
    borderColor: 'border-pink-500',
    bgLight: 'bg-pink-50 text-pink-900 border-pink-200',
    bgDark: 'dark:bg-pink-950/70 dark:text-pink-200 dark:border-pink-800/80',
    textLight: 'text-pink-700',
    textDark: 'dark:text-pink-300',
    isVisible: true,
  },
  {
    id: 'one_on_one',
    name: '1-on-1s & Mentoria',
    color: '#059669',
    borderColor: 'border-emerald-500',
    bgLight: 'bg-emerald-50 text-emerald-900 border-emerald-200',
    bgDark: 'dark:bg-emerald-950/70 dark:text-emerald-200 dark:border-emerald-800/80',
    textLight: 'text-emerald-700',
    textDark: 'dark:text-emerald-300',
    isVisible: true,
  },
  {
    id: 'focus_time',
    name: 'Foco Técnico & Deep Work',
    color: '#d97706',
    borderColor: 'border-amber-500',
    bgLight: 'bg-amber-50 text-amber-900 border-amber-200',
    bgDark: 'dark:bg-amber-950/70 dark:text-amber-200 dark:border-amber-800/80',
    textLight: 'text-amber-700',
    textDark: 'dark:text-amber-300',
    isVisible: true,
  },
  {
    id: 'executive_board',
    name: 'Comitê Executivo & Diretoria',
    color: '#e11d48',
    borderColor: 'border-rose-500',
    bgLight: 'bg-rose-50 text-rose-900 border-rose-200',
    bgDark: 'dark:bg-rose-950/70 dark:text-rose-200 dark:border-rose-800/80',
    textLight: 'text-rose-700',
    textDark: 'dark:text-rose-300',
    isVisible: true,
  },
];

export const DEFAULT_GOOGLE_SETTINGS: GoogleIntegrationSettings = {
  domain: 'nexustechflow.com.br',
  domainWideSync: true,
  autoSyncIntervalMinutes: 15,
  syncCrmDiagnosticos: true,
  webhookUrl: '',
  googleClientId: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '',
  serviceAccountConfigured: false,
  connectedAccountsCount: 0,
  lastGlobalSyncAt: '',
};

// Retorna lista 100% limpa (sem eventos falsos)
export function generateInitialEvents(): CalendarEvent[] {
  return [];
}
