import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { fetchWrestlingTweets, TwitterPost } from '@/services/twitterService';

export const useTwitterData = () => {
  return useQuery({
    queryKey: ['twitter-wrestling-data'],
    queryFn: fetchWrestlingTweets,
    staleTime: 10 * 60 * 1000, // 10 minutes - longer stale time to reduce API calls
    refetchInterval: 15 * 60 * 1000, // 15 minutes - much longer interval to respect rate limits
    retry: 1, // Reduced retry attempts
    retryDelay: 60000, // 1 minute delay between retries
    meta: {
      onError: (error: Error) => {
        console.error('Twitter data fetch failed:', error);
      }
    },
    // Use placeholderData instead of keepPreviousData for newer versions
    placeholderData: keepPreviousData,
  });
};

export const useTwitterAnalytics = () => {
  const { data: tweets = [], isLoading, error } = useTwitterData();
  
  // Filter out fallback data for analytics
  const realTweets = tweets.filter(tweet => !tweet.isFallback);
  const fallbackTweets = tweets.filter(tweet => tweet.isFallback);
  
  return {
    tweets: realTweets,
    fallbackTweets,
    fallbackCount: fallbackTweets.length,
    isLoading,
    error,
    hasRealData: realTweets.length > 0,
    totalTweets: tweets.length
  };
};
