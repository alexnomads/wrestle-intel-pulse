
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'
import { DOMParser } from 'https://esm.sh/linkedom@0.14.12'

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

// Mock scraping functions - in production these would scrape real websites
const scrapeWWEEvents = async (): Promise<WrestlingEvent[]> => {
  console.log('Scraping WWE events...');
  
  // Mock WWE events - replace with actual scraping logic
  const today = new Date();
  const events: WrestlingEvent[] = [];
  
  // Generate weekly RAW and SmackDown events
  for (let i = 0; i < 8; i++) {
    const eventDate = new Date(today);
    eventDate.setDate(today.getDate() + i);
    
    const dayOfWeek = eventDate.getDay();
    
    if (dayOfWeek === 1) { // Monday - RAW
      events.push({
        event_name: 'Monday Night RAW',
        promotion: 'WWE',
        date: eventDate.toISOString().split('T')[0],
        time_et: '20:00',
        time_pt: '17:00',
        time_cet: '02:00',
        venue: 'Various Venues',
        city: 'USA',
        network: 'USA Network',
        event_type: 'weekly',
        match_card: ['Main Event TBD', 'Championship Match TBD']
      });
    } else if (dayOfWeek === 5) { // Friday - SmackDown
      events.push({
        event_name: 'Friday Night SmackDown',
        promotion: 'WWE',
        date: eventDate.toISOString().split('T')[0],
        time_et: '20:00',
        time_pt: '17:00',
        time_cet: '02:00',
        venue: 'Various Venues',
        city: 'USA',
        network: 'FOX',
        event_type: 'weekly',
        match_card: ['Main Event TBD', 'Tag Team Match TBD']
      });
    }
  }
  
  return events;
};

const scrapeAEWEvents = async (): Promise<WrestlingEvent[]> => {
  console.log('Scraping AEW events...');
  
  const today = new Date();
  const events: WrestlingEvent[] = [];
  
  // Generate weekly Dynamite and Rampage events
  for (let i = 0; i < 8; i++) {
    const eventDate = new Date(today);
    eventDate.setDate(today.getDate() + i);
    
    const dayOfWeek = eventDate.getDay();
    
    if (dayOfWeek === 3) { // Wednesday - Dynamite
      events.push({
        event_name: 'AEW Dynamite',
        promotion: 'AEW',
        date: eventDate.toISOString().split('T')[0],
        time_et: '20:00',
        time_pt: '17:00',
        time_cet: '02:00',
        venue: 'Various Venues',
        city: 'USA',
        network: 'TNT',
        event_type: 'weekly',
        match_card: ['Elite vs BCC', 'Women\'s Championship Match']
      });
    } else if (dayOfWeek === 6) { // Saturday - Rampage
      events.push({
        event_name: 'AEW Rampage',
        promotion: 'AEW',
        date: eventDate.toISOString().split('T')[0],
        time_et: '22:00',
        time_pt: '19:00',
        time_cet: '04:00',
        venue: 'Various Venues',
        city: 'USA',
        network: 'TNT',
        event_type: 'weekly',
        match_card: ['High-flying action', 'Rising stars showcase']
      });
    }
  }
  
  return events;
};

const scrapeNXTEvents = async (): Promise<WrestlingEvent[]> => {
  console.log('Scraping NXT events...');
  
  const today = new Date();
  const events: WrestlingEvent[] = [];
  
  // Generate weekly NXT events
  for (let i = 0; i < 8; i++) {
    const eventDate = new Date(today);
    eventDate.setDate(today.getDate() + i);
    
    const dayOfWeek = eventDate.getDay();
    
    if (dayOfWeek === 2) { // Tuesday - NXT
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
        match_card: ['NXT Championship Match', 'Future stars in action']
      });
    }
  }
  
  return events;
};

const scrapeTNAEvents = async (): Promise<WrestlingEvent[]> => {
  console.log('Scraping TNA events...');
  
  const today = new Date();
  const events: WrestlingEvent[] = [];
  
  // Generate weekly TNA events
  for (let i = 0; i < 8; i++) {
    const eventDate = new Date(today);
    eventDate.setDate(today.getDate() + i);
    
    const dayOfWeek = eventDate.getDay();
    
    if (dayOfWeek === 4) { // Thursday - Impact
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
        match_card: ['TNA Championship Action', 'X-Division showcase']
      });
    }
  }
  
  return events;
};

const scrapeNJPWEvents = async (): Promise<WrestlingEvent[]> => {
  console.log('Scraping NJPW events...');
  
  return [
    {
      event_name: 'NJPW Strong',
      promotion: 'NJPW',
      date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      time_et: '22:00',
      time_pt: '19:00',
      time_cet: '04:00',
      venue: 'Various Venues',
      city: 'Japan/USA',
      network: 'NJPW World',
      event_type: 'weekly',
      match_card: ['Strong Style action', 'International talent']
    }
  ];
};

const scrapeROHEvents = async (): Promise<WrestlingEvent[]> => {
  console.log('Scraping ROH events...');
  
  return [
    {
      event_name: 'ROH Honor Club',
      promotion: 'ROH',
      date: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      time_et: '21:00',
      time_pt: '18:00',
      time_cet: '03:00',
      venue: 'Various Venues',
      city: 'USA',
      network: 'Honor Club',
      event_type: 'weekly',
      match_card: ['Ring of Honor Championship', 'Pure wrestling']
    }
  ];
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

    // Process timezone conversions
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

    // Clear existing events and insert new ones
    await supabaseClient.from('autonomous_wrestling_events').delete().gte('id', 0);
    
    if (processedEvents.length > 0) {
      const { error: insertError } = await supabaseClient
        .from('autonomous_wrestling_events')
        .insert(processedEvents);

      if (insertError) {
        console.error('Error inserting events:', insertError);
        throw insertError;
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
