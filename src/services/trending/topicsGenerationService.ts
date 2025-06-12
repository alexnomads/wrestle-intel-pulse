
import { NewsItem, RedditPost, analyzeSentiment, extractWrestlerMentions } from '../wrestlingDataService';
import { TrendingTopic } from './types';

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
