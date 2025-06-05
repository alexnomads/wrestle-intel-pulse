
import { supabase } from '@/integrations/supabase/client';
import { SupabaseWrestler, SupabaseEvent } from '@/services/supabaseWrestlerService';

export interface RealWrestler {
  id: string;
  name: string;
  realName: string | null;
  status: 'Active' | 'Injured' | 'Suspended' | 'Released';
  championships: string[];
  brand?: string | null;
  debut: string | null;
  height: string | null;
  weight: string | null;
  hometown: string | null;
  finisher: string | null;
  image: string | null;
  promotionName: string;
}

export interface RealEvent {
  id: string;
  name: string;
  promotion: string;
  date?: string | null;
  day?: string | null;
  time?: string | null;
  network: string | null;
  nextDate?: string;
  location?: string | null;
  type: 'weekly' | 'ple' | 'ppv';
}

export type Promotion = 'WWE' | 'AEW' | 'NXT' | 'TNA';

const mapSupabaseWrestlerToReal = (wrestler: SupabaseWrestler): RealWrestler => {
  return {
    id: wrestler.id,
    name: wrestler.name,
    realName: wrestler.real_name,
    status: wrestler.status as 'Active' | 'Injured' | 'Suspended' | 'Released',
    championships: wrestler.is_champion && wrestler.championship_title 
      ? [wrestler.championship_title] 
      : [],
    brand: wrestler.brand,
    debut: wrestler.debut_date,
    height: wrestler.height,
    weight: wrestler.weight,
    hometown: wrestler.hometown,
    finisher: wrestler.finisher,
    image: wrestler.image_url || '/placeholder.svg',
    promotionName: wrestler.promotions?.name || 'Unknown'
  };
};

const mapSupabaseEventToReal = (event: SupabaseEvent): RealEvent => {
  const eventType = event.event_type?.toLowerCase() === 'weekly' ? 'weekly' : 
                   event.event_type?.toLowerCase() === 'ple' ? 'ple' : 'ppv';
  
  return {
    id: event.id,
    name: event.name,
    promotion: event.promotions?.name || 'Unknown',
    date: event.event_date,
    time: event.event_time,
    network: event.network,
    location: event.location,
    type: eventType
  };
};

export const getAllRealWrestlers = async (): Promise<{ promotion: Promotion; wrestler: RealWrestler }[]> => {
  try {
    const { data: wrestlers, error } = await supabase
      .from('wrestlers')
      .select(`
        *,
        promotions (name)
      `)
      .order('name');

    if (error) {
      console.error('Error fetching all wrestlers:', error);
      return [];
    }

    return wrestlers.map(wrestler => ({
      promotion: wrestler.promotions?.name as Promotion || 'WWE',
      wrestler: mapSupabaseWrestlerToReal(wrestler)
    }));
  } catch (error) {
    console.error('Error in getAllRealWrestlers:', error);
    return [];
  }
};

export const getRealWrestlersByPromotion = async (promotion: Promotion): Promise<RealWrestler[]> => {
  try {
    const { data: wrestlers, error } = await supabase
      .from('wrestlers')
      .select(`
        *,
        promotions (name)
      `)
      .eq('promotions.name', promotion)
      .order('name');

    if (error) {
      console.error('Error fetching wrestlers by promotion:', error);
      return [];
    }

    return wrestlers.map(mapSupabaseWrestlerToReal);
  } catch (error) {
    console.error('Error in getRealWrestlersByPromotion:', error);
    return [];
  }
};

export const searchRealWrestlers = async (query: string): Promise<{ promotion: Promotion; wrestler: RealWrestler }[]> => {
  try {
    const { data: wrestlers, error } = await supabase
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

    return wrestlers.map(wrestler => ({
      promotion: wrestler.promotions?.name as Promotion || 'WWE',
      wrestler: mapSupabaseWrestlerToReal(wrestler)
    }));
  } catch (error) {
    console.error('Error in searchRealWrestlers:', error);
    return [];
  }
};

export const getRealChampions = async (): Promise<{ promotion: Promotion; wrestler: RealWrestler }[]> => {
  try {
    const { data: wrestlers, error } = await supabase
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

    return wrestlers.map(wrestler => ({
      promotion: wrestler.promotions?.name as Promotion || 'WWE',
      wrestler: mapSupabaseWrestlerToReal(wrestler)
    }));
  } catch (error) {
    console.error('Error in getRealChampions:', error);
    return [];
  }
};

export const getRealActiveWrestlers = async (): Promise<{ promotion: Promotion; wrestler: RealWrestler }[]> => {
  try {
    const { data: wrestlers, error } = await supabase
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

    return wrestlers.map(wrestler => ({
      promotion: wrestler.promotions?.name as Promotion || 'WWE',
      wrestler: mapSupabaseWrestlerToReal(wrestler)
    }));
  } catch (error) {
    console.error('Error in getRealActiveWrestlers:', error);
    return [];
  }
};

export const getRealWeeklyShows = async (): Promise<RealEvent[]> => {
  try {
    const { data: events, error } = await supabase
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

    return events.map(mapSupabaseEventToReal);
  } catch (error) {
    console.error('Error in getRealWeeklyShows:', error);
    return [];
  }
};

export const getRealSpecialEvents = async (): Promise<RealEvent[]> => {
  try {
    const { data: events, error } = await supabase
      .from('wrestling_events')
      .select(`
        *,
        promotions (name)
      `)
      .eq('is_recurring', false)
      .not('event_date', 'is', null)
      .order('event_date');

    if (error) {
      console.error('Error fetching special events:', error);
      return [];
    }

    return events.map(mapSupabaseEventToReal);
  } catch (error) {
    console.error('Error in getRealSpecialEvents:', error);
    return [];
  }
};

export const getRealUpcomingEvents = async (): Promise<RealEvent[]> => {
  try {
    const today = new Date().toISOString().split('T')[0];
    
    const { data: events, error } = await supabase
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

    return events.map(mapSupabaseEventToReal);
  } catch (error) {
    console.error('Error in getRealUpcomingEvents:', error);
    return [];
  }
};
