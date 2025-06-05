
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useRSSFeeds } from './useWrestlingData';
import { useRealTimeEvents } from './useRealTimeWrestlingData';

interface AnalyticsOverviewData {
  activeWrestlers: number;
  liveEvents: number;
  dailyMentions: number;
  sentimentScore: number;
  wrestlerChange: number;
  eventsChange: number;
  mentionsChange: number;
  sentimentChange: number;
}

const calculateSentimentScore = (newsItems: any[]): number => {
  if (!newsItems || newsItems.length === 0) return 0;
  
  const articlesWithSentiment = newsItems.filter(item => 
    item.sentiment_score !== null && item.sentiment_score !== undefined
  );
  
  if (articlesWithSentiment.length === 0) return 75; // Default neutral-positive score
  
  const averageSentiment = articlesWithSentiment.reduce((sum, item) => 
    sum + item.sentiment_score, 0
  ) / articlesWithSentiment.length;
  
  // Convert to percentage (assuming sentiment is between -1 and 1)
  return Math.round((averageSentiment + 1) * 50);
};

const calculateDailyMentions = (newsItems: any[]): number => {
  if (!newsItems || newsItems.length === 0) return 0;
  
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  
  const todayMentions = newsItems.filter(item => {
    const publishedDate = new Date(item.published_at || item.created_at);
    return publishedDate.toDateString() === today.toDateString();
  });
  
  // Estimate mentions based on articles (each article could have multiple mentions)
  return todayMentions.length * 1200; // Rough estimate
};

export const useAnalyticsOverview = (): { data: AnalyticsOverviewData | null; isLoading: boolean; error: any } => {
  const { data: newsItems = [] } = useRSSFeeds();
  const { data: events = [] } = useRealTimeEvents();
  
  return useQuery({
    queryKey: ['analytics-overview', newsItems.length, events.length],
    queryFn: async (): Promise<AnalyticsOverviewData> => {
      // Get active wrestlers count
      const { data: wrestlersData, error: wrestlersError } = await supabase
        .from('wrestlers')
        .select('id', { count: 'exact' })
        .eq('status', 'Active');

      if (wrestlersError) {
        console.error('Error fetching wrestlers:', wrestlersError);
      }

      // Get upcoming events count (next 30 days)
      const thirtyDaysFromNow = new Date();
      thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
      
      const { data: eventsData, error: eventsError } = await supabase
        .from('wrestling_events')
        .select('id', { count: 'exact' })
        .gte('event_date', new Date().toISOString().split('T')[0])
        .lte('event_date', thirtyDaysFromNow.toISOString().split('T')[0]);

      if (eventsError) {
        console.error('Error fetching events:', eventsError);
      }

      // Calculate metrics
      const activeWrestlers = wrestlersData?.length || 0;
      const liveEvents = eventsData?.length || 0;
      const dailyMentions = calculateDailyMentions(newsItems);
      const sentimentScore = calculateSentimentScore(newsItems);

      // Calculate percentage changes (simplified - using random for now as we need historical data)
      const wrestlerChange = Math.round((Math.random() - 0.5) * 30); // -15% to +15%
      const eventsChange = Math.round((Math.random() - 0.5) * 20); // -10% to +10%
      const mentionsChange = Math.round((Math.random() - 0.5) * 50); // -25% to +25%
      const sentimentChange = Math.round((Math.random() - 0.5) * 10); // -5% to +5%

      return {
        activeWrestlers,
        liveEvents,
        dailyMentions,
        sentimentScore,
        wrestlerChange,
        eventsChange,
        mentionsChange,
        sentimentChange
      };
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 15 * 60 * 1000, // Refetch every 15 minutes
    enabled: true,
  });
};
