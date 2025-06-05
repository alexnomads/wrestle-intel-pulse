
import { useQuery } from '@tanstack/react-query';
import { useRSSFeeds, useRedditPosts } from './useWrestlingData';
import {
  detectStorylinesFromNews,
  calculateWrestlerMomentum,
  generateTrendingTopics,
  performIntelligentSearch,
  type StorylineAnalysis,
  type WrestlerMomentum,
  type TrendingTopic
} from '@/services/advancedAnalyticsService';

export const useStorylineAnalysis = () => {
  const { data: newsItems = [] } = useRSSFeeds();
  
  return useQuery({
    queryKey: ['storyline-analysis', newsItems.length],
    queryFn: () => detectStorylinesFromNews(newsItems),
    enabled: newsItems.length > 0,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

export const useWrestlerMomentumAnalysis = () => {
  const { data: newsItems = [] } = useRSSFeeds();
  const { data: redditPosts = [] } = useRedditPosts();
  
  return useQuery({
    queryKey: ['wrestler-momentum', newsItems.length, redditPosts.length],
    queryFn: () => calculateWrestlerMomentum(newsItems, redditPosts),
    enabled: newsItems.length > 0 || redditPosts.length > 0,
    staleTime: 15 * 60 * 1000, // 15 minutes
  });
};

export const useAdvancedTrendingTopics = () => {
  const { data: newsItems = [] } = useRSSFeeds();
  const { data: redditPosts = [] } = useRedditPosts();
  
  return useQuery({
    queryKey: ['advanced-trending-topics', newsItems.length, redditPosts.length],
    queryFn: () => generateTrendingTopics(newsItems, redditPosts),
    enabled: newsItems.length > 0 || redditPosts.length > 0,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

export const useIntelligentSearch = (query: string) => {
  const { data: newsItems = [] } = useRSSFeeds();
  const { data: redditPosts = [] } = useRedditPosts();
  
  return useQuery({
    queryKey: ['intelligent-search', query, newsItems.length, redditPosts.length],
    queryFn: () => performIntelligentSearch(query, newsItems, redditPosts),
    enabled: query.length > 2 && (newsItems.length > 0 || redditPosts.length > 0),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useRealTimeAnalytics = () => {
  const storylines = useStorylineAnalysis();
  const momentum = useWrestlerMomentumAnalysis();
  const topics = useAdvancedTrendingTopics();
  
  return {
    storylines: storylines.data || [],
    wrestlerMomentum: momentum.data || [],
    trendingTopics: topics.data || [],
    isLoading: storylines.isLoading || momentum.isLoading || topics.isLoading,
    error: storylines.error || momentum.error || topics.error,
    refetchAll: () => {
      storylines.refetch();
      momentum.refetch();
      topics.refetch();
    }
  };
};
