
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RefreshCw } from "lucide-react";
import { useScrapeWrestlingData } from "@/hooks/useSupabaseWrestlers";
import { useToast } from "@/hooks/use-toast";

interface Promotion {
  id: string;
  name: string;
  roster_url?: string;
}

interface PromotionDataSourcesProps {
  promotions: Promotion[];
  wrestlersByPromotion: { [key: string]: number };
  scrapingStatus: { [key: string]: boolean };
  onScrapingStatusChange: (promotionName: string, isLoading: boolean) => void;
  onWrestlersRefetch: () => void;
}

export const PromotionDataSources = ({
  promotions,
  wrestlersByPromotion,
  scrapingStatus,
  onScrapingStatusChange,
  onWrestlersRefetch
}: PromotionDataSourcesProps) => {
  const scrapeWrestlingData = useScrapeWrestlingData();
  const { toast } = useToast();

  const handleScrapePromotion = async (promotionName: string) => {
    onScrapingStatusChange(promotionName, true);
    
    try {
      const result = await scrapeWrestlingData(promotionName);
      
      if (result.success) {
        toast({
          title: "Scraping Successful",
          description: result.message,
        });
        onWrestlersRefetch();
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
      onScrapingStatusChange(promotionName, false);
    }
  };

  return (
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
  );
};
