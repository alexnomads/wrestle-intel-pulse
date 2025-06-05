
import { useQuery } from '@tanstack/react-query';
import { 
  getAllRealWrestlers,
  getRealWrestlersByPromotion,
  searchRealWrestlers,
  getRealChampions,
  getRealActiveWrestlers,
  getRealWeeklyShows,
  getRealSpecialEvents,
  getRealUpcomingEvents,
  Promotion
} from '@/services/realWrestlerService';

export const useAllRealWrestlers = () => {
  return useQuery({
    queryKey: ['real-wrestlers-all'],
    queryFn: getAllRealWrestlers,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useRealWrestlersByPromotion = (promotion: Promotion) => {
  return useQuery({
    queryKey: ['real-wrestlers-by-promotion', promotion],
    queryFn: () => getRealWrestlersByPromotion(promotion),
    staleTime: 5 * 60 * 1000,
    enabled: !!promotion,
  });
};

export const useRealWrestlerSearch = (query: string) => {
  return useQuery({
    queryKey: ['real-wrestler-search', query],
    queryFn: () => searchRealWrestlers(query),
    staleTime: 2 * 60 * 1000, // 2 minutes
    enabled: query.length > 2,
  });
};

export const useRealChampions = () => {
  return useQuery({
    queryKey: ['real-champions'],
    queryFn: getRealChampions,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

export const useRealActiveWrestlers = () => {
  return useQuery({
    queryKey: ['real-active-wrestlers'],
    queryFn: getRealActiveWrestlers,
    staleTime: 5 * 60 * 1000,
  });
};

export const useRealWeeklyShows = () => {
  return useQuery({
    queryKey: ['real-weekly-shows'],
    queryFn: getRealWeeklyShows,
    staleTime: 30 * 60 * 1000, // 30 minutes
  });
};

export const useRealSpecialEvents = () => {
  return useQuery({
    queryKey: ['real-special-events'],
    queryFn: getRealSpecialEvents,
    staleTime: 30 * 60 * 1000,
  });
};

export const useRealUpcomingEvents = () => {
  return useQuery({
    queryKey: ['real-upcoming-events'],
    queryFn: getRealUpcomingEvents,
    staleTime: 10 * 60 * 1000,
  });
};
