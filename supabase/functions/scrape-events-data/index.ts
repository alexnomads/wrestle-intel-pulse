
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface EventData {
  name: string;
  date: string;
  time?: string;
  location?: string;
  network?: string;
  eventType: string;
  mainEvent?: string;
  ticketUrl?: string;
  posterImageUrl?: string;
  promotionName: string;
  matches?: Array<{
    title?: string;
    matchType: string;
    participants: string[];
  }>;
}

async function scrapeWWEEvents(): Promise<EventData[]> {
  console.log('Scraping WWE events...');
  
  // For now, return weekly shows since web scraping is complex and unreliable
  // In production, you'd want to use official APIs or more sophisticated scraping
  const weeklyShows = [
    {
      name: 'Monday Night Raw',
      date: getNextWeekday(1), // Monday
      time: '20:00',
      location: 'Various',
      network: 'USA Network',
      eventType: 'weekly',
      promotionName: 'WWE',
    },
    {
      name: 'Friday Night SmackDown',
      date: getNextWeekday(5), // Friday
      time: '20:00',
      location: 'Various',
      network: 'FOX',
      eventType: 'weekly',
      promotionName: 'WWE',
    },
    {
      name: 'WWE NXT',
      date: getNextWeekday(2), // Tuesday
      time: '20:00',
      location: 'Various',
      network: 'USA Network',
      eventType: 'weekly',
      promotionName: 'NXT',
    },
  ];
  
  console.log(`Generated ${weeklyShows.length} WWE weekly shows`);
  return weeklyShows;
}

async function scrapeAEWEvents(): Promise<EventData[]> {
  console.log('Scraping AEW events...');
  
  const weeklyShows = [
    {
      name: 'AEW Dynamite',
      date: getNextWeekday(3), // Wednesday
      time: '20:00',
      location: 'Various',
      network: 'TBS',
      eventType: 'weekly',
      promotionName: 'AEW',
    },
    {
      name: 'AEW Rampage',
      date: getNextWeekday(5), // Friday
      time: '22:00',
      location: 'Various',
      network: 'TNT',
      eventType: 'weekly',
      promotionName: 'AEW',
    },
    {
      name: 'AEW Collision',
      date: getNextWeekday(6), // Saturday
      time: '20:00',
      location: 'Various',
      network: 'TNT',
      eventType: 'weekly',
      promotionName: 'AEW',
    },
  ];
  
  console.log(`Generated ${weeklyShows.length} AEW weekly shows`);
  return weeklyShows;
}

async function scrapeTNAEvents(): Promise<EventData[]> {
  console.log('Scraping TNA events...');
  
  const events = [
    {
      name: 'TNA Impact Wrestling',
      date: getNextWeekday(4), // Thursday
      time: '20:00',
      location: 'Various',
      network: 'AXS TV',
      eventType: 'weekly',
      promotionName: 'TNA',
    },
  ];
  
  console.log(`Generated ${events.length} TNA weekly shows`);
  return events;
}

function getNextWeekday(dayOfWeek: number): string {
  const today = new Date();
  const currentDay = today.getDay();
  const daysUntilNext = (dayOfWeek - currentDay + 7) % 7;
  const nextDate = new Date(today);
  nextDate.setDate(today.getDate() + (daysUntilNext || 7));
  return nextDate.toISOString().split('T')[0];
}

async function scrapeWrestlingNews(): Promise<any[]> {
  console.log('Scraping wrestling news...');
  
  const sources = [
    'https://www.wrestlinginc.com/feed/',
    'https://411mania.com/wrestling/feed/',
  ];
  
  const newsItems = [];
  
  for (const sourceUrl of sources) {
    try {
      const response = await fetch(sourceUrl);
      const rssText = await response.text();
      
      // Parse RSS feed
      const itemRegex = /<item>([\s\S]*?)<\/item>/gi;
      let match;
      
      while ((match = itemRegex.exec(rssText)) !== null) {
        const itemContent = match[1];
        
        const titleMatch = itemContent.match(/<title><!\[CDATA\[(.*?)\]\]><\/title>/);
        const linkMatch = itemContent.match(/<link>(.*?)<\/link>/);
        const descMatch = itemContent.match(/<description><!\[CDATA\[(.*?)\]\]><\/description>/);
        const pubDateMatch = itemContent.match(/<pubDate>(.*?)<\/pubDate>/);
        
        if (titleMatch && linkMatch) {
          newsItems.push({
            title: titleMatch[1],
            url: linkMatch[1],
            content: descMatch?.[1] || '',
            source: sourceUrl.includes('wrestlinginc') ? 'Wrestling Inc' : '411 Mania',
            published_at: pubDateMatch ? new Date(pubDateMatch[1]).toISOString() : new Date().toISOString(),
          });
        }
      }
    } catch (error) {
      console.error(`Error scraping news from ${sourceUrl}:`, error);
    }
  }
  
  return newsItems;
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

    if (action === 'scrape-events') {
      console.log('Starting event scraping...');
      
      // First, let's check what promotions exist in the database
      const { data: existingPromotions, error: promotionsError } = await supabaseClient
        .from('promotions')
        .select('id, name');
      
      if (promotionsError) {
        console.error('Error fetching promotions:', promotionsError);
        return new Response(
          JSON.stringify({ success: false, message: 'Failed to fetch promotions from database' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      console.log('Existing promotions:', existingPromotions);
      
      // Create a mapping of promotion names to ensure we match correctly
      const promotionMap = new Map();
      existingPromotions?.forEach(promo => {
        promotionMap.set(promo.name.toLowerCase(), promo);
        // Also add some common variations
        if (promo.name === 'WWE') {
          promotionMap.set('wwe', promo);
        }
        if (promo.name === 'AEW') {
          promotionMap.set('aew', promo);
        }
        if (promo.name === 'TNA') {
          promotionMap.set('tna', promo);
        }
        if (promo.name === 'NXT') {
          promotionMap.set('nxt', promo);
        }
      });
      
      const [wweEvents, aewEvents, tnaEvents] = await Promise.all([
        scrapeWWEEvents(),
        scrapeAEWEvents(),
        scrapeTNAEvents(),
      ]);
      
      const allEvents = [...wweEvents, ...aewEvents, ...tnaEvents];
      console.log(`Total events to process: ${allEvents.length}`);
      
      let successCount = 0;
      let errorCount = 0;
      
      for (const eventData of allEvents) {
        try {
          console.log(`Processing event: ${eventData.name} for promotion: ${eventData.promotionName}`);
          
          // Find promotion using the mapping
          const promotion = promotionMap.get(eventData.promotionName.toLowerCase());
          
          if (!promotion) {
            console.error(`No promotion found for: ${eventData.promotionName}`);
            console.log('Available promotions:', Array.from(promotionMap.keys()));
            errorCount++;
            continue;
          }
          
          console.log(`Found promotion: ${promotion.name} (ID: ${promotion.id})`);
          
          // Insert or update event using the correct unique constraint
          const { error } = await supabaseClient
            .from('wrestling_events')
            .upsert({
              name: eventData.name,
              promotion_id: promotion.id,
              event_date: eventData.date,
              event_time: eventData.time,
              location: eventData.location,
              network: eventData.network,
              event_type: eventData.eventType,
              main_event: eventData.mainEvent,
              ticket_url: eventData.ticketUrl,
              poster_image_url: eventData.posterImageUrl,
              is_recurring: eventData.eventType === 'weekly',
              day_of_week: eventData.eventType === 'weekly' ? new Date(eventData.date).getDay() : null,
            }, {
              onConflict: 'unique_event_per_promotion_date',
              ignoreDuplicates: false
            });
          
          if (!error) {
            successCount++;
            console.log(`Successfully inserted: ${eventData.name} for ${eventData.promotionName}`);
          } else {
            console.error('Error inserting event:', error, 'for event:', eventData.name);
            errorCount++;
          }
        } catch (error) {
          console.error('Error processing event:', error, 'for event:', eventData.name);
          errorCount++;
        }
      }
      
      return new Response(
        JSON.stringify({
          success: true,
          message: `Successfully scraped and stored ${successCount} events (${errorCount} errors)`,
          eventsProcessed: allEvents.length,
          successCount,
          errorCount
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    if (action === 'scrape-news') {
      console.log('Starting news scraping...');
      
      const newsItems = await scrapeWrestlingNews();
      let successCount = 0;
      
      for (const newsItem of newsItems) {
        try {
          // Extract wrestler mentions from title and content
          const allText = `${newsItem.title} ${newsItem.content}`.toLowerCase();
          const wrestlerMentions = [];
          const promotionMentions = [];
          
          // Common wrestler names to detect
          const wrestlerNames = ['roman reigns', 'cody rhodes', 'seth rollins', 'drew mcintyre', 'jon moxley', 'kenny omega', 'cm punk'];
          const promotionNames = ['wwe', 'aew', 'nxt', 'tna', 'njpw'];
          
          wrestlerNames.forEach(name => {
            if (allText.includes(name)) wrestlerMentions.push(name);
          });
          
          promotionNames.forEach(name => {
            if (allText.includes(name)) promotionMentions.push(name);
          });
          
          const { error } = await supabaseClient
            .from('news_articles')
            .upsert({
              title: newsItem.title,
              content: newsItem.content,
              url: newsItem.url,
              source: newsItem.source,
              published_at: newsItem.published_at,
              wrestler_mentions: wrestlerMentions,
              promotion_mentions: promotionMentions,
            }, {
              onConflict: 'url',
              ignoreDuplicates: true
            });
          
          if (!error) {
            successCount++;
          }
        } catch (error) {
          console.error('Error processing news item:', error);
        }
      }
      
      return new Response(
        JSON.stringify({
          success: true,
          message: `Successfully scraped and stored ${successCount} news articles`,
          articlesProcessed: newsItems.length
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ success: false, message: 'Invalid action' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in scrape-events-data function:', error);
    return new Response(
      JSON.stringify({ success: false, message: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
