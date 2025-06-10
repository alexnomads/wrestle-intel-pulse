
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

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

interface TonightEventsProps {
  events: WrestlingEvent[];
  promotionColors: Record<string, string>;
  formatTime: (timeET: string, timePT: string, timeCET: string) => string;
}

export const TonightEvents = ({ events, promotionColors, formatTime }: TonightEventsProps) => {
  if (events.length === 0) return null;

  return (
    <Card className="border-wrestling-electric bg-wrestling-electric/5">
      <CardHeader>
        <CardTitle className="text-wrestling-electric">Tonight's Events</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {events.map(event => (
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
  );
};
