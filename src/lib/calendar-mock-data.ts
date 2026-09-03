import { CollaboratorAccount, CalendarCategory, CalendarEvent, GoogleIntegrationSettings } from '@/types/calendar';

export const DEFAULT_COLLABORATORS: CollaboratorAccount[] = [
  {
    id: 'collab_marcel',
    name: 'Marcel Wachowicz',
    roleTitle: 'Founder & CEO / CFO',
    department: 'executivo',
    email: 'marcel@nexusflowtech.com.br',
    avatar: 'MW',
    color: '#f59e0b',
    googleCalendarId: 'marcel@nexusflowtech.com.br',
    googleConnected: false,
    syncStatus: 'disconnected',
    lastSyncAt: '',
    isVisible: true,
  },
  {
    id: 'collab_patrik',
    name: 'Patrik Rodrigues',
    roleTitle: 'CTO & Inteligência Artificial e Automação',
    department: 'engenharia',
    email: 'patrik@nexusflowtech.com.br',
    avatar: 'PR',
    color: '#8b5cf6',
    googleCalendarId: 'patrik@nexusflowtech.com.br',
    googleConnected: false,
    syncStatus: 'disconnected',
    lastSyncAt: '',
    isVisible: true,
  },
  {
    id: 'collab_carlos',
    name: 'Carlos Eduardo da Silva Ribeiro',
    roleTitle: 'Tech Lead Full Stack & IA',
    department: 'engenharia',
    email: 'carlos@nexusflowtech.com.br',
    avatar: 'CR',
    color: '#0284c7',
    googleCalendarId: 'carlos@nexusflowtech.com.br',
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
    id: 'geral_outros',
    name: 'Outros Compromissos',
    color: '#64748b',
    borderColor: 'border-slate-500',
    bgLight: 'bg-slate-50 text-slate-900 border-slate-200',
    bgDark: 'dark:bg-slate-900/70 dark:text-slate-200 dark:border-slate-800/80',
    textLight: 'text-slate-700',
    textDark: 'dark:text-slate-300',
    isVisible: true,
  },
];

export const DEFAULT_GOOGLE_SETTINGS: GoogleIntegrationSettings = {
  domain: 'nexusflowtech.com.br',
  domainWideSync: true,
  autoSyncIntervalMinutes: 15,
  syncCrmDiagnosticos: true,
  webhookUrl: 'https://crm.nexusflowtech.com.br/api/calendar/webhook',
  serviceAccountConfigured: true,
  connectedAccountsCount: 3,
};

export const INITIAL_CALENDAR_EVENTS: CalendarEvent[] = [];

export const FALLBACK_CATEGORY: CalendarCategory = {
  id: 'default',
  name: 'Geral',
  color: '#0284c7',
  borderColor: 'border-blue-500',
  bgLight: 'bg-blue-50 text-blue-900 border-blue-200',
  bgDark: 'dark:bg-blue-950/70 dark:text-blue-200 dark:border-blue-800/80',
  textLight: 'text-blue-700',
  textDark: 'dark:text-blue-300',
  isVisible: true,
};

