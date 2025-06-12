
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
        JSON.stringify({ error: 'Twitter API not configured' }),
        { 
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    const { accounts } = await req.json();
    console.log('Fetching tweets for accounts:', accounts);

    // Convert account usernames to user IDs by looking them up
    const usernames = accounts.join(',');
    const usersUrl = `https://api.twitter.com/2/users/by?usernames=${usernames}&user.fields=id,username,name`;
    
    const usersResponse = await fetch(usersUrl, {
      headers: {
        'Authorization': `Bearer ${bearerToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!usersResponse.ok) {
      const errorText = await usersResponse.text();
      console.error('Twitter users API error:', usersResponse.status, errorText);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch user data from Twitter' }),
        { 
          status: usersResponse.status,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    const usersData = await usersResponse.json();
    console.log('Users data:', usersData);

    if (!usersData.data || usersData.data.length === 0) {
      return new Response(
        JSON.stringify({ tweets: [] }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get user IDs
    const userIds = usersData.data.map((user: TwitterUser) => user.id).join(',');
    
    // Fetch recent tweets from these users
    const tweetsUrl = `https://api.twitter.com/2/tweets/search/recent?query=from:${accounts.join(' OR from:')}&max_results=50&tweet.fields=created_at,public_metrics,author_id&expansions=author_id&user.fields=username,name`;
    
    const tweetsResponse = await fetch(tweetsUrl, {
      headers: {
        'Authorization': `Bearer ${bearerToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!tweetsResponse.ok) {
      const errorText = await tweetsResponse.text();
      console.error('Twitter tweets API error:', tweetsResponse.status, errorText);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch tweets from Twitter' }),
        { 
          status: tweetsResponse.status,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    const tweetsData: TwitterApiResponse = await tweetsResponse.json();
    console.log(`Fetched ${tweetsData.data?.length || 0} tweets`);

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
      JSON.stringify({ tweets }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Twitter service error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
