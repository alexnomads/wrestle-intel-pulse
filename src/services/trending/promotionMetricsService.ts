
import { NewsItem, RedditPost, analyzeSentiment, extractWrestlerMentions } from '../wrestlingDataService';
import { PromotionMetrics } from './types';

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
