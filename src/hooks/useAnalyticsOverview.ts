
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useRSSFeeds } from './useWrestlingData';
import { useRealTimeEvents } from './useRealTimeWrestlingData';

interface AnalyticsOverviewData {
  totalWrestlers: number;
  upcomingEvents: number;
  dailyMentions: number;
  sentimentScore: number;
}

const calculateSentimentScore = (newsItems: any[]): number => {
  if (!newsItems || newsItems.length === 0) return 75; // Default neutral-positive score
  
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
  if (!newsItems || newsItems.length === 0) {
    console.log('No news items available for mentions calculation');
    return 0;
  }
  
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  
  console.log('Total news items:', newsItems.length);
  console.log('Sample news item:', newsItems[0]);
  
  const todayMentions = newsItems.filter(item => {
    const publishedDate = new Date(item.published_at || item.pubDate || item.created_at);
    const isToday = publishedDate.toDateString() === today.toDateString();
    if (isToday) {
      console.log('Found today mention:', item.title);
    }
    return isToday;
  });
  
  console.log('Today mentions count:', todayMentions.length);
  
  // Count actual mentions in titles and content
  const totalMentions = newsItems.reduce((count, item) => {
    const content = `${item.title || ''} ${item.contentSnippet || item.content || ''}`.toLowerCase();
    
    // Count wrestling-related terms
    const wrestlingTerms = ['wrestler', 'wrestling', 'wwe', 'aew', 'champion', 'championship', 'match', 'event'];
    const mentionCount = wrestlingTerms.reduce((termCount, term) => {
      const matches = (content.match(new RegExp(term, 'g')) || []).length;
      return termCount + matches;
    }, 0);
    
    return count + Math.max(mentionCount, 1); // At least 1 mention per article
  }, 0);
  
  console.log('Total calculated mentions:', totalMentions);
  return totalMentions;
};

export const useAnalyticsOverview = (): { data: AnalyticsOverviewData | null; isLoading: boolean; error: any } => {
  const { data: newsItems = [], isLoading: newsLoading } = useRSSFeeds();
  const { data: events = [] } = useRealTimeEvents();
  
  return useQuery({
    queryKey: ['analytics-overview', newsItems.length, events.length],
    queryFn: async (): Promise<AnalyticsOverviewData> => {
      console.log('Calculating analytics overview...');
      
      // Get total wrestlers count
      const { data: wrestlersData, error: wrestlersError } = await supabase
        .from('wrestlers')
        .select('id', { count: 'exact' });

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
      const totalWrestlers = wrestlersData?.length || 0;
      const upcomingEvents = eventsData?.length || 0;
      const dailyMentions = calculateDailyMentions(newsItems);
      const sentimentScore = calculateSentimentScore(newsItems);

      console.log('Analytics calculated:', {
        totalWrestlers,
        upcomingEvents,
        dailyMentions,
        sentimentScore
      });

      return {
        totalWrestlers,
        upcomingEvents,
        dailyMentions,
        sentimentScore
      };
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 15 * 60 * 1000, // Refetch every 15 minutes
    enabled: !newsLoading && true,
  });
};
