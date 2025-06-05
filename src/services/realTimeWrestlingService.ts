
import { supabase } from '@/integrations/supabase/client';

export interface RealTimeEvent {
  id: string;
  name: string;
  event_date: string | null;
  event_time: string | null;
  location: string | null;
  network: string | null;
  event_type: string | null;
  main_event: string | null;
  ticket_url: string | null;
  poster_image_url: string | null;
  is_recurring: boolean | null;
  day_of_week: number | null;
  card_announced: boolean | null;
  sold_out: boolean | null;
  venue_capacity: number | null;
  promotions: {
    name: string;
  } | null;
}

export interface NewsArticle {
  id: string;
  title: string;
  content: string | null;
  url: string;
  source: string;
  author: string | null;
  published_at: string | null;
  sentiment_score: number | null;
  keywords: string[] | null;
  wrestler_mentions: string[] | null;
  promotion_mentions: string[] | null;
  created_at: string;
}

export interface Storyline {
  id: string;
  title: string;
  participants: string[];
  description: string | null;
  status: string;
  intensity_score: number | null;
  fan_reception_score: number | null;
  start_date: string | null;
  end_date: string | null;
  promotions: {
    name: string;
  } | null;
}

export interface ContractStatus {
  id: string;
  contract_start: string | null;
  contract_end: string | null;
  contract_type: string | null;
  salary_tier: string | null;
  status: string;
  notes: string | null;
  wrestlers: {
    name: string;
    real_name: string | null;
  } | null;
}

// Event functions
export const getAllRealTimeEvents = async (): Promise<RealTimeEvent[]> => {
  const { data, error } = await supabase
    .from('wrestling_events')
    .select(`
      *,
      promotions (name)
    `)
    .order('event_date', { ascending: true });

  if (error) {
    console.error('Error fetching real-time events:', error);
    return [];
  }

  return data || [];
};

export const getUpcomingRealTimeEvents = async (): Promise<RealTimeEvent[]> => {
  const today = new Date().toISOString().split('T')[0];
  
  const { data, error } = await supabase
    .from('wrestling_events')
    .select(`
      *,
      promotions (name)
    `)
    .gte('event_date', today)
    .order('event_date', { ascending: true })
    .limit(10);

  if (error) {
    console.error('Error fetching upcoming events:', error);
    return [];
  }

  return data || [];
};

export const getWeeklyShows = async (): Promise<RealTimeEvent[]> => {
  const { data, error } = await supabase
    .from('wrestling_events')
    .select(`
      *,
      promotions (name)
    `)
    .eq('is_recurring', true)
    .order('day_of_week');

  if (error) {
    console.error('Error fetching weekly shows:', error);
    return [];
  }

  return data || [];
};

// News functions
export const getLatestNews = async (limit: number = 20): Promise<NewsArticle[]> => {
  const { data, error } = await supabase
    .from('news_articles')
    .select('*')
    .order('published_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching latest news:', error);
    return [];
  }

  return data || [];
};

export const getNewsByWrestler = async (wrestlerName: string): Promise<NewsArticle[]> => {
  const { data, error } = await supabase
    .from('news_articles')
    .select('*')
    .contains('wrestler_mentions', [wrestlerName.toLowerCase()])
    .order('published_at', { ascending: false })
    .limit(10);

  if (error) {
    console.error('Error fetching news by wrestler:', error);
    return [];
  }

  return data || [];
};

export const getNewsByPromotion = async (promotionName: string): Promise<NewsArticle[]> => {
  const { data, error } = await supabase
    .from('news_articles')
    .select('*')
    .contains('promotion_mentions', [promotionName.toLowerCase()])
    .order('published_at', { ascending: false })
    .limit(15);

  if (error) {
    console.error('Error fetching news by promotion:', error);
    return [];
  }

  return data || [];
};

// Storyline functions
export const getActiveStorylines = async (): Promise<Storyline[]> => {
  const { data, error } = await supabase
    .from('storylines')
    .select(`
      *,
      promotions (name)
    `)
    .in('status', ['building', 'climax'])
    .order('intensity_score', { ascending: false });

  if (error) {
    console.error('Error fetching active storylines:', error);
    return [];
  }

  return data || [];
};

export const getStorylinesByPromotion = async (promotionName: string): Promise<Storyline[]> => {
  const { data, error } = await supabase
    .from('storylines')
    .select(`
      *,
      promotions (name)
    `)
    .eq('promotions.name', promotionName)
    .order('intensity_score', { ascending: false });

  if (error) {
    console.error('Error fetching storylines by promotion:', error);
    return [];
  }

  return data || [];
};

// Contract status functions
export const getActiveContracts = async (): Promise<ContractStatus[]> => {
  const { data, error } = await supabase
    .from('contract_status')
    .select(`
      *,
      wrestlers (name, real_name)
    `)
    .eq('status', 'active')
    .order('salary_tier');

  if (error) {
    console.error('Error fetching active contracts:', error);
    return [];
  }

  return data || [];
};

export const getExpiringContracts = async (): Promise<ContractStatus[]> => {
  const sixMonthsFromNow = new Date();
  sixMonthsFromNow.setMonth(sixMonthsFromNow.getMonth() + 6);
  
  const { data, error } = await supabase
    .from('contract_status')
    .select(`
      *,
      wrestlers (name, real_name)
    `)
    .eq('status', 'active')
    .lte('contract_end', sixMonthsFromNow.toISOString().split('T')[0])
    .order('contract_end');

  if (error) {
    console.error('Error fetching expiring contracts:', error);
    return [];
  }

  return data || [];
};

// Scraping functions
export const scrapeEventsData = async (): Promise<{ success: boolean; message: string }> => {
  try {
    const { data, error } = await supabase.functions.invoke('scrape-events-data', {
      body: { action: 'scrape-events' }
    });

    if (error) {
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error calling scrape events function:', error);
    return { success: false, message: 'Failed to scrape events data' };
  }
};

export const scrapeNewsData = async (): Promise<{ success: boolean; message: string }> => {
  try {
    const { data, error } = await supabase.functions.invoke('scrape-events-data', {
      body: { action: 'scrape-news' }
    });

    if (error) {
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error calling scrape news function:', error);
    return { success: false, message: 'Failed to scrape news data' };
  }
};

// Analytics functions
export const getWrestlerSentimentAnalysis = async (wrestlerName: string) => {
  const { data, error } = await supabase
    .from('news_articles')
    .select('sentiment_score, published_at')
    .contains('wrestler_mentions', [wrestlerName.toLowerCase()])
    .not('sentiment_score', 'is', null)
    .order('published_at', { ascending: false })
    .limit(30);

  if (error) {
    console.error('Error fetching sentiment analysis:', error);
    return { averageSentiment: 0, recentTrend: 'neutral', totalMentions: 0 };
  }

  if (!data || data.length === 0) {
    return { averageSentiment: 0, recentTrend: 'neutral', totalMentions: 0 };
  }

  const sentiments = data.map(article => article.sentiment_score).filter(Boolean);
  const averageSentiment = sentiments.reduce((sum, score) => sum + score, 0) / sentiments.length;
  
  // Calculate recent trend (last 7 days vs previous 7 days)
  const now = new Date();
  const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
  
  const recentSentiments = data.filter(article => 
    new Date(article.published_at!) > lastWeek
  ).map(article => article.sentiment_score).filter(Boolean);
  
  const previousSentiments = data.filter(article => {
    const pubDate = new Date(article.published_at!);
    return pubDate > twoWeeksAgo && pubDate <= lastWeek;
  }).map(article => article.sentiment_score).filter(Boolean);
  
  const recentAvg = recentSentiments.length > 0 
    ? recentSentiments.reduce((sum, score) => sum + score, 0) / recentSentiments.length 
    : 0;
  const previousAvg = previousSentiments.length > 0 
    ? previousSentiments.reduce((sum, score) => sum + score, 0) / previousSentiments.length 
    : 0;
  
  let recentTrend = 'neutral';
  if (recentAvg > previousAvg + 0.1) recentTrend = 'positive';
  else if (recentAvg < previousAvg - 0.1) recentTrend = 'negative';
  
  return {
    averageSentiment: Math.round(averageSentiment * 100) / 100,
    recentTrend,
    totalMentions: data.length
  };
};
