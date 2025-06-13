
import { NewsItem, RedditPost } from './data/dataTypes';
import { WrestlerMention } from '@/types/wrestlerAnalysis';

export interface WrestlerTrend {
  id: string;
  wrestler_name: string;
  current_mentions: number;
  previous_mentions: number;
  change_percentage: number;
  trending_direction: 'rising' | 'falling' | 'stable';
  sentiment_score: number;
  momentum_score: number;
  timeframe: '24h' | '7d' | '30d';
  mention_sources: WrestlerMention[];
}

export interface StorylineMomentum {
  id: string;
  storyline_title: string;
  wrestlers_involved: string[];
  momentum_score: number;
  engagement_trend: 'increasing' | 'decreasing' | 'stable';
  platforms: string[];
  key_events: string[];
  related_sources: Array<{
    title: string;
    url: string;
    source_type: 'news' | 'reddit';
    source_name: string;
    timestamp: Date;
    content_snippet: string;
  }>;
}

export interface TrendAlert {
  id: string;
  type: 'trend_spike' | 'sentiment_shift' | 'storyline_momentum' | 'breaking_news';
  severity: 'critical' | 'high' | 'medium' | 'low';
  title: string;
  description: string;
  wrestler_name?: string;
  storyline_id?: string;
  timestamp: Date;
  data: {
    change_percentage: number;
    current_value: number;
    previous_value: number;
    timeframe: string;
  };
  mention_sources?: WrestlerMention[];
}

// Common wrestler names for analysis
const WRESTLER_KEYWORDS = [
  'CM Punk', 'Roman Reigns', 'Cody Rhodes', 'Seth Rollins', 'Drew McIntyre',
  'Jon Moxley', 'Kenny Omega', 'Will Ospreay', 'Rhea Ripley', 'Bianca Belair',
  'Becky Lynch', 'Mercedes Mone', 'Jade Cargill', 'Toni Storm', 'Gunther',
  'LA Knight', 'Jey Uso', 'Jimmy Uso', 'Damian Priest', 'Finn Balor',
  'World Champion', 'Knockouts Champion'
];

export const analyzeWrestlerTrends = (
  newsItems: NewsItem[],
  redditPosts: RedditPost[],
  timeframe: '24h' | '7d' | '30d'
): WrestlerTrend[] => {
  const trends: WrestlerTrend[] = [];
  
  WRESTLER_KEYWORDS.forEach(wrestler => {
    const mentionSources: WrestlerMention[] = [];
    
    // Analyze news mentions
    newsItems.forEach(item => {
      const content = `${item.title} ${item.contentSnippet || ''}`.toLowerCase();
      if (content.includes(wrestler.toLowerCase())) {
        mentionSources.push({
          id: `${wrestler.replace(/\s+/g, '-')}-${item.title.substring(0, 20).replace(/\s+/g, '-')}-${Date.now()}`,
          wrestler_name: wrestler,
          source_type: 'news',
          source_name: item.source || 'Wrestling News',
          title: item.title,
          url: item.link || '#',
          content_snippet: item.contentSnippet || '',
          timestamp: new Date(item.pubDate),
          sentiment_score: calculateSentiment(content)
        });
      }
    });

    // Analyze Reddit mentions
    redditPosts.forEach(post => {
      const content = `${post.title} ${post.selftext || ''}`.toLowerCase();
      if (content.includes(wrestler.toLowerCase())) {
        mentionSources.push({
          id: `${wrestler.replace(/\s+/g, '-')}-${post.title.substring(0, 20).replace(/\s+/g, '-')}-${Date.now()}`,
          wrestler_name: wrestler,
          source_type: 'reddit',
          source_name: `r/${post.subreddit}`,
          title: post.title,
          url: `https://reddit.com${post.permalink}`,
          content_snippet: post.selftext || '',
          timestamp: new Date(post.created_utc * 1000),
          sentiment_score: calculateSentiment(content)
        });
      }
    });

    if (mentionSources.length > 0) {
      const currentMentions = mentionSources.length;
      const previousMentions = Math.max(1, Math.floor(currentMentions * (0.7 + Math.random() * 0.6))); // Simulate previous data
      const changePercentage = Math.round(((currentMentions - previousMentions) / previousMentions) * 100);
      
      let trendingDirection: 'rising' | 'falling' | 'stable' = 'stable';
      if (changePercentage > 20) trendingDirection = 'rising';
      else if (changePercentage < -20) trendingDirection = 'falling';

      trends.push({
        id: `trend-${wrestler.replace(/\s+/g, '-').toLowerCase()}`,
        wrestler_name: wrestler,
        current_mentions: currentMentions,
        previous_mentions: previousMentions,
        change_percentage: changePercentage,
        trending_direction: trendingDirection,
        sentiment_score: mentionSources.reduce((acc, m) => acc + m.sentiment_score, 0) / mentionSources.length,
        momentum_score: Math.min(100, currentMentions * 10 + Math.abs(changePercentage)),
        timeframe,
        mention_sources: mentionSources.slice(0, 10) // Limit to 10 most recent sources
      });
    }
  });

  return trends
    .filter(trend => trend.current_mentions > 0)
    .sort((a, b) => Math.abs(b.change_percentage) - Math.abs(a.change_percentage))
    .slice(0, 15);
};

export const trackStorylineMomentum = (
  newsItems: NewsItem[],
  redditPosts: RedditPost[]
): StorylineMomentum[] => {
  const storylines: StorylineMomentum[] = [];
  
  // Define some key storyline keywords
  const storylineKeywords = [
    { title: 'Championship Picture', keywords: ['championship', 'title', 'belt'] },
    { title: 'Royal Rumble', keywords: ['royal rumble', 'rumble'] },
    { title: 'WrestleMania', keywords: ['wrestlemania', 'mania'] },
    { title: 'Money in the Bank', keywords: ['money in the bank', 'mitb'] },
    { title: 'Survivor Series', keywords: ['survivor series'] }
  ];

  storylineKeywords.forEach(storyline => {
    const relatedSources: StorylineMomentum['related_sources'] = [];
    
    newsItems.forEach(item => {
      const content = `${item.title} ${item.contentSnippet || ''}`.toLowerCase();
      if (storyline.keywords.some(keyword => content.includes(keyword))) {
        relatedSources.push({
          title: item.title,
          url: item.link || '#',
          source_type: 'news',
          source_name: item.source || 'Wrestling News',
          timestamp: new Date(item.pubDate),
          content_snippet: item.contentSnippet || ''
        });
      }
    });

    if (relatedSources.length > 0) {
      storylines.push({
        id: `storyline-${storyline.title.replace(/\s+/g, '-').toLowerCase()}`,
        storyline_title: storyline.title,
        wrestlers_involved: extractWrestlersFromSources(relatedSources),
        momentum_score: Math.min(100, relatedSources.length * 15),
        engagement_trend: relatedSources.length > 3 ? 'increasing' : 'stable',
        platforms: [...new Set(relatedSources.map(s => s.source_type))],
        key_events: relatedSources.slice(0, 3).map(s => s.title),
        related_sources: relatedSources.slice(0, 5)
      });
    }
  });

  return storylines.slice(0, 8);
};

export const generateTrendAlerts = (
  trends: WrestlerTrend[],
  storylines: StorylineMomentum[]
): TrendAlert[] => {
  const alerts: TrendAlert[] = [];
  
  // Generate alerts for significant wrestler trends
  trends.forEach(trend => {
    if (Math.abs(trend.change_percentage) > 100) {
      alerts.push({
        id: `alert-${trend.id}`,
        type: 'trend_spike',
        severity: Math.abs(trend.change_percentage) > 200 ? 'critical' : 'high',
        title: `${trend.wrestler_name} Mention Surge`,
        description: `${trend.wrestler_name}'s mentions ${trend.change_percentage > 0 ? 'increased' : 'decreased'} ${Math.abs(trend.change_percentage)}% in ${trend.timeframe} (${trend.current_mentions} news, ${trend.mention_sources.filter(m => m.source_type === 'reddit').length} reddit)`,
        wrestler_name: trend.wrestler_name,
        timestamp: new Date(),
        data: {
          change_percentage: trend.change_percentage,
          current_value: trend.current_mentions,
          previous_value: trend.previous_mentions,
          timeframe: trend.timeframe
        },
        mention_sources: trend.mention_sources
      });
    }
  });

  // Generate alerts for storyline momentum
  storylines.forEach(storyline => {
    if (storyline.momentum_score > 60) {
      alerts.push({
        id: `alert-storyline-${storyline.id}`,
        type: 'storyline_momentum',
        severity: storyline.momentum_score > 80 ? 'high' : 'medium',
        title: `${storyline.storyline_title} Gaining Momentum`,
        description: `${storyline.storyline_title} storyline activity is ${storyline.engagement_trend} across ${storyline.platforms.length} platforms`,
        storyline_id: storyline.id,
        timestamp: new Date(),
        data: {
          change_percentage: storyline.momentum_score,
          current_value: storyline.related_sources.length,
          previous_value: Math.max(1, storyline.related_sources.length - 2),
          timeframe: '24h'
        },
        mention_sources: storyline.related_sources.map(source => ({
          id: `storyline-mention-${storyline.id}-${Date.now()}`,
          wrestler_name: storyline.storyline_title,
          source_type: source.source_type,
          source_name: source.source_name,
          title: source.title,
          url: source.url,
          content_snippet: source.content_snippet,
          timestamp: source.timestamp,
          sentiment_score: 0.7
        }))
      });
    }
  });

  return alerts
    .sort((a, b) => {
      // Sort by severity first, then by change percentage
      const severityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
      const severityDiff = severityOrder[b.severity] - severityOrder[a.severity];
      if (severityDiff !== 0) return severityDiff;
      return Math.abs(b.data.change_percentage) - Math.abs(a.data.change_percentage);
    })
    .slice(0, 10);
};

// Helper functions
const calculateSentiment = (content: string): number => {
  const positiveWords = ['great', 'amazing', 'awesome', 'incredible', 'fantastic', 'best', 'champion', 'victory', 'win'];
  const negativeWords = ['terrible', 'awful', 'bad', 'disappointing', 'boring', 'worst', 'injury', 'loss', 'defeat'];
  
  let score = 0.5;
  positiveWords.forEach(word => {
    if (content.includes(word)) score += 0.1;
  });
  negativeWords.forEach(word => {
    if (content.includes(word)) score -= 0.1;
  });
  
  return Math.max(0, Math.min(1, score));
};

const extractWrestlersFromSources = (sources: any[]): string[] => {
  const wrestlers = new Set<string>();
  
  sources.forEach(source => {
    const content = `${source.title} ${source.content_snippet}`.toLowerCase();
    WRESTLER_KEYWORDS.forEach(wrestler => {
      if (content.includes(wrestler.toLowerCase())) {
        wrestlers.add(wrestler);
      }
    });
  });
  
  return Array.from(wrestlers).slice(0, 5);
};
