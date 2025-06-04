
import { supabase } from '@/integrations/supabase/client';

export interface SupabaseWrestler {
  id: string;
  name: string;
  real_name: string | null;
  status: string;
  brand: string | null;
  division: string | null;
  height: string | null;
  weight: string | null;
  hometown: string | null;
  debut_date: string | null;
  finisher: string | null;
  image_url: string | null;
  profile_url: string | null;
  is_champion: boolean;
  championship_title?: string | null;
  promotion_id: string;
  promotions: {
    name: string;
  } | null;
}

export interface SupabasePromotion {
  id: string;
  name: string;
  website_url: string | null;
  roster_url: string | null;
}

export interface SupabaseEvent {
  id: string;
  name: string;
  event_date: string | null;
  event_time: string | null;
  location: string | null;
  network: string | null;
  event_type: string | null;
  is_recurring: boolean;
  day_of_week: number | null;
  promotions: {
    name: string;
  } | null;
}

export const getAllSupabaseWrestlers = async (): Promise<SupabaseWrestler[]> => {
  const { data, error } = await supabase
    .from('wrestlers')
    .select(`
      *,
      promotions (name)
    `)
    .order('name');

  if (error) {
    console.error('Error fetching wrestlers:', error);
    return [];
  }

  return data || [];
};

export const getWrestlersByPromotion = async (promotionName: string): Promise<SupabaseWrestler[]> => {
  const { data, error } = await supabase
    .from('wrestlers')
    .select(`
      *,
      promotions (name)
    `)
    .eq('promotions.name', promotionName)
    .order('name');

  if (error) {
    console.error('Error fetching wrestlers by promotion:', error);
    return [];
  }

  return data || [];
};

export const searchSupabaseWrestlers = async (query: string): Promise<SupabaseWrestler[]> => {
  const { data, error } = await supabase
    .from('wrestlers')
    .select(`
      *,
      promotions (name)
    `)
    .or(`name.ilike.%${query}%, real_name.ilike.%${query}%, hometown.ilike.%${query}%`)
    .order('name');

  if (error) {
    console.error('Error searching wrestlers:', error);
    return [];
  }

  return data || [];
};

export const getChampions = async (): Promise<SupabaseWrestler[]> => {
  const { data, error } = await supabase
    .from('wrestlers')
    .select(`
      *,
      promotions (name)
    `)
    .eq('is_champion', true)
    .order('name');

  if (error) {
    console.error('Error fetching champions:', error);
    return [];
  }

  return data || [];
};

export const getActiveWrestlers = async (): Promise<SupabaseWrestler[]> => {
  const { data, error } = await supabase
    .from('wrestlers')
    .select(`
      *,
      promotions (name)
    `)
    .eq('status', 'Active')
    .order('name');

  if (error) {
    console.error('Error fetching active wrestlers:', error);
    return [];
  }

  return data || [];
};

export const getAllPromotions = async (): Promise<SupabasePromotion[]> => {
  const { data, error } = await supabase
    .from('promotions')
    .select('*')
    .order('name');

  if (error) {
    console.error('Error fetching promotions:', error);
    return [];
  }

  return data || [];
};

export const scrapeWrestlingData = async (promotion: string): Promise<{ success: boolean; message: string }> => {
  try {
    const { data, error } = await supabase.functions.invoke('scrape-wrestling-data', {
      body: { promotion }
    });

    if (error) {
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error calling scrape function:', error);
    return { success: false, message: `Failed to scrape ${promotion} data` };
  }
};

export const getUpcomingEvents = async (): Promise<SupabaseEvent[]> => {
  const today = new Date().toISOString().split('T')[0];
  
  const { data, error } = await supabase
    .from('wrestling_events')
    .select(`
      *,
      promotions (name)
    `)
    .gte('event_date', today)
    .order('event_date');

  if (error) {
    console.error('Error fetching upcoming events:', error);
    return [];
  }

  return data || [];
};
