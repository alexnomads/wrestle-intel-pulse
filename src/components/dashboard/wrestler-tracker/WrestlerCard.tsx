
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, BarChart3, Flame } from "lucide-react";
import { MentionsPopup } from "./MentionsPopup";

interface WrestlerCardProps {
  wrestler: any;
  index: number;
  timePeriod: string;
  popularityScore: number;
  change24h: number;
}

export const WrestlerCard = ({ wrestler, index, timePeriod, popularityScore, change24h }: WrestlerCardProps) => {
  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'push': return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'burial': return <TrendingDown className="h-4 w-4 text-red-500" />;
      default: return <BarChart3 className="h-4 w-4 text-yellow-500" />;
    }
  };

  return (
    <div 
      className={`flex items-center justify-between p-4 rounded-lg transition-all ${
        wrestler.isOnFire 
          ? 'bg-gradient-to-r from-yellow-100 to-orange-100 dark:from-yellow-900/40 dark:to-orange-900/40 border-2 border-orange-400' 
          : 'bg-secondary/30 hover:bg-secondary/50'
      }`}
    >
      <div className="flex items-center space-x-4">
        <div className="w-8 h-8 bg-gradient-to-br from-wrestling-electric to-wrestling-purple rounded-full flex items-center justify-center">
          <span className="text-white font-bold text-sm">#{index + 1}</span>
        </div>
        
        <div>
          <div className="flex items-center space-x-2">
            <h4 className="font-semibold text-foreground">{wrestler.wrestler_name}</h4>
            {wrestler.isOnFire && (
              <Badge variant="secondary" className="bg-orange-100 text-orange-800 dark:bg-orange-900/30">
                <Flame className="h-3 w-3 mr-1" />
                HOT
              </Badge>
            )}
            <Badge 
              variant="outline" 
              className={`text-xs ${
                wrestler.promotion.toLowerCase().includes('wwe') ? 'border-yellow-400 text-yellow-600' :
                wrestler.promotion.toLowerCase().includes('aew') ? 'border-black text-black dark:border-white dark:text-white' :
                wrestler.promotion.toLowerCase().includes('tna') ? 'border-blue-400 text-blue-600' :
                'border-gray-400 text-gray-600'
              }`}
            >
              {wrestler.promotion}
            </Badge>
          </div>
          <div className="text-sm text-muted-foreground flex items-center">
            <span>{wrestler.totalMentions} mentions</span>
            <MentionsPopup wrestler={wrestler} timePeriod={timePeriod} />
            <span className="ml-2">• {wrestler.sentimentScore}% sentiment</span>
          </div>
        </div>
      </div>
      
      <div className="flex items-center space-x-4">
        <div className="text-right">
          <div className="flex items-center space-x-1">
            {getTrendIcon(wrestler.trend)}
            <span className="text-lg font-bold text-wrestling-electric">
              {popularityScore}
            </span>
          </div>
          <div className="text-xs text-muted-foreground">Popularity Score</div>
        </div>
        
        <div className="text-right">
          <div className={`text-sm font-medium ${
            change24h > 0 ? 'text-green-500' : change24h < 0 ? 'text-red-500' : 'text-yellow-500'
          }`}>
            {change24h > 0 ? '+' : ''}{change24h}%
          </div>
          <div className="text-xs text-muted-foreground">24h Change</div>
        </div>
      </div>
    </div>
  );
};
