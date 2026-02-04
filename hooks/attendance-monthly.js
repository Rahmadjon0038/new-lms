import { useQuery } from "@tanstack/react-query";
import { instance } from "./api";

// groupId: string | number, month: string (YYYY-MM)
const fetchMonthlyAttendance = async (groupId, month) => {
  const url = `/api/attendance/groups/${groupId}/monthly?month=${month}`;
  const response = await instance.get(url);
  
  // Debug: Log API response
  console.log('Monthly Attendance API Response:', response.data);
  console.log('Students in response:', response.data?.data?.students);
  
  return response.data;
};

export const useMonthlyAttendance = (groupId, month, options = {}) => {
  return useQuery({
    queryKey: ["monthly-attendance", groupId, month],
    queryFn: () => fetchMonthlyAttendance(groupId, month),
    enabled: !!groupId && !!month,
    ...options,
  });
};
