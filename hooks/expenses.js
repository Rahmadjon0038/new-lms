import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
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

const getExpenses = async (filters = {}) => {
  const query = buildQuery(filters);
  const url = query ? `/api/expenses?${query}` : '/api/expenses';
  const res = await instance.get(url);
  return normalize(res);
};

const getExpenseSummary = async ({ month } = {}) => {
  const query = buildQuery({ month });
  const url = query ? `/api/expenses/summary?${query}` : '/api/expenses/summary';
  const res = await instance.get(url);
  return normalize(res);
};

const createExpense = async (payload) => {
  const res = await instance.post('/api/expenses', payload);
  return normalize(res);
};

const updateExpense = async ({ expenseId, payload }) => {
  const res = await instance.put(`/api/expenses/${expenseId}`, payload);
  return normalize(res);
};

const deleteExpense = async (expenseId) => {
  const res = await instance.delete(`/api/expenses/${expenseId}`);
  return normalize(res);
};

const getExpenseDailyStats = async ({ from, to } = {}) => {
  const query = buildQuery({ from, to });
  const url = query ? `/api/expenses/stats/daily?${query}` : '/api/expenses/stats/daily';
  const res = await instance.get(url);
  return normalize(res);
};

const getExpenseMonthlyStats = async ({ from_month, to_month } = {}) => {
  const query = buildQuery({ from_month, to_month });
  const url = query ? `/api/expenses/stats/monthly?${query}` : '/api/expenses/stats/monthly';
  const res = await instance.get(url);
  return normalize(res);
};

export const useGetExpenses = (filters = {}) =>
  useQuery({
    queryKey: ['expenses', filters],
    queryFn: () => getExpenses(filters),
  });

export const useGetExpenseSummary = ({ month } = {}) =>
  useQuery({
    queryKey: ['expenses-summary', month],
    queryFn: () => getExpenseSummary({ month }),
  });

export const useGetExpenseDailyStats = ({ from, to } = {}) =>
  useQuery({
    queryKey: ['expenses-stats-daily', from, to],
    queryFn: () => getExpenseDailyStats({ from, to }),
  });

export const useGetExpenseMonthlyStats = ({ from_month, to_month } = {}) =>
  useQuery({
    queryKey: ['expenses-stats-monthly', from_month, to_month],
    queryFn: () => getExpenseMonthlyStats({ from_month, to_month }),
  });

const invalidateExpenseQueries = (queryClient) => {
  queryClient.invalidateQueries({ queryKey: ['expenses'] });
  queryClient.invalidateQueries({ queryKey: ['expenses-summary'] });
  queryClient.invalidateQueries({ queryKey: ['expenses-stats-daily'] });
  queryClient.invalidateQueries({ queryKey: ['expenses-stats-monthly'] });
};

export const useCreateExpense = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createExpense,
    onSuccess: () => invalidateExpenseQueries(queryClient),
  });
};

export const useUpdateExpense = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateExpense,
    onSuccess: () => invalidateExpenseQueries(queryClient),
  });
};

export const useDeleteExpense = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteExpense,
    onSuccess: () => invalidateExpenseQueries(queryClient),
  });
};
