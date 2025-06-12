
import { NewsItem, RedditPost } from '../wrestlingDataService';

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
