
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { fetchAllDataParallel, smartCache } from '@/services/optimizedDataService';

export const useOptimizedUnifiedData = () => {
  const [isBackground, setIsBackground] = useState(false);
  const queryClient = useQueryClient();
  
  const query = useQuery({
    queryKey: ['optimized-unified-data'],
    queryFn: async () => {
      setIsBackground(true);
      const data = await fetchAllDataParallel();
      setIsBackground(false);
      return data;
    },
    staleTime: 2 * 60 * 1000, // Consider data stale after 2 minutes
    gcTime: 15 * 60 * 1000, // Keep in cache for 15 minutes
    refetchInterval: 5 * 60 * 1000, // Auto-refetch every 5 minutes
    refetchIntervalInBackground: true,
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  // Background refresh function
  const backgroundRefresh = async () => {
    setIsBackground(true);
    try {
      await queryClient.refetchQueries({ 
        queryKey: ['optimized-unified-data'],
        type: 'active' 
      });
    } finally {
      setIsBackground(false);
    }
  };

  // Manual refresh that shows immediate feedback
  const manualRefresh = async () => {
    // Clear cache to force fresh fetch
    smartCache.clear();
    queryClient.removeQueries({ queryKey: ['optimized-unified-data'] });
    
    return query.refetch();
  };

  return {
    ...query,
    isBackgroundRefreshing: isBackground,
    backgroundRefresh,
    manualRefresh,
    fromCache: query.data?.fromCache || false,
    loadTimes: query.data?.loadTimes || {}
  };
};

// Hook for progressive data loading with instant feedback
export const useProgressiveData = () => {
  const [progressiveData, setProgressiveData] = useState({
    newsItems: [],
    redditPosts: [],
    tweets: [],
    videos: [],
    progress: 0,
    isComplete: false
  });

  const { data, isLoading, error } = useOptimizedUnifiedData();

  useEffect(() => {
    if (data) {
      setProgressiveData({
        newsItems: data.newsItems || [],
        redditPosts: data.redditPosts || [],
        tweets: data.tweets || [],
        videos: data.videos || [],
        progress: 100,
        isComplete: true
      });
    }
  }, [data]);

  return {
    data: progressiveData,
    isLoading,
    error,
    fromCache: data?.fromCache || false
  };
};
