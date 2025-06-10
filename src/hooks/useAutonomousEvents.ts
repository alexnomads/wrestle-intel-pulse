
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface WrestlingEvent {
  id: string;
  eventName: string;
  promotion: 'WWE' | 'AEW' | 'NXT' | 'TNA' | 'NJPW' | 'ROH';
  date: string;
  timeET: string;
  timePT: string;
  timeCET: string;
  venue: string;
  city: string;
  network: string;
  eventType: 'weekly' | 'ppv' | 'special';
  matchCard?: string[];
  lastUpdated: string;
}

const fetchAutonomousEvents = async (): Promise<WrestlingEvent[]> => {
  console.log('Fetching autonomous wrestling events...');
  
  try {
    const { data: dbEvents, error } = await supabase
      .from('autonomous_wrestling_events')
      .select('*')
      .order('date', { ascending: true });

    if (error) {
      console.error('Database error:', error);
      throw error;
    }

    if (dbEvents && dbEvents.length > 0) {
      console.log(`Found ${dbEvents.length} events in database`);
      
      // Convert and deduplicate events based on unique combination of date, promotion, and event_name
      const eventMap = new Map();
      
      dbEvents.forEach(event => {
        const uniqueKey = `${event.date}-${event.promotion}-${event.event_name}`;
        if (!eventMap.has(uniqueKey)) {
          eventMap.set(uniqueKey, {
            id: event.id,
            eventName: event.event_name,
            promotion: event.promotion as 'WWE' | 'AEW' | 'NXT' | 'TNA' | 'NJPW' | 'ROH',
            date: event.date,
            timeET: event.time_et,
            timePT: event.time_pt,
            timeCET: event.time_cet,
            venue: event.venue,
            city: event.city,
            network: event.network,
            eventType: event.event_type as 'weekly' | 'ppv' | 'special',
            matchCard: event.match_card || [],
            lastUpdated: event.last_updated
          });
        }
      });
      
      const deduplicatedEvents = Array.from(eventMap.values());
      console.log(`Deduplicated to ${deduplicatedEvents.length} unique events`);
      return deduplicatedEvents;
    }

    console.log('No events found in database, triggering initial scrape...');
    
    const { error: scrapeError } = await supabase.functions.invoke('autonomous-events-scraper', {
      body: { action: 'scrape_all' }
    });
    
    if (scrapeError) {
      console.error('Error triggering initial scrape:', scrapeError);
    }
    
    return [];
  } catch (error) {
    console.error('Error fetching events:', error);
    return [];
  }
};

const triggerEventsScraping = async () => {
  console.log('Triggering autonomous events scraping...');
  
  try {
    const { data, error } = await supabase.functions.invoke('autonomous-events-scraper', {
      body: { action: 'scrape_all' }
    });

    if (error) {
      console.error('Scraping function error:', error);
      throw error;
    }

    console.log('Scraping completed:', data);
    return data;
  } catch (error) {
    console.error('Error triggering scraping:', error);
    throw error;
  }
};

export const useAutonomousEvents = () => {
  return useQuery({
    queryKey: ['autonomous-wrestling-events'],
    queryFn: fetchAutonomousEvents,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 10 * 60 * 1000, // Refetch every 10 minutes
    retry: 3,
    retryDelay: 2000,
  });
};

export const useEventsScraping = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: triggerEventsScraping,
    onSuccess: () => {
      // Invalidate and refetch events after successful scraping
      queryClient.invalidateQueries({ queryKey: ['autonomous-wrestling-events'] });
    },
    onError: (error) => {
      console.error('Events scraping failed:', error);
    }
  });
};
