import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { instance } from "./api";

const baseUrl = "/api/teacher-late";

const extractData = (res) => res?.data?.data ?? res?.data ?? null;

const getMonthLate = async ({ month_name }) => {
  const res = await instance.get(`${baseUrl}/months/${month_name}/teachers`);
  return extractData(res);
};

const createLateRecord = async (payload) => {
  const res = await instance.post(baseUrl, payload);
  return extractData(res);
};

const deleteLateRecord = async (id) => {
  const res = await instance.delete(`${baseUrl}/${id}`);
  return extractData(res);
};

export const useTeacherLateMonth = ({ month_name }, options = {}) =>
  useQuery({
    queryKey: ["teacher-late", month_name],
    queryFn: () => getMonthLate({ month_name }),
    enabled: !!month_name,
    ...options,
  });

export const useCreateTeacherLate = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createLateRecord,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teacher-late"] });
    },
  });
};

export const useDeleteTeacherLate = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteLateRecord,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teacher-late"] });
    },
  });
};
