
import { useQuery } from '@tanstack/react-query';
import { 
  getAllSupabaseWrestlers, 
  getWrestlersByPromotion, 
  searchSupabaseWrestlers,
  getChampions,
  getActiveWrestlers,
  getAllPromotions,
  scrapeWrestlingData,
  getUpcomingEvents
} from '@/services/supabaseWrestlerService';

export const useSupabaseWrestlers = () => {
  return useQuery({
    queryKey: ['supabase-wrestlers'],
    queryFn: getAllSupabaseWrestlers,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useWrestlersByPromotion = (promotionName: string) => {
  return useQuery({
    queryKey: ['wrestlers-by-promotion', promotionName],
    queryFn: () => getWrestlersByPromotion(promotionName),
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: !!promotionName,
  });
};

export const useWrestlerSearch = (query: string) => {
  return useQuery({
    queryKey: ['wrestler-search', query],
    queryFn: () => searchSupabaseWrestlers(query),
    staleTime: 2 * 60 * 1000, // 2 minutes
    enabled: query.length > 2,
  });
};

export const useChampions = () => {
  return useQuery({
    queryKey: ['champions'],
    queryFn: getChampions,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

export const useActiveWrestlers = () => {
  return useQuery({
    queryKey: ['active-wrestlers'],
    queryFn: getActiveWrestlers,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const usePromotions = () => {
  return useQuery({
    queryKey: ['promotions'],
    queryFn: getAllPromotions,
    staleTime: 30 * 60 * 1000, // 30 minutes
  });
};

export const useUpcomingEvents = () => {
  return useQuery({
    queryKey: ['upcoming-events'],
    queryFn: getUpcomingEvents,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

export const useScrapeWrestlingData = () => {
  return async (promotion: string) => {
    return await scrapeWrestlingData(promotion);
  };
};
