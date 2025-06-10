
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
    // Try to get events from the database first
    const { data: dbEvents, error } = await supabase
      .from('autonomous_wrestling_events')
      .select('*')
      .order('date', { ascending: true });

    if (error) {
      console.error('Database error:', error);
    }

    if (dbEvents && dbEvents.length > 0) {
      console.log(`Found ${dbEvents.length} events in database`);
      return dbEvents.map(event => ({
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
      }));
    }

    // Fallback to mock data if no database events
    console.log('No database events found, using mock data');
    return getMockEvents();
  } catch (error) {
    console.error('Error fetching events:', error);
    return getMockEvents();
  }
};

const getMockEvents = (): WrestlingEvent[] => {
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  return [
    {
      id: '1',
      eventName: 'Monday Night RAW',
      promotion: 'WWE',
      date: today.toISOString().split('T')[0],
      timeET: '20:00',
      timePT: '17:00',
      timeCET: '02:00',
      venue: 'Madison Square Garden',
      city: 'New York, NY',
      network: 'USA Network',
      eventType: 'weekly',
      matchCard: ['CM Punk vs Drew McIntyre', 'Rhea Ripley vs Liv Morgan'],
      lastUpdated: new Date().toISOString()
    },
    {
      id: '2',
      eventName: 'AEW Dynamite',
      promotion: 'AEW',
      date: tomorrow.toISOString().split('T')[0],
      timeET: '20:00',
      timePT: '17:00',
      timeCET: '02:00',
      venue: 'Daily\'s Place',
      city: 'Jacksonville, FL',
      network: 'TNT',
      eventType: 'weekly',
      matchCard: ['Jon Moxley vs Orange Cassidy', 'Mercedes Mone vs Toni Storm'],
      lastUpdated: new Date().toISOString()
    },
    {
      id: '3',
      eventName: 'WWE Saturday Night\'s Main Event',
      promotion: 'WWE',
      date: new Date(today.getTime() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      timeET: '20:00',
      timePT: '17:00',
      timeCET: '02:00',
      venue: 'Frost Bank Center',
      city: 'San Antonio, TX',
      network: 'NBC',
      eventType: 'special',
      matchCard: ['Cody Rhodes vs Kevin Owens', 'Gunther vs Finn Balor'],
      lastUpdated: new Date().toISOString()
    }
  ];
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
    staleTime: 15 * 60 * 1000, // 15 minutes
    refetchInterval: 30 * 60 * 1000, // Refetch every 30 minutes
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
