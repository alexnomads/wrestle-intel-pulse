
import { supabase } from '@/integrations/supabase/client';

// Real-time wrestling events service - completely rewritten
export const getAllRealTimeEvents = async () => {
  console.log('Fetching all wrestling events...');
  
  try {
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
      console.error('Error fetching events:', error);
      throw error;
    }

    console.log(`Successfully fetched ${data?.length || 0} events`);
    return data || [];
  } catch (error) {
    console.error('Service error fetching events:', error);
    throw error;
  }
};

export const getUpcomingRealTimeEvents = async () => {
  console.log('Fetching upcoming wrestling events...');
  
  try {
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

    console.log(`Successfully fetched ${data?.length || 0} upcoming events`);
    return data || [];
  } catch (error) {
    console.error('Service error fetching upcoming events:', error);
    throw error;
  }
};

export const getWeeklyShows = async () => {
  console.log('Fetching weekly wrestling shows...');
  
  try {
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
      .eq('is_recurring', true)
      .order('day_of_week', { ascending: true });

    if (error) {
      console.error('Error fetching weekly shows:', error);
      throw error;
    }

    console.log(`Successfully fetched ${data?.length || 0} weekly shows`);
    return data || [];
  } catch (error) {
    console.error('Service error fetching weekly shows:', error);
    throw error;
  }
};

// Scraping function
export const scrapeEventsData = async () => {
  console.log('Calling scrape-events-data edge function...');
  
  try {
    const { data, error } = await supabase.functions.invoke('scrape-events-data', {
      body: { action: 'scrape-events' }
    });

    if (error) {
      console.error('Error calling scrape-events-data function:', error);
      throw error;
    }

    console.log('Scrape events result:', data);
    return data;
  } catch (error) {
    console.error('Service error calling scrape function:', error);
    throw error;
  }
};

// Placeholder functions for news (not implemented yet)
export const getLatestNews = async (limit: number = 20) => {
  console.log(`News feature not implemented yet`);
  return [];
};

export const getNewsByWrestler = async (wrestlerName: string) => {
  console.log(`News by wrestler feature not implemented yet`);
  return [];
};

export const getNewsByPromotion = async (promotionName: string) => {
  console.log(`News by promotion feature not implemented yet`);
  return [];
};

export const getActiveStorylines = async () => {
  console.log(`Storylines feature not implemented yet`);
  return [];
};

export const getStorylinesByPromotion = async (promotionName: string) => {
  console.log(`Storylines by promotion feature not implemented yet`);
  return [];
};

export const getActiveContracts = async () => {
  console.log(`Contracts feature not implemented yet`);
  return [];
};

export const getExpiringContracts = async () => {
  console.log(`Expiring contracts feature not implemented yet`);
  return [];
};

export const getWrestlerSentimentAnalysis = async (wrestlerName: string) => {
  console.log(`Sentiment analysis feature not implemented yet`);
  return [];
};

export const scrapeNewsData = async () => {
  console.log('News scraping not implemented yet');
  return { success: true, message: 'News scraping feature coming soon' };
};
