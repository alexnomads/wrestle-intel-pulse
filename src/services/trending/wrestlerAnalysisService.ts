
import { NewsItem, RedditPost, analyzeSentiment, extractWrestlerMentions } from '../wrestlingDataService';
import { TrendingWrestler } from './types';

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
        if (sentiment.score > 0.7) {
          stats.reasons.push('Positive media coverage');
        } else if (sentiment.score < 0.3) {
          stats.reasons.push('Negative media coverage');
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
