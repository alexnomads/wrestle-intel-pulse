
import { useQuery } from '@tanstack/react-query';
import { fetchRSSFeeds, fetchRedditPosts, NewsItem, RedditPost } from '@/services/wrestlingDataService';

export const useRSSFeeds = () => {
  return useQuery({
    queryKey: ['rss-feeds'],
    queryFn: fetchRSSFeeds,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 10 * 60 * 1000, // Refetch every 10 minutes
  });
};

export const useRedditPosts = () => {
  return useQuery({
    queryKey: ['reddit-posts'],
    queryFn: fetchRedditPosts,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 10 * 60 * 1000, // Refetch every 10 minutes
  });
};
