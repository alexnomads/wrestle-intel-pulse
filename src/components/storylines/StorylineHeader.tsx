
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RefreshCw } from "lucide-react";

interface StorylineHeaderProps {
  onRefresh: () => void;
  isLoading: boolean;
  criticalAlertsCount: number;
}

export const StorylineHeader = ({ onRefresh, isLoading, criticalAlertsCount }: StorylineHeaderProps) => {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h2 className="text-3xl font-bold text-foreground">Storylines Dashboard</h2>
        <p className="text-muted-foreground">Unified view of all active wrestling storylines</p>
      </div>
      <Button
        onClick={onRefresh}
        disabled={isLoading}
        variant="outline"
        size="sm"
        className="flex items-center space-x-2"
      >
        <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
        <span>Refresh</span>
      </Button>
    </div>
  );
};
