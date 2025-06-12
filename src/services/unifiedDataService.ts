
import { NewsItem, RedditPost } from './data/dataTypes';
import { fetchComprehensiveWrestlingNews, fetchComprehensiveRedditPosts } from './wrestlingDataService';

export interface UnifiedDataSource {
  type: 'news' | 'reddit';
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

export interface WrestlerMention {
  wrestlerName: string;
  mentions: number;
  sentiment: number;
  sources: UnifiedDataSource[];
  trend: 'up' | 'down' | 'stable';
  trendPercentage: number;
}

export interface DetectedStoryline {
  id: string;
  title: string;
  wrestlers: string[];
  description: string;
  intensity: number;
  sources: UnifiedDataSource[];
  platform: 'news' | 'reddit' | 'mixed';
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
    // Fetch all data sources in parallel
    const [newsItems, redditPosts] = await Promise.all([
      fetchComprehensiveWrestlingNews(),
      fetchComprehensiveRedditPosts()
    ]);

    // Convert to unified format
    const sources: UnifiedDataSource[] = [
      ...newsItems.map(item => ({
        type: 'news' as const,
        title: item.title,
        content: item.contentSnippet || '',
        url: item.link,
        timestamp: new Date(item.pubDate),
        source: item.source || 'Wrestling News'
      })),
      ...redditPosts.map(post => ({
        type: 'reddit' as const,
        title: post.title,
        content: post.selftext || '',
        url: `https://reddit.com${post.permalink}`,
        timestamp: new Date(post.created_utc * 1000),
        source: `r/${post.subreddit}`,
        engagement: {
          score: post.score,
          comments: post.num_comments
        }
      }))
    ];

    // Analyze wrestler mentions
    const wrestlerMentions = analyzeWrestlerMentions(sources);
    
    // Detect storylines
    const storylines = detectStorylines(sources);

    return { sources, wrestlerMentions, storylines };
  } catch (error) {
    console.error('Error fetching unified data:', error);
    return { sources: [], wrestlerMentions: [], storylines: [] };
  }
};

const analyzeWrestlerMentions = (sources: UnifiedDataSource[]): WrestlerMention[] => {
  const wrestlerData = new Map<string, {
    mentions: number;
    sources: UnifiedDataSource[];
    sentimentSum: number;
  }>();

  sources.forEach(source => {
    const content = `${source.title} ${source.content}`.toLowerCase();
    
    KNOWN_WRESTLERS.forEach(wrestler => {
      if (content.includes(wrestler.toLowerCase())) {
        const existing = wrestlerData.get(wrestler) || { mentions: 0, sources: [], sentimentSum: 0 };
        
        // Simple sentiment analysis
        const sentiment = calculateSentiment(content);
        
        wrestlerData.set(wrestler, {
          mentions: existing.mentions + 1,
          sources: [...existing.sources, source],
          sentimentSum: existing.sentimentSum + sentiment
        });
      }
    });
  });

  return Array.from(wrestlerData.entries())
    .map(([name, data]) => ({
      wrestlerName: name,
      mentions: data.mentions,
      sentiment: data.sentimentSum / data.mentions,
      sources: data.sources,
      trend: Math.random() > 0.5 ? 'up' as const : 'down' as const,
      trendPercentage: Math.floor(Math.random() * 50) + 10
    }))
    .sort((a, b) => b.mentions - a.mentions)
    .slice(0, 15);
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
          id: `${Date.now()}-${Math.random()}`,
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

  // Merge similar storylines
  const merged = mergeStorylines(storylines);
  
  return merged
    .sort((a, b) => b.intensity - a.intensity)
    .slice(0, 10);
};

const calculateSentiment = (content: string): number => {
  const positiveWords = ['great', 'amazing', 'awesome', 'incredible', 'fantastic'];
  const negativeWords = ['terrible', 'awful', 'bad', 'disappointing', 'boring'];
  
  let score = 0.5; // neutral
  positiveWords.forEach(word => {
    if (content.includes(word)) score += 0.1;
  });
  negativeWords.forEach(word => {
    if (content.includes(word)) score -= 0.1;
  });
  
  return Math.max(0, Math.min(1, score));
};

const calculateIntensity = (content: string): number => {
  const intensityWords = ['attack', 'assault', 'betrayal', 'championship', 'main event'];
  let intensity = 5;
  
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
    } else {
      merged.set(key, storyline);
    }
  });
  
  return Array.from(merged.values());
};
