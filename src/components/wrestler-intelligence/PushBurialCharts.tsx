
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { TrendingUp, TrendingDown, Flame, ExternalLink } from "lucide-react";

interface WrestlerAnalysis {
  id: string;
  wrestler_name: string;
  promotion: string;
  totalMentions: number;
  pushScore: number;
  burialScore: number;
  trend: 'push' | 'burial' | 'stable';
  isOnFire: boolean;
  sentimentScore: number;
  relatedNews?: Array<{
    title: string;
    link: string;
    source: string;
    pubDate: string;
  }>;
}

interface PushBurialChartsProps {
  topPushWrestlers: WrestlerAnalysis[];
  worstBuriedWrestlers: WrestlerAnalysis[];
  selectedPromotion: string;
  selectedTimePeriod: string;
}

export const PushBurialCharts = ({ 
  topPushWrestlers, 
  worstBuriedWrestlers, 
  selectedPromotion, 
  selectedTimePeriod 
}: PushBurialChartsProps) => {
  const promotionLabel = selectedPromotion === 'all' ? 'All Federations' : selectedPromotion.toUpperCase();

  const MediaCoveragePopup = ({ wrestler }: { wrestler: WrestlerAnalysis }) => (
    <HoverCard>
      <HoverCardTrigger asChild>
        <button className="text-xs text-blue-400 hover:text-blue-300 underline">
          View Coverage
        </button>
      </HoverCardTrigger>
      <HoverCardContent className="w-80 max-h-96 overflow-y-auto">
        <div className="space-y-3">
          <h4 className="font-semibold text-foreground">Media Coverage for {wrestler.wrestler_name}</h4>
          <div className="text-sm text-muted-foreground">
            {wrestler.totalMentions} mentions in the last {selectedTimePeriod} days
          </div>
          
          {wrestler.relatedNews && wrestler.relatedNews.length > 0 ? (
            <div className="space-y-2">
              {wrestler.relatedNews.slice(0, 5).map((news, index) => (
                <div key={index} className="border-l-2 border-blue-400 pl-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="text-sm font-medium text-foreground mb-1">
                        {news.title.substring(0, 80)}...
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {news.source} • {new Date(news.pubDate).toLocaleDateString()}
                      </div>
                    </div>
                    <a 
                      href={news.link} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="ml-2 text-blue-400 hover:text-blue-300"
                    >
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                </div>
              ))}
              {wrestler.relatedNews.length > 5 && (
                <div className="text-xs text-muted-foreground text-center">
                  And {wrestler.relatedNews.length - 5} more articles...
                </div>
              )}
            </div>
          ) : (
            <div className="text-sm text-muted-foreground">
              No detailed coverage links available
            </div>
          )}
        </div>
      </HoverCardContent>
    </HoverCard>
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center text-green-400">
            <TrendingUp className="h-5 w-5 mr-2" />
            PUSH Top 10 - Most Mentioned ({promotionLabel})
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Ranked by total mentions, not alphabetical order
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {topPushWrestlers.length > 0 ? (
              topPushWrestlers.map((wrestler, index) => (
                <div 
                  key={wrestler.id} 
                  className={`flex items-center justify-between p-3 rounded-lg transition-all ${
                    wrestler.isOnFire 
                      ? 'bg-gradient-to-r from-green-100 to-yellow-100 dark:from-green-900/40 dark:to-yellow-900/40 border-2 border-yellow-400' 
                      : 'bg-green-50 dark:bg-green-900/20'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center font-bold text-sm">
                      #{index + 1}
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <h4 className="font-semibold text-gray-900 dark:text-gray-100 text-base">
                          {wrestler.wrestler_name}
                        </h4>
                        {wrestler.isOnFire && (
                          <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300">
                            <Flame className="h-3 w-3 mr-1" />
                            ON FIRE
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-300">{wrestler.promotion}</p>
                      <div className="mt-1">
                        <MediaCoveragePopup wrestler={wrestler} />
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-green-600 dark:text-green-400">
                      {wrestler.totalMentions} mentions
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-300">
                      {wrestler.pushScore.toFixed(1)}% positive • {wrestler.sentimentScore}% sentiment
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center text-muted-foreground py-8">
                No wrestlers receiving significant push in the last {selectedTimePeriod} days
                {selectedPromotion !== 'all' && ` for ${selectedPromotion.toUpperCase()}`}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center text-red-400">
            <TrendingDown className="h-5 w-5 mr-2" />
            BURIED Worst 10 - Most Mentioned ({promotionLabel})
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Ranked by total mentions, not alphabetical order
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {worstBuriedWrestlers.length > 0 ? (
              worstBuriedWrestlers.map((wrestler, index) => (
                <div 
                  key={wrestler.id} 
                  className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-900/20 rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center font-bold text-sm">
                      #{index + 1}
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-gray-100 text-base">
                        {wrestler.wrestler_name}
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-300">{wrestler.promotion}</p>
                      <div className="mt-1">
                        <MediaCoveragePopup wrestler={wrestler} />
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-red-600 dark:text-red-400">
                      {wrestler.totalMentions} mentions
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-300">
                      {wrestler.burialScore.toFixed(1)}% negative • {wrestler.sentimentScore}% sentiment
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center text-muted-foreground py-8">
                No wrestlers being significantly buried in the last {selectedTimePeriod} days
                {selectedPromotion !== 'all' && ` for ${selectedPromotion.toUpperCase()}`}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
