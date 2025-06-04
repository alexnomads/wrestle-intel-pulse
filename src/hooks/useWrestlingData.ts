
import { useQuery } from '@tanstack/react-query';
import { 
  fetchRSSFeeds, 
  fetchRedditPosts, 
  scrapeWrestlenomicsData,
  NewsItem, 
  RedditPost,
  WrestlenomicsData
} from '@/services/wrestlingDataService';

export const useRSSFeeds = () => {
  return useQuery({
    queryKey: ['rss-feeds'],
    queryFn: fetchRSSFeeds,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 15 * 60 * 1000, // Refetch every 15 minutes
    retry: 3,
  });
};

export const useRedditPosts = () => {
  return useQuery({
    queryKey: ['reddit-posts'],
    queryFn: fetchRedditPosts,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 15 * 60 * 1000, // Refetch every 15 minutes
    retry: 3,
  });
};

export const useWrestlenomicsData = () => {
  return useQuery({
    queryKey: ['wrestlenomics-data'],
    queryFn: scrapeWrestlenomicsData,
    staleTime: 30 * 60 * 1000, // 30 minutes
    refetchInterval: 60 * 60 * 1000, // Refetch every hour
    retry: 2,
  });
};

// Combined hook for all wrestling data
export const useWrestlingAnalytics = () => {
  const rssData = useRSSFeeds();
  const redditData = useRedditPosts();
  const wrestlenomicsData = useWrestlenomicsData();
  
  return {
    newsItems: rssData.data || [],
    redditPosts: redditData.data || [],
    wrestlenomicsData: wrestlenomicsData.data || {},
    isLoading: rssData.isLoading || redditData.isLoading || wrestlenomicsData.isLoading,
    error: rssData.error || redditData.error || wrestlenomicsData.error,
    refetchAll: () => {
      rssData.refetch();
      redditData.refetch();
      wrestlenomicsData.refetch();
    }
  };
};
