
import { useQuery } from '@tanstack/react-query';
import { fetchFreeWrestlingSocial, FreeSocialPost } from '@/services/freeWrestlingSocialService';
import { getActiveAccounts } from '@/constants/wrestlingAccounts';

export const useFreeWrestlingSocial = () => {
  const activeAccounts = getActiveAccounts();
  const accountUsernames = activeAccounts.map(acc => acc.username);

  return useQuery({
    queryKey: ['free-wrestling-social'],
    queryFn: () => fetchFreeWrestlingSocial(accountUsernames),
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 10 * 60 * 1000, // 10 minutes
    retry: 2,
    retryDelay: 30000, // 30 seconds
    meta: {
      onError: (error: Error) => {
        console.error('Free wrestling social fetch failed:', error);
      }
    }
  });
};

export const useFreeWrestlingSocialAnalytics = () => {
  const { data: posts = [], isLoading, error } = useFreeWrestlingSocial();
  
  // Separate free content from fallback
  const realPosts = posts.filter(post => !post.text.includes('🔄') && !post.text.includes('📱'));
  const fallbackPosts = posts.filter(post => post.text.includes('🔄') || post.text.includes('📱'));
  
  return {
    posts: realPosts,
    fallbackPosts,
    fallbackCount: fallbackPosts.length,
    isLoading,
    error,
    hasRealData: realPosts.length > 0,
    totalPosts: posts.length,
    isFreeMode: true
  };
};
