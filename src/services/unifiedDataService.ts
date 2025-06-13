import { NewsItem, RedditPost } from './data/dataTypes';
import { fetchComprehensiveRedditPosts } from './wrestlingDataService';
import { fetchOptimizedRSSFeeds } from './data/optimizedRssService';
import { fetchWrestlingTweets, TwitterPost } from './twitterService';
import { fetchWrestlingVideos, YouTubeVideo } from './youtubeService';
import { WrestlerMention } from '@/types/wrestlerAnalysis';
import { getFallbackWrestlerMentions, getFallbackStorylines, getFallbackUnifiedSources } from './fallbackDataService';

export interface UnifiedDataSource {
  type: 'news' | 'reddit' | 'twitter' | 'youtube';
  title: string;
  content: string;
  url?: string;
  timestamp: Date;
  source: string;
  engagement?: {
    score: number;
    comments: number;
  };
}

export interface DetectedStoryline {
  id: string;
  title: string;
  wrestlers: string[];
  description: string;
  intensity: number;
  sources: UnifiedDataSource[];
  platform: 'news' | 'reddit' | 'twitter' | 'youtube' | 'mixed';
}

// Common wrestler names for better detection
const KNOWN_WRESTLERS = [
  'CM Punk', 'Roman Reigns', 'Cody Rhodes', 'Seth Rollins', 'Drew McIntyre',
  'Jon Moxley', 'Kenny Omega', 'Will Ospreay', 'Rhea Ripley', 'Bianca Belair',
  'Becky Lynch', 'Mercedes Mone', 'Jade Cargill', 'Toni Storm', 'Gunther',
  'LA Knight', 'Jey Uso', 'Jimmy Uso', 'Damian Priest', 'Finn Balor',
  'Adam Cole', 'Bobby Lashley', 'Brock Lesnar', 'John Cena', 'The Rock'
];

export const fetchUnifiedData = async (): Promise<{
  sources: UnifiedDataSource[];
  wrestlerMentions: WrestlerMention[];
  storylines: DetectedStoryline[];
}> => {
  try {
    console.log('Fetching unified wrestling data from all sources...');
    
    // Fetch from all real data sources with error handling
    const [newsItems, redditPosts, twitterPosts, youtubeVideos] = await Promise.allSettled([
      fetchOptimizedRSSFeeds(),
      fetchComprehensiveRedditPosts(),
      fetchWrestlingTweets(),
      fetchWrestlingVideos()
    ]);

    // Process settled promises and extract successful data
    const successfulNews = newsItems.status === 'fulfilled' ? newsItems.value : [];
    const successfulReddit = redditPosts.status === 'fulfilled' ? redditPosts.value : [];
    const successfulTwitter = twitterPosts.status === 'fulfilled' ? twitterPosts.value : [];
    const successfulYoutube = youtubeVideos.status === 'fulfilled' ? youtubeVideos.value : [];

    // Log any failures
    if (newsItems.status === 'rejected') console.warn('News fetch failed:', newsItems.reason);
    if (redditPosts.status === 'rejected') console.warn('Reddit fetch failed:', redditPosts.reason);
    if (twitterPosts.status === 'rejected') console.warn('Twitter fetch failed:', twitterPosts.reason);
    if (youtubeVideos.status === 'rejected') console.warn('YouTube fetch failed:', youtubeVideos.reason);

    // Convert to unified format
    const sources: UnifiedDataSource[] = [
      ...successfulNews.map(item => ({
        type: 'news' as const,
        title: item.title || 'Untitled',
        content: item.contentSnippet || '',
        url: item.link,
        timestamp: new Date(item.pubDate),
        source: item.source || 'Wrestling News'
      })),
      ...successfulReddit.map(post => ({
        type: 'reddit' as const,
        title: post.title || 'Untitled',
        content: post.selftext || '',
        url: `https://reddit.com${post.permalink}`,
        timestamp: new Date(post.created_utc * 1000),
        source: `r/${post.subreddit}`,
        engagement: {
          score: post.score || 0,
          comments: post.num_comments || 0
        }
      })),
      ...successfulTwitter.map(tweet => ({
        type: 'twitter' as const,
        title: tweet.text.length > 50 ? `${tweet.text.substring(0, 47)}...` : tweet.text,
        content: tweet.text,
        url: tweet.url,
        timestamp: tweet.timestamp,
        source: `@${tweet.author}`,
        engagement: {
          score: tweet.engagement.likes,
          comments: tweet.engagement.replies
        }
      })),
      ...successfulYoutube.map(video => ({
        type: 'youtube' as const,
        title: video.title || 'Untitled',
        content: video.description || '',
        url: video.url,
        timestamp: video.publishedAt,
        source: video.channelTitle || 'YouTube',
        engagement: {
          score: video.viewCount || 0,
          comments: video.commentCount || 0
        }
      }))
    ];

    // If we don't have enough real data, supplement with fallback data
    const shouldUseFallback = sources.length < 5;
    let finalSources = sources;
    let wrestlerMentions: WrestlerMention[] = [];
    let storylines: DetectedStoryline[] = [];

    if (shouldUseFallback) {
      console.log('Using fallback data due to insufficient external data sources');
      const fallbackSources = getFallbackUnifiedSources();
      finalSources = [...sources, ...fallbackSources];
      wrestlerMentions = getFallbackWrestlerMentions();
      storylines = getFallbackStorylines();
    } else {
      // Analyze wrestler mentions based on real data only
      wrestlerMentions = analyzeWrestlerMentions(sources);
      // Detect storylines from real data only
      storylines = detectStorylines(sources);
    }

    console.log(`Processed ${finalSources.length} total sources:`, {
      news: successfulNews.length,
      reddit: successfulReddit.length,
      twitter: successfulTwitter.length,
      youtube: successfulYoutube.length,
      fallback: shouldUseFallback ? 'yes' : 'no'
    });
    
    return { 
      sources: finalSources, 
      wrestlerMentions: wrestlerMentions.slice(0, 20), // Limit to prevent UI overflow
      storylines: storylines.slice(0, 10) 
    };
  } catch (error) {
    console.error('Error fetching unified data:', error);
    
    // Return fallback data in case of complete failure
    console.log('Using complete fallback data due to error');
    return { 
      sources: getFallbackUnifiedSources(), 
      wrestlerMentions: getFallbackWrestlerMentions(), 
      storylines: getFallbackStorylines() 
    };
  }
};

const analyzeWrestlerMentions = (sources: UnifiedDataSource[]): WrestlerMention[] => {
  const wrestlerData = new Map<string, {
    mentions: UnifiedDataSource[];
    sentimentSum: number;
  }>();

  sources.forEach(source => {
    const content = `${source.title} ${source.content}`.toLowerCase();
    
    KNOWN_WRESTLERS.forEach(wrestler => {
      if (content.includes(wrestler.toLowerCase())) {
        const existing = wrestlerData.get(wrestler) || { mentions: [], sentimentSum: 0 };
        
        // Simple sentiment analysis
        const sentiment = calculateSentiment(content);
        
        wrestlerData.set(wrestler, {
          mentions: [...existing.mentions, source],
          sentimentSum: existing.sentimentSum + sentiment
        });
      }
    });
  });

  return Array.from(wrestlerData.entries())
    .map(([name, data]) => {
      const mentionSources: WrestlerMention[] = data.mentions.map((source, index) => ({
        id: `${name.replace(/\s+/g, '-').toLowerCase()}-${source.timestamp.getTime()}-${index}`,
        wrestler_name: name,
        source_type: source.type === 'news' ? 'news' as const : 'reddit' as const,
        source_name: source.source,
        title: source.title,
        url: source.url || '#',
        content_snippet: source.content.substring(0, 200) + (source.content.length > 200 ? '...' : ''),
        timestamp: source.timestamp,
        sentiment_score: calculateSentiment(`${source.title} ${source.content}`)
      }));

      return mentionSources;
    })
    .flat()
    .filter(mention => mention !== undefined)
    .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
    .slice(0, 50);
};

const detectStorylines = (sources: UnifiedDataSource[]): DetectedStoryline[] => {
  const storylineKeywords = ['vs', 'versus', 'feud', 'rivalry', 'championship', 'title', 'match'];
  const storylines: DetectedStoryline[] = [];

  sources.forEach(source => {
    const content = `${source.title} ${source.content}`.toLowerCase();
    
    if (storylineKeywords.some(keyword => content.includes(keyword))) {
      const mentionedWrestlers = KNOWN_WRESTLERS.filter(wrestler => 
        content.includes(wrestler.toLowerCase())
      ).slice(0, 3);

      if (mentionedWrestlers.length >= 2) {
        const title = mentionedWrestlers.slice(0, 2).join(' vs ');
        const intensity = calculateIntensity(content);
        
        storylines.push({
          id: `${source.timestamp.getTime()}-${mentionedWrestlers.join('-')}`,
          title,
          wrestlers: mentionedWrestlers,
          description: source.title,
          intensity,
          sources: [source],
          platform: source.type
        });
      }
    }
  });

  const merged = mergeStorylines(storylines);
  
  return merged
    .filter(storyline => storyline.sources.length > 0)
    .sort((a, b) => b.intensity - a.intensity)
    .slice(0, 10);
};

const calculateSentiment = (content: string): number => {
  const positiveWords = ['great', 'amazing', 'awesome', 'incredible', 'fantastic', 'best', 'perfect', 'excellent'];
  const negativeWords = ['terrible', 'awful', 'bad', 'disappointing', 'boring', 'worst', 'horrible'];
  
  let score = 0.5;
  positiveWords.forEach(word => {
    if (content.includes(word)) score += 0.1;
  });
  negativeWords.forEach(word => {
    if (content.includes(word)) score -= 0.1;
  });
  
  return Math.max(0, Math.min(1, score));
};

const calculateIntensity = (content: string): number => {
  const intensityWords = ['attack', 'assault', 'betrayal', 'championship', 'main event', 'title', 'feud', 'rivalry'];
  let intensity = 3;
  
  intensityWords.forEach(word => {
    if (content.includes(word)) intensity += 1;
  });
  
  return Math.min(10, intensity);
};

const mergeStorylines = (storylines: DetectedStoryline[]): DetectedStoryline[] => {
  const merged = new Map<string, DetectedStoryline>();
  
  storylines.forEach(storyline => {
    const key = storyline.wrestlers.sort().join('-');
    const existing = merged.get(key);
    
    if (existing) {
      existing.sources.push(...storyline.sources);
      existing.intensity = Math.max(existing.intensity, storyline.intensity);
      if (existing.platform !== storyline.platform && existing.platform !== 'mixed') {
        existing.platform = 'mixed';
      }
    } else {
      merged.set(key, storyline);
    }
  });
  
  return Array.from(merged.values());
};
