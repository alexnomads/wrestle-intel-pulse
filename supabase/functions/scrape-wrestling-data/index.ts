
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'
import { corsHeaders, WrestlerData } from './utils.ts'
import { scrapeWWEFromWikipedia } from './scrapers/wwe.ts'
import { scrapeAEWFromWikipedia } from './scrapers/aew.ts'
import { scrapeTNAFromWikipedia } from './scrapers/tna.ts'
import { scrapeNXTFromWikipedia } from './scrapers/nxt.ts'

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { promotion } = await req.json();
    console.log(`Starting scrape for promotion: ${promotion}`);

    // Get promotion data
    const { data: promotionData, error: promotionError } = await supabaseClient
      .from('promotions')
      .select('*')
      .eq('name', promotion)
      .single();

    if (promotionError || !promotionData) {
      throw new Error(`Promotion ${promotion} not found`);
    }

    let wrestlers: WrestlerData[] = [];

    // Scrape based on promotion using Wikipedia only
    switch (promotion.toLowerCase()) {
      case 'wwe':
        wrestlers = await scrapeWWEFromWikipedia();
        break;
      case 'aew':
        wrestlers = await scrapeAEWFromWikipedia();
        break;
      case 'tna':
        wrestlers = await scrapeTNAFromWikipedia();
        break;
      case 'nxt':
        wrestlers = await scrapeNXTFromWikipedia();
        break;
      default:
        throw new Error(`Unsupported promotion: ${promotion}`);
    }

    console.log(`Scraped ${wrestlers.length} wrestlers for ${promotion}`);

    // Clear existing wrestlers for this promotion first to avoid duplicates
    await supabaseClient
      .from('wrestlers')
      .delete()
      .eq('promotion_id', promotionData.id);

    // Insert new wrestlers for this promotion
    for (const wrestler of wrestlers) {
      const wrestlerData = {
        name: wrestler.name,
        real_name: wrestler.real_name,
        promotion_id: promotionData.id,
        status: wrestler.status,
        brand: wrestler.brand,
        division: wrestler.division,
        height: wrestler.height,
        weight: wrestler.weight,
        hometown: wrestler.hometown,
        finisher: wrestler.finisher,
        image_url: wrestler.image_url,
        profile_url: wrestler.profile_url,
        is_champion: wrestler.is_champion || false,
        last_scraped_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      await supabaseClient
        .from('wrestlers')
        .insert(wrestlerData);
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Successfully scraped and updated ${wrestlers.length} wrestlers for ${promotion}`,
        count: wrestlers.length 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Error in scrape-wrestling-data:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
