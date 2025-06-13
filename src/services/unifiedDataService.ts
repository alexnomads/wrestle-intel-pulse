
import { NewsItem, RedditPost } from './data/dataTypes';
import { WrestlerMention } from '@/types/wrestlerAnalysis';
import { fetchRSSFeeds } from './data/rssService';
import { fetchRedditPosts } from './data/redditService';
import { fetchWrestlingTweets } from './twitterService';
import { fetchWrestlingVideos } from './youtubeService';
import { analyzeSentiment, extractWrestlerMentions } from './data/sentimentAnalysisService';

export interface UnifiedSource {
  id: string;
  type: 'news' | 'reddit' | 'twitter' | 'youtube';
  title: string;
  content: string;
  source: string;
  timestamp: Date;
  url: string;
  sentiment: number;
  engagement: {
    score: number;
    comments: number;
    shares: number;
  };
}

export interface DetectedStoryline {
  id: string;
  title: string;
  wrestlers: string[];
  description: string;
  intensity: number;
  sources: Array<{
    type: string;
    title: string;
    content: string;
    timestamp: Date;
    source: string;
    url?: string;
  }>;
  platform: 'news' | 'reddit' | 'twitter' | 'mixed';
}

export interface UnifiedDataResponse {
  sources: UnifiedSource[];
  wrestlerMentions: WrestlerMention[];
  storylines: DetectedStoryline[];
  lastUpdated: Date;
  totalSources: number;
}

// Helper function to safely get sentiment score as number
const getSentimentScore = (text: string): number => {
  const result = analyzeSentiment(text);
  if (typeof result === 'number') {
    return result;
  }
  if (typeof result === 'object' && result !== null && 'score' in result) {
    return (result as any).score || 0.5;
  }
  return 0.5; // Default neutral sentiment
};

export const fetchUnifiedData = async (): Promise<UnifiedDataResponse> => {
  console.log('Fetching unified wrestling data from all sources...');
  
  try {
    // Fetch data from all sources with proper error handling
    const [newsItems, redditPosts, twitterPosts, youtubeVideos] = await Promise.allSettled([
      fetchRSSFeeds(),
      fetchRedditPosts(), 
      fetchWrestlingTweets(), // Now uses rate-limited service
      fetchWrestlingVideos()
    ]);

    const sources: UnifiedSource[] = [];
    
    // Process news data
    if (newsItems.status === 'fulfilled' && newsItems.value) {
      newsItems.value.forEach(item => {
        sources.push({
          id: `news-${item.guid || item.link}`,
          type: 'news',
          title: item.title,
          content: item.contentSnippet || '',
          source: item.source || 'Wrestling News',
          timestamp: new Date(item.pubDate),
          url: item.link,
          sentiment: getSentimentScore(item.title + ' ' + (item.contentSnippet || '')),
          engagement: {
            score: 0,
            comments: 0,
            shares: 0
          }
        });
      });
    }

    // Process Reddit data
    if (redditPosts.status === 'fulfilled' && redditPosts.value) {
      redditPosts.value.forEach(post => {
        sources.push({
          id: `reddit-${post.url}`,
          type: 'reddit',
          title: post.title,
          content: post.selftext || '',
          source: `r/${post.subreddit}`,
          timestamp: new Date(post.created_utc * 1000),
          url: post.permalink.startsWith('http') ? post.permalink : `https://reddit.com${post.permalink}`,
          sentiment: getSentimentScore(post.title + ' ' + (post.selftext || '')),
          engagement: {
            score: post.score,
            comments: post.num_comments,
            shares: 0
          }
        });
      });
    }

    // Process Twitter data (now with rate limiting)
    if (twitterPosts.status === 'fulfilled' && twitterPosts.value) {
      twitterPosts.value.forEach(tweet => {
        if (!tweet.isFallback) { // Only include real tweets, not fallback data
          sources.push({
            id: `twitter-${tweet.id}`,
            type: 'twitter',
            title: tweet.text,
            content: tweet.text,
            source: `@${tweet.author}`,
            timestamp: tweet.timestamp,
            url: tweet.url,
            sentiment: getSentimentScore(tweet.text),
            engagement: {
              score: tweet.engagement.likes,
              comments: tweet.engagement.replies,
              shares: tweet.engagement.retweets
            }
          });
        }
      });
    }

    // Process YouTube data
    if (youtubeVideos.status === 'fulfilled' && youtubeVideos.value) {
      youtubeVideos.value.forEach(video => {
        sources.push({
          id: `youtube-${video.id}`,
          type: 'youtube',
          title: video.title,
          content: video.description,
          source: video.channelTitle,
          timestamp: video.publishedAt,
          url: video.url,
          sentiment: getSentimentScore(video.title + ' ' + video.description),
          engagement: {
            score: video.viewCount,
            comments: video.commentCount,
            shares: 0
          }
        });
      });
    }

    // Extract wrestler mentions from all sources
    const allContent = sources.map(s => s.title + ' ' + s.content).join(' ');
    const wrestlerMentions = extractWrestlerMentions(allContent, sources);

    // Generate basic storylines from sources
    const storylines: DetectedStoryline[] = [];

    console.log(`Unified data: ${sources.length} sources, ${wrestlerMentions.length} wrestler mentions`);
    console.log('Source breakdown:', {
      news: sources.filter(s => s.type === 'news').length,
      reddit: sources.filter(s => s.type === 'reddit').length,
      twitter: sources.filter(s => s.type === 'twitter').length,
      youtube: sources.filter(s => s.type === 'youtube').length
    });

    return {
      sources: sources.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()).slice(0, 100),
      wrestlerMentions,
      storylines,
      lastUpdated: new Date(),
      totalSources: sources.length
    };

  } catch (error) {
    console.error('Error fetching unified data:', error);
    return {
      sources: [],
      wrestlerMentions: [],
      storylines: [],
      lastUpdated: new Date(),
      totalSources: 0
    };
  }
};
