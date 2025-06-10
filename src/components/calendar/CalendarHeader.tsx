
import { Button } from "@/components/ui/button";
import { RefreshCw, List, Grid } from "lucide-react";
import { format } from "date-fns";

interface CalendarHeaderProps {
  lastUpdateTime: string | null;
  filteredEventsCount: number;
  isLoading: boolean;
  eventsScraping: { isPending: boolean };
  viewMode: 'monthly' | 'weekly';
  onRefresh: () => void;
  onViewModeToggle: () => void;
}

export const CalendarHeader = ({
  lastUpdateTime,
  filteredEventsCount,
  isLoading,
  eventsScraping,
  viewMode,
  onRefresh,
  onViewModeToggle
}: CalendarHeaderProps) => {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Autonomous Wrestling Events Calendar</h2>
        <p className="text-muted-foreground">
          Auto-updated daily at 6:00 AM ET • Last update: {lastUpdateTime ? format(new Date(lastUpdateTime), 'PPpp') : 'Never'} • Showing {filteredEventsCount} events
        </p>
      </div>
      <div className="flex space-x-2">
        <Button
          onClick={onRefresh}
          variant="outline"
          size="sm"
          disabled={isLoading || eventsScraping.isPending}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${(isLoading || eventsScraping.isPending) ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
        <Button
          onClick={onViewModeToggle}
          variant="outline"
          size="sm"
        >
          {viewMode === 'monthly' ? <List className="h-4 w-4 mr-2" /> : <Grid className="h-4 w-4 mr-2" />}
          {viewMode === 'monthly' ? 'Weekly View' : 'Monthly View'}
        </Button>
      </div>
    </div>
  );
};
