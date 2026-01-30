import { useQuery } from '@tanstack/react-query';
import { instance } from './api';

export function useGetDashboardStats(selectedDate = null, selectedMonth = null) {
  return useQuery({
    queryKey: ['dashboard-stats', selectedDate, selectedMonth],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (selectedDate) params.append('date', selectedDate);
      if (selectedMonth) params.append('month', selectedMonth);
      const url = params.toString() 
        ? `/api/dashboard/stats?${params.toString()}`
        : '/api/dashboard/stats';
      const res = await instance.get(url);
      return res.data;
    },
    staleTime: 1000 * 60, // 1 minut
  });
}
