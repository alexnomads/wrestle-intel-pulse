
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Clock, Database, TrendingUp, AlertCircle, CheckCircle, Info } from "lucide-react";

interface DataQualityIndicatorProps {
  confidenceLevel: 'high' | 'medium' | 'low';
  mentionCount: number;
  lastUpdated: Date;
  dataSources: {
    total_mentions: number;
    tier_1_mentions: number;
    tier_2_mentions: number;
    tier_3_mentions: number;
    hours_since_last_mention: number;
    source_breakdown: Record<string, number>;
  };
  compact?: boolean;
}

export const DataQualityIndicator = ({
  confidenceLevel,
  mentionCount,
  lastUpdated,
  dataSources,
  compact = false
}: DataQualityIndicatorProps) => {
  const getConfidenceColor = () => {
    switch (confidenceLevel) {
      case 'high': return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
      case 'medium': return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/40';
      case 'low': return 'bg-red-500/20 text-red-300 border-red-500/40';
      default: return 'bg-gray-500/20 text-gray-300 border-gray-500/40';
    }
  };

  const getConfidenceIcon = () => {
    switch (confidenceLevel) {
      case 'high': return <CheckCircle className="h-3 w-3" />;
      case 'medium': return <AlertCircle className="h-3 w-3" />;
      case 'low': return <Info className="h-3 w-3" />;
      default: return <Info className="h-3 w-3" />;
    }
  };

  const getFreshnessColor = () => {
    const hoursAgo = dataSources.hours_since_last_mention;
    if (hoursAgo <= 6) return 'text-emerald-400';
    if (hoursAgo <= 24) return 'text-yellow-400';
    return 'text-red-400';
  };

  const formatTimeAgo = (hours: number) => {
    if (hours < 1) return 'Just now';
    if (hours < 24) return `${Math.floor(hours)}h ago`;
    if (hours < 168) return `${Math.floor(hours / 24)}d ago`;
    return `${Math.floor(hours / 168)}w ago`;
  };

  if (compact) {
    return (
      <div className="flex items-center space-x-2">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>
              <Badge variant="outline" className={`text-xs ${getConfidenceColor()}`}>
                {getConfidenceIcon()}
                <span className="ml-1">{confidenceLevel.toUpperCase()}</span>
              </Badge>
            </TooltipTrigger>
            <TooltipContent>
              <div className="text-xs space-y-1">
                <div>Confidence: {confidenceLevel}</div>
                <div>Mentions: {mentionCount}</div>
                <div>Updated: {formatTimeAgo(dataSources.hours_since_last_mention)}</div>
              </div>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    );
  }

  return (
    <div className="space-y-3 p-4 bg-secondary/20 rounded-lg border border-border/50">
      <div className="flex items-center justify-between">
        <div className="text-sm font-medium text-foreground">Data Quality</div>
        <Badge variant="outline" className={`${getConfidenceColor()}`}>
          {getConfidenceIcon()}
          <span className="ml-1">{confidenceLevel.toUpperCase()} CONFIDENCE</span>
        </Badge>
      </div>

      <div className="grid grid-cols-2 gap-4 text-xs">
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Database className="h-3 w-3 text-blue-400" />
            <span className="text-muted-foreground">Total Mentions:</span>
            <span className="font-medium text-blue-400">{dataSources.total_mentions}</span>
          </div>
          
          <div className="flex items-center space-x-2">
            <Clock className={`h-3 w-3 ${getFreshnessColor()}`} />
            <span className="text-muted-foreground">Last Updated:</span>
            <span className={`font-medium ${getFreshnessColor()}`}>
              {formatTimeAgo(dataSources.hours_since_last_mention)}
            </span>
          </div>
        </div>

        <div className="space-y-2">
          <div className="text-muted-foreground">Source Quality:</div>
          <div className="space-y-1">
            {dataSources.tier_1_mentions > 0 && (
              <div className="flex justify-between">
                <span className="text-emerald-400">Tier 1:</span>
                <span className="text-emerald-400">{dataSources.tier_1_mentions}</span>
              </div>
            )}
            {dataSources.tier_2_mentions > 0 && (
              <div className="flex justify-between">
                <span className="text-yellow-400">Tier 2:</span>
                <span className="text-yellow-400">{dataSources.tier_2_mentions}</span>
              </div>
            )}
            {dataSources.tier_3_mentions > 0 && (
              <div className="flex justify-between">
                <span className="text-gray-400">Tier 3:</span>
                <span className="text-gray-400">{dataSources.tier_3_mentions}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {Object.keys(dataSources.source_breakdown).length > 0 && (
        <div>
          <div className="text-xs text-muted-foreground mb-2">Source Breakdown:</div>
          <div className="flex flex-wrap gap-1">
            {Object.entries(dataSources.source_breakdown).map(([source, count]) => (
              <Badge key={source} variant="secondary" className="text-xs">
                {source}: {count}
              </Badge>
            ))}
          </div>
        </div>
      )}

      <div className="text-xs text-muted-foreground pt-2 border-t border-border/50">
        <div className="space-y-1">
          <div><strong>High Confidence:</strong> 5+ mentions, 2+ from Tier 1/2 sources, &lt;48h</div>
          <div><strong>Medium Confidence:</strong> 3+ mentions, 1+ from Tier 1/2 sources, &lt;7d</div>
          <div><strong>Low Confidence:</strong> Limited data, using historical patterns</div>
        </div>
      </div>
    </div>
  );
};
