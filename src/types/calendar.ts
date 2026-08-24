export type CalendarViewMode = 'week' | 'day' | 'month' | 'agenda';

export type EventSource = 'google_calendar' | 'crm_nexus' | 'manual';

export type EventStatus = 'confirmed' | 'tentative' | 'cancelled';

export type Department = 'all' | 'executivo' | 'engenharia' | 'comercial' | 'produto';

export interface CollaboratorAccount {
  id: string;
  name: string;
  roleTitle: string;
  department: Department;
  email: string;
  avatar: string;
  color: string; // Hex color
  accentColor?: string;
  googleCalendarId: string;
  googleConnected: boolean;
  syncStatus: 'synced' | 'syncing' | 'error' | 'disconnected';
  lastSyncAt: string;
  isVisible: boolean;
}

// Alias for compatibility
export type CtoAccount = CollaboratorAccount;
export type CtoId = string;

export interface CalendarCategory {
  id: string;
  name: string;
  color: string;
  borderColor: string;
  bgLight: string;
  bgDark: string;
  textLight: string;
  textDark: string;
  isVisible: boolean;
}

export interface EventAttendee {
  name: string;
  email: string;
  avatar?: string;
  status?: 'accepted' | 'tentative' | 'declined';
  role?: string;
}

export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  collaboratorId: string; // ID do colaborador responsável ou 'all_team'
  ctoId?: string; // Compatibilidade com código legado
  additionalCollaboratorIds?: string[]; // Colaboradores adicionais participando
  categoryId: string;
  startTime: string; // ISO String
  endTime: string;   // ISO String
  isAllDay?: boolean;
  meetUrl?: string;
  location?: string;
  attendees?: EventAttendee[];
  
  // CRM Linkage
  linkedOpportunityId?: string;
  opportunityTitle?: string;
  opportunityCompanyName?: string;
  opportunityScore?: number;
  stageTitle?: string;
  
  recurrence?: 'none' | 'daily' | 'weekly' | 'monthly';
  source: EventSource;
  status: EventStatus;
  
  createdAt: string;
  updatedAt: string;
}

export interface GoogleIntegrationSettings {
  domain: string; // Ex: nexusflow.com.br
  domainWideSync: boolean;
  autoSyncIntervalMinutes: number;
  syncCrmDiagnosticos: boolean;
  webhookUrl: string;
  googleClientId?: string;
  serviceAccountConfigured: boolean;
  connectedAccountsCount?: number;
  lastGlobalSyncAt?: string;
}

export interface FreeTimeSlot {
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string;   // HH:mm
  durationMinutes: number;
  availableCollaborators: string[];
  availableCtos?: ('cto_1' | 'cto_2')[];
}
