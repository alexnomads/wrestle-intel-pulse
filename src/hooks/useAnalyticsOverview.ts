
import { useQuery } from '@tanstack/react-query';
import { useSupabaseWrestlers } from './useSupabaseWrestlers';
import { useRSSFeeds } from './useWrestlingData';

interface AnalyticsData {
  totalWrestlers: number;
  upcomingEvents: number;
  dailyMentions: number;
  sentimentScore: number;
}

export const useAnalyticsOverview = () => {
  const { data: wrestlers = [], isLoading: wrestlersLoading } = useSupabaseWrestlers();
  const { data: newsItems = [], isLoading: newsLoading } = useRSSFeeds();

  return useQuery({
    queryKey: ['analytics-overview', wrestlers.length, newsItems.length],
    queryFn: async (): Promise<AnalyticsData> => {
      // Calculate total wrestlers
      const totalWrestlers = wrestlers.length;
      
      // Mock upcoming events (you can replace with real data later)
      const upcomingEvents = 12;
      
      // Calculate daily mentions from news
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      
      const recentNews = newsItems.filter(item => {
        const itemDate = new Date(item.pubDate);
        return itemDate >= yesterday;
      });
      
      const dailyMentions = recentNews.length * 3; // Estimate mentions per article
      
      // Calculate sentiment score from recent news
      let totalSentimentScore = 0;
      let sentimentCount = 0;
      
      recentNews.forEach(item => {
        const content = `${item.title} ${item.contentSnippet}`.toLowerCase();
        
        // Simple positive/negative word counting for sentiment
        const positiveWords = ['win', 'champion', 'great', 'amazing', 'success', 'victory', 'star', 'return'];
        const negativeWords = ['lose', 'injury', 'fired', 'controversy', 'problem', 'issue', 'suspended'];
        
        let score = 50; // neutral baseline
        
        positiveWords.forEach(word => {
          if (content.includes(word)) score += 10;
        });
        
        negativeWords.forEach(word => {
          if (content.includes(word)) score -= 10;
        });
        
        totalSentimentScore += Math.max(0, Math.min(100, score));
        sentimentCount++;
      });
      
      const sentimentScore = sentimentCount > 0 
        ? Math.round(totalSentimentScore / sentimentCount)
        : 75; // Default positive sentiment
      
      return {
        totalWrestlers,
        upcomingEvents,
        dailyMentions,
        sentimentScore
      };
    },
    enabled: !wrestlersLoading && !newsLoading,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 3,
  });
};
