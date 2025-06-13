
import { useQuery } from '@tanstack/react-query';
import { fetchWrestlingTweets, TwitterPost } from '@/services/twitterService';

export const useTwitterData = () => {
  return useQuery({
    queryKey: ['twitter-wrestling-data'],
    queryFn: fetchWrestlingTweets,
    staleTime: 5 * 60 * 1000, // 5 minutes - synchronized
    refetchInterval: 10 * 60 * 1000, // 10 minutes - synchronized (longer to respect rate limits)
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // Exponential backoff
    meta: {
      onError: (error: Error) => {
        console.error('Twitter data fetch failed:', error);
      }
    }
  });
};

export const useTwitterAnalytics = () => {
  const { data: tweets = [], isLoading, error } = useTwitterData();
  
  // Filter out fallback data for analytics
  const realTweets = tweets.filter(tweet => !tweet.isFallback);
  
  return {
    tweets: realTweets,
    fallbackCount: tweets.length - realTweets.length,
    isLoading,
    error,
    hasRealData: realTweets.length > 0
  };
};
