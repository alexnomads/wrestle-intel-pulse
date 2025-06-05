
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// WWE Events Scraper
async function scrapeWWEEvents() {
  console.log('Scraping WWE events...');
  
  try {
    const response = await fetch('https://www.wwe.com/events/results/all-events/all-dates/', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });
    
    if (!response.ok) {
      console.error('WWE fetch failed:', response.status);
      return [];
    }
    
    const html = await response.text();
    console.log(`WWE HTML length: ${html.length}`);
    
    const events = [];
    
    // Look for event patterns in the HTML
    const eventMatches = html.match(/<div[^>]*class="[^"]*event[^"]*"[^>]*>[\s\S]*?<\/div>/gi) || [];
    console.log(`Found ${eventMatches.length} potential WWE events`);
    
    // Extract event information using regex patterns
    for (const eventHtml of eventMatches.slice(0, 10)) { // Limit to 10 events
      try {
        // Extract event name
        const nameMatch = eventHtml.match(/<h[1-6][^>]*>([^<]+)<\/h[1-6]>/i) || 
                         eventHtml.match(/title="([^"]+)"/i) ||
                         eventHtml.match(/>([^<]{5,50})</);
        
        // Extract date
        const dateMatch = eventHtml.match(/(\d{1,2}[-\/]\d{1,2}[-\/]\d{4}|\w+ \d{1,2}, \d{4})/);
        
        // Extract location
        const locationMatch = eventHtml.match(/location[^>]*>([^<]+)</i) ||
                             eventHtml.match(/venue[^>]*>([^<]+)</i);
        
        if (nameMatch && nameMatch[1]) {
          const eventName = nameMatch[1].trim();
          
          // Skip if event name is too generic or short
          if (eventName.length > 3 && !eventName.match(/^(more|view|click|see)/i)) {
            const event = {
              name: eventName,
              promotionName: eventName.toLowerCase().includes('nxt') ? 'NXT' : 'WWE',
              event_date: dateMatch ? parseEventDate(dateMatch[1]) : getNextWeekday(1), // Default to Monday
              event_time: '20:00:00',
              location: locationMatch ? locationMatch[1].trim() : 'Various WWE Venues',
              network: eventName.toLowerCase().includes('nxt') ? 'USA Network' : 
                      eventName.toLowerCase().includes('smackdown') ? 'FOX' : 'USA Network',
              event_type: isWeeklyShow(eventName) ? 'weekly' : 'ple',
              is_recurring: isWeeklyShow(eventName),
              day_of_week: getDayOfWeek(eventName)
            };
            
            events.push(event);
            console.log(`WWE Event: ${event.name}`);
          }
        }
      } catch (error) {
        console.error('Error parsing WWE event:', error);
      }
    }
    
    return events;
  } catch (error) {
    console.error('WWE scraping error:', error);
    return [];
  }
}

// AEW Events Scraper
async function scrapeAEWEvents() {
  console.log('Scraping AEW events...');
  
  try {
    const response = await fetch('https://www.allelitewrestling.com/aew-events', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });
    
    if (!response.ok) {
      console.error('AEW fetch failed:', response.status);
      return [];
    }
    
    const html = await response.text();
    console.log(`AEW HTML length: ${html.length}`);
    
    const events = [];
    
    // Look for event patterns
    const eventMatches = html.match(/<div[^>]*class="[^"]*event[^"]*"[^>]*>[\s\S]*?<\/div>/gi) || 
                        html.match(/<article[^>]*>[\s\S]*?<\/article>/gi) || [];
    console.log(`Found ${eventMatches.length} potential AEW events`);
    
    for (const eventHtml of eventMatches.slice(0, 10)) {
      try {
        const nameMatch = eventHtml.match(/<h[1-6][^>]*>([^<]+)<\/h[1-6]>/i) ||
                         eventHtml.match(/title="([^"]+)"/i);
        
        const dateMatch = eventHtml.match(/(\d{1,2}[-\/]\d{1,2}[-\/]\d{4}|\w+ \d{1,2}, \d{4})/);
        const locationMatch = eventHtml.match(/location[^>]*>([^<]+)</i);
        
        if (nameMatch && nameMatch[1]) {
          const eventName = nameMatch[1].trim();
          
          if (eventName.length > 3 && !eventName.match(/^(more|view|click|see)/i)) {
            const event = {
              name: eventName,
              promotionName: 'AEW',
              event_date: dateMatch ? parseEventDate(dateMatch[1]) : getNextWeekday(3), // Default to Wednesday
              event_time: eventName.toLowerCase().includes('rampage') ? '22:00:00' : '20:00:00',
              location: locationMatch ? locationMatch[1].trim() : 'Various AEW Venues',
              network: eventName.toLowerCase().includes('rampage') || eventName.toLowerCase().includes('collision') ? 'TNT' : 'TBS',
              event_type: isWeeklyShow(eventName) ? 'weekly' : 'ppv',
              is_recurring: isWeeklyShow(eventName),
              day_of_week: getDayOfWeek(eventName)
            };
            
            events.push(event);
            console.log(`AEW Event: ${event.name}`);
          }
        }
      } catch (error) {
        console.error('Error parsing AEW event:', error);
      }
    }
    
    return events;
  } catch (error) {
    console.error('AEW scraping error:', error);
    return [];
  }
}

// TNA Events Scraper
async function scrapeTNAEvents() {
  console.log('Scraping TNA events...');
  
  try {
    const response = await fetch('https://tnawrestling.com/events', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });
    
    if (!response.ok) {
      console.error('TNA fetch failed:', response.status);
      return [];
    }
    
    const html = await response.text();
    console.log(`TNA HTML length: ${html.length}`);
    
    const events = [];
    
    const eventMatches = html.match(/<div[^>]*class="[^"]*event[^"]*"[^>]*>[\s\S]*?<\/div>/gi) || [];
    console.log(`Found ${eventMatches.length} potential TNA events`);
    
    for (const eventHtml of eventMatches.slice(0, 10)) {
      try {
        const nameMatch = eventHtml.match(/<h[1-6][^>]*>([^<]+)<\/h[1-6]>/i) ||
                         eventHtml.match(/title="([^"]+)"/i);
        
        const dateMatch = eventHtml.match(/(\d{1,2}[-\/]\d{1,2}[-\/]\d{4}|\w+ \d{1,2}, \d{4})/);
        const locationMatch = eventHtml.match(/location[^>]*>([^<]+)</i);
        
        if (nameMatch && nameMatch[1]) {
          const eventName = nameMatch[1].trim();
          
          if (eventName.length > 3 && !eventName.match(/^(more|view|click|see)/i)) {
            const event = {
              name: eventName,
              promotionName: 'TNA',
              event_date: dateMatch ? parseEventDate(dateMatch[1]) : getNextWeekday(4), // Default to Thursday
              event_time: '20:00:00',
              location: locationMatch ? locationMatch[1].trim() : 'Various TNA Venues',
              network: 'AXS TV',
              event_type: isWeeklyShow(eventName) ? 'weekly' : 'ppv',
              is_recurring: isWeeklyShow(eventName),
              day_of_week: getDayOfWeek(eventName)
            };
            
            events.push(event);
            console.log(`TNA Event: ${event.name}`);
          }
        }
      } catch (error) {
        console.error('Error parsing TNA event:', error);
      }
    }
    
    return events;
  } catch (error) {
    console.error('TNA scraping error:', error);
    return [];
  }
}

// Helper functions
function parseEventDate(dateStr: string): string {
  try {
    const date = new Date(dateStr);
    if (!isNaN(date.getTime())) {
      return date.toISOString().split('T')[0];
    }
  } catch (error) {
    console.error('Date parsing error:', error);
  }
  
  // Return next week if parsing fails
  const nextWeek = new Date();
  nextWeek.setDate(nextWeek.getDate() + 7);
  return nextWeek.toISOString().split('T')[0];
}

function isWeeklyShow(eventName: string): boolean {
  const weeklyShows = ['raw', 'smackdown', 'nxt', 'dynamite', 'rampage', 'collision', 'impact'];
  return weeklyShows.some(show => eventName.toLowerCase().includes(show));
}

function getDayOfWeek(eventName: string): number | null {
  const name = eventName.toLowerCase();
  if (name.includes('raw')) return 1; // Monday
  if (name.includes('nxt')) return 2; // Tuesday
  if (name.includes('dynamite')) return 3; // Wednesday
  if (name.includes('impact')) return 4; // Thursday
  if (name.includes('smackdown') || name.includes('rampage')) return 5; // Friday
  if (name.includes('collision')) return 6; // Saturday
  return null;
}

function getNextWeekday(dayOfWeek: number): string {
  const today = new Date();
  const currentDay = today.getDay();
  const daysUntilNext = (dayOfWeek - currentDay + 7) % 7;
  const nextDate = new Date(today);
  nextDate.setDate(today.getDate() + (daysUntilNext || 7));
  return nextDate.toISOString().split('T')[0];
}

// Fallback events if scraping fails
function generateFallbackEvents() {
  console.log('Generating fallback events...');
  
  return [
    {
      name: 'Monday Night Raw',
      promotionName: 'WWE',
      event_date: getNextWeekday(1),
      event_time: '20:00:00',
      location: 'Various WWE Venues',
      network: 'USA Network',
      event_type: 'weekly',
      is_recurring: true,
      day_of_week: 1
    },
    {
      name: 'Friday Night SmackDown',
      promotionName: 'WWE',
      event_date: getNextWeekday(5),
      event_time: '20:00:00',
      location: 'Various WWE Venues',
      network: 'FOX',
      event_type: 'weekly',
      is_recurring: true,
      day_of_week: 5
    },
    {
      name: 'WWE NXT',
      promotionName: 'NXT',
      event_date: getNextWeekday(2),
      event_time: '20:00:00',
      location: 'WWE Performance Center',
      network: 'USA Network',
      event_type: 'weekly',
      is_recurring: true,
      day_of_week: 2
    },
    {
      name: 'AEW Dynamite',
      promotionName: 'AEW',
      event_date: getNextWeekday(3),
      event_time: '20:00:00',
      location: 'Various AEW Venues',
      network: 'TBS',
      event_type: 'weekly',
      is_recurring: true,
      day_of_week: 3
    },
    {
      name: 'TNA Impact Wrestling',
      promotionName: 'TNA',
      event_date: getNextWeekday(4),
      event_time: '20:00:00',
      location: 'Various TNA Venues',
      network: 'AXS TV',
      event_type: 'weekly',
      is_recurring: true,
      day_of_week: 4
    }
  ];
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { action } = await req.json();
    console.log(`Processing action: ${action}`);

    if (action === 'scrape-events') {
      console.log('Starting real-world event scraping...');
      
      // Get promotions from database
      const { data: promotions, error: promotionsError } = await supabaseClient
        .from('promotions')
        .select('id, name');
      
      if (promotionsError) {
        console.error('Error fetching promotions:', promotionsError);
        return new Response(
          JSON.stringify({ success: false, message: 'Failed to fetch promotions', error: promotionsError }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      console.log('Available promotions:', promotions);
      
      // Create promotion lookup map
      const promotionMap = new Map();
      promotions?.forEach(promo => {
        promotionMap.set(promo.name.toUpperCase(), promo.id);
      });
      
      // Scrape events from all sources
      const allScrapedEvents = [];
      
      try {
        console.log('Scraping WWE events...');
        const wweEvents = await scrapeWWEEvents();
        allScrapedEvents.push(...wweEvents);
        console.log(`Scraped ${wweEvents.length} WWE events`);
      } catch (error) {
        console.error('WWE scraping failed:', error);
      }
      
      try {
        console.log('Scraping AEW events...');
        const aewEvents = await scrapeAEWEvents();
        allScrapedEvents.push(...aewEvents);
        console.log(`Scraped ${aewEvents.length} AEW events`);
      } catch (error) {
        console.error('AEW scraping failed:', error);
      }
      
      try {
        console.log('Scraping TNA events...');
        const tnaEvents = await scrapeTNAEvents();
        allScrapedEvents.push(...tnaEvents);
        console.log(`Scraped ${tnaEvents.length} TNA events`);
      } catch (error) {
        console.error('TNA scraping failed:', error);
      }
      
      // If no events were scraped, use fallback
      const eventsToProcess = allScrapedEvents.length > 0 ? allScrapedEvents : generateFallbackEvents();
      console.log(`Processing ${eventsToProcess.length} total events`);
      
      let successCount = 0;
      let errorCount = 0;
      const errors = [];
      
      // Clear existing events
      console.log('Clearing existing events...');
      const { error: deleteError } = await supabaseClient
        .from('wrestling_events')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000');
      
      if (deleteError) {
        console.log('Warning: Could not clear existing events:', deleteError);
      }
      
      // Insert new events
      for (const eventData of eventsToProcess) {
        try {
          console.log(`Processing event: ${eventData.name} for ${eventData.promotionName}`);
          
          const promotionId = promotionMap.get(eventData.promotionName.toUpperCase());
          
          if (!promotionId) {
            console.error(`No promotion found for: ${eventData.promotionName}`);
            errorCount++;
            errors.push(`Promotion not found: ${eventData.promotionName}`);
            continue;
          }
          
          const eventRecord = {
            name: eventData.name,
            promotion_id: promotionId,
            event_date: eventData.event_date,
            event_time: eventData.event_time,
            location: eventData.location,
            network: eventData.network,
            event_type: eventData.event_type,
            is_recurring: eventData.is_recurring,
            day_of_week: eventData.day_of_week,
            card_announced: false,
            sold_out: false
          };
          
          const { data: insertedEvent, error: insertError } = await supabaseClient
            .from('wrestling_events')
            .insert(eventRecord)
            .select()
            .single();
          
          if (insertError) {
            console.error(`Error inserting event ${eventData.name}:`, insertError);
            errorCount++;
            errors.push(`${eventData.name}: ${insertError.message}`);
          } else {
            console.log(`Successfully inserted event: ${eventData.name}`);
            successCount++;
          }
        } catch (error) {
          console.error(`Exception processing event ${eventData.name}:`, error);
          errorCount++;
          errors.push(`${eventData.name}: ${error.message}`);
        }
      }
      
      const scrapingMethod = allScrapedEvents.length > 0 ? 'real-world scraping' : 'fallback data';
      console.log(`Event processing complete using ${scrapingMethod}. Success: ${successCount}, Errors: ${errorCount}`);
      
      return new Response(
        JSON.stringify({
          success: successCount > 0,
          message: `Processed ${eventsToProcess.length} events using ${scrapingMethod}. Success: ${successCount}, Errors: ${errorCount}`,
          successCount,
          errorCount,
          scrapingMethod,
          errors: errors.slice(0, 5)
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    return new Response(
      JSON.stringify({ success: false, message: 'Invalid action' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Function error:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        message: 'Function execution failed', 
        error: error.message 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
