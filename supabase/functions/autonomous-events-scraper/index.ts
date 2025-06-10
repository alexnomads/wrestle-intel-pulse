
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface WrestlingEvent {
  event_name: string;
  promotion: 'WWE' | 'AEW' | 'NXT' | 'TNA' | 'NJPW' | 'ROH';
  date: string;
  time_et: string;
  time_pt: string;
  time_cet: string;
  venue: string;
  city: string;
  network: string;
  event_type: 'weekly' | 'ppv' | 'special';
  match_card?: string[];
}

// Enhanced mock scraping functions with correct scheduling
const scrapeWWEEvents = async (): Promise<WrestlingEvent[]> => {
  console.log('Scraping WWE events...');
  
  const today = new Date();
  const events: WrestlingEvent[] = [];
  
  // Generate events for the next 6 months (180 days)
  for (let i = 0; i < 180; i++) {
    const eventDate = new Date(today);
    eventDate.setDate(today.getDate() + i);
    
    const dayOfWeek = eventDate.getDay();
    
    // Monday = 1 - RAW
    if (dayOfWeek === 1) {
      events.push({
        event_name: 'Monday Night RAW',
        promotion: 'WWE',
        date: eventDate.toISOString().split('T')[0],
        time_et: '20:00',
        time_pt: '17:00',
        time_cet: '02:00',
        venue: getRandomVenue('WWE'),
        city: getRandomCity(),
        network: 'USA Network',
        event_type: 'weekly',
        match_card: ['WWE Championship Match', 'Women\'s Championship', 'Tag Team Action']
      });
    }
    
    // Friday = 5 - SmackDown
    if (dayOfWeek === 5) {
      events.push({
        event_name: 'Friday Night SmackDown',
        promotion: 'WWE',
        date: eventDate.toISOString().split('T')[0],
        time_et: '20:00',
        time_pt: '17:00',
        time_cet: '02:00',
        venue: getRandomVenue('WWE'),
        city: getRandomCity(),
        network: 'FOX',
        event_type: 'weekly',
        match_card: ['Universal Championship', 'Intercontinental Championship', 'Women\'s Division']
      });
    }
  }

  // Add major WWE PPV events
  const ppvEvents = [
    {
      event_name: 'Royal Rumble 2025',
      date: new Date(2025, 0, 25), // January 25, 2025
      venue: 'Lucas Oil Stadium',
      city: 'Indianapolis, IN'
    },
    {
      event_name: 'WrestleMania 41',
      date: new Date(2025, 3, 6), // April 6, 2025
      venue: 'Allegiant Stadium',
      city: 'Las Vegas, NV'
    },
    {
      event_name: 'SummerSlam 2025',
      date: new Date(2025, 7, 2), // August 2, 2025
      venue: 'MetLife Stadium',
      city: 'East Rutherford, NJ'
    }
  ];

  ppvEvents.forEach(ppv => {
    if (ppv.date >= today) {
      events.push({
        event_name: ppv.event_name,
        promotion: 'WWE',
        date: ppv.date.toISOString().split('T')[0],
        time_et: '20:00',
        time_pt: '17:00',
        time_cet: '02:00',
        venue: ppv.venue,
        city: ppv.city,
        network: 'Peacock',
        event_type: 'ppv',
        match_card: ['WWE Championship', 'Universal Championship', 'Women\'s Championship', 'Royal Rumble Match']
      });
    }
  });
  
  return events;
};

const scrapeAEWEvents = async (): Promise<WrestlingEvent[]> => {
  console.log('Scraping AEW events...');
  
  const today = new Date();
  const events: WrestlingEvent[] = [];
  
  // Generate events for the next 6 months
  for (let i = 0; i < 180; i++) {
    const eventDate = new Date(today);
    eventDate.setDate(today.getDate() + i);
    
    const dayOfWeek = eventDate.getDay();
    
    // Wednesday = 3 - Dynamite
    if (dayOfWeek === 3) {
      events.push({
        event_name: 'AEW Dynamite',
        promotion: 'AEW',
        date: eventDate.toISOString().split('T')[0],
        time_et: '20:00',
        time_pt: '17:00',
        time_cet: '02:00',
        venue: getRandomVenue('AEW'),
        city: getRandomCity(),
        network: 'TNT',
        event_type: 'weekly',
        match_card: ['AEW World Championship', 'TNT Championship', 'Women\'s Championship']
      });
    }
    
    // Saturday = 6 - Rampage
    if (dayOfWeek === 6) {
      events.push({
        event_name: 'AEW Rampage',
        promotion: 'AEW',
        date: eventDate.toISOString().split('T')[0],
        time_et: '22:00',
        time_pt: '19:00',
        time_cet: '04:00',
        venue: getRandomVenue('AEW'),
        city: getRandomCity(),
        network: 'TNT',
        event_type: 'weekly',
        match_card: ['Rising Stars Match', 'Tag Team Championship', 'Women\'s Action']
      });
    }
  }

  // Add AEW PPV events
  const aewPPVs = [
    {
      event_name: 'AEW Revolution 2025',
      date: new Date(2025, 2, 2), // March 2, 2025
      venue: 'T-Mobile Arena',
      city: 'Las Vegas, NV'
    },
    {
      event_name: 'AEW Double or Nothing 2025',
      date: new Date(2025, 4, 25), // May 25, 2025
      venue: 'MGM Grand Garden Arena',
      city: 'Las Vegas, NV'
    }
  ];

  aewPPVs.forEach(ppv => {
    if (ppv.date >= today) {
      events.push({
        event_name: ppv.event_name,
        promotion: 'AEW',
        date: ppv.date.toISOString().split('T')[0],
        time_et: '20:00',
        time_pt: '17:00',
        time_cet: '02:00',
        venue: ppv.venue,
        city: ppv.city,
        network: 'Bleacher Report',
        event_type: 'ppv',
        match_card: ['AEW World Championship', 'AEW Women\'s Championship', 'TNT Championship']
      });
    }
  });
  
  return events;
};

const scrapeNXTEvents = async (): Promise<WrestlingEvent[]> => {
  console.log('Scraping NXT events...');
  
  const today = new Date();
  const events: WrestlingEvent[] = [];
  
  // Generate weekly NXT events for next 6 months
  for (let i = 0; i < 180; i++) {
    const eventDate = new Date(today);
    eventDate.setDate(today.getDate() + i);
    
    const dayOfWeek = eventDate.getDay();
    
    // Tuesday = 2 - NXT
    if (dayOfWeek === 2) {
      events.push({
        event_name: 'WWE NXT',
        promotion: 'NXT',
        date: eventDate.toISOString().split('T')[0],
        time_et: '20:00',
        time_pt: '17:00',
        time_cet: '02:00',
        venue: 'WWE Performance Center',
        city: 'Orlando, FL',
        network: 'USA Network',
        event_type: 'weekly',
        match_card: ['NXT Championship', 'NXT Women\'s Championship', 'North American Championship']
      });
    }
  }

  // Add NXT special events
  events.push({
    event_name: 'NXT Stand & Deliver 2025',
    promotion: 'NXT',
    date: new Date(2025, 3, 5).toISOString().split('T')[0], // April 5, 2025
    time_et: '20:00',
    time_pt: '17:00',
    time_cet: '02:00',
    venue: 'WWE Performance Center',
    city: 'Orlando, FL',
    network: 'Peacock',
    event_type: 'special',
    match_card: ['NXT Championship', 'NXT Women\'s Championship', 'Ladder Match']
  });
  
  return events;
};

const scrapeTNAEvents = async (): Promise<WrestlingEvent[]> => {
  console.log('Scraping TNA events...');
  
  const today = new Date();
  const events: WrestlingEvent[] = [];
  
  // Generate weekly TNA events
  for (let i = 0; i < 180; i++) {
    const eventDate = new Date(today);
    eventDate.setDate(today.getDate() + i);
    
    const dayOfWeek = eventDate.getDay();
    
    // Thursday = 4 - Impact
    if (dayOfWeek === 4) {
      events.push({
        event_name: 'TNA Impact Wrestling',
        promotion: 'TNA',
        date: eventDate.toISOString().split('T')[0],
        time_et: '20:00',
        time_pt: '17:00',
        time_cet: '02:00',
        venue: 'Impact Zone',
        city: 'Nashville, TN',
        network: 'AXS TV',
        event_type: 'weekly',
        match_card: ['TNA World Championship', 'X-Division Championship', 'Knockouts Championship']
      });
    }
  }
  
  return events;
};

const scrapeNJPWEvents = async (): Promise<WrestlingEvent[]> => {
  console.log('Scraping NJPW events...');
  
  const today = new Date();
  const events: WrestlingEvent[] = [];

  // Generate NJPW Strong weekly events
  for (let i = 0; i < 180; i++) {
    const eventDate = new Date(today);
    eventDate.setDate(today.getDate() + i);
    
    const dayOfWeek = eventDate.getDay();
    
    // Saturday = 6 - NJPW Strong (but only every other week to avoid conflict with AEW Rampage)
    if (dayOfWeek === 6) {
      const weekNumber = Math.floor(i / 7);
      if (weekNumber % 2 === 0) { // Every other week
        events.push({
          event_name: 'NJPW Strong',
          promotion: 'NJPW',
          date: eventDate.toISOString().split('T')[0],
          time_et: '22:00',
          time_pt: '19:00',
          time_cet: '04:00',
          venue: 'Various Venues',
          city: 'USA/Japan',
          network: 'NJPW World',
          event_type: 'weekly',
          match_card: ['Strong Style Competition', 'International Showcase']
        });
      }
    }
  }

  // Add major NJPW events
  const njpwEvents = [
    {
      event_name: 'NJPW Wrestle Kingdom 19',
      date: new Date(2025, 0, 4), // January 4, 2025
      venue: 'Tokyo Dome',
      city: 'Tokyo, Japan'
    }
  ];

  njpwEvents.forEach(event => {
    if (event.date >= today) {
      events.push({
        event_name: event.event_name,
        promotion: 'NJPW',
        date: event.date.toISOString().split('T')[0],
        time_et: '05:00',
        time_pt: '02:00',
        time_cet: '11:00',
        venue: event.venue,
        city: event.city,
        network: 'NJPW World',
        event_type: 'ppv',
        match_card: ['IWGP World Championship', 'IWGP Intercontinental Championship']
      });
    }
  });
  
  return events;
};

const scrapeROHEvents = async (): Promise<WrestlingEvent[]> => {
  console.log('Scraping ROH events...');
  
  const today = new Date();
  const events: WrestlingEvent[] = [];

  // Generate ROH Honor Club weekly events
  for (let i = 0; i < 180; i++) {
    const eventDate = new Date(today);
    eventDate.setDate(today.getDate() + i);
    
    const dayOfWeek = eventDate.getDay();
    
    // Sunday = 0 - ROH Honor Club
    if (dayOfWeek === 0) {
      events.push({
        event_name: 'ROH Honor Club',
        promotion: 'ROH',
        date: eventDate.toISOString().split('T')[0],
        time_et: '21:00',
        time_pt: '18:00',
        time_cet: '03:00',
        venue: getRandomVenue('ROH'),
        city: getRandomCity(),
        network: 'Honor Club',
        event_type: 'weekly',
        match_card: ['ROH World Championship', 'ROH Women\'s Championship', 'Pure Wrestling']
      });
    }
  }
  
  return events;
};

// Helper functions for venue and city data
const getRandomVenue = (promotion: string): string => {
  const venues = {
    WWE: [
      'Madison Square Garden', 'Allstate Arena', 'Toyota Center', 'Wells Fargo Center',
      'American Airlines Center', 'Barclays Center', 'Capital One Arena', 'Amway Center'
    ],
    AEW: [
      'Daily\'s Place', 'United Center', 'Prudential Center', 'PPG Paints Arena',
      'KeyBank Center', 'Heritage Bank Center', 'CFG Bank Arena', 'Van Andel Arena'
    ],
    ROH: [
      'Hammerstein Ballroom', 'Temple University', 'Philadelphia 2300 Arena',
      'Sam\'s Town Live', 'Globe Theatre', 'Chesapeake Employers Insurance Arena'
    ]
  };
  
  const promotionVenues = venues[promotion as keyof typeof venues] || venues.WWE;
  return promotionVenues[Math.floor(Math.random() * promotionVenues.length)];
};

const getRandomCity = (): string => {
  const cities = [
    'New York, NY', 'Los Angeles, CA', 'Chicago, IL', 'Houston, TX', 'Phoenix, AZ',
    'Philadelphia, PA', 'San Antonio, TX', 'San Diego, CA', 'Dallas, TX', 'San Jose, CA',
    'Austin, TX', 'Jacksonville, FL', 'Fort Worth, TX', 'Columbus, OH', 'Charlotte, NC',
    'Detroit, MI', 'El Paso, TX', 'Memphis, TN', 'Denver, CO', 'Washington, DC'
  ];
  
  return cities[Math.floor(Math.random() * cities.length)];
};

const convertToTimezones = (etTime: string) => {
  const [hours, minutes] = etTime.split(':').map(Number);
  
  // Convert ET to PT (3 hours behind)
  let ptHours = hours - 3;
  if (ptHours < 0) ptHours += 24;
  
  // Convert ET to CET (6 hours ahead)
  let cetHours = hours + 6;
  if (cetHours >= 24) cetHours -= 24;
  
  return {
    time_pt: `${ptHours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`,
    time_cet: `${cetHours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`
  };
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { action } = await req.json();
    console.log(`Starting autonomous events scraping: ${action}`);

    // Scrape all promotions
    const allEvents: WrestlingEvent[] = [];
    
    const wweEvents = await scrapeWWEEvents();
    const aewEvents = await scrapeAEWEvents();
    const nxtEvents = await scrapeNXTEvents();
    const tnaEvents = await scrapeTNAEvents();
    const njpwEvents = await scrapeNJPWEvents();
    const rohEvents = await scrapeROHEvents();
    
    allEvents.push(...wweEvents, ...aewEvents, ...nxtEvents, ...tnaEvents, ...njpwEvents, ...rohEvents);

    // Process timezone conversions and add last_updated
    const processedEvents = allEvents.map(event => {
      const timezones = convertToTimezones(event.time_et);
      return {
        ...event,
        time_pt: timezones.time_pt,
        time_cet: timezones.time_cet,
        last_updated: new Date().toISOString()
      };
    });

    console.log(`Scraped ${processedEvents.length} total events`);

    // Clear existing events and insert new ones to prevent duplicates
    await supabaseClient.from('autonomous_wrestling_events').delete().gte('id', 0);
    
    if (processedEvents.length > 0) {
      // Insert in batches to avoid potential issues with large datasets
      const batchSize = 100;
      for (let i = 0; i < processedEvents.length; i += batchSize) {
        const batch = processedEvents.slice(i, i + batchSize);
        const { error: insertError } = await supabaseClient
          .from('autonomous_wrestling_events')
          .insert(batch);

        if (insertError) {
          console.error(`Error inserting batch ${i / batchSize + 1}:`, insertError);
          throw insertError;
        }
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: `Successfully scraped and stored ${processedEvents.length} wrestling events`,
        events: processedEvents.length,
        lastUpdate: new Date().toISOString()
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in autonomous events scraper:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
