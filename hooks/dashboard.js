import { useQuery } from '@tanstack/react-query';
import { instance } from './api';

const normalize = (response) => response?.data?.data ?? response?.data;
const buildQuery = (params = {}) => {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      search.append(key, String(value));
    }
  });
  return search.toString();
};

export function useGetDashboardDailyStats(from = null, to = null) {
  return useQuery({
    queryKey: ['dashboard-stats-daily', from, to],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (from) params.append('from', from);
      if (to) params.append('to', to);
      const url = params.toString() ? `/api/dashboard/stats/daily?${params.toString()}` : '/api/dashboard/stats/daily';
      const res = await instance.get(url);
      return normalize(res);
    },
    staleTime: 60 * 1000,
  });
}

export function useGetDashboardMonthlyStats(fromMonth = null, toMonth = null) {
  return useQuery({
    queryKey: ['dashboard-stats-monthly', fromMonth, toMonth],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (fromMonth) params.append('from_month', fromMonth);
      if (toMonth) params.append('to_month', toMonth);
      const url = params.toString() ? `/api/dashboard/stats/monthly?${params.toString()}` : '/api/dashboard/stats/monthly';
      const res = await instance.get(url);
      return normalize(res);
    },
    staleTime: 60 * 1000,
  });
}

export function useGetDashboardDebtors() {
  return useQuery({
    queryKey: ['dashboard-debtors'],
    queryFn: async () => {
      const res = await instance.get('/api/dashboard/debtors');
      return normalize(res);
    },
    staleTime: 60 * 1000,
  });
}

export function useGetDashboardOverview() {
  return useQuery({
    queryKey: ['dashboard-overview'],
    queryFn: async () => {
      const res = await instance.get('/api/dashboard/stats/overview');
      return normalize(res);
    },
    staleTime: 60 * 1000,
  });
}

export function useGetDashboardDebtorsByMonth(month = null) {
  return useQuery({
    queryKey: ['dashboard-debtors', month],
    queryFn: async () => {
      const query = buildQuery({ month });
      const url = query ? `/api/dashboard/debtors?${query}` : '/api/dashboard/debtors';
      const res = await instance.get(url);
      return normalize(res);
    },
    staleTime: 60 * 1000,
  });
}

export function useGetDashboardSuperAdmin() {
  return useQuery({
    queryKey: ['dashboard-super-admin'],
    queryFn: async () => {
      const res = await instance.get('/api/dashboard/super-admin');
      return normalize(res);
    },
    staleTime: 60 * 1000,
  });
}
