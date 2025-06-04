
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
    
    if (diffDays <= 0) return "Today or Past";
    if (diffDays === 1) return "Tomorrow";
    if (diffDays < 7) return `${diffDays} days`;
    if (diffDays < 30) return `${Math.ceil(diffDays / 7)} weeks`;
    return `${Math.ceil(diffDays / 30)} months`;
  };

  const getNextShowDate = (day: string) => {
    const today = new Date();
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const targetDay = dayNames.indexOf(day);
    const currentDay = today.getDay();
    
    let daysUntil = targetDay - currentDay;
    if (daysUntil <= 0) daysUntil += 7;
    
    const nextShow = new Date(today);
    nextShow.setDate(today.getDate() + daysUntil);
    return nextShow.toISOString().split('T')[0];
  };

  const convertTime = (timeET: string) => {
    const etHour = parseInt(timeET.split(':')[0]);
    const ptHour = etHour - 3;
    const cestHour = etHour + 6;
    
    return {
      et: timeET,
      pt: `${ptHour < 0 ? ptHour + 12 : ptHour > 12 ? ptHour - 12 : ptHour}:00 PM PT`,
      cest: `${cestHour > 24 ? cestHour - 24 : cestHour}:00 CEST`
    };
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
          {weeklyShows.map((show) => {
            const nextShowDate = show.nextDate || getNextShowDate(show.day!);
            const timeZones = convertTime(show.time!);
            
            return (
              <div key={show.id} className="p-4 bg-secondary/20 rounded-lg space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`w-3 h-3 rounded-full ${getPromotionColor(show.promotion)}`} />
                    <h4 className="font-semibold text-foreground">{show.name}</h4>
                  </div>
                  <Badge variant="outline">{show.promotion}</Badge>
                </div>
                
                <div className="space-y-2 text-sm text-muted-foreground">
                  <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4" />
                    <div className="flex flex-col">
                      <span>{show.day}s</span>
                      <span className="text-xs">
                        {timeZones.et} | {timeZones.pt} | {timeZones.cest}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Tv className="h-4 w-4" />
                    <span>{show.network}</span>
                  </div>
                </div>
                
                <div className="text-sm text-wrestling-electric font-medium">
                  Next: {formatTimeUntil(nextShowDate)} ({new Date(nextShowDate).toLocaleDateString()})
                </div>
              </div>
            );
          })}
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
