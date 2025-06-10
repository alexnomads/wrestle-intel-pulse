
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'
import { WrestlingEvent } from './types.ts';
import { convertToTimezones } from './utils.ts';
import { scrapeWWEEvents } from './scrapers/wwe.ts';
import { scrapeAEWEvents } from './scrapers/aew.ts';
import { scrapeNXTEvents } from './scrapers/nxt.ts';
import { scrapeTNAEvents } from './scrapers/tna.ts';
import { scrapeNJPWEvents } from './scrapers/njpw.ts';
import { scrapeROHEvents } from './scrapers/roh.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

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
