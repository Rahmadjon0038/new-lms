import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { instance } from "./api";

// Get payment filters
const fetchPaymentFilters = async () => {
  const response = await instance.get('/api/payments/filters');
  return response.data;
};

export const usePaymentFilters = (options = {}) => {
  return useQuery({
    queryKey: ['payment-filters'],
    queryFn: fetchPaymentFilters,
    ...options,
  });
};

// Get monthly payments
const fetchMonthlyPayments = async (filters) => {
  const params = new URLSearchParams();
  
  if (filters.month) params.append('month', filters.month);
  if (filters.teacher_id) params.append('teacher_id', filters.teacher_id);
  if (filters.subject_id) params.append('subject_id', filters.subject_id);
  if (filters.status && filters.status !== 'all') params.append('status', filters.status);
  
  const queryString = params.toString();
  const url = `/api/payments/monthly${queryString ? `?${queryString}` : ''}`;
  
  const response = await instance.get(url);
  return response.data;
};

export const useMonthlyPayments = (filters, options = {}) => {
  return useQuery({
    queryKey: ['monthly-payments', filters],
    queryFn: () => fetchMonthlyPayments(filters),
    enabled: !!filters.month,
    ...options,
  });
};

// Apply discount to student
export const useApplyDiscount = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (discountData) => {
      const response = await instance.post('/api/payments/discount', discountData);
      return response.data;
    },
    onSuccess: () => {
      // Invalidate and refetch payments data
      queryClient.invalidateQueries({ queryKey: ['monthly-payments'] });
    },
  });
};

// Process payment for student
export const useProcessPayment = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (paymentData) => {
      const response = await instance.post('/api/payments/pay', paymentData);
      return response.data;
    },
    onSuccess: () => {
      // Invalidate and refetch payments data
      queryClient.invalidateQueries({ queryKey: ['monthly-payments'] });
    },
  });
};

// Get student payment history
const fetchStudentPaymentHistory = async (studentId) => {
  const response = await instance.get(`/api/payments/student/${studentId}/history`);
  return response.data;
};

export const useStudentPaymentHistory = (studentId, options = {}) => {
  return useQuery({
    queryKey: ['student-payment-history', studentId],
    queryFn: () => fetchStudentPaymentHistory(studentId),
    enabled: !!studentId,
    ...options,
  });
};

// Teacher: Get my students payments
const fetchTeacherStudentsPayments = async (filters) => {
  const params = new URLSearchParams();
  
  if (filters.month) params.append('month', filters.month);
  if (filters.status && filters.status !== 'all') params.append('status', filters.status);
  
  const queryString = params.toString();
  const url = `/api/payments/teacher/my-students${queryString ? `?${queryString}` : ''}`;
  
  const response = await instance.get(url);
  return response.data;
};

export const useTeacherStudentsPayments = (filters, options = {}) => {
  return useQuery({
    queryKey: ['teacher-students-payments', filters],
    queryFn: () => fetchTeacherStudentsPayments(filters),
    enabled: !!filters.month,
    ...options,
  });
};

// ================ STUDENT PAYMENT APIs ================

// Get student's monthly payments
const fetchStudentMonthlyPayments = async (month) => {
  const params = new URLSearchParams();
  if (month) params.append('month', month);
  
  const queryString = params.toString();
  const url = `/api/payments/my${queryString ? `?${queryString}` : ''}`;
  
  const response = await instance.get(url);
  return response.data;
};

export const useStudentMonthlyPayments = (month, options = {}) => {
  return useQuery({
    queryKey: ['student-monthly-payments', month],
    queryFn: () => fetchStudentMonthlyPayments(month),
    ...options,
  });
};

// Get student's payment history
const fetchStudentPaymentHistoryNew = async (groupId, limit = 10) => {
  const params = new URLSearchParams();
  if (groupId) params.append('group_id', groupId);
  if (limit) params.append('limit', limit);
  
  const queryString = params.toString();
  const url = `/api/payments/my/history${queryString ? `?${queryString}` : ''}`;
  
  const response = await instance.get(url);
  return response.data;
};

export const useStudentPaymentHistoryNew = (groupId, limit = 10, options = {}) => {
  return useQuery({
    queryKey: ['student-payment-history-new', groupId, limit],
    queryFn: () => fetchStudentPaymentHistoryNew(groupId, limit),
    ...options,
  });
};

// Get student's discounts
const fetchStudentDiscounts = async () => {
  const response = await instance.get('/api/payments/my/discounts');
  return response.data;
};

export const useStudentDiscounts = (options = {}) => {
  return useQuery({
    queryKey: ['student-discounts'],
    queryFn: fetchStudentDiscounts,
    ...options,
  });
};