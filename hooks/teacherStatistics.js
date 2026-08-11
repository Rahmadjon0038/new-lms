import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { instance } from "./api";
import { normalizeMonth } from "../utils/date";

// 1️⃣ Ustunlar katalogi
// GET /api/teacher-statistics/column-catalog
const getColumnCatalog = async () => {
  const response = await instance.get("/api/teacher-statistics/column-catalog");
  return response.data?.data ?? response.data;
};

export const useColumnCatalog = () => {
  return useQuery({
    queryKey: ["teacher-statistics-column-catalog"],
    queryFn: getColumnCatalog,
    staleTime: 30 * 60 * 1000,
  });
};

// 2️⃣ Guruh uchun oy davomida yuborilgan hisobotlar
// GET /api/teacher-statistics/groups/:groupId/reports?month=YYYY-MM
const getGroupLessonReports = async (groupId, month) => {
  const normalizedMonth = normalizeMonth(month);
  const params = new URLSearchParams();
  if (normalizedMonth) params.append("month", normalizedMonth);
  const response = await instance.get(
    `/api/teacher-statistics/groups/${groupId}/reports${params.toString() ? `?${params.toString()}` : ""}`
  );
  return response.data?.data ?? response.data;
};

export const useGroupLessonReports = (groupId, month) => {
  const normalizedMonth = normalizeMonth(month);
  return useQuery({
    queryKey: ["teacher-statistics-group-reports", groupId, normalizedMonth],
    queryFn: () => getGroupLessonReports(groupId, normalizedMonth),
    enabled: !!groupId,
  });
};

// 3️⃣ Darsni saqlash (yaratish/yangilash) — POST/PUT bir xil natija beradi
// PUT /api/teacher-statistics/lessons/:lesson_id
const saveLessonStatistics = async ({ lesson_id, ...payload }) => {
  const response = await instance.put(`/api/teacher-statistics/lessons/${lesson_id}`, payload);
  return response.data;
};

export const useSaveLessonStatistics = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: saveLessonStatistics,
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["teacher-statistics-group-reports"] });
      queryClient.invalidateQueries({ queryKey: ["group-lessons"] });
    },
  });
};

// 4️⃣ Darsning hisobotini o'chirish
// DELETE /api/teacher-statistics/lessons/:lesson_id
const deleteLessonStatistics = async (lesson_id) => {
  const response = await instance.delete(`/api/teacher-statistics/lessons/${lesson_id}`);
  return response.data;
};

export const useDeleteLessonStatistics = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteLessonStatistics,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teacher-statistics-group-reports"] });
      queryClient.invalidateQueries({ queryKey: ["group-lessons"] });
    },
  });
};
