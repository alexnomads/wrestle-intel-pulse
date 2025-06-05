import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RefreshCw, Database, Users, Trophy, ExternalLink, Calendar, FileText, Zap } from "lucide-react";
import { usePromotions, useSupabaseWrestlers, useChampions, useScrapeWrestlingData } from "@/hooks/useSupabaseWrestlers";
import { useToast } from "@/hooks/use-toast";
import { useScrapeWrestlenomics, useScrapeAllWrestlenomics, useAllWrestlenomicsData } from "@/hooks/useWrestlenomicsData";
import { useScrapeEvents, useScrapeNews, useRealTimeAnalytics } from "@/hooks/useRealTimeWrestlingData";

export const DataManagement = () => {
  const [isScrapingAll, setIsScrapingAll] = useState(false);
  const [scrapingStatus, setScrapingStatus] = useState<{ [key: string]: boolean }>({});
  
  const { data: promotions = [] } = usePromotions();
  const { data: wrestlers = [], refetch: refetchWrestlers } = useSupabaseWrestlers();
  const { data: champions = [] } = useChampions();
  const scrapeWrestlingData = useScrapeWrestlingData();
  const { toast } = useToast();
  const scrapeWrestlenomics = useScrapeWrestlenomics();
  const scrapeAllWrestlenomics = useScrapeAllWrestlenomics();
  const { tvRatings, ticketSales, eloRankings, refetchAll } = useAllWrestlenomicsData();
  
  // New real-time data hooks
  const scrapeEvents = useScrapeEvents();
  const scrapeNews = useScrapeNews();
  const { events, news, storylines, refetchAll: refetchRealTimeData } = useRealTimeAnalytics();

  const handleScrapePromotion = async (promotionName: string) => {
    setScrapingStatus(prev => ({ ...prev, [promotionName]: true }));
    
    try {
      const result = await scrapeWrestlingData(promotionName);
      
      if (result.success) {
        toast({
          title: "Scraping Successful",
          description: result.message,
        });
        refetchWrestlers();
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
        description: `Failed to scrape ${promotionName} data`,
        variant: "destructive",
      });
    } finally {
      setScrapingStatus(prev => ({ ...prev, [promotionName]: false }));
    }
  };

  const handleScrapeAll = async () => {
    setIsScrapingAll(true);
    
    for (const promotion of promotions) {
      await handleScrapePromotion(promotion.name);
    }
    
    setIsScrapingAll(false);
    toast({
      title: "All Data Updated",
      description: "Successfully updated data for all promotions",
    });
  };

  const handleScrapeRealTimeEvents = async () => {
    try {
      const result = await scrapeEvents.mutateAsync();
      
      if (result.success) {
        toast({
          title: "Events Scraping Successful",
          description: `${result.message}. Check the Events tab to view the latest data.`,
        });
        refetchRealTimeData();
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
        refetchRealTimeData();
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

  const wrestlersByPromotion = wrestlers.reduce((acc, wrestler) => {
    const promotionName = wrestler.promotions?.name || 'Unknown';
    acc[promotionName] = (acc[promotionName] || 0) + 1;
    return acc;
  }, {} as { [key: string]: number });

  const handleScrapeWrestlenomics = async (dataType: 'tv-ratings' | 'ticket-sales' | 'elo-rankings') => {
    try {
      const result = await scrapeWrestlenomics.mutateAsync(dataType);
      
      if (result.success) {
        toast({
          title: "Wrestlenomics Scraping Successful",
          description: `${result.message}. Check the Industry Analytics tab to view the data.`,
        });
        // Refresh the data display
        refetchAll();
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
        description: `Failed to scrape ${dataType} data`,
        variant: "destructive",
      });
    }
  };

  const handleScrapeAllWrestlenomicsData = async () => {
    try {
      const results = await scrapeAllWrestlenomics.mutateAsync();
      
      const successCount = Object.values(results).filter(r => r.success).length;
      const totalCount = Object.keys(results).length;
      
      toast({
        title: "Wrestlenomics Data Updated",
        description: `Successfully updated ${successCount}/${totalCount} data sources. Check the Industry Analytics tab to view the data.`,
      });
      
      // Refresh the data display
      refetchAll();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update Wrestlenomics data",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Real-Time Data Management</h2>
          <p className="text-muted-foreground">
            Manage and update wrestling data from live sources. All data is scraped in real-time from official websites.
            <span className="inline-flex items-center ml-2 text-wrestling-electric">
              View data across all tabs 
              <ExternalLink className="h-3 w-3 ml-1" />
            </span>
          </p>
        </div>
        <Button 
          onClick={handleScrapeAll}
          disabled={isScrapingAll}
          className="bg-wrestling-electric hover:bg-wrestling-electric/90"
        >
          {isScrapingAll ? (
            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Zap className="h-4 w-4 mr-2" />
          )}
          Update All Real-Time Data
        </Button>
      </div>

      {/* Enhanced Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="glass-card">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500/20 to-blue-600/20 rounded-lg flex items-center justify-center">
                <Users className="h-6 w-6 text-blue-500" />
              </div>
              <div>
                <div className="text-2xl font-bold text-foreground">{wrestlers.length}</div>
                <div className="text-sm text-muted-foreground">Total Wrestlers</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-yellow-500/20 to-yellow-600/20 rounded-lg flex items-center justify-center">
                <Trophy className="h-6 w-6 text-yellow-500" />
              </div>
              <div>
                <div className="text-2xl font-bold text-foreground">{champions.length}</div>
                <div className="text-sm text-muted-foreground">Champions</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500/20 to-purple-600/20 rounded-lg flex items-center justify-center">
                <Calendar className="h-6 w-6 text-purple-500" />
              </div>
              <div>
                <div className="text-2xl font-bold text-foreground">{events.length}</div>
                <div className="text-sm text-muted-foreground">Live Events</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500/20 to-green-600/20 rounded-lg flex items-center justify-center">
                <FileText className="h-6 w-6 text-green-500" />
              </div>
              <div>
                <div className="text-2xl font-bold text-foreground">{news.length}</div>
                <div className="text-sm text-muted-foreground">Latest News</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Real-Time Data Sources */}
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
                  {events.length} live events • WWE, AEW, NXT weekly shows + PPVs
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
                  {news.length} articles • Real-time news from trusted sources
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
                  {storylines.length} storylines • Auto-detected from news & social media
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

      {/* Wrestlenomics Data Sources */}
      <Card className="glass-card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Wrestlenomics Data Sources</CardTitle>
            <Button
              onClick={handleScrapeAllWrestlenomicsData}
              disabled={scrapeAllWrestlenomics.isPending}
              className="bg-wrestling-electric hover:bg-wrestling-electric/90"
            >
              {scrapeAllWrestlenomics.isPending ? (
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Database className="h-4 w-4 mr-2" />
              )}
              Update All Wrestlenomics
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3 mb-4">
            <div className="text-sm text-blue-400">
              💡 After updating data, view it in the <strong>Industry Analytics</strong> tab under "Wrestlenomics Data"
            </div>
          </div>

          <div className="flex items-center justify-between p-4 bg-secondary/30 rounded-lg">
            <div className="flex items-center space-x-4">
              <div>
                <h3 className="font-semibold text-foreground">TV Ratings</h3>
                <p className="text-sm text-muted-foreground">
                  {tvRatings.length} ratings in database
                </p>
              </div>
              <Badge variant="secondary">
                wrestlenomics.com/tv-ratings
              </Badge>
            </div>
            <Button
              onClick={() => handleScrapeWrestlenomics('tv-ratings')}
              disabled={scrapeWrestlenomics.isPending}
              variant="outline"
              size="sm"
            >
              {scrapeWrestlenomics.isPending ? (
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
                <h3 className="font-semibold text-foreground">Ticket Sales</h3>
                <p className="text-sm text-muted-foreground">
                  {ticketSales.length} events in database
                </p>
              </div>
              <Badge variant="secondary">
                wrestlenomics.com/wrestletix
              </Badge>
            </div>
            <Button
              onClick={() => handleScrapeWrestlenomics('ticket-sales')}
              disabled={scrapeWrestlenomics.isPending}
              variant="outline"
              size="sm"
            >
              {scrapeWrestlenomics.isPending ? (
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
                <h3 className="font-semibold text-foreground">ELO Rankings</h3>
                <p className="text-sm text-muted-foreground">
                  {eloRankings.length} wrestlers ranked
                </p>
              </div>
              <Badge variant="secondary">
                wrestlenomics.com/elo-rankings-2
              </Badge>
            </div>
            <Button
              onClick={() => handleScrapeWrestlenomics('elo-rankings')}
              disabled={scrapeWrestlenomics.isPending}
              variant="outline"
              size="sm"
            >
              {scrapeWrestlenomics.isPending ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
              Update
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Promotion Management */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle>Promotion Data Sources</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {promotions.map((promotion) => (
            <div key={promotion.id} className="flex items-center justify-between p-4 bg-secondary/30 rounded-lg">
              <div className="flex items-center space-x-4">
                <div>
                  <h3 className="font-semibold text-foreground">{promotion.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {wrestlersByPromotion[promotion.name] || 0} wrestlers in database
                  </p>
                </div>
                <Badge variant="secondary">
                  {promotion.roster_url ? 'Source Available' : 'No Source'}
                </Badge>
              </div>
              <Button
                onClick={() => handleScrapePromotion(promotion.name)}
                disabled={scrapingStatus[promotion.name]}
                variant="outline"
                size="sm"
              >
                {scrapingStatus[promotion.name] ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4" />
                )}
                Update
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};
