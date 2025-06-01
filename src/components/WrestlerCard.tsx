
import { TrendingUp, TrendingDown, Minus, MoreVertical } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface WrestlerCardProps {
  name: string;
  promotion: string;
  status: string;
  sentiment: string;
  mentions: string;
  trending: "up" | "down" | "stable";
  image: string;
}

export const WrestlerCard = ({
  name,
  promotion,
  status,
  sentiment,
  mentions,
  trending,
  image
}: WrestlerCardProps) => {
  const getTrendingIcon = () => {
    switch (trending) {
      case "up":
        return <TrendingUp className="h-4 w-4 text-green-500" />;
      case "down":
        return <TrendingDown className="h-4 w-4 text-red-500" />;
      default:
        return <Minus className="h-4 w-4 text-yellow-500" />;
    }
  };

  const getStatusColor = () => {
    switch (status.toLowerCase()) {
      case "active":
        return "bg-green-500/20 text-green-400 border-green-500/30";
      case "champion":
        return "bg-wrestling-gold/20 text-wrestling-gold border-wrestling-gold/30";
      case "injured":
        return "bg-red-500/20 text-red-400 border-red-500/30";
      default:
        return "bg-secondary text-secondary-foreground border-border";
    }
  };

  return (
    <Card className="glass-card hover-scale group overflow-hidden">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-br from-wrestling-electric/20 to-wrestling-purple/20 rounded-full flex items-center justify-center">
              <span className="text-lg font-bold text-primary">{name.charAt(0)}</span>
            </div>
            <div>
              <h3 className="font-semibold text-foreground text-lg">{name}</h3>
              <p className="text-sm text-muted-foreground">{promotion}</p>
            </div>
          </div>
          <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 transition-opacity">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Status</span>
            <Badge className={getStatusColor()}>{status}</Badge>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Sentiment</span>
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium text-green-400">{sentiment}</span>
              {getTrendingIcon()}
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Mentions (24h)</span>
            <span className="text-sm font-medium text-foreground">{mentions}</span>
          </div>
        </div>

        {/* Sentiment Bar */}
        <div className="mt-4">
          <div className="w-full bg-secondary rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-green-500 to-wrestling-electric h-2 rounded-full transition-all duration-500"
              style={{ width: sentiment }}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
