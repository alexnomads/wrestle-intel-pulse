
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

  const handleScrapeRealTimeEvents = async () => {
    try {
      const result = await scrapeEvents.mutateAsync();
      
      if (result.success) {
        toast({
          title: "Events Scraping Successful",
          description: `${result.message}. Check the Events tab to view the latest data.`,
        });
        onDataUpdate();
      } else {
        toast({
          title: "Scraping Failed",
          description: result.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to scrape events data",
        variant: "destructive",
      });
    }
  };

  const handleScrapeRealTimeNews = async () => {
    try {
      const result = await scrapeNews.mutateAsync();
      
      if (result.success) {
        toast({
          title: "News Scraping Successful",
          description: `${result.message}. Check the Overview tab to view the latest news.`,
        });
        onDataUpdate();
      } else {
        toast({
          title: "Scraping Failed",
          description: result.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to scrape news data",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="glass-card">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Real-Time Data Sources</CardTitle>
          <div className="flex space-x-2">
            <Button
              onClick={handleScrapeRealTimeEvents}
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
              onClick={handleScrapeRealTimeNews}
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
            🔴 LIVE: Data is scraped in real-time from official sources every 15 minutes automatically
          </div>
        </div>

        <div className="flex items-center justify-between p-4 bg-secondary/30 rounded-lg">
          <div className="flex items-center space-x-4">
            <div>
              <h3 className="font-semibold text-foreground">Wrestling Events</h3>
              <p className="text-sm text-muted-foreground">
                {eventsCount} live events • WWE, AEW, NXT weekly shows + PPVs
              </p>
            </div>
            <Badge variant="secondary">
              wwe.com • allelitewrestling.com
            </Badge>
          </div>
          <Button
            onClick={handleScrapeRealTimeEvents}
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
                {newsCount} articles • Real-time news from trusted sources
              </p>
            </div>
            <Badge variant="secondary">
              wrestlinginc.com • 411mania.com
            </Badge>
          </div>
          <Button
            onClick={handleScrapeRealTimeNews}
            disabled={scrapeNews.isPending}
            variant="outline"
            size="sm"
          >
            {scrapeNews.isPending ? (
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
              <h3 className="font-semibold text-foreground">Active Storylines</h3>
              <p className="text-sm text-muted-foreground">
                {storylinesCount} storylines • Auto-detected from news & social media
              </p>
            </div>
            <Badge variant="secondary">
              AI-powered detection
            </Badge>
          </div>
          <Button
            onClick={() => {
              handleScrapeRealTimeNews();
              toast({
                title: "Updating Storylines",
                description: "Storylines are auto-detected from latest news data",
              });
            }}
            disabled={scrapeNews.isPending}
            variant="outline"
            size="sm"
          >
            {scrapeNews.isPending ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
            Update
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
