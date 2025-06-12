
export interface YouTubeVideo {
  id: string;
  title: string;
  description: string;
  channelTitle: string;
  publishedAt: Date;
  viewCount: number;
  likeCount: number;
  commentCount: number;
  thumbnailUrl: string;
  url: string;
}

// Major wrestling YouTube channels
const WRESTLING_CHANNELS = [
  'WWEFANDANGO', // WWE
  'AEWrestling', // AEW
  'NewJapanPro', // NJPW
  'IMPACTWRESTLING', // Impact Wrestling
  'WrestleTalk', // WrestleTalk
  'WhatCultureWWE', // WhatCulture Wrestling
  'NoRollsBarred', // No Rolls Barred
  'TheWrestlingClassic', // Wrestling Classic
  'wrestlingshoot', // Wrestling Shoot Interviews
  'JDfromNY206' // JD from NY
];

export const fetchWrestlingVideos = async (): Promise<YouTubeVideo[]> => {
  try {
    console.log('Fetching YouTube wrestling content...');
    
    // Use Supabase client to call the edge function
    const response = await fetch('https://wavxulotmntdtixcpzik.supabase.co/functions/v1/youtube-wrestling-data', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        channels: WRESTLING_CHANNELS,
        maxResults: 10,
        order: 'date'
      })
    });

    if (!response.ok) {
      console.warn('YouTube API not available - requires API key setup');
      return [];
    }

    const data = await response.json();
    
    const videos: YouTubeVideo[] = data.videos?.map((video: any) => ({
      id: video.id,
      title: video.snippet?.title || '',
      description: video.snippet?.description || '',
      channelTitle: video.snippet?.channelTitle || '',
      publishedAt: new Date(video.snippet?.publishedAt),
      viewCount: parseInt(video.statistics?.viewCount) || 0,
      likeCount: parseInt(video.statistics?.likeCount) || 0,
      commentCount: parseInt(video.statistics?.commentCount) || 0,
      thumbnailUrl: video.snippet?.thumbnails?.medium?.url || '',
      url: `https://www.youtube.com/watch?v=${video.id}`
    })) || [];

    console.log(`Fetched ${videos.length} wrestling videos`);
    return videos;
  } catch (error) {
    console.warn('YouTube service error:', error);
    return [];
  }
};
