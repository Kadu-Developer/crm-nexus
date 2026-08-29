'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  CalendarEvent,
  CollaboratorAccount,
  CalendarCategory,
  CalendarViewMode,
  GoogleIntegrationSettings,
  FreeTimeSlot,
} from '@/types/calendar';
import { Opportunity } from '@/types/crm';
import { calendarService } from '@/lib/supabase/calendar-service';
import { CalendarLeftSidebar } from './CalendarLeftSidebar';
import { CalendarHeader } from './CalendarHeader';
import { CalendarWeekGrid } from './CalendarWeekGrid';
import { CalendarDayGrid } from './CalendarDayGrid';
import { CalendarMonthGrid } from './CalendarMonthGrid';
import { CalendarAgendaList } from './CalendarAgendaList';
import { CalendarRightSidebar } from './CalendarRightSidebar';
import { EventModal } from './EventModal';
import { EventDetailModal } from './EventDetailModal';
import { GoogleSyncSettingsModal } from './GoogleSyncSettingsModal';
import { AddCollaboratorModal } from './AddCollaboratorModal';
import { toast } from 'sonner';
import { useAuth } from '@/lib/supabase/auth-context';

interface CalendarModuleProps {
  opportunities?: Opportunity[];
  onSelectOpportunity?: (opp: Opportunity) => void;
}

export function CalendarModule({ opportunities = [], onSelectOpportunity }: CalendarModuleProps) {
  const { profile } = useAuth();
  const isAdmin = profile?.role === 'admin_ceo' || profile?.role === 'admin_tech';
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [viewMode, setViewMode] = useState<CalendarViewMode>('week');
  const [searchQuery, setSearchQuery] = useState('');

  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [accounts, setAccounts] = useState<CollaboratorAccount[]>([]);
  const [categories, setCategories] = useState<CalendarCategory[]>([]);
  const [googleSettings, setGoogleSettings] = useState<GoogleIntegrationSettings | null>(null);

  const [isSyncing, setIsSyncing] = useState(false);
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isAddCollaboratorOpen, setIsAddCollaboratorOpen] = useState(false);

  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [editingEvent, setEditingEvent] = useState<Partial<CalendarEvent> | null>(null);

  // Carregar dados
  const loadData = useCallback(async () => {
    const [evts, accs, cats, settings] = await Promise.all([
      calendarService.getEvents(opportunities),
      calendarService.getCollaborators(),
      calendarService.getCategories(),
      calendarService.getGoogleSettings(),
    ]);

    setEvents(evts);
    setAccounts(accs);
    setCategories(cats);
    setGoogleSettings(settings);
  }, [opportunities]);

  useEffect(() => {
    loadData();

    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get('google_connected') === 'true') {
        const count = urlParams.get('synced_count') || '0';
        toast.success('Conta Google conectada com sucesso!', {
          description: `${count} eventos sincronizados diretamente da sua Google Agenda.`,
        });
        loadData();
        window.history.replaceState({}, '', window.location.pathname);
      }
    }
  }, [loadData]);

  // Alternar visibilidade de um colaborador
  const handleToggleAccount = (id: string) => {
    setAccounts((prev) => {
      const updated = prev.map((a) => (a.id === id ? { ...a, isVisible: !a.isVisible } : a));
      calendarService.saveCollaborators(updated);
      return updated;
    });
  };

  // Alternar visibilidade de todos os colaboradores
  const handleToggleAllAccounts = (visible: boolean) => {
    setAccounts((prev) => {
      const updated = prev.map((a) => ({ ...a, isVisible: visible }));
      calendarService.saveCollaborators(updated);
      return updated;
    });
  };

  // Adicionar novo colaborador
  const handleAddCollaborator = async (collabData: Omit<CollaboratorAccount, 'id' | 'syncStatus' | 'lastSyncAt'>) => {
    await calendarService.addCollaborator(collabData);
    await loadData();
  };

  // Alternar visibilidade de categorias
  const handleToggleCategory = (id: string) => {
    setCategories((prev) => {
      const updated = prev.map((c) => (c.id === id ? { ...c, isVisible: !c.isVisible } : c));
      calendarService.saveCategories(updated);
      return updated;
    });
  };

  // Sincronizar com Google Agenda
  const handleSyncGoogle = async () => {
    setIsSyncing(true);
    try {
      const result = await calendarService.syncWithGoogle();
      await loadData();
      toast.success('Google Workspace sincronizado!', {
        description: `${result.syncedCount} eventos sincronizados para toda a equipe.`,
      });
    } catch (e) {
      toast.error('Erro ao sincronizar com Google Workspace');
    } finally {
      setIsSyncing(false);
    }
  };

  // Salvar novo evento ou edição
  const handleSaveEvent = async (eventData: Partial<CalendarEvent>) => {
    const selectedAccount = accounts.find((a) => a.id === eventData.collaboratorId);
    const collaboratorName = selectedAccount?.name || '';

    let finalTitle = (eventData.title || '').trim();

    // Consultores veem o nome do responsável automaticamente no título.
    // Admin pode editar o título livremente.
    if (!isAdmin && collaboratorName && !finalTitle.startsWith(collaboratorName)) {
      finalTitle = `${collaboratorName}: ${finalTitle}`;
    }

    const payload = { ...eventData, title: finalTitle };
    const saved = await calendarService.saveEvent(payload);
    await loadData();
    toast.success(eventData.id ? 'Evento atualizado com sucesso!' : 'Novo evento agendado!', {
      description: `${saved.title} (${new Date(saved.startTime).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })})`,
    });
  };

  // Excluir evento
  const handleDeleteEvent = async (eventId: string) => {
    await calendarService.deleteEvent(eventId);
    await loadData();
    toast.info('Evento removido da agenda.');
  };

  // Salvar configurações do Google
  const handleSaveGoogleSettings = async (settings: GoogleIntegrationSettings) => {
    await calendarService.saveGoogleSettings(settings);
    setGoogleSettings(settings);
  };

  // Navegação por data
  const handleNavigatePrev = () => {
    const newD = new Date(selectedDate);
    if (viewMode === 'day') newD.setDate(newD.getDate() - 1);
    else if (viewMode === 'week') newD.setDate(newD.getDate() - 7);
    else if (viewMode === 'month') newD.setMonth(newD.getMonth() - 1);
    else newD.setDate(newD.getDate() - 7);
    setSelectedDate(newD);
  };

  const handleNavigateNext = () => {
    const newD = new Date(selectedDate);
    if (viewMode === 'day') newD.setDate(newD.getDate() + 1);
    else if (viewMode === 'week') newD.setDate(newD.getDate() + 7);
    else if (viewMode === 'month') newD.setMonth(newD.getMonth() + 1);
    else newD.setDate(newD.getDate() + 7);
    setSelectedDate(newD);
  };

  const handleNavigateToday = () => {
    setSelectedDate(new Date());
  };

  // Abertura de Modais
  const handleNewEvent = () => {
    setEditingEvent({
      startTime: selectedDate.toISOString(),
      endTime: new Date(selectedDate.getTime() + 3600000).toISOString(),
    });
    setIsEventModalOpen(true);
  };

  const handleCreateSlotEvent = (dateStr: string, hour: number, collaboratorId?: string) => {
    const [year, month, day] = dateStr.split('-').map(Number);
    const start = new Date(year, month - 1, day, hour, 0, 0, 0);
    const end = new Date(year, month - 1, day, hour + 1, 0, 0, 0);

    setEditingEvent({
      startTime: start.toISOString(),
      endTime: end.toISOString(),
      collaboratorId: collaboratorId || accounts[0]?.id || 'collab_carlos',
    });
    setIsEventModalOpen(true);
  };

  const handleBookFreeSlot = (slot: FreeTimeSlot) => {
    const [year, month, day] = slot.date.split('-').map(Number);
    const [startH, startM] = slot.startTime.split(':').map(Number);
    const [endH, endM] = slot.endTime.split(':').map(Number);

    const start = new Date(year, month - 1, day, startH, startM, 0, 0);
    const end = new Date(year, month - 1, day, endH, endM, 0, 0);

    setEditingEvent({
      title: 'Reunião de Alinhamento / Pré-Diagnóstico',
      startTime: start.toISOString(),
      endTime: end.toISOString(),
      collaboratorId: slot.availableCollaborators[0] || 'all_team',
      additionalCollaboratorIds: slot.availableCollaborators.slice(1),
      categoryId: 'crm_diagnostico',
    });
    setIsEventModalOpen(true);
  };

  const handleSelectEvent = (event: CalendarEvent) => {
    setSelectedEvent(event);
    setIsDetailModalOpen(true);
  };

  const handleOpenLeadDetailFromOppId = (oppId: string) => {
    const opp = opportunities.find((o) => o.id === oppId);
    if (opp && onSelectOpportunity) {
      onSelectOpportunity(opp);
    }
  };

  // Filtragem de eventos
  const filteredEvents = useMemo(() => {
    const visibleAccountIds = new Set(accounts.filter((a) => a.isVisible).map((a) => a.id));
    const visibleCategoryIds = new Set(categories.filter((c) => c.isVisible).map((c) => c.id));

    return events.filter((e) => {
      // Filtro de Colaborador (se desmarcado no painel, oculta imediatamente)
      if (accounts.length > 0) {
        const collabId = e.collaboratorId || e.ctoId || 'collab_carlos';
        const isMainOwnerVisible = visibleAccountIds.has(collabId) || collabId === 'all_team';
        const isCoHostVisible = e.additionalCollaboratorIds?.some((id) => visibleAccountIds.has(id));

        if (!isMainOwnerVisible && !isCoHostVisible) {
          return false;
        }
      }

      // Filtro de Categoria (se desmarcado no painel, oculta imediatamente)
      if (categories.length > 0 && e.categoryId) {
        if (!visibleCategoryIds.has(e.categoryId)) {
          return false;
        }
      }

      // Filtro de Busca
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = e.title.toLowerCase().includes(q);
        const matchesDesc = e.description?.toLowerCase().includes(q);
        const matchesCompany = e.opportunityCompanyName?.toLowerCase().includes(q);
        const matchesAttendee = e.attendees?.some((a) => a.name.toLowerCase().includes(q) || a.email.toLowerCase().includes(q));

        if (!matchesTitle && !matchesDesc && !matchesCompany && !matchesAttendee) {
          return false;
        }
      }

      return true;
    });
  }, [events, accounts, categories, searchQuery]);

  // Horários Livres da Equipe
  const freeSlots = useMemo(() => {
    const visibleIds = accounts.filter((a) => a.isVisible).map((a) => a.id);
    return calendarService.findCommonFreeSlots(events, selectedDate, visibleIds, 9, 18, 60);
  }, [events, selectedDate, accounts]);

  return (
    <div className="flex flex-col flex-1 h-[calc(100vh-7.5rem)] rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xl overflow-hidden">
      {/* Barra de Controle Superior */}
      <CalendarHeader
        currentDate={selectedDate}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        onNavigatePrev={handleNavigatePrev}
        onNavigateNext={handleNavigateNext}
        onNavigateToday={handleNavigateToday}
        onNewEvent={handleNewEvent}
      />

      {/* Layout Motion com 3 Painéis */}
      <div className="flex-1 flex overflow-hidden">
        {/* Painel Esquerdo (Mini Calendário, Colaboradores e Categorias) */}
        <CalendarLeftSidebar
          selectedDate={selectedDate}
          onSelectDate={setSelectedDate}
          accounts={accounts}
          onToggleAccount={handleToggleAccount}
          onToggleAllAccounts={handleToggleAllAccounts}
          categories={categories}
          onToggleCategory={handleToggleCategory}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onOpenGoogleSettings={() => setIsSettingsModalOpen(true)}
          onOpenAddCollaborator={() => setIsAddCollaboratorOpen(true)}
          onSyncGoogle={handleSyncGoogle}
          isSyncing={isSyncing}
        />

        {/* Área Central (Semana, Dia, Mês ou Lista) */}
        <main className="flex-1 flex flex-col overflow-x-auto overflow-y-auto bg-slate-50/50 dark:bg-slate-950/50 min-w-0">
          {viewMode === 'week' && (
            <CalendarWeekGrid
              currentDate={selectedDate}
              events={filteredEvents}
              accounts={accounts}
              categories={categories}
              onSelectEvent={handleSelectEvent}
              onCreateSlotEvent={handleCreateSlotEvent}
              onOpenOpportunity={handleOpenLeadDetailFromOppId}
            />
          )}

          {viewMode === 'day' && (
            <CalendarDayGrid
              currentDate={selectedDate}
              events={filteredEvents}
              accounts={accounts}
              categories={categories}
              onSelectEvent={handleSelectEvent}
              onCreateSlotEvent={handleCreateSlotEvent}
              onOpenOpportunity={handleOpenLeadDetailFromOppId}
            />
          )}

          {viewMode === 'month' && (
            <CalendarMonthGrid
              currentDate={selectedDate}
              events={filteredEvents}
              accounts={accounts}
              categories={categories}
              onSelectEvent={handleSelectEvent}
              onSelectDay={(d) => {
                setSelectedDate(d);
                setViewMode('day');
              }}
              onCreateSlotEvent={handleCreateSlotEvent}
            />
          )}

          {viewMode === 'agenda' && (
            <CalendarAgendaList
              events={filteredEvents}
              accounts={accounts}
              categories={categories}
              onSelectEvent={handleSelectEvent}
              onOpenOpportunity={handleOpenLeadDetailFromOppId}
            />
          )}
        </main>

        {/* Painel Direito (Tarefas, Smart Free Slots & Google Sync) */}
        <CalendarRightSidebar
          events={filteredEvents}
          accounts={accounts}
          selectedDate={selectedDate}
          onSelectEvent={handleSelectEvent}
          onNewEvent={handleNewEvent}
          onBookFreeSlot={handleBookFreeSlot}
          onSyncGoogle={handleSyncGoogle}
          isSyncing={isSyncing}
          freeSlots={freeSlots}
        />
      </div>

      {/* Modais */}
      <EventModal
        isOpen={isEventModalOpen}
        onClose={() => {
          setIsEventModalOpen(false);
          setEditingEvent(null);
        }}
        onSave={handleSaveEvent}
        onDelete={handleDeleteEvent}
        initialEvent={editingEvent}
        accounts={accounts}
        categories={categories}
        opportunities={opportunities}
      />

      <EventDetailModal
        isOpen={isDetailModalOpen}
        event={selectedEvent}
        onClose={() => {
          setIsDetailModalOpen(false);
          setSelectedEvent(null);
        }}
        onEdit={(evt) => {
          setEditingEvent(evt);
          setIsEventModalOpen(true);
        }}
        onDelete={handleDeleteEvent}
        onOpenOpportunity={handleOpenLeadDetailFromOppId}
        accounts={accounts}
        categories={categories}
      />

      <AddCollaboratorModal
        isOpen={isAddCollaboratorOpen}
        onClose={() => setIsAddCollaboratorOpen(false)}
        onAdd={handleAddCollaborator}
      />

      {googleSettings && (
        <GoogleSyncSettingsModal
          isOpen={isSettingsModalOpen}
          onClose={() => setIsSettingsModalOpen(false)}
          settings={googleSettings}
          onSaveSettings={handleSaveGoogleSettings}
          accounts={accounts}
          onSyncGoogle={handleSyncGoogle}
          isSyncing={isSyncing}
        />
      )}
    </div>
  );
}
