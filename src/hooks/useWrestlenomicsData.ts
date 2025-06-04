
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  scrapeWrestlenomicsData, 
  scrapeAllWrestlenomicsData,
  getStoredTVRatings,
  getStoredTicketSales,
  getStoredELORankings,
  WrestlenomicsResponse
} from '@/services/wrestlenomicsService';

export const useStoredTVRatings = () => {
  return useQuery({
    queryKey: ['stored-tv-ratings'],
    queryFn: getStoredTVRatings,
    staleTime: 10 * 60 * 1000, // 10 minutes
    refetchInterval: 30 * 60 * 1000, // Refetch every 30 minutes
  });
};

export const useStoredTicketSales = () => {
  return useQuery({
    queryKey: ['stored-ticket-sales'],
    queryFn: getStoredTicketSales,
    staleTime: 10 * 60 * 1000,
    refetchInterval: 30 * 60 * 1000,
  });
};

export const useStoredELORankings = () => {
  return useQuery({
    queryKey: ['stored-elo-rankings'],
    queryFn: getStoredELORankings,
    staleTime: 10 * 60 * 1000,
    refetchInterval: 30 * 60 * 1000,
  });
};

export const useScrapeWrestlenomics = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (dataType: 'tv-ratings' | 'ticket-sales' | 'elo-rankings') => {
      return await scrapeWrestlenomicsData(dataType);
    },
    onSuccess: (data: WrestlenomicsResponse, dataType: string) => {
      // Invalidate and refetch related queries
      switch (dataType) {
        case 'tv-ratings':
          queryClient.invalidateQueries({ queryKey: ['stored-tv-ratings'] });
          break;
        case 'ticket-sales':
          queryClient.invalidateQueries({ queryKey: ['stored-ticket-sales'] });
          break;
        case 'elo-rankings':
          queryClient.invalidateQueries({ queryKey: ['stored-elo-rankings'] });
          break;
      }
      queryClient.invalidateQueries({ queryKey: ['wrestlenomics-data'] });
    },
  });
};

export const useScrapeAllWrestlenomics = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: scrapeAllWrestlenomicsData,
    onSuccess: () => {
      // Invalidate all related queries
      queryClient.invalidateQueries({ queryKey: ['stored-tv-ratings'] });
      queryClient.invalidateQueries({ queryKey: ['stored-ticket-sales'] });
      queryClient.invalidateQueries({ queryKey: ['stored-elo-rankings'] });
      queryClient.invalidateQueries({ queryKey: ['wrestlenomics-data'] });
    },
  });
};

// Combined hook for all stored Wrestlenomics data
export const useAllWrestlenomicsData = () => {
  const tvRatings = useStoredTVRatings();
  const ticketSales = useStoredTicketSales();
  const eloRankings = useStoredELORankings();
  
  return {
    tvRatings: tvRatings.data || [],
    ticketSales: ticketSales.data || [],
    eloRankings: eloRankings.data || [],
    isLoading: tvRatings.isLoading || ticketSales.isLoading || eloRankings.isLoading,
    error: tvRatings.error || ticketSales.error || eloRankings.error,
    refetchAll: () => {
      tvRatings.refetch();
      ticketSales.refetch();
      eloRankings.refetch();
    }
  };
};
