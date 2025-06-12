
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock } from "lucide-react";
import { useComprehensiveNews } from "@/hooks/useWrestlingData";
import { useComprehensiveReddit } from "@/hooks/useWrestlingData";
import { useUnifiedData } from "@/hooks/useUnifiedData";
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
  const { data: unifiedData } = useUnifiedData();

  // Combine news, Reddit, and Twitter data
  const allSources = unifiedData?.sources || [];
  const newsAndRedditItems = createUnifiedItems(newsItems, redditPosts);
  
  // Convert Twitter and YouTube sources to unified format
  const twitterAndYouTubeItems = allSources
    .filter(source => source.type === 'twitter' || source.type === 'youtube')
    .map(source => ({
      id: `${source.type}-${source.timestamp.getTime()}`,
      title: source.title,
      content: source.content,
      source: source.source,
      type: source.type as 'twitter' | 'youtube',
      timestamp: source.timestamp,
      link: source.url || '#',
      sentiment: 0.5, // Default neutral sentiment
      credibilityScore: source.type === 'twitter' ? 7 : 8,
      isBreaking: false,
      engagement: source.engagement
    }));

  // Combine all items
  const unifiedItems = [...newsAndRedditItems, ...twitterAndYouTubeItems];

  // Apply filters
  const filteredItems = filterItems(unifiedItems, filter);

  return (
    <Card className="glass-card">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <Clock className="h-6 w-6 text-wrestling-electric" />
            <span>Latest Wrestling News & Social Updates</span>
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
