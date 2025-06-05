
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { RefreshCw, ExternalLink, Zap } from "lucide-react";
import { usePromotions, useSupabaseWrestlers, useChampions, useScrapeWrestlingData } from "@/hooks/useSupabaseWrestlers";
import { useToast } from "@/hooks/use-toast";
import { useAllWrestlenomicsData } from "@/hooks/useWrestlenomicsData";
import { useRealTimeAnalytics } from "@/hooks/useRealTimeWrestlingData";
import { DataStatisticsCards } from "./data-management/DataStatisticsCards";
import { RealTimeDataSources } from "./data-management/RealTimeDataSources";
import { WrestlenomicsDataSources } from "./data-management/WrestlenomicsDataSources";
import { PromotionDataSources } from "./data-management/PromotionDataSources";

export const DataManagement = () => {
  const [isScrapingAll, setIsScrapingAll] = useState(false);
  const [scrapingStatus, setScrapingStatus] = useState<{ [key: string]: boolean }>({});
  
  const { data: promotions = [] } = usePromotions();
  const { data: wrestlers = [], refetch: refetchWrestlers } = useSupabaseWrestlers();
  const { data: champions = [] } = useChampions();
  const scrapeWrestlingData = useScrapeWrestlingData();
  const { toast } = useToast();
  const { tvRatings, ticketSales, eloRankings, refetchAll } = useAllWrestlenomicsData();
  
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

  const wrestlersByPromotion = wrestlers.reduce((acc, wrestler) => {
    const promotionName = wrestler.promotions?.name || 'Unknown';
    acc[promotionName] = (acc[promotionName] || 0) + 1;
    return acc;
  }, {} as { [key: string]: number });

  const handleScrapingStatusChange = (promotionName: string, isLoading: boolean) => {
    setScrapingStatus(prev => ({ ...prev, [promotionName]: isLoading }));
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

      <DataStatisticsCards
        wrestlersCount={wrestlers.length}
        championsCount={champions.length}
        eventsCount={events.length}
        newsCount={news.length}
      />

      <RealTimeDataSources
        eventsCount={events.length}
        newsCount={news.length}
        storylinesCount={storylines.length}
        onDataUpdate={refetchRealTimeData}
      />

      <WrestlenomicsDataSources
        tvRatingsCount={tvRatings.length}
        ticketSalesCount={ticketSales.length}
        eloRankingsCount={eloRankings.length}
        onDataUpdate={refetchAll}
      />

      <PromotionDataSources
        promotions={promotions}
        wrestlersByPromotion={wrestlersByPromotion}
        scrapingStatus={scrapingStatus}
        onScrapingStatusChange={handleScrapingStatusChange}
        onWrestlersRefetch={refetchWrestlers}
      />
    </div>
  );
};
