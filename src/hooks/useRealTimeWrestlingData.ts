
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getAllRealTimeEvents,
  getUpcomingRealTimeEvents,
  getWeeklyShows,
  getLatestNews,
  getNewsByWrestler,
  getNewsByPromotion,
  getActiveStorylines,
  getStorylinesByPromotion,
  getActiveContracts,
  getExpiringContracts,
  scrapeEventsData,
  scrapeNewsData,
  getWrestlerSentimentAnalysis,
} from '@/services/realTimeWrestlingService';

// Event hooks
export const useRealTimeEvents = () => {
  return useQuery({
    queryKey: ['real-time-events'],
    queryFn: getAllRealTimeEvents,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 15 * 60 * 1000, // Refetch every 15 minutes
  });
};

export const useUpcomingEvents = () => {
  return useQuery({
    queryKey: ['upcoming-real-time-events'],
    queryFn: getUpcomingRealTimeEvents,
    staleTime: 5 * 60 * 1000,
    refetchInterval: 15 * 60 * 1000,
  });
};

export const useWeeklyShows = () => {
  return useQuery({
    queryKey: ['weekly-shows'],
    queryFn: getWeeklyShows,
    staleTime: 30 * 60 * 1000, // 30 minutes
  });
};

// News hooks
export const useLatestNews = (limit: number = 20) => {
  return useQuery({
    queryKey: ['latest-news', limit],
    queryFn: () => getLatestNews(limit),
    staleTime: 2 * 60 * 1000, // 2 minutes
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
  });
};

export const useNewsByWrestler = (wrestlerName: string) => {
  return useQuery({
    queryKey: ['news-by-wrestler', wrestlerName],
    queryFn: () => getNewsByWrestler(wrestlerName),
    staleTime: 5 * 60 * 1000,
    enabled: !!wrestlerName,
  });
};

export const useNewsByPromotion = (promotionName: string) => {
  return useQuery({
    queryKey: ['news-by-promotion', promotionName],
    queryFn: () => getNewsByPromotion(promotionName),
    staleTime: 5 * 60 * 1000,
    enabled: !!promotionName,
  });
};

// Storyline hooks
export const useActiveStorylines = () => {
  return useQuery({
    queryKey: ['active-storylines'],
    queryFn: getActiveStorylines,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

export const useStorylinesByPromotion = (promotionName: string) => {
  return useQuery({
    queryKey: ['storylines-by-promotion', promotionName],
    queryFn: () => getStorylinesByPromotion(promotionName),
    staleTime: 10 * 60 * 1000,
    enabled: !!promotionName,
  });
};

// Contract hooks
export const useActiveContracts = () => {
  return useQuery({
    queryKey: ['active-contracts'],
    queryFn: getActiveContracts,
    staleTime: 30 * 60 * 1000, // 30 minutes
  });
};

export const useExpiringContracts = () => {
  return useQuery({
    queryKey: ['expiring-contracts'],
    queryFn: getExpiringContracts,
    staleTime: 30 * 60 * 1000,
  });
};

// Analytics hooks
export const useWrestlerSentiment = (wrestlerName: string) => {
  return useQuery({
    queryKey: ['wrestler-sentiment', wrestlerName],
    queryFn: () => getWrestlerSentimentAnalysis(wrestlerName),
    staleTime: 10 * 60 * 1000,
    enabled: !!wrestlerName,
  });
};

// Scraping mutations
export const useScrapeEvents = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: scrapeEventsData,
    onSuccess: () => {
      // Invalidate and refetch event queries
      queryClient.invalidateQueries({ queryKey: ['real-time-events'] });
      queryClient.invalidateQueries({ queryKey: ['upcoming-real-time-events'] });
      queryClient.invalidateQueries({ queryKey: ['weekly-shows'] });
    },
  });
};

export const useScrapeNews = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: scrapeNewsData,
    onSuccess: () => {
      // Invalidate and refetch news queries
      queryClient.invalidateQueries({ queryKey: ['latest-news'] });
      queryClient.invalidateQueries({ queryKey: ['news-by-wrestler'] });
      queryClient.invalidateQueries({ queryKey: ['news-by-promotion'] });
    },
  });
};

// Combined data hook for dashboard
export const useRealTimeAnalytics = () => {
  const events = useRealTimeEvents();
  const upcomingEvents = useUpcomingEvents();
  const news = useLatestNews(10);
  const storylines = useActiveStorylines();
  const contracts = useExpiringContracts();
  
  return {
    events: events.data || [],
    upcomingEvents: upcomingEvents.data || [],
    news: news.data || [],
    storylines: storylines.data || [],
    expiringContracts: contracts.data || [],
    isLoading: events.isLoading || news.isLoading || storylines.isLoading,
    error: events.error || news.error || storylines.error,
    refetchAll: () => {
      events.refetch();
      upcomingEvents.refetch();
      news.refetch();
      storylines.refetch();
      contracts.refetch();
    }
  };
};
