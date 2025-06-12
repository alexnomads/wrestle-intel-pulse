
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock } from "lucide-react";
import { useComprehensiveNews } from "@/hooks/useWrestlingData";
import { useComprehensiveReddit } from "@/hooks/useWrestlingData";
import { FilterButtons } from "./unified-news-feed/FilterButtons";
import { NewsItem } from "./unified-news-feed/NewsItem";
import { EmptyState } from "./unified-news-feed/EmptyState";
import { Footer } from "./unified-news-feed/Footer";
import { createUnifiedItems, filterItems } from "./unified-news-feed/utils";
import { UnifiedNewsFeedProps, FilterType } from "./unified-news-feed/types";

export const UnifiedNewsFeed = ({ refreshTrigger }: UnifiedNewsFeedProps) => {
  const [filter, setFilter] = useState<FilterType>('all');
  const { data: newsItems = [] } = useComprehensiveNews();
  const { data: redditPosts = [] } = useComprehensiveReddit();

  // Combine and process all items
  const unifiedItems = createUnifiedItems(newsItems, redditPosts);

  // Apply filters
  const filteredItems = filterItems(unifiedItems, filter);

  return (
    <Card className="glass-card">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <Clock className="h-6 w-6 text-wrestling-electric" />
            <span>Latest Wrestling News & Community Updates</span>
            <Badge variant="secondary" className="bg-blue-100 text-blue-800">
              {filteredItems.length} items
            </Badge>
          </CardTitle>
          
          <FilterButtons filter={filter} onFilterChange={setFilter} />
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-4 max-h-96 overflow-y-auto">
          {filteredItems.slice(0, 15).map((item) => (
            <NewsItem key={item.id} item={item} />
          ))}
          
          <EmptyState filteredItemsLength={filteredItems.length} />
        </div>
        
        <Footer filteredItemsLength={filteredItems.length} />
      </CardContent>
    </Card>
  );
};
