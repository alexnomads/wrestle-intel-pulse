
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface WrestlerData {
  name: string;
  real_name?: string;
  status: string;
  brand?: string;
  division: string;
  height?: string;
  weight?: string;
  hometown?: string;
  finisher?: string;
  image_url?: string;
  profile_url?: string;
}

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

    // Scrape based on promotion
    switch (promotion.toLowerCase()) {
      case 'wwe':
        wrestlers = await scrapeWWE();
        break;
      case 'aew':
        wrestlers = await scrapeAEW();
        break;
      case 'tna':
        wrestlers = await scrapeTNA();
        break;
      default:
        throw new Error(`Unsupported promotion: ${promotion}`);
    }

    console.log(`Scraped ${wrestlers.length} wrestlers for ${promotion}`);

    // Update database with scraped data
    for (const wrestler of wrestlers) {
      // Check if wrestler exists
      const { data: existingWrestler } = await supabaseClient
        .from('wrestlers')
        .select('id')
        .eq('name', wrestler.name)
        .eq('promotion_id', promotionData.id)
        .maybeSingle();

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
        last_scraped_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      if (existingWrestler) {
        // Update existing wrestler
        await supabaseClient
          .from('wrestlers')
          .update(wrestlerData)
          .eq('id', existingWrestler.id);
      } else {
        // Insert new wrestler
        await supabaseClient
          .from('wrestlers')
          .insert(wrestlerData);
      }
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

async function scrapeWWE(): Promise<WrestlerData[]> {
  try {
    // For demo purposes, return sample data - in production you'd scrape the actual website
    // This simulates what would be scraped from WWE.com/superstars
    return [
      {
        name: "Roman Reigns",
        real_name: "Joe Anoa'i",
        status: "Active",
        brand: "SmackDown",
        division: "men",
        height: "6'3\"",
        weight: "265 lbs",
        hometown: "Pensacola, Florida",
        finisher: "Superman Punch, Spear",
        image_url: "https://www.wwe.com/f/styles/wwe_16_9_l/public/all/2023/03/Roman_Reigns_bio--ba7263ed8bc5f89e3e57b44162bb79d8.png"
      },
      {
        name: "Cody Rhodes",
        real_name: "Cody Garrett Runnels",
        status: "Active",
        brand: "SmackDown",
        division: "men",
        height: "6'1\"",
        weight: "220 lbs",
        hometown: "Marietta, Georgia",
        finisher: "Cross Rhodes"
      },
      {
        name: "Rhea Ripley",
        real_name: "Demi Bennett",
        status: "Active",
        brand: "RAW",
        division: "women",
        height: "5'7\"",
        weight: "137 lbs",
        hometown: "Adelaide, Australia",
        finisher: "Riptide"
      }
    ];
  } catch (error) {
    console.error('Error scraping WWE:', error);
    return [];
  }
}

async function scrapeAEW(): Promise<WrestlerData[]> {
  try {
    // Sample AEW data - in production you'd scrape from allelitewrestling.com
    return [
      {
        name: "Jon Moxley",
        real_name: "Jonathan Good",
        status: "Active",
        division: "men",
        height: "6'1\"",
        weight: "230 lbs",
        hometown: "Cincinnati, Ohio",
        finisher: "Paradigm Shift"
      },
      {
        name: "Dr. Britt Baker, D.M.D.",
        real_name: "Brittany Baker",
        status: "Active",
        division: "women",
        height: "5'4\"",
        weight: "123 lbs",
        hometown: "Pittsburgh, Pennsylvania",
        finisher: "Lockjaw"
      }
    ];
  } catch (error) {
    console.error('Error scraping AEW:', error);
    return [];
  }
}

async function scrapeTNA(): Promise<WrestlerData[]> {
  try {
    // Sample TNA data - in production you'd scrape from tnawrestling.com
    return [
      {
        name: "Moose",
        real_name: "Quinn Ojinnaka",
        status: "Active",
        division: "men",
        height: "6'5\"",
        weight: "300 lbs",
        hometown: "Charlotte, North Carolina",
        finisher: "Spear"
      },
      {
        name: "Jordynne Grace",
        real_name: "Jordynne Grace",
        status: "Active",
        division: "women",
        height: "5'3\"",
        weight: "143 lbs",
        hometown: "Austin, Texas",
        finisher: "Grace Driver"
      }
    ];
  } catch (error) {
    console.error('Error scraping TNA:', error);
    return [];
  }
}
