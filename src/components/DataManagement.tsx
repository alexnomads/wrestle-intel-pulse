import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { RefreshCw, ExternalLink, Zap, Clock, Play, Pause } from "lucide-react";
import { usePromotions, useSupabaseWrestlers, useChampions, useScrapeWrestlingData } from "@/hooks/useSupabaseWrestlers";
import { useToast } from "@/hooks/use-toast";
import { useAllWrestlenomicsData } from "@/hooks/useWrestlenomicsData";
import { useRealTimeAnalytics } from "@/hooks/useRealTimeWrestlingData";
import { useComprehensiveNews, useComprehensiveReddit } from "@/hooks/useWrestlingData";
import { autoUpdateService } from "@/services/autoUpdateService";
import { DataStatisticsCards } from "./data-management/DataStatisticsCards";
import { RealTimeDataSources } from "./data-management/RealTimeDataSources";
import { WrestlenomicsDataSources } from "./data-management/WrestlenomicsDataSources";
import { PromotionDataSources } from "./data-management/PromotionDataSources";

export const DataManagement = () => {
  const [isScrapingAll, setIsScrapingAll] = useState(false);
  const [scrapingStatus, setScrapingStatus] = useState<{ [key: string]: boolean }>({});
  const [autoUpdateEnabled, setAutoUpdateEnabled] = useState(true);
  const [lastUpdateTime, setLastUpdateTime] = useState<string>('');
  const [hasAutoUpdatedOnMount, setHasAutoUpdatedOnMount] = useState(false);
  
  const { data: promotions = [] } = usePromotions();
  const { data: wrestlers = [], refetch: refetchWrestlers } = useSupabaseWrestlers();
  const { data: champions = [] } = useChampions();
  const scrapeWrestlingData = useScrapeWrestlingData();
  const { toast } = useToast();
  const { tvRatings, ticketSales, eloRankings, refetchAll } = useAllWrestlenomicsData();
  
  const { events, news, storylines, refetchAll: refetchRealTimeData } = useRealTimeAnalytics();
  const { data: comprehensiveNews = [], refetch: refetchComprehensiveNews } = useComprehensiveNews();
  const { data: comprehensiveReddit = [], refetch: refetchComprehensiveReddit } = useComprehensiveReddit();

  // Auto-update all data when component mounts (user visits the website)
  useEffect(() => {
    const performInitialUpdate = async () => {
      if (hasAutoUpdatedOnMount) return;
      
      console.log('🚀 DataManagement: Auto-updating all data on website visit...');
      setHasAutoUpdatedOnMount(true);
      
      try {
        // Trigger comprehensive data refresh
        await Promise.allSettled([
          refetchComprehensiveNews(),
          refetchComprehensiveReddit(),
          refetchRealTimeData(),
          refetchAll(),
          refetchWrestlers()
        ]);
        
        setLastUpdateTime(new Date().toLocaleTimeString());
        
        toast({
          title: "Data Refreshed",
          description: `All wrestling data updated automatically at ${new Date().toLocaleTimeString()}`,
        });
        
        console.log('✅ DataManagement: Auto-update on mount completed');
      } catch (error) {
        console.error('❌ DataManagement: Auto-update on mount failed:', error);
        toast({
          title: "Update Notice",
          description: "Some data sources may need manual refresh",
          variant: "destructive",
        });
      }
    };

    // Small delay to ensure all hooks are ready
    const timer = setTimeout(performInitialUpdate, 1000);
    return () => clearTimeout(timer);
  }, []); // Empty dependency array ensures this only runs once on mount

  // Register comprehensive data updates with auto-update service
  useEffect(() => {
    const updateCallback = async () => {
      try {
        setLastUpdateTime(new Date().toLocaleTimeString());
        await Promise.allSettled([
          refetchComprehensiveNews(),
          refetchComprehensiveReddit(),
          refetchRealTimeData(),
          refetchAll()
        ]);
        toast({
          title: "Auto-Update Complete",
          description: `Data refreshed at ${new Date().toLocaleTimeString()}`,
        });
      } catch (error) {
        console.error('Auto-update error:', error);
      }
    };

    autoUpdateService.addUpdateCallback(updateCallback);

    return () => {
      autoUpdateService.removeUpdateCallback(updateCallback);
    };
  }, [refetchComprehensiveNews, refetchComprehensiveReddit, refetchRealTimeData, refetchAll, toast]);

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
    
    try {
      // Update wrestling data
      for (const promotion of promotions) {
        await handleScrapePromotion(promotion.name);
      }
      
      // Trigger comprehensive news and Reddit update
      await Promise.allSettled([
        refetchComprehensiveNews(),
        refetchComprehensiveReddit(),
        refetchRealTimeData(),
        refetchAll()
      ]);
      
      setLastUpdateTime(new Date().toLocaleTimeString());
      
      toast({
        title: "All Data Updated",
        description: "Successfully updated data for all promotions and news sources",
      });
    } catch (error) {
      toast({
        title: "Update Error",
        description: "Some data sources failed to update",
        variant: "destructive",
      });
    } finally {
      setIsScrapingAll(false);
    }
  };

  const toggleAutoUpdate = () => {
    if (autoUpdateEnabled) {
      autoUpdateService.stopAutoUpdate();
      setAutoUpdateEnabled(false);
      toast({
        title: "Auto-Update Disabled",
        description: "Data will no longer update automatically every 10 minutes",
      });
    } else {
      autoUpdateService.startAutoUpdate();
      setAutoUpdateEnabled(true);
      toast({
        title: "Auto-Update Enabled",
        description: "Data will now update automatically every 10 minutes",
      });
    }
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
            Comprehensive wrestling data from {comprehensiveNews.length + news.length} news sources, {comprehensiveReddit.length} Reddit posts, and official promotions.
            <span className="inline-flex items-center ml-2 text-wrestling-electric">
              Auto-updates on every visit + every 10 minutes 
              <Clock className="h-3 w-3 ml-1" />
            </span>
          </p>
          {lastUpdateTime && (
            <p className="text-sm text-muted-foreground">
              Last updated: {lastUpdateTime}
            </p>
          )}
        </div>
        <div className="flex items-center space-x-2">
          <Button 
            onClick={toggleAutoUpdate}
            variant={autoUpdateEnabled ? "default" : "outline"}
            size="sm"
          >
            {autoUpdateEnabled ? (
              <Pause className="h-4 w-4 mr-2" />
            ) : (
              <Play className="h-4 w-4 mr-2" />
            )}
            Auto-Update {autoUpdateEnabled ? 'ON' : 'OFF'}
          </Button>
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
            Update All Data Now
          </Button>
        </div>
      </div>

      <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3 mb-4">
        <div className="text-sm text-green-400">
          🔴 LIVE: Auto-updating from {comprehensiveNews.length > 0 ? 'comprehensive' : 'standard'} wrestling news sources on every website visit + every 10 minutes
        </div>
      </div>

      <DataStatisticsCards
        wrestlersCount={wrestlers.length}
        championsCount={champions.length}
        eventsCount={events.length}
        newsCount={comprehensiveNews.length + news.length}
      />

      <div className="grid gap-6">
        <div className="bg-secondary/30 rounded-lg p-4">
          <h3 className="font-semibold text-foreground mb-2">Comprehensive News Sources ({comprehensiveNews.length} articles)</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
            <div>• F4W Online • PWTorch • PWInsider</div>
            <div>• Wrestling Inc • Fightful • Ringside News</div>
            <div>• WWE.com • AEW.com • Impact Wrestling</div>
            <div>• Cageside Seats • WrestleZone • + more</div>
          </div>
        </div>

        <div className="bg-secondary/30 rounded-lg p-4">
          <h3 className="font-semibold text-foreground mb-2">Twitter/X Wrestling Accounts</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
            <div>• @SeanRossSapp • @WrestleVotes</div>
            <div>• @davemeltzerWON • @ryansatin</div>
            <div>• @WWE • @AEW • @njpw1972</div>
            <div>• @MichaelCole • @WadeBarrett • + 40 more</div>
          </div>
        </div>

        <div className="bg-secondary/30 rounded-lg p-4">
          <h3 className="font-semibold text-foreground mb-2">Reddit Wrestling Communities ({comprehensiveReddit.length} posts)</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
            <div>• r/SquaredCircle • r/WWE • r/AEWOfficial</div>
            <div>• r/njpw • r/ImpactWrestling • r/Wreddit</div>
            <div>• r/IndieWrestling • r/ROH • r/SCJerk</div>
            <div>• r/FantasyBooking • r/WrestlingGM • + more</div>
          </div>
        </div>
      </div>

      <RealTimeDataSources
        eventsCount={events.length}
        newsCount={comprehensiveNews.length + news.length}
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
