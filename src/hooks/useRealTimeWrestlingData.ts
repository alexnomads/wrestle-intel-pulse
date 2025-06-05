
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getAllRealTimeEvents,
  getUpcomingRealTimeEvents,
  getWeeklyShows,
  scrapeEventsData,
} from '@/services/realTimeWrestlingService';

// Event hooks - completely rewritten
export const useRealTimeEvents = () => {
  return useQuery({
    queryKey: ['wrestling-events-all'],
    queryFn: getAllRealTimeEvents,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 15 * 60 * 1000, // Refetch every 15 minutes
    retry: 3,
    retryDelay: 1000,
  });
};

export const useUpcomingEvents = () => {
  return useQuery({
    queryKey: ['wrestling-events-upcoming'],
    queryFn: getUpcomingRealTimeEvents,
    staleTime: 5 * 60 * 1000,
    refetchInterval: 15 * 60 * 1000,
    retry: 3,
    retryDelay: 1000,
  });
};

export const useWeeklyShows = () => {
  return useQuery({
    queryKey: ['wrestling-events-weekly'],
    queryFn: getWeeklyShows,
    staleTime: 30 * 60 * 1000, // 30 minutes
    retry: 3,
    retryDelay: 1000,
  });
};

// Scraping mutation
export const useScrapeEvents = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: scrapeEventsData,
    onSuccess: (data) => {
      console.log('Events scraping completed:', data);
      // Invalidate and refetch all event queries
      queryClient.invalidateQueries({ queryKey: ['wrestling-events-all'] });
      queryClient.invalidateQueries({ queryKey: ['wrestling-events-upcoming'] });
      queryClient.invalidateQueries({ queryKey: ['wrestling-events-weekly'] });
    },
    onError: (error) => {
      console.error('Events scraping failed:', error);
    }
  });
};

// Placeholder hooks for news (not implemented)
export const useLatestNews = (limit: number = 20) => {
  return useQuery({
    queryKey: ['latest-news', limit],
    queryFn: () => Promise.resolve([]),
    enabled: false, // Disabled until implemented
  });
};

export const useNewsByWrestler = (wrestlerName: string) => {
  return useQuery({
    queryKey: ['news-by-wrestler', wrestlerName],
    queryFn: () => Promise.resolve([]),
    enabled: false,
  });
};

export const useNewsByPromotion = (promotionName: string) => {
  return useQuery({
    queryKey: ['news-by-promotion', promotionName],
    queryFn: () => Promise.resolve([]),
    enabled: false,
  });
};

export const useActiveStorylines = () => {
  return useQuery({
    queryKey: ['active-storylines'],
    queryFn: () => Promise.resolve([]),
    enabled: false,
  });
};

export const useStorylinesByPromotion = (promotionName: string) => {
  return useQuery({
    queryKey: ['storylines-by-promotion', promotionName],
    queryFn: () => Promise.resolve([]),
    enabled: false,
  });
};

export const useActiveContracts = () => {
  return useQuery({
    queryKey: ['active-contracts'],
    queryFn: () => Promise.resolve([]),
    enabled: false,
  });
};

export const useExpiringContracts = () => {
  return useQuery({
    queryKey: ['expiring-contracts'],
    queryFn: () => Promise.resolve([]),
    enabled: false,
  });
};

export const useWrestlerSentiment = (wrestlerName: string) => {
  return useQuery({
    queryKey: ['wrestler-sentiment', wrestlerName],
    queryFn: () => Promise.resolve([]),
    enabled: false,
  });
};

export const useScrapeNews = () => {
  return useMutation({
    mutationFn: () => Promise.resolve({ success: true, message: 'News scraping not implemented yet' }),
  });
};

// Combined data hook for dashboard
export const useRealTimeAnalytics = () => {
  const events = useRealTimeEvents();
  const upcomingEvents = useUpcomingEvents();
  const weeklyShows = useWeeklyShows();
  
  return {
    events: events.data || [],
    upcomingEvents: upcomingEvents.data || [],
    news: [], // Not implemented yet
    storylines: [], // Not implemented yet
    expiringContracts: [], // Not implemented yet
    isLoading: events.isLoading,
    error: events.error,
    refetchAll: () => {
      events.refetch();
      upcomingEvents.refetch();
      weeklyShows.refetch();
    }
  };
};
