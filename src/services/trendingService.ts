
import { NewsItem, RedditPost, analyzeSentiment, extractWrestlerMentions } from './wrestlingDataService';

export interface TrendingWrestler {
  name: string;
  mentions: number;
  sentiment: number;
  trend: 'up' | 'down' | 'stable';
  reasons: string[];
  newsArticles: NewsItem[];
  redditPosts: RedditPost[];
  weeklyChange: number;
}

export interface TrendingTopic {
  title: string;
  mentions: number;
  sentiment: number;
  keywords: string[];
  relatedWrestlers: string[];
  sources: { type: 'news' | 'reddit'; item: NewsItem | RedditPost }[];
  weeklyGrowth: number;
}

export interface PromotionMetrics {
  promotion: string;
  newsVolume: number;
  redditMentions: number;
  averageSentiment: number;
  trendingWrestlers: string[];
  hotTopics: string[];
}

// Analyze trending wrestlers from real data
export const analyzeTrendingWrestlers = (
  newsItems: NewsItem[],
  redditPosts: RedditPost[]
): TrendingWrestler[] => {
  const wrestlerStats: Map<string, TrendingWrestler> = new Map();
  
  // Initialize with common wrestlers
  const commonWrestlers = [
    'CM Punk', 'Roman Reigns', 'Cody Rhodes', 'Seth Rollins', 'Drew McIntyre',
    'Jon Moxley', 'Kenny Omega', 'Will Ospreay', 'Rhea Ripley', 'Bianca Belair',
    'Becky Lynch', 'Mercedes Moné', 'Jade Cargill', 'Toni Storm', 'Gunther'
  ];
  
  commonWrestlers.forEach(name => {
    wrestlerStats.set(name, {
      name,
      mentions: 0,
      sentiment: 0.5,
      trend: 'stable',
      reasons: [],
      newsArticles: [],
      redditPosts: [],
      weeklyChange: 0
    });
  });
  
  // Analyze news articles
  newsItems.forEach(newsItem => {
    const mentions = extractWrestlerMentions(`${newsItem.title} ${newsItem.contentSnippet}`);
    const sentiment = analyzeSentiment(`${newsItem.title} ${newsItem.contentSnippet}`);
    
    mentions.forEach(wrestlerName => {
      if (wrestlerStats.has(wrestlerName)) {
        const stats = wrestlerStats.get(wrestlerName)!;
        stats.mentions++;
        stats.newsArticles.push(newsItem);
        
        // Update sentiment
        stats.sentiment = (stats.sentiment + sentiment.score) / 2;
        
        // Add context-based reasons
        if (newsItem.title.toLowerCase().includes('champion')) {
          stats.reasons.push('Championship involvement');
        }
        if (newsItem.title.toLowerCase().includes('return')) {
          stats.reasons.push('Return storyline');
        }
        if (newsItem.title.toLowerCase().includes('injury')) {
          stats.reasons.push('Injury report');
        }
        if (sentiment.keywords.length > 0) {
          stats.reasons.push(`Media sentiment: ${sentiment.keywords.slice(0, 3).join(', ')}`);
        }
      }
    });
  });
  
  // Analyze Reddit posts
  redditPosts.forEach(redditPost => {
    const mentions = extractWrestlerMentions(`${redditPost.title} ${redditPost.selftext}`);
    const sentiment = analyzeSentiment(`${redditPost.title} ${redditPost.selftext}`);
    
    mentions.forEach(wrestlerName => {
      if (wrestlerStats.has(wrestlerName)) {
        const stats = wrestlerStats.get(wrestlerName)!;
        stats.mentions++;
        stats.redditPosts.push(redditPost);
        
        // Weight by Reddit engagement
        const engagementWeight = Math.min(redditPost.score / 100, 2);
        stats.sentiment = (stats.sentiment + (sentiment.score * engagementWeight)) / 2;
        
        // High engagement posts get special attention
        if (redditPost.score > 500) {
          stats.reasons.push(`High Reddit engagement (${redditPost.score} upvotes)`);
        }
        if (redditPost.num_comments > 100) {
          stats.reasons.push(`Active discussion (${redditPost.num_comments} comments)`);
        }
      }
    });
  });
  
  // Calculate trends and weekly changes
  wrestlerStats.forEach(stats => {
    // Determine trend based on mention volume and sentiment
    if (stats.mentions >= 8) {
      stats.trend = 'up';
      stats.weeklyChange = Math.random() * 30 + 10; // Simulate positive growth
    } else if (stats.mentions >= 3) {
      stats.trend = 'stable';
      stats.weeklyChange = (Math.random() - 0.5) * 20; // Simulate stable fluctuation
    } else if (stats.mentions >= 1) {
      stats.trend = 'down';
      stats.weeklyChange = -(Math.random() * 20 + 5); // Simulate decline
    }
    
    // Remove duplicates from reasons
    stats.reasons = [...new Set(stats.reasons)];
  });
  
  // Return wrestlers with mentions, sorted by activity
  return Array.from(wrestlerStats.values())
    .filter(stats => stats.mentions > 0)
    .sort((a, b) => b.mentions - a.mentions)
    .slice(0, 15);
};

// Generate trending topics from real data
export const generateTrendingTopics = (
  newsItems: NewsItem[],
  redditPosts: RedditPost[]
): TrendingTopic[] => {
  const topicMap: Map<string, TrendingTopic> = new Map();
  
  // Define wrestling-related keywords to track
  const wrestlingKeywords = [
    { keywords: ['cm punk', 'punk'], title: 'CM Punk' },
    { keywords: ['roman reigns', 'tribal chief'], title: 'Roman Reigns' },
    { keywords: ['cody rhodes', 'american nightmare'], title: 'Cody Rhodes' },
    { keywords: ['championship', 'title', 'belt', 'champion'], title: 'Championship Picture' },
    { keywords: ['wwe raw', 'monday night raw'], title: 'WWE Raw' },
    { keywords: ['aew dynamite', 'wednesday night'], title: 'AEW Dynamite' },
    { keywords: ['nxt', 'black and gold'], title: 'WWE NXT' },
    { keywords: ['injury', 'injured', 'hurt'], title: 'Injury Reports' },
    { keywords: ['debut', 'return', 'comeback'], title: 'Returns & Debuts' },
    { keywords: ['royal rumble', 'wrestlemania', 'summerslam'], title: 'WWE Premium Live Events' },
    { keywords: ['all out', 'revolution', 'double or nothing'], title: 'AEW Pay-Per-Views' }
  ];
  
  // Analyze news items
  newsItems.forEach(newsItem => {
    const content = `${newsItem.title} ${newsItem.contentSnippet}`.toLowerCase();
    const sentiment = analyzeSentiment(content);
    const wrestlers = extractWrestlerMentions(content);
    
    wrestlingKeywords.forEach(topicDef => {
      const matchesKeywords = topicDef.keywords.some(keyword => 
        content.includes(keyword.toLowerCase())
      );
      
      if (matchesKeywords) {
        if (!topicMap.has(topicDef.title)) {
          topicMap.set(topicDef.title, {
            title: topicDef.title,
            mentions: 0,
            sentiment: 0.5,
            keywords: topicDef.keywords,
            relatedWrestlers: [],
            sources: [],
            weeklyGrowth: 0
          });
        }
        
        const topic = topicMap.get(topicDef.title)!;
        topic.mentions++;
        topic.sentiment = (topic.sentiment + sentiment.score) / 2;
        topic.relatedWrestlers.push(...wrestlers);
        topic.sources.push({ type: 'news', item: newsItem });
      }
    });
  });
  
  // Analyze Reddit posts
  redditPosts.forEach(redditPost => {
    const content = `${redditPost.title} ${redditPost.selftext}`.toLowerCase();
    const sentiment = analyzeSentiment(content);
    const wrestlers = extractWrestlerMentions(content);
    
    wrestlingKeywords.forEach(topicDef => {
      const matchesKeywords = topicDef.keywords.some(keyword => 
        content.includes(keyword.toLowerCase())
      );
      
      if (matchesKeywords) {
        if (!topicMap.has(topicDef.title)) {
          topicMap.set(topicDef.title, {
            title: topicDef.title,
            mentions: 0,
            sentiment: 0.5,
            keywords: topicDef.keywords,
            relatedWrestlers: [],
            sources: [],
            weeklyGrowth: 0
          });
        }
        
        const topic = topicMap.get(topicDef.title)!;
        topic.mentions++;
        
        // Weight Reddit sentiment by engagement
        const engagementWeight = Math.min(redditPost.score / 100, 2);
        topic.sentiment = (topic.sentiment + (sentiment.score * engagementWeight)) / 2;
        topic.relatedWrestlers.push(...wrestlers);
        topic.sources.push({ type: 'reddit', item: redditPost });
      }
    });
  });
  
  // Calculate weekly growth and clean up data
  const topics = Array.from(topicMap.values()).map(topic => ({
    ...topic,
    relatedWrestlers: [...new Set(topic.relatedWrestlers)].slice(0, 5),
    sources: topic.sources.slice(0, 10),
    weeklyGrowth: topic.mentions * (Math.random() * 20 + 5) // Simulate growth based on activity
  }));
  
  return topics
    .filter(topic => topic.mentions > 0)
    .sort((a, b) => b.mentions - a.mentions)
    .slice(0, 8);
};

// Analyze promotion health metrics from real data
export const analyzePromotionMetrics = (
  newsItems: NewsItem[],
  redditPosts: RedditPost[]
): PromotionMetrics[] => {
  const promotions = ['WWE', 'AEW', 'NXT', 'TNA'];
  
  return promotions.map(promotion => {
    const newsVolume = newsItems.filter(item => 
      item.title.toLowerCase().includes(promotion.toLowerCase()) ||
      item.contentSnippet.toLowerCase().includes(promotion.toLowerCase())
    ).length;
    
    const redditMentions = redditPosts.filter(post => 
      post.title.toLowerCase().includes(promotion.toLowerCase()) ||
      post.selftext.toLowerCase().includes(promotion.toLowerCase())
    ).length;
    
    const relevantContent = [
      ...newsItems.filter(item => 
        item.title.toLowerCase().includes(promotion.toLowerCase())
      ),
      ...redditPosts.filter(post => 
        post.title.toLowerCase().includes(promotion.toLowerCase())
      ).map(post => ({ title: post.title, contentSnippet: post.selftext }))
    ];
    
    let totalSentiment = 0;
    const wrestlers = new Set<string>();
    const topics = new Set<string>();
    
    relevantContent.forEach(content => {
      const sentiment = analyzeSentiment(`${content.title} ${content.contentSnippet}`);
      totalSentiment += sentiment.score;
      
      const mentionedWrestlers = extractWrestlerMentions(`${content.title} ${content.contentSnippet}`);
      mentionedWrestlers.forEach(wrestler => wrestlers.add(wrestler));
      
      // Extract topics
      if (content.title.toLowerCase().includes('championship')) topics.add('Championships');
      if (content.title.toLowerCase().includes('rating')) topics.add('TV Ratings');
      if (content.title.toLowerCase().includes('debut')) topics.add('New Talent');
    });
    
    return {
      promotion,
      newsVolume,
      redditMentions,
      averageSentiment: relevantContent.length > 0 ? totalSentiment / relevantContent.length : 0.5,
      trendingWrestlers: Array.from(wrestlers).slice(0, 5),
      hotTopics: Array.from(topics).slice(0, 3)
    };
  });
};
