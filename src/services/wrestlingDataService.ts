
// Re-export all types and functions from the modular data services
export type { 
  NewsItem, 
  RedditPost, 
  WrestlenomicsData, 
  TVRating, 
  TicketData, 
  ELORanking 
} from './data/dataTypes';

export { fetchRSSFeeds } from './data/rssService';
export { fetchRedditPosts } from './data/redditService';
export { scrapeWrestlenomicsData } from './data/wrestlenomicsDataService';
export { analyzeSentiment, extractWrestlerMentions } from './data/sentimentAnalysisService';

// Export enhanced comprehensive services
export { 
  fetchComprehensiveWrestlingNews, 
  fetchComprehensiveRedditPosts 
} from './data/enhancedRssService';
