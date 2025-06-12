
import { NewsItem, RedditPost } from './data/dataTypes';
import { analyzeSentiment, extractWrestlerMentions } from './data/sentimentAnalysisService';

export interface TrendAlert {
  id: string;
  type: 'trend_spike' | 'sentiment_shift' | 'storyline_momentum';
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  timestamp: Date;
  wrestler?: string;
  data: {
    current_value: number;
    previous_value: number;
    change_percentage: number;
    timeframe: string;
  };
}

export interface WrestlerTrend {
  wrestler_name: string;
  current_mentions: number;
  previous_mentions: number;
  mention_change_percentage: number;
  current_sentiment: number;
  previous_sentiment: number;
  sentiment_change: number;
  trending_direction: 'rising' | 'falling' | 'stable';
  momentum_score: number;
  timeframe: '24h' | '7d' | '30d';
}

export interface StorylineMomentum {
  storyline_id: string;
  title: string;
  participants: string[];
  momentum_score: number;
  momentum_direction: 'building' | 'cooling' | 'peaked' | 'declining';
  intensity_change: number;
  fan_engagement_trend: number;
  recent_events: string[];
  predicted_peak: Date | null;
}

// Simulated historical data for trend calculation
const getHistoricalMentions = (wrestlerName: string, timeframe: '24h' | '7d' | '30d'): number => {
  const baselineMap: Record<string, number> = {
    'CM Punk': 45,
    'Roman Reigns': 38,
    'Cody Rhodes': 42,
    'Seth Rollins': 35,
    'Drew McIntyre': 28,
    'Jon Moxley': 25,
    'Kenny Omega': 22,
    'Will Ospreay': 30,
    'Rhea Ripley': 33,
    'Bianca Belair': 29
  };
  
  const baseline = baselineMap[wrestlerName] || 15;
  const variance = Math.random() * 0.4 + 0.8; // 80-120% variance
  
  return Math.round(baseline * variance);
};

const getHistoricalSentiment = (wrestlerName: string): number => {
  // Simulate sentiment history with some realistic patterns
  const sentimentPatterns: Record<string, number> = {
    'CM Punk': 0.72,
    'Roman Reigns': 0.58,
    'Cody Rhodes': 0.78,
    'Seth Rollins': 0.65,
    'Drew McIntyre': 0.69,
    'Jon Moxley': 0.63,
    'Kenny Omega': 0.71,
    'Will Ospreay': 0.76,
    'Rhea Ripley': 0.74,
    'Bianca Belair': 0.68
  };
  
  const baseline = sentimentPatterns[wrestlerName] || 0.55;
  const variance = (Math.random() - 0.5) * 0.2; // ±0.1 variance
  
  return Math.max(0, Math.min(1, baseline + variance));
};

export const analyzeWrestlerTrends = (
  newsItems: NewsItem[],
  redditPosts: RedditPost[],
  timeframe: '24h' | '7d' | '30d' = '24h'
): WrestlerTrend[] => {
  const wrestlerStats = new Map<string, {
    mentions: number;
    sentiments: number[];
  }>();

  // Analyze current mentions and sentiment from news items
  newsItems.forEach(item => {
    const content = `${item.title} ${item.contentSnippet || ''}`;
    const mentions = extractWrestlerMentions(content);
    const sentiment = analyzeSentiment(content);
    
    mentions.forEach(wrestler => {
      const existing = wrestlerStats.get(wrestler) || { mentions: 0, sentiments: [] };
      existing.mentions++;
      existing.sentiments.push(sentiment.score);
      wrestlerStats.set(wrestler, existing);
    });
  });

  // Analyze current mentions and sentiment from reddit posts
  redditPosts.forEach(post => {
    const content = `${post.title} ${post.selftext}`;
    const mentions = extractWrestlerMentions(content);
    const sentiment = analyzeSentiment(content);
    
    mentions.forEach(wrestler => {
      const existing = wrestlerStats.get(wrestler) || { mentions: 0, sentiments: [] };
      existing.mentions++;
      existing.sentiments.push(sentiment.score);
      wrestlerStats.set(wrestler, existing);
    });
  });

  // Calculate trends
  const trends: WrestlerTrend[] = [];
  
  wrestlerStats.forEach((stats, wrestlerName) => {
    const currentMentions = stats.mentions;
    const previousMentions = getHistoricalMentions(wrestlerName, timeframe);
    const mentionChange = ((currentMentions - previousMentions) / previousMentions) * 100;
    
    const currentSentiment = stats.sentiments.length > 0 
      ? stats.sentiments.reduce((sum, s) => sum + s, 0) / stats.sentiments.length 
      : 0.5;
    const previousSentiment = getHistoricalSentiment(wrestlerName);
    const sentimentChange = currentSentiment - previousSentiment;
    
    let trendingDirection: 'rising' | 'falling' | 'stable' = 'stable';
    if (mentionChange > 15) trendingDirection = 'rising';
    else if (mentionChange < -15) trendingDirection = 'falling';
    
    const momentumScore = Math.min(100, Math.max(0, 
      (mentionChange / 2) + (sentimentChange * 50) + 50
    ));

    trends.push({
      wrestler_name: wrestlerName,
      current_mentions: currentMentions,
      previous_mentions: previousMentions,
      mention_change_percentage: Math.round(mentionChange),
      current_sentiment: currentSentiment,
      previous_sentiment: previousSentiment,
      sentiment_change: Math.round(sentimentChange * 100) / 100,
      trending_direction: trendingDirection,
      momentum_score: Math.round(momentumScore),
      timeframe
    });
  });

  return trends
    .filter(trend => trend.current_mentions > 0)
    .sort((a, b) => Math.abs(b.mention_change_percentage) - Math.abs(a.mention_change_percentage))
    .slice(0, 10);
};

export const generateTrendAlerts = (
  trends: WrestlerTrend[],
  storylines: StorylineMomentum[]
): TrendAlert[] => {
  const alerts: TrendAlert[] = [];
  let alertId = 1;

  // Generate mention spike alerts
  trends.forEach(trend => {
    if (Math.abs(trend.mention_change_percentage) > 100) {
      const severity = Math.abs(trend.mention_change_percentage) > 300 ? 'critical' :
                     Math.abs(trend.mention_change_percentage) > 200 ? 'high' : 'medium';
      
      alerts.push({
        id: `alert-${alertId++}`,
        type: 'trend_spike',
        title: `${trend.wrestler_name} Mention ${trend.mention_change_percentage > 0 ? 'Surge' : 'Drop'}`,
        description: `${trend.wrestler_name}'s mentions ${trend.mention_change_percentage > 0 ? 'increased' : 'decreased'} ${Math.abs(trend.mention_change_percentage)}% in ${trend.timeframe}`,
        severity,
        timestamp: new Date(),
        wrestler: trend.wrestler_name,
        data: {
          current_value: trend.current_mentions,
          previous_value: trend.previous_mentions,
          change_percentage: trend.mention_change_percentage,
          timeframe: trend.timeframe
        }
      });
    }

    // Generate sentiment shift alerts
    if (Math.abs(trend.sentiment_change) > 0.2) {
      alerts.push({
        id: `alert-${alertId++}`,
        type: 'sentiment_shift',
        title: `${trend.wrestler_name} Sentiment ${trend.sentiment_change > 0 ? 'Boost' : 'Decline'}`,
        description: `Fan sentiment for ${trend.wrestler_name} has ${trend.sentiment_change > 0 ? 'improved' : 'declined'} significantly`,
        severity: Math.abs(trend.sentiment_change) > 0.3 ? 'high' : 'medium',
        timestamp: new Date(),
        wrestler: trend.wrestler_name,
        data: {
          current_value: Math.round(trend.current_sentiment * 100),
          previous_value: Math.round(trend.previous_sentiment * 100),
          change_percentage: Math.round(trend.sentiment_change * 100),
          timeframe: trend.timeframe
        }
      });
    }
  });

  // Generate storyline momentum alerts
  storylines.forEach(storyline => {
    if (storyline.momentum_score > 80 && storyline.momentum_direction === 'building') {
      alerts.push({
        id: `alert-${alertId++}`,
        type: 'storyline_momentum',
        title: `${storyline.title} Gaining Momentum`,
        description: `Storyline involving ${storyline.participants.join(', ')} is building significant momentum`,
        severity: 'medium',
        timestamp: new Date(),
        data: {
          current_value: storyline.momentum_score,
          previous_value: storyline.momentum_score - storyline.intensity_change,
          change_percentage: storyline.intensity_change,
          timeframe: '24h'
        }
      });
    }
  });

  return alerts.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
};

export const trackStorylineMomentum = (
  newsItems: NewsItem[],
  redditPosts: RedditPost[]
): StorylineMomentum[] => {
  const storylines: StorylineMomentum[] = [
    {
      storyline_id: 'punk-drew-feud',
      title: 'CM Punk vs Drew McIntyre',
      participants: ['CM Punk', 'Drew McIntyre'],
      momentum_score: 85,
      momentum_direction: 'building',
      intensity_change: 15,
      fan_engagement_trend: 12,
      recent_events: ['Backstage confrontation', 'Social media exchange'],
      predicted_peak: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days from now
    },
    {
      storyline_id: 'rhea-dominance',
      title: 'Rhea Ripley Championship Reign',
      participants: ['Rhea Ripley', 'Liv Morgan', 'Raquel Rodriguez'],
      momentum_score: 72,
      momentum_direction: 'peaked',
      intensity_change: -5,
      fan_engagement_trend: -3,
      recent_events: ['Title defense', 'New challenger emerges'],
      predicted_peak: null
    },
    {
      storyline_id: 'cody-title-defense',
      title: 'Cody Rhodes Title Challenges',
      participants: ['Cody Rhodes', 'Kevin Owens', 'Randy Orton'],
      momentum_score: 68,
      momentum_direction: 'cooling',
      intensity_change: -8,
      fan_engagement_trend: -6,
      recent_events: ['Successful title defense', 'Post-match segment'],
      predicted_peak: null
    }
  ];

  // Enhance with real data analysis
  const allContent = [
    ...newsItems.map(item => ({ content: `${item.title} ${item.contentSnippet || ''}`, timestamp: new Date(item.pubDate) })),
    ...redditPosts.map(post => ({ content: `${post.title} ${post.selftext}`, timestamp: new Date(post.created_utc * 1000) }))
  ];

  storylines.forEach(storyline => {
    let mentionCount = 0;
    let totalSentiment = 0;
    
    allContent.forEach(({ content }) => {
      const hasMention = storyline.participants.some(participant => 
        content.toLowerCase().includes(participant.toLowerCase())
      );
      
      if (hasMention) {
        mentionCount++;
        const sentiment = analyzeSentiment(content);
        totalSentiment += sentiment.score;
      }
    });

    if (mentionCount > 0) {
      const avgSentiment = totalSentiment / mentionCount;
      storyline.momentum_score = Math.min(100, storyline.momentum_score + (avgSentiment - 0.5) * 20);
      storyline.fan_engagement_trend = mentionCount > 10 ? 8 : mentionCount > 5 ? 4 : 0;
    }
  });

  return storylines.sort((a, b) => b.momentum_score - a.momentum_score);
};
