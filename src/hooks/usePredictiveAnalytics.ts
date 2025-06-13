
import { useQuery } from '@tanstack/react-query';
import { useUnifiedData } from './useUnifiedData';
import { 
  analyzeWrestlerTrends, 
  generateTrendAlerts, 
  trackStorylineMomentum,
  type WrestlerTrend,
  type TrendAlert,
  type StorylineMomentum
} from '@/services/predictiveAnalyticsService';

export const usePredictiveAnalytics = (timeframe: '24h' | '7d' | '30d' = '24h') => {
  const { data: unifiedData } = useUnifiedData();

  const analyticsQuery = useQuery({
    queryKey: ['predictive-analytics', timeframe, unifiedData?.sources?.length || 0],
    queryFn: async () => {
      console.log('Running predictive analytics with unified data...');
      
      const sources = unifiedData?.sources || [];
      const wrestlerMentions = unifiedData?.wrestlerMentions || [];
      
      // Convert unified sources to the format expected by analytics service
      const newsItems = sources
        .filter(s => s.type === 'news')
        .map(s => ({
          title: s.title,
          contentSnippet: s.content,
          link: s.url || '#',
          pubDate: s.timestamp.toISOString(),
          source: s.source
        }));

      const redditPosts = sources
        .filter(s => s.type === 'reddit')
        .map(s => ({
          title: s.title,
          selftext: s.content,
          permalink: s.url?.replace('https://reddit.com', '') || '',
          created_utc: Math.floor(s.timestamp.getTime() / 1000),
          subreddit: s.source.replace('r/', ''),
          score: s.engagement?.score || 0,
          num_comments: s.engagement?.comments || 0
        }));
      
      // Analyze wrestler trends
      const trends = analyzeWrestlerTrends(newsItems, redditPosts, timeframe);
      
      // Track storyline momentum
      const storylines = trackStorylineMomentum(newsItems, redditPosts);
      
      // Generate alerts based on trends and storylines
      const alerts = generateTrendAlerts(trends, storylines);
      
      console.log('Predictive analytics results:', {
        trends: trends.length,
        storylines: storylines.length,
        alerts: alerts.length,
        sourceData: {
          totalSources: sources.length,
          newsItems: newsItems.length,
          redditPosts: redditPosts.length,
          wrestlerMentions: wrestlerMentions.length
        }
      });
      
      return {
        trends,
        storylines,
        alerts
      };
    },
    enabled: true, // Always enabled now since we have fallback data
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
