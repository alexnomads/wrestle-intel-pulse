
import { NewsItem, RedditPost } from './wrestlingDataService';
import { getAllWrestlers, Wrestler, Promotion } from './wrestlerService';

export interface TrendingWrestler {
  wrestler: Wrestler;
  promotion: Promotion;
  mentions: number;
  sentiment: number;
  trend: 'up' | 'down' | 'stable';
  reasons: string[];
  newsArticles: NewsItem[];
  redditPosts: RedditPost[];
}

export interface TrendingTopic {
  title: string;
  mentions: number;
  sentiment: number;
  keywords: string[];
  relatedWrestlers: string[];
  sources: { type: 'news' | 'reddit'; item: NewsItem | RedditPost }[];
}

export const analyzeTrendingWrestlers = (
  newsItems: NewsItem[],
  redditPosts: RedditPost[]
): TrendingWrestler[] => {
  const allWrestlers = getAllWrestlers();
  const wrestlerStats: Map<string, TrendingWrestler> = new Map();

  // Initialize wrestler stats
  allWrestlers.forEach(({ promotion, wrestler }) => {
    wrestlerStats.set(wrestler.id, {
      wrestler,
      promotion,
      mentions: 0,
      sentiment: 0.5,
      trend: 'stable',
      reasons: [],
      newsArticles: [],
      redditPosts: []
    });
  });

  // Analyze news items for wrestler mentions
  newsItems.forEach(newsItem => {
    allWrestlers.forEach(({ wrestler }) => {
      const isWrestlerMentioned = 
        newsItem.title.toLowerCase().includes(wrestler.name.toLowerCase()) ||
        newsItem.contentSnippet.toLowerCase().includes(wrestler.name.toLowerCase());

      if (isWrestlerMentioned) {
        const stats = wrestlerStats.get(wrestler.id)!;
        stats.mentions++;
        stats.newsArticles.push(newsItem);
        
        // Simple sentiment analysis based on keywords
        const positiveWords = ['champion', 'victory', 'win', 'success', 'return', 'debut'];
        const negativeWords = ['injury', 'lose', 'defeat', 'suspended', 'controversy'];
        
        const content = `${newsItem.title} ${newsItem.contentSnippet}`.toLowerCase();
        const positiveScore = positiveWords.filter(word => content.includes(word)).length;
        const negativeScore = negativeWords.filter(word => content.includes(word)).length;
        
        if (positiveScore > negativeScore) {
          stats.sentiment = Math.min(stats.sentiment + 0.1, 1);
          stats.reasons.push(`Positive news coverage`);
        } else if (negativeScore > positiveScore) {
          stats.sentiment = Math.max(stats.sentiment - 0.1, 0);
          stats.reasons.push(`Negative news coverage`);
        }
      }
    });
  });

  // Analyze Reddit posts for wrestler mentions
  redditPosts.forEach(redditPost => {
    allWrestlers.forEach(({ wrestler }) => {
      const isWrestlerMentioned = 
        redditPost.title.toLowerCase().includes(wrestler.name.toLowerCase()) ||
        redditPost.selftext.toLowerCase().includes(wrestler.name.toLowerCase());

      if (isWrestlerMentioned) {
        const stats = wrestlerStats.get(wrestler.id)!;
        stats.mentions++;
        stats.redditPosts.push(redditPost);
        
        // Factor in Reddit engagement
        if (redditPost.score > 100) {
          stats.sentiment += 0.05;
          stats.reasons.push(`High Reddit engagement (${redditPost.score} upvotes)`);
        }
        
        if (redditPost.num_comments > 50) {
          stats.mentions += Math.floor(redditPost.num_comments / 50);
          stats.reasons.push(`Active Reddit discussion (${redditPost.num_comments} comments)`);
        }
      }
    });
  });

  // Determine trending direction
  wrestlerStats.forEach(stats => {
    if (stats.mentions >= 5) {
      stats.trend = 'up';
    } else if (stats.mentions >= 2) {
      stats.trend = 'stable';
    } else if (stats.mentions === 1) {
      stats.trend = 'down';
    }
    
    // Remove duplicates from reasons
    stats.reasons = [...new Set(stats.reasons)];
  });

  // Return top trending wrestlers
  return Array.from(wrestlerStats.values())
    .filter(stats => stats.mentions > 0)
    .sort((a, b) => b.mentions - a.mentions)
    .slice(0, 10);
};

export const generateTrendingTopics = (
  newsItems: NewsItem[],
  redditPosts: RedditPost[]
): TrendingTopic[] => {
  const topics: TrendingTopic[] = [];
  
  // Predefined wrestling topics to track
  const wrestlingTopics = [
    { keywords: ['cm punk', 'punk'], title: 'CM Punk WWE Return' },
    { keywords: ['aew dynasty', 'dynasty ppv'], title: 'AEW Dynasty PPV' },
    { keywords: ['njpw strong', 'njpw'], title: 'NJPW Strong Tapings' },
    { keywords: ['championship', 'title', 'belt'], title: 'Championship Changes' },
    { keywords: ['injury', 'injured', 'hurt'], title: 'Injury Reports' },
    { keywords: ['debut', 'return', 'comeback'], title: 'Returns & Debuts' },
    { keywords: ['trade', 'transfer', 'signing'], title: 'Roster Moves' }
  ];

  wrestlingTopics.forEach(topicTemplate => {
    let mentions = 0;
    let sentiment = 0.5;
    const sources: { type: 'news' | 'reddit'; item: NewsItem | RedditPost }[] = [];
    const relatedWrestlers: string[] = [];

    // Check news items
    newsItems.forEach(newsItem => {
      const content = `${newsItem.title} ${newsItem.contentSnippet}`.toLowerCase();
      const matchesKeywords = topicTemplate.keywords.some(keyword => 
        content.includes(keyword.toLowerCase())
      );

      if (matchesKeywords) {
        mentions++;
        sources.push({ type: 'news', item: newsItem });
      }
    });

    // Check Reddit posts
    redditPosts.forEach(redditPost => {
      const content = `${redditPost.title} ${redditPost.selftext}`.toLowerCase();
      const matchesKeywords = topicTemplate.keywords.some(keyword => 
        content.includes(keyword.toLowerCase())
      );

      if (matchesKeywords) {
        mentions++;
        sources.push({ type: 'reddit', item: redditPost });
      }
    });

    if (mentions > 0) {
      topics.push({
        title: topicTemplate.title,
        mentions,
        sentiment,
        keywords: topicTemplate.keywords,
        relatedWrestlers,
        sources: sources.slice(0, 5) // Limit to 5 sources per topic
      });
    }
  });

  return topics.sort((a, b) => b.mentions - a.mentions).slice(0, 5);
};
