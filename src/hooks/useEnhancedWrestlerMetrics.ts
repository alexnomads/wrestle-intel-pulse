
import { useQuery } from '@tanstack/react-query';
import { enhancedWrestlerMetricsService } from '@/services/enhancedWrestlerMetricsService';

export const useEnhancedWrestlerMetrics = (wrestlerId?: string) => {
  return useQuery({
    queryKey: ['enhanced-wrestler-metrics', wrestlerId],
    queryFn: () => enhancedWrestlerMetricsService.getWrestlerMetrics(wrestlerId),
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 15 * 60 * 1000, // 15 minutes
    retry: 2,
  });
};

export const useWrestlerTrends = (wrestlerId: string, days: number = 30) => {
  return useQuery({
    queryKey: ['wrestler-trends', wrestlerId, days],
    queryFn: () => enhancedWrestlerMetricsService.getWrestlerTrends(wrestlerId, days),
    enabled: !!wrestlerId,
    staleTime: 10 * 60 * 1000, // 10 minutes
    retry: 2,
  });
};
