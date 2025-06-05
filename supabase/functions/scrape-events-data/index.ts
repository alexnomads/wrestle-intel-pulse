
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
  
  try {
    // Scrape from WWE's official events page
    const response = await fetch('https://www.wwe.com/shows/events');
    const html = await response.text();
    
    // Extract event data using regex patterns
    const eventRegex = /<div[^>]*class="[^"]*event[^"]*"[^>]*>[\s\S]*?<\/div>/gi;
    const events: EventData[] = [];
    
    let match;
    while ((match = eventRegex.exec(html)) !== null) {
      const eventHtml = match[0];
      
      // Extract event details
      const nameMatch = eventHtml.match(/<h[1-6][^>]*>([^<]+)<\/h[1-6]>/i);
      const dateMatch = eventHtml.match(/\b\d{1,2}\/\d{1,2}\/\d{4}\b/);
      const locationMatch = eventHtml.match(/location[^>]*>([^<]+)</i);
      
      if (nameMatch && dateMatch) {
        events.push({
          name: nameMatch[1].trim(),
          date: dateMatch[0],
          location: locationMatch?.[1]?.trim(),
          network: 'WWE Network/Peacock',
          eventType: 'ple',
          promotionName: 'WWE',
        });
      }
    }
    
    // Add weekly shows
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
    ];
    
    return [...events, ...weeklyShows];
  } catch (error) {
    console.error('Error scraping WWE events:', error);
    return [];
  }
}

async function scrapeAEWEvents(): Promise<EventData[]> {
  console.log('Scraping AEW events...');
  
  try {
    const response = await fetch('https://www.allelitewrestling.com/events');
    const html = await response.text();
    
    const events: EventData[] = [];
    
    // Add known weekly shows
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
    ];
    
    return weeklyShows;
  } catch (error) {
    console.error('Error scraping AEW events:', error);
    return [];
  }
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
      
      const [wweEvents, aewEvents] = await Promise.all([
        scrapeWWEEvents(),
        scrapeAEWEvents(),
      ]);
      
      const allEvents = [...wweEvents, ...aewEvents];
      let successCount = 0;
      
      for (const eventData of allEvents) {
        try {
          // Get promotion ID
          const { data: promotion } = await supabaseClient
            .from('promotions')
            .select('id')
            .eq('name', eventData.promotionName)
            .single();
          
          if (promotion) {
            // Insert or update event
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
                onConflict: 'name,event_date',
                ignoreDuplicates: false
              });
            
            if (!error) {
              successCount++;
            } else {
              console.error('Error inserting event:', error);
            }
          }
        } catch (error) {
          console.error('Error processing event:', error);
        }
      }
      
      return new Response(
        JSON.stringify({
          success: true,
          message: `Successfully scraped and stored ${successCount} events`,
          eventsProcessed: allEvents.length
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
