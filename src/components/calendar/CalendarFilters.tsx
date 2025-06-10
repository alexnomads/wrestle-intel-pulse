
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Filter } from "lucide-react";

interface CalendarFiltersProps {
  promotionColors: Record<string, string>;
  selectedPromotions: string[];
  selectedEventTypes: string[];
  onTogglePromotion: (promotion: string) => void;
  onToggleEventType: (eventType: string) => void;
}

export const CalendarFilters = ({
  promotionColors,
  selectedPromotions,
  selectedEventTypes,
  onTogglePromotion,
  onToggleEventType
}: CalendarFiltersProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Filter className="h-5 w-5" />
          <span>Filters</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <h4 className="font-medium mb-2">Promotions</h4>
            <div className="flex flex-wrap gap-2">
              {Object.keys(promotionColors).map(promotion => (
                <Button
                  key={promotion}
                  onClick={() => onTogglePromotion(promotion)}
                  variant={selectedPromotions.includes(promotion) ? "default" : "outline"}
                  size="sm"
                  className={selectedPromotions.includes(promotion) ? promotionColors[promotion as keyof typeof promotionColors] : ''}
                >
                  {promotion}
                </Button>
              ))}
            </div>
          </div>
          <div>
            <h4 className="font-medium mb-2">Event Types</h4>
            <div className="flex flex-wrap gap-2">
              {['weekly', 'ppv', 'special'].map(type => (
                <Button
                  key={type}
                  onClick={() => onToggleEventType(type)}
                  variant={selectedEventTypes.includes(type) ? "default" : "outline"}
                  size="sm"
                >
                  {type.toUpperCase()}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
