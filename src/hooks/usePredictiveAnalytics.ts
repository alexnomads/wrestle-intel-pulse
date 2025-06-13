
import { useQuery } from '@tanstack/react-query';
import { useUnifiedData } from './useUnifiedData';
import { useRSSFeeds, useRedditPosts } from './useWrestlingData';
import { 
  analyzeWrestlerTrends, 
  generateTrendAlerts, 
  trackStorylineMomentum,
  type WrestlerTrend,
  type TrendAlert,
  type StorylineMomentum
} from '@/services/predictiveAnalyticsService';

export const usePredictiveAnalytics = () => {
  const { data: unifiedData } = useUnifiedData();

  const analyticsQuery = useQuery({
    queryKey: ['predictive-analytics', '7d', unifiedData?.sources?.length || 0],
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
          source: s.source,
          guid: s.url || `${s.source}-${s.timestamp.getTime()}`, // Add required guid property
          author: undefined,
          category: undefined
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
          num_comments: s.engagement?.comments || 0,
          url: s.url || '',
          author: 'unknown'
        }));
      
      // Analyze wrestler trends with 7d timeframe
      const trends = analyzeWrestlerTrends(newsItems, redditPosts, '7d');
      
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
    staleTime: 5 * 60 * 1000, // 5 minutes - synchronized
    refetchInterval: 10 * 60 * 1000, // 10 minutes - synchronized with auto-update
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
    queryFn: () => {
      console.log('Analyzing real-time trends with enhanced source data...');
      return analyzeWrestlerTrends(newsItems, redditPosts, '7d');
    },
    enabled: true, // Always enabled to ensure fallback data
    staleTime: 5 * 60 * 1000, // 5 minutes - synchronized
    refetchInterval: 10 * 60 * 1000, // 10 minutes - synchronized with auto-update
  });
};

export const useTrendAlerts = () => {
  const { trends, storylines } = usePredictiveAnalytics();
  
  return useQuery({
    queryKey: ['trend-alerts', trends.length, storylines.length],
    queryFn: () => {
      console.log('Generating trend alerts with enhanced source data...');
      const alerts = generateTrendAlerts(trends, storylines);
      console.log(`Generated ${alerts.length} alerts, each with source data:`, 
        alerts.map(a => ({ 
          title: a.title, 
          sources: a.mention_sources?.length || 0 
        }))
      );
      return alerts;
    },
    enabled: true, // Always enabled to ensure fallback data
    staleTime: 5 * 60 * 1000, // 5 minutes - synchronized
    refetchInterval: 10 * 60 * 1000, // 10 minutes - synchronized with auto-update
  });
};
