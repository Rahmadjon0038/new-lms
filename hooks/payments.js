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

// Get monthly payments (snapshots)
const fetchMonthlyPayments = async (filters) => {
  const params = new URLSearchParams();

  if (filters.month) params.append('month', filters.month);
  if (filters.group_id) params.append('group_id', filters.group_id);
  if (filters.teacher_id) params.append('teacher_id', filters.teacher_id);
  if (filters.subject_id) params.append('subject_id', filters.subject_id);

  const monthlyStatus = filters.monthly_status;
  if (monthlyStatus && monthlyStatus !== 'all') params.append('status', monthlyStatus);

  const paymentStatus = filters.payment_status ?? filters.status;
  if (paymentStatus && paymentStatus !== 'all') params.append('payment_status', paymentStatus);

  const queryString = params.toString();
  const url = `/api/snapshots${queryString ? `?${queryString}` : ''}`;

  // Debug: log the filters and URL
  console.log('📊 Payment Filters:', filters);
  console.log('🔗 API URL:', url);

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

// Create snapshots for new students
const createSnapshotsForNewStudents = async (month) => {
  const response = await instance.post('/api/snapshots/create-for-new', {
    month: month
  });
  return response.data;
};

export const useCreateSnapshotsForNewStudents = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createSnapshotsForNewStudents,
    onSuccess: (data) => {
      // Invalidate monthly payments to refresh the list
      queryClient.invalidateQueries({ queryKey: ['monthly-payments'] });
      // Also invalidate new students notification
      queryClient.invalidateQueries({ queryKey: ['new-students-notification'] });
    },
  });
};

// Get new students notification
const fetchNewStudentsNotification = async (month) => {
  const response = await instance.get(`/api/snapshots/new-students-notification?month=${month}`);
  return response.data;
};

export const useNewStudentsNotification = (month, options = {}) => {
  return useQuery({
    queryKey: ['new-students-notification', month],
    queryFn: () => fetchNewStudentsNotification(month),
    enabled: !!month,
    refetchOnWindowFocus: false,
    staleTime: 1000 * 60 * 5, // 5 minutes
    ...options,
  });
};

// Apply discount to student
export const useApplyDiscount = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (discountData) => {
      const response = await instance.post('/api/snapshots/discount', discountData);
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
      const response = await instance.post('/api/snapshots/make-payment', paymentData);
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

// Get student's monthly payments (new API)
const fetchStudentMonthlyPayments = async ({ month, groupId } = {}) => {
  const params = new URLSearchParams();
  if (month) params.append('month', month);
  if (groupId) params.append('group_id', groupId);
  
  const queryString = params.toString();
  const url = `/api/students/my-payments${queryString ? `?${queryString}` : ''}`;
  
  const response = await instance.get(url);
  return response.data;
};

export const useStudentMonthlyPayments = (params = {}, options = {}) => {
  const normalizedParams = typeof params === 'string' ? { month: params } : (params || {});
  return useQuery({
    queryKey: ['student-monthly-payments', normalizedParams.month, normalizedParams.groupId],
    queryFn: () => fetchStudentMonthlyPayments(normalizedParams),
    ...options,
  });
};

// Get student's payment history
const fetchStudentPaymentHistoryNew = async ({ month, groupId, limit = 10 }) => {
  const params = new URLSearchParams();
  if (month) params.append('month', month);
  if (groupId) params.append('group_id', groupId);
  if (limit) params.append('limit', limit);
  
  const queryString = params.toString();
  const url = `/api/payments/my/history${queryString ? `?${queryString}` : ''}`;
  
  const response = await instance.get(url);
  return response.data;
};

export const useStudentPaymentHistoryNew = ({ month, groupId, limit = 10 }, options = {}) => {
  return useQuery({
    queryKey: ['student-payment-history-new', month, groupId, limit],
    queryFn: () => fetchStudentPaymentHistoryNew({ month, groupId, limit }),
    enabled: !!groupId,
    ...options,
  });
};

// Get payment history with month filter (Admin)
const fetchPaymentHistory = async ({ month, groupId, studentId, limit = 20 }) => {
  const params = new URLSearchParams();
  if (month) params.append('month', month);
  if (groupId) params.append('group_id', groupId);
  if (studentId) params.append('student_id', studentId);
  
  const queryString = params.toString();
  const url = `/api/snapshots/transactions${queryString ? `?${queryString}` : ''}`;
  
  console.log('📜 Payment History API Request:', url);
  const response = await instance.get(url);
  console.log('📜 Payment History Response:', response.data);
  return response.data;
};

export const usePaymentHistory = ({ month, groupId, studentId, limit = 20 }, options = {}) => {
  return useQuery({
    queryKey: ['payment-history', month, groupId, studentId, limit],
    queryFn: () => fetchPaymentHistory({ month, groupId, studentId, limit }),
    enabled: !!groupId && !!studentId,
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
