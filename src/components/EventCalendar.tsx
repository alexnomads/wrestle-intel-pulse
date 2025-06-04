
import { Clock, Calendar, MapPin, Tv } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getWeeklyShows, getUpcomingEvents } from "@/services/wrestlerService";

export const EventCalendar = () => {
  const weeklyShows = getWeeklyShows();
  const upcomingEvents = getUpcomingEvents();

  const formatTimeUntil = (dateString: string) => {
    const eventDate = new Date(dateString);
    const now = new Date();
    const diffTime = eventDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Tomorrow";
    if (diffDays < 7) return `${diffDays} days`;
    if (diffDays < 30) return `${Math.ceil(diffDays / 7)} weeks`;
    return `${Math.ceil(diffDays / 30)} months`;
  };

  const getPromotionColor = (promotion: string) => {
    switch (promotion.toLowerCase()) {
      case "wwe": return "bg-red-600";
      case "aew": return "bg-yellow-500";
      case "nxt": return "bg-purple-600";
      case "tna": return "bg-blue-600";
      default: return "bg-secondary";
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Weekly Shows */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Calendar className="h-5 w-5 text-wrestling-electric" />
            <span>Weekly Shows</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {weeklyShows.map((show) => (
            <div key={show.id} className="p-4 bg-secondary/20 rounded-lg space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`w-3 h-3 rounded-full ${getPromotionColor(show.promotion)}`} />
                  <h4 className="font-semibold text-foreground">{show.name}</h4>
                </div>
                <Badge variant="outline">{show.promotion}</Badge>
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4" />
                  <span>{show.day}s at {show.time}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Tv className="h-4 w-4" />
                  <span>{show.network}</span>
                </div>
              </div>
              
              {show.nextDate && (
                <div className="text-sm text-wrestling-electric font-medium">
                  Next: {formatTimeUntil(show.nextDate)}
                </div>
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Special Events */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <MapPin className="h-5 w-5 text-wrestling-gold" />
            <span>Upcoming Special Events</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {upcomingEvents.map((event) => (
            <div key={event.id} className="p-4 bg-secondary/20 rounded-lg space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`w-3 h-3 rounded-full ${getPromotionColor(event.promotion)}`} />
                  <h4 className="font-semibold text-foreground">{event.name}</h4>
                </div>
                <Badge className={event.type === 'ple' ? 'bg-wrestling-gold/20 text-wrestling-gold' : 'bg-wrestling-electric/20 text-wrestling-electric'}>
                  {event.type.toUpperCase()}
                </Badge>
              </div>
              
              <div className="space-y-2 text-sm text-muted-foreground">
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4" />
                  <span>{new Date(event.date!).toLocaleDateString()}</span>
                  <span className="text-wrestling-electric font-medium">
                    ({formatTimeUntil(event.date!)})
                  </span>
                </div>
                
                {event.location && (
                  <div className="flex items-center space-x-2">
                    <MapPin className="h-4 w-4" />
                    <span>{event.location}</span>
                  </div>
                )}
                
                <div className="flex items-center space-x-2">
                  <Tv className="h-4 w-4" />
                  <span>{event.network}</span>
                </div>
              </div>
              
              {event.matches && event.matches.length > 0 && (
                <div className="pt-2 border-t border-border/50">
                  <div className="text-xs text-muted-foreground mb-2">Featured Match:</div>
                  <div className="text-sm text-foreground">
                    {event.matches[0].title}: {event.matches[0].participants.join(' vs ')}
                  </div>
                </div>
              )}
            </div>
          ))}
          
          {upcomingEvents.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No upcoming special events scheduled
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
