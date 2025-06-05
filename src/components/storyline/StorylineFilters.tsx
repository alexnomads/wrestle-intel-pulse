
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";

interface StorylineFiltersProps {
  selectedPromotion: string;
  onPromotionChange: (promotion: string) => void;
  onRefresh: () => void;
  isLoading: boolean;
}

export const StorylineFilters = ({ 
  selectedPromotion, 
  onPromotionChange, 
  onRefresh, 
  isLoading 
}: StorylineFiltersProps) => {
  const promotions = ['all', 'wwe', 'aew', 'nxt', 'tna'];

  return (
    <div className="flex items-center space-x-2">
      <Button
        variant="outline"
        size="sm"
        onClick={onRefresh}
        disabled={isLoading}
      >
        <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
        Refresh
      </Button>
      {promotions.map((promotion) => (
        <Button
          key={promotion}
          variant={selectedPromotion === promotion ? 'default' : 'outline'}
          size="sm"
          onClick={() => onPromotionChange(promotion)}
          className="capitalize"
        >
          {promotion === 'all' ? 'All' : promotion.toUpperCase()}
        </Button>
      ))}
    </div>
  );
};
