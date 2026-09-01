import { supabase } from './client';
import { CalendarEvent, CollaboratorAccount, CalendarCategory, GoogleIntegrationSettings, FreeTimeSlot } from '@/types/calendar';
import { Opportunity } from '@/types/crm';
import { DEFAULT_COLLABORATORS, DEFAULT_CATEGORIES, DEFAULT_GOOGLE_SETTINGS } from '@/lib/calendar-mock-data';

const STORAGE_KEYS = {
  EVENTS: 'nexus_real_calendar_events_v2',
  COLLABORATORS: 'nexus_real_calendar_collaborators_v2',
  CATEGORIES: 'nexus_calendar_categories_v2',
  SETTINGS: 'nexus_calendar_google_settings_v2',
};

class CalendarService {
  private getStorageItem<T>(key: string, defaultValue: T): T {
    if (typeof window === 'undefined') return defaultValue;
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch {
      return defaultValue;
    }
  }

  private setStorageItem<T>(key: string, value: T): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.warn('Erro ao salvar localmente:', e);
    }
  }

  // 1. Obter Colaboradores Reais (Supabase ➔ Local)
  public async getCollaborators(): Promise<CollaboratorAccount[]> {
    let list: CollaboratorAccount[] = [];

    try {
      const { data, error } = await supabase
        .from('calendar_collaborators')
        .select('*')
        .order('created_at', { ascending: true });

      if (!error && data && data.length > 0) {
        list = data.map((d: any) => ({
          id: d.id,
          name: d.name,
          roleTitle: d.role_title,
          department: d.department,
          email: d.email,
          avatar: d.avatar,
          color: d.color,
          googleCalendarId: d.google_calendar_id,
          googleConnected: d.google_connected,
          syncStatus: d.sync_status,
          lastSyncAt: d.last_sync_at,
          isVisible: d.is_visible,
        }));
      }
    } catch {
      // Ignora e usa fallback
    }

    if (list.length === 0) {
      list = this.getStorageItem<CollaboratorAccount[]>(STORAGE_KEYS.COLLABORATORS, DEFAULT_COLLABORATORS);
      try {
        await supabase.from('calendar_collaborators').upsert(
          list.map((c) => ({
            id: c.id,
            name: c.name,
            role_title: c.roleTitle,
            department: c.department,
            email: c.email,
            avatar: c.avatar,
            color: c.color,
            google_calendar_id: c.googleCalendarId,
            google_connected: c.googleConnected,
            sync_status: c.syncStatus,
            last_sync_at: c.lastSyncAt,
            is_visible: c.isVisible,
          }))
        );
      } catch {
        // Ignora erro se tabelas ainda não estiverem migradas remotamente
      }
    }

    // Desduplica por e-mail ou prefixo de nome
    const seen = new Set<string>();
    const deduplicated = list.filter((c) => {
      const key = (c.email || c.name || c.id).toLowerCase().trim();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    this.setStorageItem(STORAGE_KEYS.COLLABORATORS, deduplicated);
    return deduplicated;
  }

  public async getAccounts(): Promise<CollaboratorAccount[]> {
    return this.getCollaborators();
  }

  // 2. Salvar Colaboradores
  public async saveCollaborators(collaborators: CollaboratorAccount[]): Promise<void> {
    this.setStorageItem(STORAGE_KEYS.COLLABORATORS, collaborators);

    try {
      const upsertPayload = collaborators.map((c) => ({
        id: c.id,
        name: c.name,
        role_title: c.roleTitle,
        department: c.department,
        email: c.email,
        avatar: c.avatar,
        color: c.color,
        google_calendar_id: c.googleCalendarId,
        google_connected: c.googleConnected,
        sync_status: c.syncStatus,
        last_sync_at: c.lastSyncAt,
        is_visible: c.isVisible,
      }));

      await supabase.from('calendar_collaborators').upsert(upsertPayload);
    } catch {
      // Ignora erro se tabelas ainda não estiverem migradas remotamente
    }
  }

  public async saveAccounts(accounts: CollaboratorAccount[]): Promise<void> {
    return this.saveCollaborators(accounts);
  }

  // 3. Adicionar Colaborador
  public async addCollaborator(collab: Omit<CollaboratorAccount, 'id' | 'syncStatus' | 'lastSyncAt'>): Promise<CollaboratorAccount> {
    const collaborators = await this.getCollaborators();
    const newId = `collab_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`;
    
    const newCollaborator: CollaboratorAccount = {
      ...collab,
      id: newId,
      googleCalendarId: collab.googleCalendarId || collab.email,
      googleConnected: true,
      syncStatus: 'synced',
      lastSyncAt: new Date().toISOString(),
      isVisible: true,
    };

    const updated = [...collaborators, newCollaborator];
    await this.saveCollaborators(updated);
    return newCollaborator;
  }

  // 4. Obter Eventos Reais (Sem Mocks)
  public async getEvents(crmOpportunities?: Opportunity[]): Promise<CalendarEvent[]> {
    let events: CalendarEvent[] = [];

    // Busca do Supabase
    try {
      const { data, error } = await supabase
        .from('calendar_events')
        .select('*')
        .order('start_time', { ascending: true });

      if (!error && data && data.length > 0) {
        events = data.map((d: any) => ({
          id: d.id,
          title: d.title,
          description: d.description,
          collaboratorId: d.collaborator_id,
          ctoId: d.collaborator_id,
          additionalCollaboratorIds: d.additional_collaborator_ids || [],
          categoryId: d.category_id,
          startTime: d.start_time,
          endTime: d.end_time,
          isAllDay: d.is_all_day,
          meetUrl: d.meet_url,
          location: d.location,
          attendees: d.attendees || [],
          linkedOpportunityId: d.linked_opportunity_id,
          opportunityTitle: d.opportunity_title,
          opportunityCompanyName: d.opportunity_company_name,
          opportunityScore: d.opportunity_score,
          stageTitle: d.stage_title,
          recurrence: d.recurrence || 'none',
          source: d.source,
          status: d.status,
          createdAt: d.created_at,
          updatedAt: d.updated_at,
        }));
      }
    } catch {
      // Ignora erro
    }

    // Se o Supabase vier vazio, busca no localStorage e, se ainda não houver eventos do Google,
    // sincroniza com a API real (evita ficar preso apenas aos eventos locais/CRM)
    if (events.length === 0) {
      events = this.getStorageItem<CalendarEvent[]>(STORAGE_KEYS.EVENTS, []);
    }

    if (typeof window !== 'undefined') {
      const hasGoogleEvents = events.some((e) => e.source === 'google_calendar');
      if (!hasGoogleEvents) {
        try {
          const syncRes = await fetch('/api/calendar/sync', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({}),
          });
          if (syncRes.ok) {
            const syncData = await syncRes.json();
            if (syncData.events && syncData.events.length > 0) {
              const merged = [...events];
              for (const ge of syncData.events as CalendarEvent[]) {
                if (!merged.some((e) => e.id === ge.id)) {
                  merged.push(ge);
                }
              }
              events = merged;
              this.setStorageItem(STORAGE_KEYS.EVENTS, merged);
            }
          }
        } catch {
          // Fallback silencioso
        }
      }
    }

    // Sincroniza apenas reuniões reais do CRM que tenham data agendada
    if (crmOpportunities && crmOpportunities.length > 0) {
      const crmEvents: CalendarEvent[] = [];
      
      crmOpportunities.forEach((opp) => {
        if (opp.nextActionDate && !events.some((e) => e.linkedOpportunityId === opp.id)) {
          const actionDate = new Date(opp.nextActionDate);
          if (!isNaN(actionDate.getTime())) {
            const endDate = new Date(actionDate.getTime() + 60 * 60 * 1000);
            
            crmEvents.push({
              id: `crm_opp_${opp.id}`,
              title: `${opp.nextActionDescription} | ${opp.tradeName || opp.companyName}`,
              description: `Compromisso do lead ${opp.tradeName || opp.companyName}. Score: ${opp.score} pts. Responsável: ${opp.consultantName}`,
              collaboratorId: 'collab_carlos',
              ctoId: 'collab_carlos',
              categoryId: 'crm_diagnostico',
              startTime: actionDate.toISOString(),
              endTime: endDate.toISOString(),
              meetUrl: `https://meet.google.com/crm-${opp.id.toLowerCase().replace(/[^a-z0-9]/g, '')}`,
              linkedOpportunityId: opp.id,
              opportunityTitle: opp.title,
              opportunityCompanyName: opp.tradeName || opp.companyName,
              opportunityScore: opp.score,
              stageTitle: opp.stage,
              attendees: opp.contacts?.map((c) => ({
                name: c.name,
                email: c.email,
                role: c.jobTitle,
                status: 'accepted' as const,
              })),
              source: 'crm_nexus',
              status: 'confirmed',
              createdAt: opp.createdAt || new Date().toISOString(),
              updatedAt: opp.updatedAt || new Date().toISOString(),
            });
          }
        }
      });

      if (crmEvents.length > 0) {
        events = [...events, ...crmEvents];
        this.setStorageItem(STORAGE_KEYS.EVENTS, events);
      }
    }

    return events;
  }

  // 5. Salvar ou Atualizar Evento Real
  public async saveEvent(event: Partial<CalendarEvent>): Promise<CalendarEvent> {
    const events = await this.getEvents();
    let savedEvent: CalendarEvent;

    const collabId = event.collaboratorId || event.ctoId || 'collab_carlos';

    let meetUrl = event.meetUrl;
    if (!meetUrl && event.title) {
      try {
        const res = await fetch('/api/calendar/events', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: event.title,
            description: event.description,
            startTime: event.startTime,
            endTime: event.endTime,
            createMeet: true,
          }),
        });
        if (res.ok) {
          const resData = await res.json();
          if (resData.meetUrl) meetUrl = resData.meetUrl;
        }
      } catch {
        meetUrl = `https://meet.google.com/nex-${Math.random().toString(36).substring(2, 5)}-${Math.random().toString(36).substring(2, 5)}`;
      }
    }

    if (event.id && events.some((e) => e.id === event.id)) {
      savedEvent = {
        ...events.find((e) => e.id === event.id)!,
        ...event,
        collaboratorId: collabId,
        ctoId: collabId,
        meetUrl: meetUrl || event.meetUrl,
        updatedAt: new Date().toISOString(),
      } as CalendarEvent;

      const updatedList = events.map((e) => (e.id === event.id ? savedEvent : e));
      this.setStorageItem(STORAGE_KEYS.EVENTS, updatedList);
    } else {
      const newId = event.id || `evt_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
      savedEvent = {
        id: newId,
        title: event.title || 'Nova Reunião',
        description: event.description || '',
        collaboratorId: collabId,
        ctoId: collabId,
        additionalCollaboratorIds: event.additionalCollaboratorIds || [],
        categoryId: event.categoryId || 'tech_alignment',
        startTime: event.startTime || new Date().toISOString(),
        endTime: event.endTime || new Date(Date.now() + 3600000).toISOString(),
        isAllDay: event.isAllDay || false,
        meetUrl: meetUrl || `https://meet.google.com/nex-${Math.random().toString(36).substr(2, 6)}`,
        location: event.location || '',
        attendees: event.attendees || [],
        linkedOpportunityId: event.linkedOpportunityId,
        opportunityTitle: event.opportunityTitle,
        opportunityCompanyName: event.opportunityCompanyName,
        opportunityScore: event.opportunityScore,
        stageTitle: event.stageTitle,
        recurrence: event.recurrence || 'none',
        source: event.source || 'google_calendar',
        status: event.status || 'confirmed',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const updatedList = [savedEvent, ...events];
      this.setStorageItem(STORAGE_KEYS.EVENTS, updatedList);
    }

    try {
      await supabase.from('calendar_events').upsert({
        id: savedEvent.id,
        title: savedEvent.title,
        description: savedEvent.description,
        collaborator_id: savedEvent.collaboratorId,
        additional_collaborator_ids: savedEvent.additionalCollaboratorIds,
        category_id: savedEvent.categoryId,
        start_time: savedEvent.startTime,
        end_time: savedEvent.endTime,
        is_all_day: savedEvent.isAllDay,
        meet_url: savedEvent.meetUrl,
        location: savedEvent.location,
        attendees: savedEvent.attendees,
        linked_opportunity_id: savedEvent.linkedOpportunityId,
        opportunity_title: savedEvent.opportunityTitle,
        opportunity_company_name: savedEvent.opportunityCompanyName,
        opportunity_score: savedEvent.opportunityScore,
        stage_title: savedEvent.stageTitle,
        recurrence: savedEvent.recurrence,
        source: savedEvent.source,
        status: savedEvent.status,
      });
    } catch {
      // Ignora erro remoto
    }

    return savedEvent;
  }

  // 6. Deletar Evento Real
  public async deleteEvent(eventId: string): Promise<boolean> {
    const events = await this.getEvents();
    const filtered = events.filter((e) => e.id !== eventId);
    this.setStorageItem(STORAGE_KEYS.EVENTS, filtered);

    try {
      await supabase.from('calendar_events').delete().eq('id', eventId);
      await fetch(`/api/calendar/events?eventId=${encodeURIComponent(eventId)}`, { method: 'DELETE' });
    } catch {
      // Ignora erro
    }

    return true;
  }

  // 7. Categorias
  public async getCategories(): Promise<CalendarCategory[]> {
    return this.getStorageItem<CalendarCategory[]>(STORAGE_KEYS.CATEGORIES, DEFAULT_CATEGORIES);
  }

  public async saveCategories(categories: CalendarCategory[]): Promise<void> {
    this.setStorageItem(STORAGE_KEYS.CATEGORIES, categories);
  }

  // 8. Configurações do Google
  public async getGoogleSettings(): Promise<GoogleIntegrationSettings> {
    return this.getStorageItem<GoogleIntegrationSettings>(STORAGE_KEYS.SETTINGS, DEFAULT_GOOGLE_SETTINGS);
  }

  public async saveGoogleSettings(settings: GoogleIntegrationSettings): Promise<void> {
    this.setStorageItem(STORAGE_KEYS.SETTINGS, settings);
    try {
      await supabase.from('calendar_settings').upsert({
        id: 'global_settings',
        domain: settings.domain,
        domain_wide_sync: settings.domainWideSync,
        auto_sync_interval_minutes: settings.autoSyncIntervalMinutes,
        sync_crm_diagnosticos: settings.syncCrmDiagnosticos,
        webhook_url: settings.webhookUrl,
        google_client_id: settings.googleClientId,
        service_account_configured: settings.serviceAccountConfigured,
        last_global_sync_at: new Date().toISOString(),
      });
    } catch {
      // Ignora erro
    }
  }

  // 9. Sincronizar com Google Calendar API Real
  public async syncWithGoogle(): Promise<{ success: boolean; syncedCount: number; timestamp: string }> {
    const now = new Date().toISOString();

    const collaborators = await this.getCollaborators();
    const updated = collaborators.map((acc) => ({
      ...acc,
      googleConnected: true,
      syncStatus: 'synced' as const,
      lastSyncAt: now,
    }));
    await this.saveCollaborators(updated);

    try {
      const syncRes = await fetch('/api/calendar/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });

      if (syncRes.ok) {
        const syncData = await syncRes.json();
        if (syncData.events && syncData.events.length > 0) {
          const currentEvents = await this.getEvents();
          const merged = [...currentEvents];
          syncData.events.forEach((ge: CalendarEvent) => {
            if (!merged.some((e) => e.id === ge.id)) {
              merged.push(ge);
            }
          });
          this.setStorageItem(STORAGE_KEYS.EVENTS, merged);
        }
      }
    } catch (e) {
      console.warn('Sync API request failed:', e);
    }

    const settings = await this.getGoogleSettings();
    await this.saveGoogleSettings({
      ...settings,
      connectedAccountsCount: updated.length,
      lastGlobalSyncAt: now,
    });

    const events = await this.getEvents();
    return {
      success: true,
      syncedCount: events.length,
      timestamp: now,
    };
  }

  // 10. Localizador de Horários Livres
  public findCommonFreeSlots(
    events: CalendarEvent[],
    targetDate: Date,
    selectedCollaboratorIds: string[] = [],
    workStartHour: number = 9,
    workEndHour: number = 18,
    slotDurationMinutes: number = 60
  ): FreeTimeSlot[] {
    const targetDateStr = targetDate.toISOString().split('T')[0];

    const dayEvents = events.filter((e) => {
      if (e.status === 'cancelled') return false;
      const eventDateStr = e.startTime.split('T')[0];
      return eventDateStr === targetDateStr;
    });

    const targetCollaborators = selectedCollaboratorIds.length > 0
      ? selectedCollaboratorIds
      : ['collab_carlos'];

    const slots: FreeTimeSlot[] = [];

    for (let h = workStartHour; h < workEndHour; h++) {
      const slotStart = new Date(targetDate);
      slotStart.setHours(h, 0, 0, 0);
      const slotEnd = new Date(targetDate);
      slotEnd.setHours(h + Math.floor(slotDurationMinutes / 60), slotDurationMinutes % 60, 0, 0);

      const availableCollaborators: string[] = [];

      targetCollaborators.forEach((collabId) => {
        const isBusy = dayEvents.some((e) => {
          const isRelated =
            e.collaboratorId === 'all_team' ||
            e.collaboratorId === collabId ||
            e.ctoId === 'both' ||
            e.additionalCollaboratorIds?.includes(collabId);

          if (!isRelated) return false;

          const eStart = new Date(e.startTime);
          const eEnd = new Date(e.endTime);
          return eStart < slotEnd && eEnd > slotStart;
        });

        if (!isBusy) {
          availableCollaborators.push(collabId);
        }
      });

      if (availableCollaborators.length > 0) {
        slots.push({
          date: targetDateStr,
          startTime: `${String(h).padStart(2, '0')}:00`,
          endTime: `${String(h + 1).padStart(2, '0')}:00`,
          durationMinutes: slotDurationMinutes,
          availableCollaborators,
        });
      }
    }

    return slots;
  }
}

export const calendarService = new CalendarService();
