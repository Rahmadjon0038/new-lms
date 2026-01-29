import { useQuery } from '@tanstack/react-query';
import { instance } from './api';

export function useGetDashboardStats() {
  return useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      const res = await instance.get('/api/dashboard/stats');
      return res.data;
    },
    staleTime: 1000 * 60, // 1 minut
  });
}
