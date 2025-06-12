
import { useQuery } from '@tanstack/react-query';
import { useRSSFeeds, useRedditPosts } from './useWrestlingData';
import { 
  analyzeWrestlerTrends, 
  generateTrendAlerts, 
  trackStorylineMomentum,
  type WrestlerTrend,
  type TrendAlert,
  type StorylineMomentum
} from '@/services/predictiveAnalyticsService';

export const usePredictiveAnalytics = (timeframe: '24h' | '7d' | '30d' = '24h') => {
  const { data: newsItems = [] } = useRSSFeeds();
  const { data: redditPosts = [] } = useRedditPosts();

  const analyticsQuery = useQuery({
    queryKey: ['predictive-analytics', timeframe, newsItems.length, redditPosts.length],
    queryFn: async () => {
      console.log('Running predictive analytics...');
      
      // Analyze wrestler trends
      const trends = analyzeWrestlerTrends(newsItems, redditPosts, timeframe);
      
      // Track storyline momentum
      const storylines = trackStorylineMomentum(newsItems, redditPosts);
      
      // Generate alerts based on trends and storylines
      const alerts = generateTrendAlerts(trends, storylines);
      
      console.log('Predictive analytics results:', {
        trends: trends.length,
        storylines: storylines.length,
        alerts: alerts.length
      });
      
      return {
        trends,
        storylines,
        alerts
      };
    },
    enabled: newsItems.length > 0 || redditPosts.length > 0,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 10 * 60 * 1000, // 10 minutes
  });

  return {
    trends: analyticsQuery.data?.trends || [],
    storylines: analyticsQuery.data?.storylines || [],
    alerts: analyticsQuery.data?.alerts || [],
    isLoading: analyticsQuery.isLoading,
    error: analyticsQuery.error,
    refetch: analyticsQuery.refetch
  };
};

export const useRealTimeTrends = () => {
  const { data: newsItems = [] } = useRSSFeeds();
  const { data: redditPosts = [] } = useRedditPosts();

  return useQuery({
    queryKey: ['real-time-trends', newsItems.length, redditPosts.length],
    queryFn: () => analyzeWrestlerTrends(newsItems, redditPosts, '24h'),
    enabled: newsItems.length > 0 || redditPosts.length > 0,
    staleTime: 2 * 60 * 1000, // 2 minutes
    refetchInterval: 5 * 60 * 1000, // 5 minutes
  });
};

export const useTrendAlerts = () => {
  const { trends, storylines } = usePredictiveAnalytics();
  
  return useQuery({
    queryKey: ['trend-alerts', trends.length, storylines.length],
    queryFn: () => generateTrendAlerts(trends, storylines),
    enabled: trends.length > 0 || storylines.length > 0,
    staleTime: 1 * 60 * 1000, // 1 minute
  });
};
