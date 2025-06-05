
import { NewsItem, RedditPost } from '../wrestlingDataService';

export interface TrendingTopic {
  title: string;
  mentions: number;
  sentiment: number;
  growth_rate: number;
  keywords: string[];
  related_wrestlers: string[];
  time_period: string;
}

// Generate trending topics from combined data
export const generateTrendingTopics = async (
  newsArticles: NewsItem[],
  redditPosts: RedditPost[]
): Promise<TrendingTopic[]> => {
  const topicMap: Map<string, TrendingTopic> = new Map();
  
  // Define wrestling topic categories
  const topicCategories = [
    { keywords: ['championship', 'title', 'belt', 'champion'], title: 'Championship Scene' },
    { keywords: ['cm punk', 'punk'], title: 'CM Punk' },
    { keywords: ['roman reigns', 'tribal chief'], title: 'Roman Reigns' },
    { keywords: ['cody rhodes', 'american nightmare'], title: 'Cody Rhodes' },
    { keywords: ['wwe raw', 'monday night raw'], title: 'WWE Raw' },
    { keywords: ['aew dynamite', 'wednesday night'], title: 'AEW Dynamite' },
    { keywords: ['nxt', 'black and gold'], title: 'WWE NXT' },
    { keywords: ['injury', 'injured', 'hurt'], title: 'Injury Reports' },
    { keywords: ['debut', 'return', 'comeback'], title: 'Returns & Debuts' },
    { keywords: ['royal rumble', 'wrestlemania', 'summerslam'], title: 'WWE Premium Events' },
    { keywords: ['all out', 'revolution', 'double or nothing'], title: 'AEW Pay-Per-Views' },
    { keywords: ['rating', 'viewership', 'numbers'], title: 'TV Ratings' },
    { keywords: ['contract', 'signing', 'deal'], title: 'Contract News' }
  ];

  // Analyze news articles
  newsArticles.forEach(article => {
    const content = `${article.title} ${article.contentSnippet || ''}`.toLowerCase();
    
    topicCategories.forEach(category => {
      const hasKeywords = category.keywords.some(keyword => 
        content.includes(keyword.toLowerCase())
      );
      
      if (hasKeywords) {
        if (!topicMap.has(category.title)) {
          topicMap.set(category.title, {
            title: category.title,
            mentions: 0,
            sentiment: 0.5,
            growth_rate: 0,
            keywords: category.keywords,
            related_wrestlers: [],
            time_period: 'last 7 days'
          });
        }
        
        const topic = topicMap.get(category.title)!;
        topic.mentions++;
        
        // Simple sentiment calculation
        let sentiment = 0.5;
        if (content.includes('amazing') || content.includes('great')) sentiment += 0.2;
        if (content.includes('terrible') || content.includes('boring')) sentiment -= 0.2;
        
        topic.sentiment = (topic.sentiment + sentiment) / 2;
        topic.growth_rate += 5; // Simulate growth based on mentions
        
        // Extract wrestler names
        const wrestlerPattern = /([A-Z][a-z]+ [A-Z][a-z]+|CM Punk|LA Knight)/g;
        const wrestlers = content.match(wrestlerPattern) || [];
        topic.related_wrestlers = [...new Set([...topic.related_wrestlers, ...wrestlers])].slice(0, 5);
      }
    });
  });

  // Analyze Reddit posts
  redditPosts.forEach(post => {
    const content = `${post.title} ${post.selftext}`.toLowerCase();
    
    topicCategories.forEach(category => {
      const hasKeywords = category.keywords.some(keyword => 
        content.includes(keyword.toLowerCase())
      );
      
      if (hasKeywords) {
        if (!topicMap.has(category.title)) {
          topicMap.set(category.title, {
            title: category.title,
            mentions: 0,
            sentiment: 0.5,
            growth_rate: 0,
            keywords: category.keywords,
            related_wrestlers: [],
            time_period: 'last 7 days'
          });
        }
        
        const topic = topicMap.get(category.title)!;
        topic.mentions++;
        
        // Weight by Reddit engagement
        const engagementWeight = Math.min(post.score / 100, 2);
        topic.growth_rate += engagementWeight * 10;
        
        // Extract wrestler names
        const wrestlerPattern = /([A-Z][a-z]+ [A-Z][a-z]+|CM Punk|LA Knight)/g;
        const wrestlers = content.match(wrestlerPattern) || [];
        topic.related_wrestlers = [...new Set([...topic.related_wrestlers, ...wrestlers])].slice(0, 5);
      }
    });
  });

  return Array.from(topicMap.values())
    .filter(topic => topic.mentions > 0)
    .sort((a, b) => b.mentions - a.mentions)
    .slice(0, 10);
};
