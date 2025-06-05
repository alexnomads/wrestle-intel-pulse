
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
  console.log('Scraping WWE events from official results page...');
  
  try {
    // Scrape from WWE's official events results page
    const response = await fetch('https://www.wwe.com/events/results/all-events/all-dates/');
    const html = await response.text();
    
    const events: EventData[] = [];
    
    // Extract event cards from WWE results page
    const eventCardRegex = /<article[^>]*class="[^"]*event-card[^"]*"[^>]*>([\s\S]*?)<\/article>/gi;
    let match;
    
    while ((match = eventCardRegex.exec(html)) !== null) {
      const cardHtml = match[1];
      
      // Extract event details
      const titleMatch = cardHtml.match(/<h[1-6][^>]*>([^<]+)<\/h[1-6]>/i);
      const dateMatch = cardHtml.match(/\b\w+\s+\d{1,2},?\s+\d{4}\b/);
      const locationMatch = cardHtml.match(/location[^>]*>([^<]+)</i) || cardHtml.match(/venue[^>]*>([^<]+)</i);
      
      if (titleMatch) {
        const eventName = titleMatch[1].trim();
        const eventDate = dateMatch ? new Date(dateMatch[0]).toISOString().split('T')[0] : getNextWeekday(1);
        
        events.push({
          name: eventName,
          date: eventDate,
          location: locationMatch?.[1]?.trim() || 'Various',
          network: 'WWE Network/Peacock',
          eventType: eventName.toLowerCase().includes('raw') || eventName.toLowerCase().includes('smackdown') ? 'weekly' : 'ple',
          promotionName: eventName.toLowerCase().includes('nxt') ? 'NXT' : 'WWE',
        });
      }
    }
    
    // Add weekly shows with proper scheduling
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
    
    return [...events, ...weeklyShows];
  } catch (error) {
    console.error('Error scraping WWE events:', error);
    
    // Fallback to weekly shows if scraping fails
    return [
      {
        name: 'Monday Night Raw',
        date: getNextWeekday(1),
        time: '20:00',
        location: 'Various',
        network: 'USA Network',
        eventType: 'weekly',
        promotionName: 'WWE',
      },
      {
        name: 'Friday Night SmackDown',
        date: getNextWeekday(5),
        time: '20:00',
        location: 'Various',
        network: 'FOX',
        eventType: 'weekly',
        promotionName: 'WWE',
      },
      {
        name: 'WWE NXT',
        date: getNextWeekday(2),
        time: '20:00',
        location: 'Various',
        network: 'USA Network',
        eventType: 'weekly',
        promotionName: 'NXT',
      },
    ];
  }
}

async function scrapeAEWEvents(): Promise<EventData[]> {
  console.log('Scraping AEW events from official events page...');
  
  try {
    const response = await fetch('https://www.allelitewrestling.com/aew-events');
    const html = await response.text();
    
    const events: EventData[] = [];
    
    // Look for event information in AEW page
    const eventRegex = /<div[^>]*class="[^"]*event[^"]*"[^>]*>([\s\S]*?)<\/div>/gi;
    let match;
    
    while ((match = eventRegex.exec(html)) !== null) {
      const eventHtml = match[1];
      
      const titleMatch = eventHtml.match(/<h[1-6][^>]*>([^<]+)<\/h[1-6]>/i);
      const dateMatch = eventHtml.match(/\b\w+\s+\d{1,2},?\s+\d{4}\b/);
      const locationMatch = eventHtml.match(/location[^>]*>([^<]+)</i);
      
      if (titleMatch) {
        events.push({
          name: titleMatch[1].trim(),
          date: dateMatch ? new Date(dateMatch[0]).toISOString().split('T')[0] : getNextWeekday(3),
          location: locationMatch?.[1]?.trim() || 'Various',
          network: 'TBS/TNT',
          eventType: 'ple',
          promotionName: 'AEW',
        });
      }
    }
    
    // Add weekly shows
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
    
    return [...events, ...weeklyShows];
  } catch (error) {
    console.error('Error scraping AEW events:', error);
    
    // Fallback to weekly shows
    return [
      {
        name: 'AEW Dynamite',
        date: getNextWeekday(3),
        time: '20:00',
        location: 'Various',
        network: 'TBS',
        eventType: 'weekly',
        promotionName: 'AEW',
      },
      {
        name: 'AEW Rampage',
        date: getNextWeekday(5),
        time: '22:00',
        location: 'Various',
        network: 'TNT',
        eventType: 'weekly',
        promotionName: 'AEW',
      },
      {
        name: 'AEW Collision',
        date: getNextWeekday(6),
        time: '20:00',
        location: 'Various',
        network: 'TNT',
        eventType: 'weekly',
        promotionName: 'AEW',
      },
    ];
  }
}

async function scrapeTNAEvents(): Promise<EventData[]> {
  console.log('Scraping TNA events...');
  
  try {
    const response = await fetch('https://tnawrestling.com/events');
    const html = await response.text();
    
    const events: EventData[] = [];
    
    // Look for event information in TNA page
    const eventRegex = /<div[^>]*class="[^"]*event[^"]*"[^>]*>([\s\S]*?)<\/div>/gi;
    let match;
    
    while ((match = eventRegex.exec(html)) !== null) {
      const eventHtml = match[1];
      
      const titleMatch = eventHtml.match(/<h[1-6][^>]*>([^<]+)<\/h[1-6]>/i);
      const dateMatch = eventHtml.match(/\b\w+\s+\d{1,2},?\s+\d{4}\b/);
      const locationMatch = eventHtml.match(/location[^>]*>([^<]+)</i);
      
      if (titleMatch) {
        events.push({
          name: titleMatch[1].trim(),
          date: dateMatch ? new Date(dateMatch[0]).toISOString().split('T')[0] : getNextWeekday(4),
          location: locationMatch?.[1]?.trim() || 'Various',
          network: 'AXS TV',
          eventType: 'ple',
          promotionName: 'TNA',
        });
      }
    }
    
    // Add TNA Impact weekly show
    events.push({
      name: 'TNA Impact Wrestling',
      date: getNextWeekday(4), // Thursday
      time: '20:00',
      location: 'Various',
      network: 'AXS TV',
      eventType: 'weekly',
      promotionName: 'TNA',
    });
    
    return events;
  } catch (error) {
    console.error('Error scraping TNA events:', error);
    
    // Fallback to weekly show
    return [
      {
        name: 'TNA Impact Wrestling',
        date: getNextWeekday(4),
        time: '20:00',
        location: 'Various',
        network: 'AXS TV',
        eventType: 'weekly',
        promotionName: 'TNA',
      },
    ];
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
      
      const [wweEvents, aewEvents, tnaEvents] = await Promise.all([
        scrapeWWEEvents(),
        scrapeAEWEvents(),
        scrapeTNAEvents(),
      ]);
      
      const allEvents = [...wweEvents, ...aewEvents, ...tnaEvents];
      let successCount = 0;
      let errorCount = 0;
      
      for (const eventData of allEvents) {
        try {
          // Get promotion ID
          const { data: promotion, error: promotionError } = await supabaseClient
            .from('promotions')
            .select('id')
            .eq('name', eventData.promotionName)
            .single();
          
          if (promotionError) {
            console.error('Error finding promotion:', promotionError, 'for:', eventData.promotionName);
            errorCount++;
            continue;
          }
          
          if (promotion) {
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
          } else {
            console.error('No promotion found for:', eventData.promotionName);
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
