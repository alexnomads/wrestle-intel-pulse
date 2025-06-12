
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.10'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const apiKey = Deno.env.get('YOUTUBE_API_KEY');
    
    if (!apiKey) {
      console.error('YouTube API Key not found');
      return new Response(
        JSON.stringify({ error: 'YouTube API not configured' }),
        { 
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    const { channels, maxResults = 10, order = 'date' } = await req.json();
    console.log('Fetching YouTube videos for channels:', channels);

    const allVideos: any[] = [];

    // Fetch videos from each channel
    for (const channelName of channels) {
      try {
        // First, get the channel ID from the channel name
        const channelSearchUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=channel&q=${encodeURIComponent(channelName)}&key=${apiKey}&maxResults=1`;
        
        const channelResponse = await fetch(channelSearchUrl);
        if (!channelResponse.ok) continue;
        
        const channelData = await channelResponse.json();
        if (!channelData.items || channelData.items.length === 0) continue;
        
        const channelId = channelData.items[0].snippet.channelId;
        
        // Now search for recent videos from this channel
        const videosUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${channelId}&type=video&order=${order}&maxResults=${maxResults}&key=${apiKey}&publishedAfter=${new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()}`;
        
        const videosResponse = await fetch(videosUrl);
        if (!videosResponse.ok) continue;
        
        const videosData = await videosResponse.json();
        
        if (videosData.items) {
          // Get detailed statistics for each video
          const videoIds = videosData.items.map((item: any) => item.id.videoId).join(',');
          const statsUrl = `https://www.googleapis.com/youtube/v3/videos?part=statistics,snippet&id=${videoIds}&key=${apiKey}`;
          
          const statsResponse = await fetch(statsUrl);
          if (statsResponse.ok) {
            const statsData = await statsResponse.json();
            
            const processedVideos = statsData.items.map((video: any) => ({
              id: video.id,
              snippet: video.snippet,
              statistics: video.statistics
            }));
            
            allVideos.push(...processedVideos);
          }
        }
      } catch (error) {
        console.error(`Error fetching videos for channel ${channelName}:`, error);
        continue;
      }
    }

    console.log(`Fetched ${allVideos.length} total videos from YouTube`);

    return new Response(
      JSON.stringify({ videos: allVideos }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('YouTube service error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
