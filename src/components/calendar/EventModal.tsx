
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, MapPin, Tv } from "lucide-react";
import { format } from "date-fns";

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

interface EventModalProps {
  event: WrestlingEvent | null;
  promotionColors: Record<string, string>;
  formatTime: (timeET: string, timePT: string, timeCET: string) => string;
  onClose: () => void;
}

export const EventModal = ({ event, promotionColors, formatTime, onClose }: EventModalProps) => {
  if (!event) return null;

  return (
    <Card className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-background p-6 rounded-lg max-w-md w-full">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Badge className={promotionColors[event.promotion]}>
              {event.promotion}
            </Badge>
            <Badge variant="outline">{event.eventType}</Badge>
          </div>
          <Button
            onClick={onClose}
            variant="ghost"
            size="sm"
          >
            ×
          </Button>
        </div>
        
        <h3 className="text-xl font-bold mb-4">{event.eventName}</h3>
        
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span>{format(new Date(event.date), 'EEEE, MMMM d, yyyy')}</span>
          </div>
          
          <div className="flex items-center space-x-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span>{formatTime(event.timeET, event.timePT, event.timeCET)}</span>
          </div>
          
          <div className="flex items-center space-x-2">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            <span>{event.venue}, {event.city}</span>
          </div>
          
          <div className="flex items-center space-x-2">
            <Tv className="h-4 w-4 text-muted-foreground" />
            <span>{event.network}</span>
          </div>
        </div>
        
        {event.matchCard && event.matchCard.length > 0 && (
          <div className="mt-4">
            <h4 className="font-medium mb-2">Match Card</h4>
            <ul className="text-sm space-y-1">
              {event.matchCard.map((match, index) => (
                <li key={index} className="text-muted-foreground">• {match}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </Card>
  );
};
