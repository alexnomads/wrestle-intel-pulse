
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, MapPin, Tv, RefreshCw, Users } from "lucide-react";
import { useUpcomingEvents, useWeeklyShows, useRealTimeEvents } from "@/hooks/useRealTimeWrestlingData";
import { useToast } from "@/hooks/use-toast";

export const EventCalendar = () => {
  const [selectedView, setSelectedView] = useState<'upcoming' | 'weekly' | 'all'>('upcoming');
  
  const { data: upcomingEvents = [], isLoading: loadingUpcoming, refetch: refetchUpcoming } = useUpcomingEvents();
  const { data: weeklyShows = [], isLoading: loadingWeekly, refetch: refetchWeekly } = useWeeklyShows();
  const { data: allEvents = [], isLoading: loadingAll, refetch: refetchAll } = useRealTimeEvents();
  const { toast } = useToast();

  const isLoading = loadingUpcoming || loadingWeekly || loadingAll;

  const getDisplayEvents = () => {
    switch (selectedView) {
      case 'upcoming':
        return upcomingEvents;
      case 'weekly':
        return weeklyShows;
      case 'all':
        return allEvents;
      default:
        return upcomingEvents;
    }
  };

  const handleRefresh = () => {
    console.log('Refreshing events data...');
    refetchUpcoming();
    refetchWeekly();
    refetchAll();
    toast({
      title: "Refreshing Events",
      description: "Loading latest event data...",
    });
  };

  const formatEventDate = (dateString: string | null, timeString: string | null) => {
    if (!dateString) return 'TBD';
    
    const date = new Date(dateString);
    const formattedDate = date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    
    if (timeString) {
      const time = new Date(`2000-01-01T${timeString}`).toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      });
      return `${formattedDate} at ${time}`;
    }
    
    return formattedDate;
  };

  const getDaysUntilEvent = (dateString: string | null) => {
    if (!dateString) return null;
    
    const eventDate = new Date(dateString);
    const today = new Date();
    const diffTime = eventDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Tomorrow';
    if (diffDays > 0) return `In ${diffDays} days`;
    return 'Past event';
  };

  const getEventTypeColor = (eventType: string | null) => {
    switch (eventType) {
      case 'ple':
      case 'ppv':
        return 'bg-wrestling-electric text-black';
      case 'weekly':
        return 'bg-blue-500 text-white';
      case 'special':
        return 'bg-purple-500 text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-wrestling-electric mx-auto"></div>
          <p className="text-muted-foreground mt-2">Loading wrestling events...</p>
        </div>
      </div>
    );
  }

  const displayEvents = getDisplayEvents();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Wrestling Events Calendar</h2>
          <p className="text-muted-foreground">Weekly wrestling shows and upcoming events</p>
        </div>
        <div className="flex space-x-2">
          <Button
            onClick={handleRefresh}
            variant="outline"
            size="sm"
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button
            onClick={() => setSelectedView('upcoming')}
            variant={selectedView === 'upcoming' ? 'default' : 'outline'}
            size="sm"
          >
            <Calendar className="h-4 w-4 mr-2" />
            Upcoming ({upcomingEvents.length})
          </Button>
          <Button
            onClick={() => setSelectedView('weekly')}
            variant={selectedView === 'weekly' ? 'default' : 'outline'}
            size="sm"
          >
            <Clock className="h-4 w-4 mr-2" />
            Weekly Shows ({weeklyShows.length})
          </Button>
          <Button
            onClick={() => setSelectedView('all')}
            variant={selectedView === 'all' ? 'default' : 'outline'}
            size="sm"
          >
            <Tv className="h-4 w-4 mr-2" />
            All Events ({allEvents.length})
          </Button>
        </div>
      </div>

      {displayEvents.length === 0 ? (
        <Card className="glass-card">
          <CardContent className="p-8 text-center">
            <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">No Events Found</h3>
            <p className="text-muted-foreground mb-4">
              {selectedView === 'upcoming' && "No upcoming events scheduled at this time."}
              {selectedView === 'weekly' && "No weekly shows configured."}
              {selectedView === 'all' && "No events available. Try updating the events data."}
            </p>
            <Button onClick={handleRefresh} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh Events
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {displayEvents.map((event) => (
            <Card key={event.id} className="glass-card hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <CardTitle className="text-xl">{event.name}</CardTitle>
                      <Badge className={getEventTypeColor(event.event_type)}>
                        {event.event_type?.toUpperCase() || 'EVENT'}
                      </Badge>
                    </div>
                    <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-4 w-4" />
                        <span>{formatEventDate(event.event_date, event.event_time)}</span>
                      </div>
                      {getDaysUntilEvent(event.event_date) && (
                        <Badge variant="outline">
                          {getDaysUntilEvent(event.event_date)}
                        </Badge>
                      )}
                    </div>
                  </div>
                  {event.promotions && (
                    <Badge variant="secondary">
                      {event.promotions.name}
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {event.main_event && (
                  <div className="p-3 bg-wrestling-electric/10 border border-wrestling-electric/20 rounded-lg">
                    <div className="text-sm font-medium text-wrestling-electric mb-1">Main Event</div>
                    <div className="text-sm">{event.main_event}</div>
                  </div>
                )}
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  {event.location && (
                    <div className="flex items-center space-x-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span>{event.location}</span>
                    </div>
                  )}
                  
                  {event.network && (
                    <div className="flex items-center space-x-2">
                      <Tv className="h-4 w-4 text-muted-foreground" />
                      <span>{event.network}</span>
                    </div>
                  )}
                  
                  {event.venue_capacity && (
                    <div className="flex items-center space-x-2">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span>{event.venue_capacity.toLocaleString()} capacity</span>
                    </div>
                  )}
                  
                  {event.sold_out && (
                    <div className="flex items-center space-x-2">
                      <Badge className="bg-red-500 text-white">
                        SOLD OUT
                      </Badge>
                    </div>
                  )}
                </div>

                {event.is_recurring && (
                  <div className="flex items-center justify-between pt-2 border-t">
                    <Badge variant="outline" className="text-xs">
                      Weekly Show
                    </Badge>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
