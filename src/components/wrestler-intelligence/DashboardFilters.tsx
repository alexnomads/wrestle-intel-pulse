
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";

interface DashboardFiltersProps {
  selectedTimeframe: string;
  onTimeframeChange: (timeframe: string) => void;
  onRefresh: () => void;
  isLoading: boolean;
}

export const DashboardFilters = ({ 
  selectedTimeframe, 
  onTimeframeChange, 
  onRefresh, 
  isLoading 
}: DashboardFiltersProps) => {
  return (
    <div className="flex space-x-2">
      <Button
        variant="outline"
        size="sm"
        onClick={onRefresh}
        disabled={isLoading}
      >
        <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
        Refresh
      </Button>
      {['24h', '7d', '30d', '90d'].map((timeframe) => (
        <Button
          key={timeframe}
          variant={selectedTimeframe === timeframe ? 'default' : 'outline'}
          size="sm"
          onClick={() => onTimeframeChange(timeframe)}
        >
          {timeframe}
        </Button>
      ))}
    </div>
  );
};
