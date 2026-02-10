import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { instance } from "./api";

const baseUrl = "/api/teacher-salary";

const buildQuery = (params = {}) => {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      search.append(key, value);
    }
  });
  const q = search.toString();
  return q ? `?${q}` : "";
};

const extractData = (res) => res?.data?.data ?? res?.data ?? null;

const getTeacherSalarySetting = async (teacherId) => {
  const res = await instance.get(`${baseUrl}/settings/${teacherId}`);
  return extractData(res);
};

const updateTeacherSalarySetting = async ({ teacherId, salary_percentage }) => {
  const res = await instance.put(`${baseUrl}/settings/${teacherId}`, { salary_percentage });
  return extractData(res);
};

const createTeacherAdvance = async (payload) => {
  const res = await instance.post(`${baseUrl}/advances`, payload);
  return extractData(res);
};

const getTeacherAdvances = async ({ teacher_id, month_name }) => {
  const res = await instance.get(`${baseUrl}/advances${buildQuery({ teacher_id, month_name })}`);
  return extractData(res);
};

const closeTeacherSalaryMonth = async ({ month_name, teacher_id }) => {
  const res = await instance.post(`${baseUrl}/months/${month_name}/teachers/${teacher_id}/close`);
  return extractData(res);
};

const getTeacherSalaryMonthSummary = async ({ month_name, teacher_id }) => {
  const res = await instance.get(`${baseUrl}/months/${month_name}/teachers/${teacher_id}`);
  return extractData(res);
};

const getTeacherSalaryMonthTeachers = async ({ month_name }) => {
  const res = await instance.get(`${baseUrl}/months/${month_name}/teachers`);
  return extractData(res);
};

const getTeacherSalaryMonthSimpleList = async ({ month_name }) => {
  const res = await instance.get(`${baseUrl}/months/${month_name}/simple-list`);
  return extractData(res);
};

export const useTeacherSalarySetting = (teacherId, options = {}) =>
  useQuery({
    queryKey: ["teacher-salary-setting", teacherId],
    queryFn: () => getTeacherSalarySetting(teacherId),
    enabled: !!teacherId,
    ...options,
  });

export const useUpdateTeacherSalarySetting = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateTeacherSalarySetting,
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ["teacher-salary-setting", vars?.teacherId] });
      queryClient.invalidateQueries({ queryKey: ["teacher-salary-teachers"] });
      queryClient.invalidateQueries({ queryKey: ["teacher-salary-simple-list"] });
      queryClient.invalidateQueries({ queryKey: ["teacher-salary-summary"] });
    },
  });
};

export const useTeacherAdvances = ({ teacher_id, month_name }, options = {}) =>
  useQuery({
    queryKey: ["teacher-salary-advances", teacher_id, month_name],
    queryFn: () => getTeacherAdvances({ teacher_id, month_name }),
    enabled: !!month_name,
    ...options,
  });

export const useCreateTeacherAdvance = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createTeacherAdvance,
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ["teacher-salary-advances", vars?.teacher_id, vars?.month_name] });
      queryClient.invalidateQueries({ queryKey: ["teacher-salary-summary", vars?.month_name, vars?.teacher_id] });
      queryClient.invalidateQueries({ queryKey: ["teacher-salary-teachers", vars?.month_name] });
      queryClient.invalidateQueries({ queryKey: ["teacher-salary-simple-list", vars?.month_name] });
    },
  });
};

export const useCloseTeacherSalaryMonth = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: closeTeacherSalaryMonth,
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ["teacher-salary-summary", vars?.month_name] });
      queryClient.invalidateQueries({ queryKey: ["teacher-salary-teachers", vars?.month_name] });
      queryClient.invalidateQueries({ queryKey: ["teacher-salary-simple-list", vars?.month_name] });
    },
  });
};

export const useTeacherSalaryMonthSummary = ({ month_name, teacher_id }, options = {}) =>
  useQuery({
    queryKey: ["teacher-salary-summary", month_name, teacher_id],
    queryFn: () => getTeacherSalaryMonthSummary({ month_name, teacher_id }),
    enabled: !!month_name && !!teacher_id,
    ...options,
  });

export const useTeacherSalaryMonthTeachers = ({ month_name }, options = {}) =>
  useQuery({
    queryKey: ["teacher-salary-teachers", month_name],
    queryFn: () => getTeacherSalaryMonthTeachers({ month_name }),
    enabled: !!month_name,
    ...options,
  });

export const useTeacherSalaryMonthSimpleList = ({ month_name }, options = {}) =>
  useQuery({
    queryKey: ["teacher-salary-simple-list", month_name],
    queryFn: () => getTeacherSalaryMonthSimpleList({ month_name }),
    enabled: !!month_name,
    ...options,
  });
