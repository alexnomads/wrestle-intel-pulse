
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
  const promotions = [
    { value: 'all', label: 'All' },
    { value: 'wwe', label: 'WWE' },
    { value: 'aew', label: 'AEW' },
    { value: 'nxt', label: 'NXT' },
    { value: 'tna', label: 'TNA' }
  ];

  return (
    <div className="flex items-center space-x-2">
      <Button
        variant="outline"
        size="sm"
        onClick={onRefresh}
        disabled={isLoading}
        className="hover:bg-secondary"
      >
        <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
        Refresh
      </Button>
      
      <div className="flex space-x-1">
        {promotions.map((promotion) => (
          <Button
            key={promotion.value}
            variant={selectedPromotion === promotion.value ? 'default' : 'outline'}
            size="sm"
            onClick={() => onPromotionChange(promotion.value)}
            className={`transition-all duration-200 ${
              selectedPromotion === promotion.value 
                ? 'bg-wrestling-electric text-white hover:bg-wrestling-electric/90' 
                : 'hover:bg-secondary'
            }`}
          >
            {promotion.label}
          </Button>
        ))}
      </div>
    </div>
  );
};
