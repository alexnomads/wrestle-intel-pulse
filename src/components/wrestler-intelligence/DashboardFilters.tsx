
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";

interface DashboardFiltersProps {
  selectedPromotion: string;
  onPromotionChange: (promotion: string) => void;
  selectedMetric: string;
  onMetricChange: (metric: string) => void;
  onRefresh: () => void;
  isLoading: boolean;
}

export const DashboardFilters = ({ 
  selectedPromotion,
  onPromotionChange,
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
      {['all', 'wwe', 'aew', 'nxt', 'tna'].map((promotion) => (
        <Button
          key={promotion}
          variant={selectedPromotion === promotion ? 'default' : 'outline'}
          size="sm"
          onClick={() => onPromotionChange(promotion)}
        >
          {promotion.toUpperCase()}
        </Button>
      ))}
    </div>
  );
};
