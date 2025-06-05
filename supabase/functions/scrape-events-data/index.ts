
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

function getNextWeekday(dayOfWeek: number): string {
  const today = new Date();
  const currentDay = today.getDay();
  const daysUntilNext = (dayOfWeek - currentDay + 7) % 7;
  const nextDate = new Date(today);
  nextDate.setDate(today.getDate() + (daysUntilNext || 7));
  return nextDate.toISOString().split('T')[0];
}

function generateEvents() {
  console.log('Generating wrestling events...');
  
  const events = [
    // WWE Events
    {
      name: 'Monday Night Raw',
      promotionName: 'WWE',
      event_date: getNextWeekday(1), // Monday
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
      event_date: getNextWeekday(5), // Friday
      event_time: '20:00:00',
      location: 'Various WWE Venues',
      network: 'FOX',
      event_type: 'weekly',
      is_recurring: true,
      day_of_week: 5
    },
    // NXT Events
    {
      name: 'WWE NXT',
      promotionName: 'NXT',
      event_date: getNextWeekday(2), // Tuesday
      event_time: '20:00:00',
      location: 'WWE Performance Center',
      network: 'USA Network',
      event_type: 'weekly',
      is_recurring: true,
      day_of_week: 2
    },
    // AEW Events
    {
      name: 'AEW Dynamite',
      promotionName: 'AEW',
      event_date: getNextWeekday(3), // Wednesday
      event_time: '20:00:00',
      location: 'Various AEW Venues',
      network: 'TBS',
      event_type: 'weekly',
      is_recurring: true,
      day_of_week: 3
    },
    {
      name: 'AEW Rampage',
      promotionName: 'AEW',
      event_date: getNextWeekday(5), // Friday
      event_time: '22:00:00',
      location: 'Various AEW Venues',
      network: 'TNT',
      event_type: 'weekly',
      is_recurring: true,
      day_of_week: 5
    },
    {
      name: 'AEW Collision',
      promotionName: 'AEW',
      event_date: getNextWeekday(6), // Saturday
      event_time: '20:00:00',
      location: 'Various AEW Venues',
      network: 'TNT',
      event_type: 'weekly',
      is_recurring: true,
      day_of_week: 6
    },
    // TNA Events
    {
      name: 'TNA Impact Wrestling',
      promotionName: 'TNA',
      event_date: getNextWeekday(4), // Thursday
      event_time: '20:00:00',
      location: 'Various TNA Venues',
      network: 'AXS TV',
      event_type: 'weekly',
      is_recurring: true,
      day_of_week: 4
    }
  ];
  
  console.log(`Generated ${events.length} wrestling events`);
  return events;
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
      console.log('Starting event generation and insertion...');
      
      // Get all promotions from database
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
      
      console.log('Promotion map:', Object.fromEntries(promotionMap));
      
      // Generate events
      const events = generateEvents();
      let successCount = 0;
      let errorCount = 0;
      const errors = [];
      
      // Clear existing events first
      console.log('Clearing existing events...');
      const { error: deleteError } = await supabaseClient
        .from('wrestling_events')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all
      
      if (deleteError) {
        console.log('Warning: Could not clear existing events:', deleteError);
      }
      
      // Insert new events
      for (const eventData of events) {
        try {
          console.log(`Processing event: ${eventData.name} for ${eventData.promotionName}`);
          
          const promotionId = promotionMap.get(eventData.promotionName.toUpperCase());
          
          if (!promotionId) {
            console.error(`No promotion found for: ${eventData.promotionName}`);
            errorCount++;
            errors.push(`Promotion not found: ${eventData.promotionName}`);
            continue;
          }
          
          console.log(`Found promotion ID: ${promotionId} for ${eventData.promotionName}`);
          
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
          
          console.log('Inserting event record:', eventRecord);
          
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
      
      console.log(`Event processing complete. Success: ${successCount}, Errors: ${errorCount}`);
      
      return new Response(
        JSON.stringify({
          success: successCount > 0,
          message: `Processed ${events.length} events. Success: ${successCount}, Errors: ${errorCount}`,
          successCount,
          errorCount,
          errors: errors.slice(0, 5) // Limit error details
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    if (action === 'scrape-news') {
      console.log('News scraping not implemented yet');
      return new Response(
        JSON.stringify({
          success: true,
          message: 'News scraping feature coming soon'
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
