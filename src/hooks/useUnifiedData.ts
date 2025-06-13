
import { useQuery } from '@tanstack/react-query';
import { fetchUnifiedData } from '@/services/unifiedDataService';

export const useUnifiedData = () => {
  return useQuery({
    queryKey: ['unified-wrestling-data'],
    queryFn: fetchUnifiedData,
    staleTime: 5 * 60 * 1000, // 5 minutes - synchronized with auto-update
    refetchInterval: 10 * 60 * 1000, // 10 minutes - synchronized with auto-update service
    retry: 2,
  });
};
