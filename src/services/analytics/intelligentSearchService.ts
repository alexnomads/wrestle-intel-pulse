
import { NewsItem, RedditPost } from '../wrestlingDataService';
import { supabase } from '@/integrations/supabase/client';
import { StorylineAnalysis, detectStorylinesFromNews } from './storylineAnalysisService';
import { TrendingTopic, generateTrendingTopics } from './trendingTopicsService';

// Enhanced search functionality
export const performIntelligentSearch = async (
  query: string,
  newsArticles: NewsItem[],
  redditPosts: RedditPost[]
): Promise<{
  news: NewsItem[];
  reddit: RedditPost[];
  wrestlers: any[];
  storylines: StorylineAnalysis[];
  topics: TrendingTopic[];
}> => {
  const searchTerm = query.toLowerCase();
  
  // Search news articles
  const relevantNews = newsArticles.filter(article => 
    article.title.toLowerCase().includes(searchTerm) ||
    (article.contentSnippet && article.contentSnippet.toLowerCase().includes(searchTerm))
  ).slice(0, 10);

  // Search Reddit posts
  const relevantReddit = redditPosts.filter(post => 
    post.title.toLowerCase().includes(searchTerm) ||
    post.selftext.toLowerCase().includes(searchTerm)
  ).slice(0, 10);

  // Search wrestlers from database
  const { data: wrestlers = [] } = await supabase
    .from('wrestlers')
    .select('*')
    .or(`name.ilike.%${query}%,real_name.ilike.%${query}%,championship_title.ilike.%${query}%`)
    .limit(10);

  // Generate storylines and topics based on search
  const storylines = await detectStorylinesFromNews(relevantNews);
  const topics = await generateTrendingTopics(relevantNews, relevantReddit);

  return {
    news: relevantNews,
    reddit: relevantReddit,
    wrestlers,
    storylines: storylines.filter(s => 
      s.title.toLowerCase().includes(searchTerm) ||
      s.participants.some(p => p.toLowerCase().includes(searchTerm))
    ),
    topics: topics.filter(t => 
      t.title.toLowerCase().includes(searchTerm) ||
      t.keywords.some(k => k.toLowerCase().includes(searchTerm))
    )
  };
};
