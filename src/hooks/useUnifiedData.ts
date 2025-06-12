
import { useQuery } from '@tanstack/react-query';
import { fetchUnifiedData } from '@/services/unifiedDataService';

export const useUnifiedData = () => {
  return useQuery({
    queryKey: ['unified-wrestling-data'],
    queryFn: fetchUnifiedData,
    staleTime: 10 * 60 * 1000, // 10 minutes
    refetchInterval: 30 * 60 * 1000, // 30 minutes
    retry: 2,
  });
};
