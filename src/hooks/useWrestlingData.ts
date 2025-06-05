
import { useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';
import { 
  fetchRSSFeeds, 
  fetchRedditPosts, 
  scrapeWrestlenomicsData,
  fetchComprehensiveWrestlingNews,
  fetchComprehensiveRedditPosts,
  NewsItem, 
  RedditPost,
  WrestlenomicsData
} from '@/services/wrestlingDataService';
import { autoUpdateService } from '@/services/autoUpdateService';

export const useRSSFeeds = () => {
  return useQuery({
    queryKey: ['rss-feeds'],
    queryFn: fetchRSSFeeds,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 15 * 60 * 1000, // Refetch every 15 minutes
    retry: 3,
  });
};

export const useComprehensiveNews = () => {
  const query = useQuery({
    queryKey: ['comprehensive-wrestling-news'],
    queryFn: fetchComprehensiveWrestlingNews,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 15 * 60 * 1000, // Refetch every 15 minutes
    retry: 3,
  });

  // Register with auto-update service
  useEffect(() => {
    const updateCallback = async () => {
      console.log('Auto-update: Refreshing comprehensive news...');
      await query.refetch();
    };

    autoUpdateService.addUpdateCallback(updateCallback);

    return () => {
      autoUpdateService.removeUpdateCallback(updateCallback);
    };
  }, [query.refetch]);

  return query;
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

export const useComprehensiveReddit = () => {
  const query = useQuery({
    queryKey: ['comprehensive-reddit-posts'],
    queryFn: fetchComprehensiveRedditPosts,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 15 * 60 * 1000, // Refetch every 15 minutes
    retry: 3,
  });

  // Register with auto-update service
  useEffect(() => {
    const updateCallback = async () => {
      console.log('Auto-update: Refreshing comprehensive Reddit posts...');
      await query.refetch();
    };

    autoUpdateService.addUpdateCallback(updateCallback);

    return () => {
      autoUpdateService.removeUpdateCallback(updateCallback);
    };
  }, [query.refetch]);

  return query;
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

// Combined hook for all wrestling data with auto-update
export const useWrestlingAnalytics = () => {
  const rssData = useRSSFeeds();
  const comprehensiveNewsData = useComprehensiveNews();
  const redditData = useRedditPosts();
  const comprehensiveRedditData = useComprehensiveReddit();
  const wrestlenomicsData = useWrestlenomicsData();
  
  // Register all queries with auto-update service
  useEffect(() => {
    const updateAllCallback = async () => {
      console.log('Auto-update: Refreshing all wrestling analytics data...');
      await Promise.allSettled([
        rssData.refetch(),
        comprehensiveNewsData.refetch(),
        redditData.refetch(),
        comprehensiveRedditData.refetch(),
        wrestlenomicsData.refetch()
      ]);
    };

    autoUpdateService.addUpdateCallback(updateAllCallback);

    return () => {
      autoUpdateService.removeUpdateCallback(updateAllCallback);
    };
  }, [
    rssData.refetch, 
    comprehensiveNewsData.refetch, 
    redditData.refetch, 
    comprehensiveRedditData.refetch, 
    wrestlenomicsData.refetch
  ]);
  
  return {
    newsItems: comprehensiveNewsData.data || rssData.data || [],
    redditPosts: comprehensiveRedditData.data || redditData.data || [],
    wrestlenomicsData: wrestlenomicsData.data || {},
    isLoading: rssData.isLoading || redditData.isLoading || wrestlenomicsData.isLoading || comprehensiveNewsData.isLoading || comprehensiveRedditData.isLoading,
    error: rssData.error || redditData.error || wrestlenomicsData.error || comprehensiveNewsData.error || comprehensiveRedditData.error,
    refetchAll: () => {
      rssData.refetch();
      comprehensiveNewsData.refetch();
      redditData.refetch();
      comprehensiveRedditData.refetch();
      wrestlenomicsData.refetch();
    }
  };
};
