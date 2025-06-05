
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RefreshCw, Calendar, FileText } from "lucide-react";
import { useScrapeEvents, useScrapeNews } from "@/hooks/useRealTimeWrestlingData";
import { useToast } from "@/hooks/use-toast";

interface RealTimeDataSourcesProps {
  eventsCount: number;
  newsCount: number;
  storylinesCount: number;
  onDataUpdate: () => void;
}

export const RealTimeDataSources = ({
  eventsCount,
  newsCount,
  storylinesCount,
  onDataUpdate
}: RealTimeDataSourcesProps) => {
  const scrapeEvents = useScrapeEvents();
  const scrapeNews = useScrapeNews();
  const { toast } = useToast();

  const handleScrapeEvents = async () => {
    try {
      console.log('Starting events scraping...');
      const result = await scrapeEvents.mutateAsync();
      
      console.log('Events scraping result:', result);
      
      if (result?.success) {
        toast({
          title: "Events Update Successful",
          description: `${result.message || 'Events updated successfully'}. Check the Events tab to view the latest data.`,
        });
        // Force data refresh
        setTimeout(() => {
          onDataUpdate();
        }, 1000);
      } else {
        toast({
          title: "Events Update Failed",
          description: result?.message || 'Unknown error occurred',
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Events scraping error:', error);
      toast({
        title: "Error",
        description: "Failed to update events data. Check console for details.",
        variant: "destructive",
      });
    }
  };

  const handleScrapeNews = async () => {
    toast({
      title: "News Feature Coming Soon",
      description: "News scraping functionality is not implemented yet.",
    });
  };

  return (
    <Card className="glass-card">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Real-Time Data Sources</CardTitle>
          <div className="flex space-x-2">
            <Button
              onClick={handleScrapeEvents}
              disabled={scrapeEvents.isPending}
              variant="outline"
              size="sm"
            >
              {scrapeEvents.isPending ? (
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Calendar className="h-4 w-4 mr-2" />
              )}
              Update Events
            </Button>
            <Button
              onClick={handleScrapeNews}
              disabled={scrapeNews.isPending}
              variant="outline"
              size="sm"
            >
              {scrapeNews.isPending ? (
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <FileText className="h-4 w-4 mr-2" />
              )}
              Update News
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3 mb-4">
          <div className="text-sm text-green-400">
            🔴 LIVE: Wrestling events are generated automatically for weekly shows
          </div>
        </div>

        <div className="flex items-center justify-between p-4 bg-secondary/30 rounded-lg">
          <div className="flex items-center space-x-4">
            <div>
              <h3 className="font-semibold text-foreground">Wrestling Events</h3>
              <p className="text-sm text-muted-foreground">
                {eventsCount} events • WWE, AEW, NXT, TNA weekly shows
              </p>
            </div>
            <Badge variant="secondary">
              Generated Weekly Shows
            </Badge>
          </div>
          <Button
            onClick={handleScrapeEvents}
            disabled={scrapeEvents.isPending}
            variant="outline"
            size="sm"
          >
            {scrapeEvents.isPending ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
            Update
          </Button>
        </div>

        <div className="flex items-center justify-between p-4 bg-secondary/30 rounded-lg">
          <div className="flex items-center space-x-4">
            <div>
              <h3 className="font-semibold text-foreground">Wrestling News</h3>
              <p className="text-sm text-muted-foreground">
                Feature coming soon • Real-time news from trusted sources
              </p>
            </div>
            <Badge variant="secondary">
              Coming Soon
            </Badge>
          </div>
          <Button
            onClick={handleScrapeNews}
            disabled={true}
            variant="outline"
            size="sm"
          >
            <RefreshCw className="h-4 w-4" />
            Update
          </Button>
        </div>

        <div className="flex items-center justify-between p-4 bg-secondary/30 rounded-lg">
          <div className="flex items-center space-x-4">
            <div>
              <h3 className="font-semibold text-foreground">Active Storylines</h3>
              <p className="text-sm text-muted-foreground">
                Feature coming soon • Auto-detected from news & social media
              </p>
            </div>
            <Badge variant="secondary">
              Coming Soon
            </Badge>
          </div>
          <Button
            disabled={true}
            variant="outline"
            size="sm"
          >
            <RefreshCw className="h-4 w-4" />
            Update
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
