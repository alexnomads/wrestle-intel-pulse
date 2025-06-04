
import { supabase } from '@/integrations/supabase/client';

export interface WrestlenomicsResponse {
  success: boolean;
  message: string;
  count: number;
  data?: any[];
  error?: string;
}

export const scrapeWrestlenomicsData = async (dataType: 'tv-ratings' | 'ticket-sales' | 'elo-rankings'): Promise<WrestlenomicsResponse> => {
  try {
    console.log(`Calling Wrestlenomics scraper for: ${dataType}`);
    
    const { data, error } = await supabase.functions.invoke('scrape-wrestlenomics', {
      body: { dataType }
    });

    if (error) {
      console.error('Supabase function error:', error);
      throw new Error(error.message || 'Failed to call scraping function');
    }

    console.log(`Wrestlenomics scrape result:`, data);
    return data;
  } catch (error) {
    console.error(`Error scraping ${dataType}:`, error);
    return {
      success: false,
      message: `Failed to scrape ${dataType} data`,
      count: 0,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
};

export const scrapeAllWrestlenomicsData = async (): Promise<{
  tvRatings: WrestlenomicsResponse;
  ticketSales: WrestlenomicsResponse;
  eloRankings: WrestlenomicsResponse;
}> => {
  console.log('Starting comprehensive Wrestlenomics data scraping...');
  
  const [tvRatings, ticketSales, eloRankings] = await Promise.all([
    scrapeWrestlenomicsData('tv-ratings'),
    scrapeWrestlenomicsData('ticket-sales'),
    scrapeWrestlenomicsData('elo-rankings')
  ]);

  return {
    tvRatings,
    ticketSales,
    eloRankings
  };
};

// Fetch stored Wrestlenomics data from Supabase
export const getStoredTVRatings = async () => {
  const { data, error } = await supabase
    .from('tv_ratings')
    .select('*')
    .order('air_date', { ascending: false })
    .limit(50);

  if (error) {
    console.error('Error fetching TV ratings:', error);
    return [];
  }

  return data || [];
};

export const getStoredTicketSales = async () => {
  const { data, error } = await supabase
    .from('ticket_sales')
    .select('*')
    .order('event_date', { ascending: false })
    .limit(30);

  if (error) {
    console.error('Error fetching ticket sales:', error);
    return [];
  }

  return data || [];
};

export const getStoredELORankings = async () => {
  const { data, error } = await supabase
    .from('elo_rankings')
    .select('*')
    .order('ranking_position', { ascending: true })
    .limit(100);

  if (error) {
    console.error('Error fetching ELO rankings:', error);
    return [];
  }

  return data || [];
};
