
import { supabase } from '@/integrations/supabase/client';

// Real-time wrestling events and news service
export const getAllRealTimeEvents = async () => {
  console.log('Fetching all real-time events...');
  
  const { data, error } = await supabase
    .from('wrestling_events')
    .select(`
      *,
      promotions (
        id,
        name,
        website_url
      )
    `)
    .order('event_date', { ascending: true });

  if (error) {
    console.error('Error fetching real-time events:', error);
    throw error;
  }

  console.log(`Fetched ${data?.length || 0} real-time events`);
  return data || [];
};

export const getUpcomingRealTimeEvents = async () => {
  console.log('Fetching upcoming real-time events...');
  
  const today = new Date().toISOString().split('T')[0];
  
  const { data, error } = await supabase
    .from('wrestling_events')
    .select(`
      *,
      promotions (
        id,
        name,
        website_url
      )
    `)
    .gte('event_date', today)
    .order('event_date', { ascending: true })
    .limit(20);

  if (error) {
    console.error('Error fetching upcoming events:', error);
    throw error;
  }

  console.log(`Fetched ${data?.length || 0} upcoming events`);
  return data || [];
};

export const getWeeklyShows = async () => {
  console.log('Fetching weekly shows...');
  
  const { data, error } = await supabase
    .from('wrestling_events')
    .select(`
      *,
      promotions (
        id,
        name,
        website_url
      )
    `)
    .eq('event_type', 'weekly')
    .order('day_of_week', { ascending: true });

  if (error) {
    console.error('Error fetching weekly shows:', error);
    throw error;
  }

  console.log(`Fetched ${data?.length || 0} weekly shows`);
  return data || [];
};

export const getLatestNews = async (limit: number = 20) => {
  console.log(`Fetching latest ${limit} news articles...`);
  
  const { data, error } = await supabase
    .from('news_articles')
    .select('*')
    .order('published_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching news:', error);
    throw error;
  }

  console.log(`Fetched ${data?.length || 0} news articles`);
  return data || [];
};

export const getNewsByWrestler = async (wrestlerName: string) => {
  console.log(`Fetching news for wrestler: ${wrestlerName}`);
  
  const { data, error } = await supabase
    .from('news_articles')
    .select('*')
    .contains('wrestler_mentions', [wrestlerName.toLowerCase()])
    .order('published_at', { ascending: false })
    .limit(10);

  if (error) {
    console.error('Error fetching wrestler news:', error);
    throw error;
  }

  return data || [];
};

export const getNewsByPromotion = async (promotionName: string) => {
  console.log(`Fetching news for promotion: ${promotionName}`);
  
  const { data, error } = await supabase
    .from('news_articles')
    .select('*')
    .contains('promotion_mentions', [promotionName.toLowerCase()])
    .order('published_at', { ascending: false })
    .limit(10);

  if (error) {
    console.error('Error fetching promotion news:', error);
    throw error;
  }

  return data || [];
};

export const getActiveStorylines = async () => {
  console.log('Fetching active storylines...');
  
  const { data, error } = await supabase
    .from('storylines')
    .select(`
      *,
      promotions (
        id,
        name
      )
    `)
    .eq('status', 'active')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching storylines:', error);
    throw error;
  }

  return data || [];
};

export const getStorylinesByPromotion = async (promotionName: string) => {
  console.log(`Fetching storylines for promotion: ${promotionName}`);
  
  const { data: promotion } = await supabase
    .from('promotions')
    .select('id')
    .eq('name', promotionName)
    .single();

  if (!promotion) {
    return [];
  }

  const { data, error } = await supabase
    .from('storylines')
    .select(`
      *,
      promotions (
        id,
        name
      )
    `)
    .eq('promotion_id', promotion.id)
    .eq('status', 'active')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching promotion storylines:', error);
    throw error;
  }

  return data || [];
};

export const getActiveContracts = async () => {
  console.log('Fetching active contracts...');
  
  const { data, error } = await supabase
    .from('contract_status')
    .select(`
      *,
      wrestlers (
        id,
        name,
        promotions (
          name
        )
      )
    `)
    .eq('status', 'active')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching contracts:', error);
    throw error;
  }

  return data || [];
};

export const getExpiringContracts = async () => {
  console.log('Fetching expiring contracts...');
  
  const sixMonthsFromNow = new Date();
  sixMonthsFromNow.setMonth(sixMonthsFromNow.getMonth() + 6);
  
  const { data, error } = await supabase
    .from('contract_status')
    .select(`
      *,
      wrestlers (
        id,
        name,
        promotions (
          name
        )
      )
    `)
    .eq('status', 'active')
    .lte('contract_end', sixMonthsFromNow.toISOString().split('T')[0])
    .order('contract_end', { ascending: true });

  if (error) {
    console.error('Error fetching expiring contracts:', error);
    throw error;
  }

  return data || [];
};

export const getWrestlerSentimentAnalysis = async (wrestlerName: string) => {
  console.log(`Fetching sentiment analysis for: ${wrestlerName}`);
  
  const { data, error } = await supabase
    .from('news_articles')
    .select('sentiment_score, published_at')
    .contains('wrestler_mentions', [wrestlerName.toLowerCase()])
    .not('sentiment_score', 'is', null)
    .order('published_at', { ascending: false })
    .limit(50);

  if (error) {
    console.error('Error fetching sentiment data:', error);
    throw error;
  }

  return data || [];
};

// Scraping functions that call edge functions
export const scrapeEventsData = async () => {
  console.log('Calling scrape-events-data edge function...');
  
  const { data, error } = await supabase.functions.invoke('scrape-events-data', {
    body: { action: 'scrape-events' }
  });

  if (error) {
    console.error('Error calling scrape-events-data function:', error);
    throw error;
  }

  console.log('Scrape events result:', data);
  return data;
};

export const scrapeNewsData = async () => {
  console.log('Calling scrape-events-data edge function for news...');
  
  const { data, error } = await supabase.functions.invoke('scrape-events-data', {
    body: { action: 'scrape-news' }
  });

  if (error) {
    console.error('Error calling scrape-news function:', error);
    throw error;
  }

  console.log('Scrape news result:', data);
  return data;
};
