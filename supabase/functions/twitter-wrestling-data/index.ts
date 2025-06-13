
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.10'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface TwitterUser {
  id: string;
  username: string;
  name: string;
}

interface TwitterTweet {
  id: string;
  text: string;
  created_at: string;
  author_id: string;
  public_metrics: {
    like_count: number;
    retweet_count: number;
    reply_count: number;
  };
}

interface TwitterApiResponse {
  data: TwitterTweet[];
  includes?: {
    users: TwitterUser[];
  };
}

// Rate limiting state (in-memory for this function instance)
let requestCount = 0;
let windowStart = Date.now();
const RATE_LIMIT = 250;
const WINDOW_MS = 15 * 60 * 1000; // 15 minutes

function checkRateLimit(): boolean {
  const now = Date.now();
  
  // Reset window if needed
  if (now - windowStart >= WINDOW_MS) {
    requestCount = 0;
    windowStart = now;
  }

  if (requestCount >= RATE_LIMIT) {
    return false; // Rate limit exceeded
  }

  requestCount++;
  return true;
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const bearerToken = Deno.env.get('TWITTER_BEARER_TOKEN');
    
    if (!bearerToken) {
      console.error('Twitter Bearer Token not found');
      return new Response(
        JSON.stringify({ error: 'Twitter API not configured', tweets: [] }),
        { 
          status: 200, // Return 200 with empty tweets instead of 500
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    const { accounts, rateLimited } = await req.json();
    
    // Check rate limit if this is a rate-limited request
    if (rateLimited && !checkRateLimit()) {
      console.log('Rate limit exceeded, returning empty response');
      return new Response(
        JSON.stringify({ tweets: [], rateLimited: true }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    console.log('Fetching tweets for accounts:', accounts);

    // Use a single account if multiple provided to reduce API calls
    const targetAccount = Array.isArray(accounts) ? accounts[0] : accounts;
    
    // Fetch tweets using search endpoint with from: operator
    const tweetsUrl = `https://api.twitter.com/2/tweets/search/recent?query=from:${targetAccount} -is:retweet&max_results=10&tweet.fields=created_at,public_metrics,author_id&expansions=author_id&user.fields=username,name`;
    
    const tweetsResponse = await fetch(tweetsUrl, {
      headers: {
        'Authorization': `Bearer ${bearerToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (tweetsResponse.status === 429) {
      console.log(`Rate limited by Twitter API for ${targetAccount}`);
      return new Response(
        JSON.stringify({ tweets: [], rateLimited: true }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    if (!tweetsResponse.ok) {
      const errorText = await tweetsResponse.text();
      console.error('Twitter tweets API error:', tweetsResponse.status, errorText);
      
      // Return empty response instead of error to prevent cascade failures
      return new Response(
        JSON.stringify({ tweets: [], error: `API Error: ${tweetsResponse.status}` }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    const tweetsData: TwitterApiResponse = await tweetsResponse.json();
    console.log(`Fetched ${tweetsData.data?.length || 0} tweets for ${targetAccount}`);

    // Process and format tweets
    const tweets = tweetsData.data?.map(tweet => {
      const author = tweetsData.includes?.users?.find(user => user.id === tweet.author_id);
      return {
        id: tweet.id,
        text: tweet.text,
        created_at: tweet.created_at,
        author: {
          username: author?.username || 'unknown',
          name: author?.name || 'Unknown'
        },
        public_metrics: tweet.public_metrics
      };
    }) || [];

    return new Response(
      JSON.stringify({ tweets, requestCount, windowStart }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Twitter service error:', error);
    return new Response(
      JSON.stringify({ tweets: [], error: 'Internal server error' }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
