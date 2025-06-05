
import { Card, CardContent } from "@/components/ui/card";
import { Users } from "lucide-react";

export const EmptyWrestlerState = () => {
  return (
    <Card className="glass-card">
      <CardContent className="p-8 text-center">
        <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-muted-foreground mb-2">No Wrestler Data Available</h3>
        <p className="text-muted-foreground">
          No recent news mentions found. Check the Data Management tab to fetch latest news.
        </p>
      </CardContent>
    </Card>
  );
};
