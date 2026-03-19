import { useQuery } from "@tanstack/react-query";
import { instance } from "./api";
import { normalizeMonth } from "../utils/date";

// groupId: string | number, month: string (YYYY-MM)
const extractMonthlySummary = (response) => {
  const root = response?.data ?? response ?? {};
  const candidates = [
    root,
    root?.data,
    root?.monthly_data,
    root?.monthly_attendance,
    root?.report,
    root?.result,
  ].filter(Boolean);

  for (const candidate of candidates) {
    const lessonsCandidate =
      candidate?.lessons ||
      candidate?.monthly_lessons ||
      candidate?.lesson_list ||
      candidate?.group_lessons;
    const studentsCandidate =
      candidate?.students ||
      candidate?.monthly_students ||
      candidate?.student_list ||
      candidate?.group_students;

    if (Array.isArray(lessonsCandidate) || Array.isArray(studentsCandidate)) {
      return {
        lessonsLength: Array.isArray(lessonsCandidate) ? lessonsCandidate.length : 0,
        studentsLength: Array.isArray(studentsCandidate) ? studentsCandidate.length : 0,
      };
    }
  }

  return { lessonsLength: 0, studentsLength: 0 };
};

const fetchMonthlyAttendance = async (groupId, month) => {
  const normalizedMonth = normalizeMonth(month);
  const url = `/api/attendance/groups/${groupId}/monthly?month=${normalizedMonth}`;
  console.log("[MonthlyAttendance] month param:", normalizedMonth);
  const response = await instance.get(url);

  const summary = extractMonthlySummary(response?.data ?? response);
  console.log(
    "[MonthlyAttendance] response lengths:",
    "lessons:",
    summary.lessonsLength,
    "students:",
    summary.studentsLength
  );
  
  return response.data;
};

export const useMonthlyAttendance = (groupId, month, options = {}) => {
  const normalizedMonth = normalizeMonth(month);
  return useQuery({
    queryKey: ["monthly-attendance", groupId, normalizedMonth],
    queryFn: () => fetchMonthlyAttendance(groupId, normalizedMonth),
    enabled: !!groupId && !!normalizedMonth,
    ...options,
  });
};
