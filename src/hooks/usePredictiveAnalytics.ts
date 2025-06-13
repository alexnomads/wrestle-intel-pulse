
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
import { getFallbackTrendAlerts } from '@/services/fallbackDataService';

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
    queryFn: () => {
      console.log('Analyzing real-time trends with enhanced source data...');
      return analyzeWrestlerTrends(newsItems, redditPosts, '24h');
    },
    enabled: true, // Always enabled to ensure fallback data
    staleTime: 2 * 60 * 1000, // 2 minutes
    refetchInterval: 5 * 60 * 1000, // 5 minutes
  });
};

export const useTrendAlerts = () => {
  const { trends, storylines } = usePredictiveAnalytics();
  
  return useQuery({
    queryKey: ['trend-alerts', trends.length, storylines.length],
    queryFn: () => {
      console.log('=== TREND ALERTS DATA PIPELINE DEBUG ===');
      console.log('Input data:', { 
        trendsCount: trends.length, 
        storylinesCount: storylines.length 
      });
      
      // Generate alerts from the predictive analytics data
      const generatedAlerts = generateTrendAlerts(trends, storylines);
      console.log('Generated alerts from service:', {
        count: generatedAlerts.length,
        alertsWithSources: generatedAlerts.filter(a => a.mention_sources && a.mention_sources.length > 0).length,
        sampleAlert: generatedAlerts[0] ? {
          id: generatedAlerts[0].id,
          title: generatedAlerts[0].title,
          hasSources: !!generatedAlerts[0].mention_sources,
          sourceCount: generatedAlerts[0].mention_sources?.length || 0
        } : null
      });
      
      // If we don't have enough alerts with sources, use fallback data
      const alertsWithSources = generatedAlerts.filter(a => a.mention_sources && a.mention_sources.length > 0);
      let finalAlerts = generatedAlerts;
      
      if (alertsWithSources.length < 2) {
        console.log('Insufficient alerts with sources, adding fallback data');
        const fallbackAlerts = getFallbackTrendAlerts();
        console.log('Fallback alerts:', {
          count: fallbackAlerts.length,
          alertsWithSources: fallbackAlerts.filter(a => a.mention_sources && a.mention_sources.length > 0).length
        });
        
        // Combine real and fallback alerts, prioritizing real ones
        finalAlerts = [...generatedAlerts, ...fallbackAlerts].slice(0, 5);
      }
      
      console.log('Final alerts being returned to UI:', {
        count: finalAlerts.length,
        alertsWithSources: finalAlerts.filter(a => a.mention_sources && a.mention_sources.length > 0).length,
        alertDetails: finalAlerts.map(a => ({
          id: a.id,
          title: a.title,
          sourceCount: a.mention_sources?.length || 0,
          hasExpandableContent: !!(a.mention_sources && a.mention_sources.length > 0)
        }))
      });
      console.log('=== END TREND ALERTS DEBUG ===');
      
      return finalAlerts;
    },
    enabled: true, // Always enabled to ensure fallback data
    staleTime: 1 * 60 * 1000, // 1 minute
  });
};
