
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RefreshCw, Database } from "lucide-react";
import { useScrapeWrestlenomics, useScrapeAllWrestlenomics } from "@/hooks/useWrestlenomicsData";
import { useToast } from "@/hooks/use-toast";

interface WrestlenomicsDataSourcesProps {
  tvRatingsCount: number;
  ticketSalesCount: number;
  eloRankingsCount: number;
  onDataUpdate: () => void;
}

export const WrestlenomicsDataSources = ({
  tvRatingsCount,
  ticketSalesCount,
  eloRankingsCount,
  onDataUpdate
}: WrestlenomicsDataSourcesProps) => {
  const scrapeWrestlenomics = useScrapeWrestlenomics();
  const scrapeAllWrestlenomics = useScrapeAllWrestlenomics();
  const { toast } = useToast();

  const handleScrapeWrestlenomics = async (dataType: 'tv-ratings' | 'ticket-sales' | 'elo-rankings') => {
    try {
      const result = await scrapeWrestlenomics.mutateAsync(dataType);
      
      if (result.success) {
        toast({
          title: "Wrestlenomics Scraping Successful",
          description: `${result.message}. Check the Industry Analytics tab to view the data.`,
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
      
      onDataUpdate();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update Wrestlenomics data",
        variant: "destructive",
      });
    }
  };

  return (
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
                {tvRatingsCount} ratings in database
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
                {ticketSalesCount} events in database
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
                {eloRankingsCount} wrestlers ranked
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
  );
};
