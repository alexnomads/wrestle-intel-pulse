
// Twitter API v2 service with proper authentication
export interface TwitterPost {
  id: string;
  text: string;
  author: string;
  timestamp: Date;
  engagement: {
    likes: number;
    retweets: number;
    replies: number;
  };
  url: string;
}

// High-volume wrestling accounts to monitor
const WRESTLING_ACCOUNTS = [
  'WWE',
  'AEW',
  'SeanRossSapp',
  'WrestleVotes',
  'davemeltzerWON',
  'ryansatin',
  'MikeJohnson_pwtorch',
  'FightfulSelect',
  'PWInsidercom',
  'WrestlingInc',
  'wrestlingnews_co'
];

export const fetchWrestlingTweets = async (): Promise<TwitterPost[]> => {
  try {
    console.log('Fetching real-time Twitter wrestling data...');
    
    // This will use Supabase Edge Function for Twitter API calls
    const response = await fetch('/api/twitter-wrestling-data', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ accounts: WRESTLING_ACCOUNTS })
    });

    if (!response.ok) {
      console.warn('Twitter API not available - requires authentication setup');
      return [];
    }

    const data = await response.json();
    
    const tweets: TwitterPost[] = data.tweets?.map((tweet: any) => ({
      id: tweet.id,
      text: tweet.text,
      author: tweet.author?.username || 'Unknown',
      timestamp: new Date(tweet.created_at),
      engagement: {
        likes: tweet.public_metrics?.like_count || 0,
        retweets: tweet.public_metrics?.retweet_count || 0,
        replies: tweet.public_metrics?.reply_count || 0
      },
      url: `https://twitter.com/${tweet.author?.username}/status/${tweet.id}`
    })) || [];

    console.log(`Fetched ${tweets.length} wrestling tweets`);
    return tweets;
  } catch (error) {
    console.warn('Twitter service error:', error);
    return [];
  }
};
