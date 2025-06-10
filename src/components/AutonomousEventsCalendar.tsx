
import { useState, useEffect } from "react";
import { RefreshCw } from "lucide-react";
import { useAutonomousEvents, useEventsScraping } from "@/hooks/useAutonomousEvents";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { toZonedTime } from "date-fns-tz";
import { CalendarHeader } from "./calendar/CalendarHeader";
import { TonightEvents } from "./calendar/TonightEvents";
import { CalendarFilters } from "./calendar/CalendarFilters";
import { MonthlyCalendarView } from "./calendar/MonthlyCalendarView";
import { EventModal } from "./calendar/EventModal";
import { WrestlingEvent, promotionColors } from "./calendar/types";

export const AutonomousEventsCalendar = () => {
  // Use ET timezone for the current date
  const etTimezone = 'America/New_York';
  const [currentDate, setCurrentDate] = useState(() => {
    const now = new Date();
    return toZonedTime(now, etTimezone);
  });
  const [viewMode, setViewMode] = useState<'monthly' | 'weekly'>('monthly');
  const [selectedPromotions, setSelectedPromotions] = useState<string[]>(['WWE', 'AEW', 'NXT', 'TNA', 'NJPW', 'ROH']);
  const [selectedEventTypes, setSelectedEventTypes] = useState<string[]>(['weekly', 'ppv', 'special']);
  const [selectedEvent, setSelectedEvent] = useState<WrestlingEvent | null>(null);
  
  const { data: events = [], isLoading, refetch } = useAutonomousEvents();
  const eventsScraping = useEventsScraping();
  const { toast } = useToast();

  // Debug logging
  useEffect(() => {
    console.log('Events data:', events);
    console.log('Total events loaded:', events.length);
  }, [events]);

  const filteredEvents = events.filter(event => 
    selectedPromotions.includes(event.promotion) && 
    selectedEventTypes.includes(event.eventType)
  );

  const getEventsForDate = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    const dayEvents = filteredEvents.filter(event => event.date === dateStr);
    console.log(`Events for ${dateStr}:`, dayEvents);
    return dayEvents;
  };

  const handleRefresh = async () => {
    toast({
      title: "Refreshing Events",
      description: "Scraping latest wrestling event data...",
    });
    
    try {
      await eventsScraping.mutateAsync();
      toast({
        title: "Events Updated",
        description: "Successfully refreshed wrestling event data!",
      });
    } catch (error) {
      toast({
        title: "Refresh Failed",
        description: "Failed to refresh event data. Please try again.",
        variant: "destructive",
      });
    }
  };

  const togglePromotion = (promotion: string) => {
    setSelectedPromotions(prev => 
      prev.includes(promotion) 
        ? prev.filter(p => p !== promotion)
        : [...prev, promotion]
    );
  };

  const toggleEventType = (eventType: string) => {
    setSelectedEventTypes(prev => 
      prev.includes(eventType) 
        ? prev.filter(t => t !== eventType)
        : [...prev, eventType]
    );
  };

  const formatTime = (timeET: string, timePT: string, timeCET: string) => {
    return `${timeET} ET / ${timePT} PT / ${timeCET} CET`;
  };

  const getTonightEvents = () => {
    const todayET = toZonedTime(new Date(), etTimezone);
    const todayStr = format(todayET, 'yyyy-MM-dd');
    return filteredEvents.filter(event => event.date === todayStr);
  };

  const tonightEvents = getTonightEvents();

  // Get the last updated timestamp from the first event
  const lastUpdateTime = events.length > 0 ? events[0].lastUpdated : null;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin text-wrestling-electric" />
        <span className="ml-2 text-lg">Loading autonomous wrestling calendar...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <CalendarHeader
        lastUpdateTime={lastUpdateTime}
        filteredEventsCount={filteredEvents.length}
        isLoading={isLoading}
        eventsScraping={eventsScraping}
        viewMode={viewMode}
        onRefresh={handleRefresh}
        onViewModeToggle={() => setViewMode(viewMode === 'monthly' ? 'weekly' : 'monthly')}
      />

      <TonightEvents
        events={tonightEvents}
        promotionColors={promotionColors}
        formatTime={formatTime}
      />

      <CalendarFilters
        promotionColors={promotionColors}
        selectedPromotions={selectedPromotions}
        selectedEventTypes={selectedEventTypes}
        onTogglePromotion={togglePromotion}
        onToggleEventType={toggleEventType}
      />

      {viewMode === 'monthly' ? (
        <MonthlyCalendarView
          currentDate={currentDate}
          events={filteredEvents}
          promotionColors={promotionColors}
          onDateChange={setCurrentDate}
          onEventSelect={setSelectedEvent}
          getEventsForDate={getEventsForDate}
        />
      ) : (
        <div className="text-center text-muted-foreground">
          Weekly view coming soon...
        </div>
      )}

      <EventModal
        event={selectedEvent}
        promotionColors={promotionColors}
        formatTime={formatTime}
        onClose={() => setSelectedEvent(null)}
      />
    </div>
  );
};
