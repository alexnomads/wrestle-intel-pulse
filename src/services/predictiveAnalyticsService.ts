
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

export const analyzeWrestlerTrends = (
  newsItems: NewsItem[],
  redditPosts: RedditPost[],
  timeframe: '24h' | '7d' | '30d' = '24h'
): WrestlerTrend[] => {
  const wrestlerStats = new Map<string, {
    mentions: number;
    sentiments: number[];
    timestamps: Date[];
  }>();

  // Get cutoff time based on timeframe
  const now = new Date();
  const cutoffTime = new Date();
  switch (timeframe) {
    case '24h':
      cutoffTime.setHours(now.getHours() - 24);
      break;
    case '7d':
      cutoffTime.setDate(now.getDate() - 7);
      break;
    case '30d':
      cutoffTime.setDate(now.getDate() - 30);
      break;
  }

  // Analyze current mentions and sentiment from news items
  newsItems.forEach(item => {
    const itemDate = new Date(item.pubDate);
    if (itemDate >= cutoffTime) {
      const content = `${item.title} ${item.contentSnippet || ''}`;
      const mentions = extractWrestlerMentions(content);
      const sentiment = analyzeSentiment(content);
      
      mentions.forEach(wrestler => {
        const existing = wrestlerStats.get(wrestler) || { mentions: 0, sentiments: [], timestamps: [] };
        existing.mentions++;
        existing.sentiments.push(sentiment.score);
        existing.timestamps.push(itemDate);
        wrestlerStats.set(wrestler, existing);
      });
    }
  });

  // Analyze current mentions and sentiment from reddit posts
  redditPosts.forEach(post => {
    const postDate = new Date(post.created_utc * 1000);
    if (postDate >= cutoffTime) {
      const content = `${post.title} ${post.selftext}`;
      const mentions = extractWrestlerMentions(content);
      const sentiment = analyzeSentiment(content);
      
      mentions.forEach(wrestler => {
        const existing = wrestlerStats.get(wrestler) || { mentions: 0, sentiments: [], timestamps: [] };
        existing.mentions++;
        existing.sentiments.push(sentiment.score);
        existing.timestamps.push(postDate);
        wrestlerStats.set(wrestler, existing);
      });
    }
  });

  // Calculate trends based on real data only
  const trends: WrestlerTrend[] = [];
  
  wrestlerStats.forEach((stats, wrestlerName) => {
    // Split data into current and previous periods for comparison
    const midpoint = new Date(cutoffTime.getTime() + (now.getTime() - cutoffTime.getTime()) / 2);
    
    const currentPeriodMentions = stats.timestamps.filter(t => t >= midpoint).length;
    const previousPeriodMentions = stats.timestamps.filter(t => t < midpoint).length;
    
    const currentPeriodSentiments = stats.sentiments.filter((_, index) => stats.timestamps[index] >= midpoint);
    const previousPeriodSentiments = stats.sentiments.filter((_, index) => stats.timestamps[index] < midpoint);
    
    const currentSentiment = currentPeriodSentiments.length > 0 
      ? currentPeriodSentiments.reduce((sum, s) => sum + s, 0) / currentPeriodSentiments.length 
      : 0;
    const previousSentiment = previousPeriodSentiments.length > 0 
      ? previousPeriodSentiments.reduce((sum, s) => sum + s, 0) / previousPeriodSentiments.length 
      : 0;
    
    // Only calculate trends if we have data from both periods
    if (previousPeriodMentions > 0 && currentPeriodMentions >= 0) {
      const mentionChange = ((currentPeriodMentions - previousPeriodMentions) / previousPeriodMentions) * 100;
      const sentimentChange = currentSentiment - previousSentiment;
      
      let trendingDirection: 'rising' | 'falling' | 'stable' = 'stable';
      if (mentionChange > 15) trendingDirection = 'rising';
      else if (mentionChange < -15) trendingDirection = 'falling';
      
      const momentumScore = Math.min(100, Math.max(0, 
        (mentionChange / 2) + (sentimentChange * 50) + 50
      ));

      trends.push({
        wrestler_name: wrestlerName,
        current_mentions: currentPeriodMentions,
        previous_mentions: previousPeriodMentions,
        mention_change_percentage: Math.round(mentionChange),
        current_sentiment: currentSentiment,
        previous_sentiment: previousSentiment,
        sentiment_change: Math.round(sentimentChange * 100) / 100,
        trending_direction: trendingDirection,
        momentum_score: Math.round(momentumScore),
        timeframe
      });
    }
  });

  return trends
    .filter(trend => trend.current_mentions > 0 || trend.previous_mentions > 0)
    .sort((a, b) => Math.abs(b.mention_change_percentage) - Math.abs(a.mention_change_percentage))
    .slice(0, 10);
};

export const generateTrendAlerts = (
  trends: WrestlerTrend[],
  storylines: StorylineMomentum[]
): TrendAlert[] => {
  const alerts: TrendAlert[] = [];
  let alertId = 1;

  // Generate mention spike alerts only for significant changes with real data
  trends.forEach(trend => {
    if (Math.abs(trend.mention_change_percentage) > 50 && trend.previous_mentions > 0) {
      const severity = Math.abs(trend.mention_change_percentage) > 200 ? 'critical' :
                     Math.abs(trend.mention_change_percentage) > 100 ? 'high' : 'medium';
      
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

    // Generate sentiment shift alerts only for significant changes
    if (Math.abs(trend.sentiment_change) > 0.15 && trend.previous_mentions > 0) {
      alerts.push({
        id: `alert-${alertId++}`,
        type: 'sentiment_shift',
        title: `${trend.wrestler_name} Sentiment ${trend.sentiment_change > 0 ? 'Boost' : 'Decline'}`,
        description: `Fan sentiment for ${trend.wrestler_name} has ${trend.sentiment_change > 0 ? 'improved' : 'declined'} significantly`,
        severity: Math.abs(trend.sentiment_change) > 0.25 ? 'high' : 'medium',
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

  return alerts.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
};

export const trackStorylineMomentum = (
  newsItems: NewsItem[],
  redditPosts: RedditPost[]
): StorylineMomentum[] => {
  const storylineMap = new Map<string, {
    mentions: number;
    sentiment: number;
    participants: Set<string>;
    recentEvents: string[];
  }>();

  // Get data from last 7 days only
  const cutoffTime = new Date();
  cutoffTime.setDate(cutoffTime.getDate() - 7);

  // Analyze storylines from real data
  const allContent = [
    ...newsItems
      .filter(item => new Date(item.pubDate) >= cutoffTime)
      .map(item => ({ 
        content: `${item.title} ${item.contentSnippet || ''}`, 
        timestamp: new Date(item.pubDate),
        title: item.title
      })),
    ...redditPosts
      .filter(post => new Date(post.created_utc * 1000) >= cutoffTime)
      .map(post => ({ 
        content: `${post.title} ${post.selftext}`, 
        timestamp: new Date(post.created_utc * 1000),
        title: post.title
      }))
  ];

  // Detect storylines from mentions and keywords
  allContent.forEach(({ content, title }) => {
    const mentions = extractWrestlerMentions(content);
    const sentiment = analyzeSentiment(content);
    
    // Look for storyline indicators
    const hasStorylineKeywords = ['vs', 'versus', 'feud', 'rivalry', 'championship', 'title', 'match', 'fight'].some(
      keyword => content.toLowerCase().includes(keyword)
    );
    
    if (mentions.length >= 2 && hasStorylineKeywords) {
      const storylineKey = mentions.slice(0, 2).sort().join(' vs ');
      const existing = storylineMap.get(storylineKey) || {
        mentions: 0,
        sentiment: 0,
        participants: new Set(),
        recentEvents: []
      };
      
      existing.mentions++;
      existing.sentiment += sentiment.score;
      mentions.forEach(wrestler => existing.participants.add(wrestler));
      existing.recentEvents.push(title);
      
      storylineMap.set(storylineKey, existing);
    }
  });

  // Convert to storyline momentum objects
  const storylines: StorylineMomentum[] = [];
  
  storylineMap.forEach((data, storylineKey) => {
    if (data.mentions >= 2) { // Only include storylines with multiple mentions
      const avgSentiment = data.sentiment / data.mentions;
      const momentumScore = Math.min(100, Math.max(0, (data.mentions * 10) + (avgSentiment * 50)));
      
      let momentumDirection: 'building' | 'cooling' | 'peaked' | 'declining' = 'building';
      if (momentumScore < 30) momentumDirection = 'cooling';
      else if (momentumScore > 80) momentumDirection = 'peaked';
      
      storylines.push({
        storyline_id: storylineKey.toLowerCase().replace(/\s+/g, '-'),
        title: storylineKey,
        participants: Array.from(data.participants),
        momentum_score: Math.round(momentumScore),
        momentum_direction: momentumDirection,
        intensity_change: data.mentions,
        fan_engagement_trend: Math.round(avgSentiment * 100),
        recent_events: data.recentEvents.slice(0, 3),
        predicted_peak: momentumDirection === 'building' ? new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) : null
      });
    }
  });

  return storylines
    .filter(storyline => storyline.participants.length >= 2)
    .sort((a, b) => b.momentum_score - a.momentum_score)
    .slice(0, 5);
};
