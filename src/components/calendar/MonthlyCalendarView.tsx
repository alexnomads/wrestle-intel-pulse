
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isToday } from "date-fns";
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

interface MonthlyCalendarViewProps {
  currentDate: Date;
  events: WrestlingEvent[];
  promotionColors: Record<string, string>;
  onDateChange: (date: Date) => void;
  onEventSelect: (event: WrestlingEvent) => void;
  getEventsForDate: (date: Date) => WrestlingEvent[];
}

export const MonthlyCalendarView = ({
  currentDate,
  events,
  promotionColors,
  onDateChange,
  onEventSelect,
  getEventsForDate
}: MonthlyCalendarViewProps) => {
  const etTimezone = 'America/New_York';
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const monthDays = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Enhanced deduplication function for events on a specific day
  const getUniqueEventsForDate = (date: Date) => {
    const dayEvents = getEventsForDate(date);
    const uniqueEvents = new Map();
    
    dayEvents.forEach(event => {
      const key = `${event.promotion}-${event.eventName}`;
      if (!uniqueEvents.has(key) || uniqueEvents.get(key).eventType === 'weekly') {
        uniqueEvents.set(key, event);
      }
    });
    
    return Array.from(uniqueEvents.values());
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>{format(currentDate, 'MMMM yyyy')} (Eastern Time)</CardTitle>
          <div className="flex space-x-2">
            <Button
              onClick={() => onDateChange(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))}
              variant="outline"
              size="sm"
            >
              Previous
            </Button>
            <Button
              onClick={() => onDateChange(toZonedTime(new Date(), etTimezone))}
              variant="outline"
              size="sm"
            >
              Today
            </Button>
            <Button
              onClick={() => onDateChange(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))}
              variant="outline"
              size="sm"
            >
              Next
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-7 gap-1">
          {/* Day headers */}
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="p-2 text-center font-medium text-muted-foreground">
              {day}
            </div>
          ))}
          
          {/* Calendar days */}
          {monthDays.map(day => {
            const dayEvents = getUniqueEventsForDate(day);
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
                      key={`${event.id}-${event.promotion}-${event.eventName}`}
                      onClick={() => onEventSelect(event)}
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
      </CardContent>
    </Card>
  );
};
