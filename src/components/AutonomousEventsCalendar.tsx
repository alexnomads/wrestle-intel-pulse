
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, MapPin, Tv, RefreshCw, Filter, Grid, List } from "lucide-react";
import { useAutonomousEvents, useEventsScraping } from "@/hooks/useAutonomousEvents";
import { useToast } from "@/hooks/use-toast";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isToday } from "date-fns";
import { toZonedTime } from "date-fns-tz";

interface WrestlingEvent {
  id: string;
  eventName: string;
  promotion: 'WWE' | 'AEW' | 'NXT' | 'TNA' | 'NJPW' | 'ROH';
  date: string;
  timeET: string;
  timePT: string;
  timeCET: string;
  venue: string;
  city: string;
  network: string;
  eventType: 'weekly' | 'ppv' | 'special';
  matchCard?: string[];
  lastUpdated: string;
}

const promotionColors = {
  WWE: 'bg-red-500',
  AEW: 'bg-yellow-500', 
  NXT: 'bg-purple-500',
  TNA: 'bg-blue-500',
  NJPW: 'bg-gray-800',
  ROH: 'bg-green-500'
};

export const AutonomousEventsCalendar = () => {
  // Use ET timezone for the current date
  const etTimezone = 'America/New_York';
  const [currentDate, setCurrentDate] = useState(() => toZonedTime(new Date(), etTimezone));
  const [viewMode, setViewMode] = useState<'monthly' | 'weekly'>('monthly');
  const [selectedPromotions, setSelectedPromotions] = useState<string[]>(['WWE', 'AEW', 'NXT', 'TNA', 'NJPW', 'ROH']);
  const [selectedEventTypes, setSelectedEventTypes] = useState<string[]>(['weekly', 'ppv', 'special']);
  const [selectedEvent, setSelectedEvent] = useState<WrestlingEvent | null>(null);
  
  const { data: events = [], isLoading, refetch } = useAutonomousEvents();
  const eventsScraping = useEventsScraping();
  const { toast } = useToast();

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const monthDays = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const filteredEvents = events.filter(event => 
    selectedPromotions.includes(event.promotion) && 
    selectedEventTypes.includes(event.eventType)
  );

  const getEventsForDate = (date: Date) => {
    return filteredEvents.filter(event => 
      isSameDay(new Date(event.date), date)
    );
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
    return filteredEvents.filter(event => 
      isSameDay(new Date(event.date), todayET)
    );
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
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Autonomous Wrestling Events Calendar</h2>
          <p className="text-muted-foreground">
            Auto-updated daily at 6:00 AM ET • Last update: {lastUpdateTime ? format(new Date(lastUpdateTime), 'PPpp') : 'Never'} • Showing {filteredEvents.length} events
          </p>
        </div>
        <div className="flex space-x-2">
          <Button
            onClick={handleRefresh}
            variant="outline"
            size="sm"
            disabled={isLoading || eventsScraping.isPending}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${(isLoading || eventsScraping.isPending) ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button
            onClick={() => setViewMode(viewMode === 'monthly' ? 'weekly' : 'monthly')}
            variant="outline"
            size="sm"
          >
            {viewMode === 'monthly' ? <List className="h-4 w-4 mr-2" /> : <Grid className="h-4 w-4 mr-2" />}
            {viewMode === 'monthly' ? 'Weekly View' : 'Monthly View'}
          </Button>
        </div>
      </div>

      {/* Tonight's Events */}
      {tonightEvents.length > 0 && (
        <Card className="border-wrestling-electric bg-wrestling-electric/5">
          <CardHeader>
            <CardTitle className="text-wrestling-electric">Tonight's Events</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {tonightEvents.map(event => (
                <div key={event.id} className="p-3 bg-background rounded-lg border">
                  <div className="flex items-center space-x-2 mb-2">
                    <Badge className={promotionColors[event.promotion]}>
                      {event.promotion}
                    </Badge>
                    <Badge variant="outline">{event.eventType}</Badge>
                  </div>
                  <h4 className="font-semibold">{event.eventName}</h4>
                  <p className="text-sm text-muted-foreground">{formatTime(event.timeET, event.timePT, event.timeCET)}</p>
                  <p className="text-sm">{event.venue}, {event.city}</p>
                  <p className="text-sm text-muted-foreground">{event.network}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Filter className="h-5 w-5" />
            <span>Filters</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">Promotions</h4>
              <div className="flex flex-wrap gap-2">
                {Object.keys(promotionColors).map(promotion => (
                  <Button
                    key={promotion}
                    onClick={() => togglePromotion(promotion)}
                    variant={selectedPromotions.includes(promotion) ? "default" : "outline"}
                    size="sm"
                    className={selectedPromotions.includes(promotion) ? promotionColors[promotion as keyof typeof promotionColors] : ''}
                  >
                    {promotion}
                  </Button>
                ))}
              </div>
            </div>
            <div>
              <h4 className="font-medium mb-2">Event Types</h4>
              <div className="flex flex-wrap gap-2">
                {['weekly', 'ppv', 'special'].map(type => (
                  <Button
                    key={type}
                    onClick={() => toggleEventType(type)}
                    variant={selectedEventTypes.includes(type) ? "default" : "outline"}
                    size="sm"
                  >
                    {type.toUpperCase()}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Calendar */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>{format(currentDate, 'MMMM yyyy')} (Eastern Time)</CardTitle>
            <div className="flex space-x-2">
              <Button
                onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))}
                variant="outline"
                size="sm"
              >
                Previous
              </Button>
              <Button
                onClick={() => setCurrentDate(toZonedTime(new Date(), etTimezone))}
                variant="outline"
                size="sm"
              >
                Today
              </Button>
              <Button
                onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))}
                variant="outline"
                size="sm"
              >
                Next
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {viewMode === 'monthly' ? (
            <div className="grid grid-cols-7 gap-1">
              {/* Day headers */}
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className="p-2 text-center font-medium text-muted-foreground">
                  {day}
                </div>
              ))}
              
              {/* Calendar days */}
              {monthDays.map(day => {
                const dayEvents = getEventsForDate(day);
                const isCurrentDay = isToday(toZonedTime(day, etTimezone));
                
                return (
                  <div
                    key={day.toISOString()}
                    className={`
                      min-h-[100px] p-2 border rounded-lg cursor-pointer hover:bg-accent transition-colors
                      ${isCurrentDay ? 'bg-wrestling-electric/10 border-wrestling-electric' : 'border-border'}
                    `}
                  >
                    <div className={`text-sm font-medium ${isCurrentDay ? 'text-wrestling-electric' : ''}`}>
                      {format(day, 'd')}
                    </div>
                    <div className="space-y-1 mt-1">
                      {dayEvents.slice(0, 3).map(event => (
                        <div
                          key={event.id}
                          onClick={() => setSelectedEvent(event)}
                          className={`
                            text-xs p-1 rounded cursor-pointer truncate
                            ${promotionColors[event.promotion]} text-white
                          `}
                          title={`${event.eventName} - ${event.timeET} ET`}
                        >
                          {event.eventName}
                        </div>
                      ))}
                      {dayEvents.length > 3 && (
                        <div className="text-xs text-muted-foreground">
                          +{dayEvents.length - 3} more
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="space-y-4">
              {/* Weekly view implementation */}
              <div className="text-center text-muted-foreground">
                Weekly view coming soon...
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Event Details Modal */}
      {selectedEvent && (
        <Card className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-background p-6 rounded-lg max-w-md w-full">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <Badge className={promotionColors[selectedEvent.promotion]}>
                  {selectedEvent.promotion}
                </Badge>
                <Badge variant="outline">{selectedEvent.eventType}</Badge>
              </div>
              <Button
                onClick={() => setSelectedEvent(null)}
                variant="ghost"
                size="sm"
              >
                ×
              </Button>
            </div>
            
            <h3 className="text-xl font-bold mb-4">{selectedEvent.eventName}</h3>
            
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span>{format(new Date(selectedEvent.date), 'EEEE, MMMM d, yyyy')}</span>
              </div>
              
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span>{formatTime(selectedEvent.timeET, selectedEvent.timePT, selectedEvent.timeCET)}</span>
              </div>
              
              <div className="flex items-center space-x-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span>{selectedEvent.venue}, {selectedEvent.city}</span>
              </div>
              
              <div className="flex items-center space-x-2">
                <Tv className="h-4 w-4 text-muted-foreground" />
                <span>{selectedEvent.network}</span>
              </div>
            </div>
            
            {selectedEvent.matchCard && selectedEvent.matchCard.length > 0 && (
              <div className="mt-4">
                <h4 className="font-medium mb-2">Match Card</h4>
                <ul className="text-sm space-y-1">
                  {selectedEvent.matchCard.map((match, index) => (
                    <li key={index} className="text-muted-foreground">• {match}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </Card>
      )}
    </div>
  );
};
