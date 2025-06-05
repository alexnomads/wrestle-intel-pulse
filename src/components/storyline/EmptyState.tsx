
import { Card, CardContent } from "@/components/ui/card";
import { Activity } from "lucide-react";

interface EmptyStateProps {
  newsItemsCount: number;
}

export const EmptyState = ({ newsItemsCount }: EmptyStateProps) => {
  return (
    <Card className="glass-card">
      <CardContent className="p-8 text-center">
        <Activity className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-muted-foreground mb-2">No Active Storylines Detected</h3>
        <p className="text-muted-foreground">
          {newsItemsCount === 0 
            ? "No news data available. Check the Data Management tab to fetch latest news."
            : "No storylines detected in recent news. Try refreshing the analysis."
          }
        </p>
      </CardContent>
    </Card>
  );
};
