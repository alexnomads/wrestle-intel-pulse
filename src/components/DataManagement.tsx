import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RefreshCw, Database, Users, Trophy } from "lucide-react";
import { usePromotions, useSupabaseWrestlers, useChampions, useScrapeWrestlingData } from "@/hooks/useSupabaseWrestlers";
import { useToast } from "@/hooks/use-toast";
import { useScrapeWrestlenomics, useScrapeAllWrestlenomics, useAllWrestlenomicsData } from "@/hooks/useWrestlenomicsData";

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
  const { tvRatings, ticketSales, eloRankings } = useAllWrestlenomicsData();

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
          description: result.message,
        });
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
        description: `Successfully updated ${successCount}/${totalCount} data sources`,
      });
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
          <h2 className="text-2xl font-bold text-foreground">Data Management</h2>
          <p className="text-muted-foreground">Manage and update wrestling data from official sources</p>
        </div>
        <Button 
          onClick={handleScrapeAll}
          disabled={isScrapingAll}
          className="bg-wrestling-electric hover:bg-wrestling-electric/90"
        >
          {isScrapingAll ? (
            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Database className="h-4 w-4 mr-2" />
          )}
          Update All Data
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
              <div className="w-12 h-12 bg-gradient-to-br from-green-500/20 to-green-600/20 rounded-lg flex items-center justify-center">
                <Database className="h-6 w-6 text-green-500" />
              </div>
              <div>
                <div className="text-2xl font-bold text-foreground">{promotions.length}</div>
                <div className="text-sm text-muted-foreground">Promotions</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

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
