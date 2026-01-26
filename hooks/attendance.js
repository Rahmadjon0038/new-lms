import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { instance } from './api';

// ========== YANGI ATTENDANCE API'LAR ==========

// 1️⃣ Guruxlar ro'yxati (Admin yoki Teacher rolga qarab)
// GET /api/attendance/groups
const getAttendanceGroups = async (filters = {}) => {
    const params = new URLSearchParams();
    
    // Filter parametrlarini qo'shish
    if (filters.teacher_id) {
        params.append('teacher_id', filters.teacher_id);
    }
    if (filters.subject_id) {
        params.append('subject_id', filters.subject_id);
    }
    if (filters.status_filter) {
        params.append('status_filter', filters.status_filter);
    }
    
    const queryString = params.toString();
    const url = `/api/attendance/groups${queryString ? `?${queryString}` : ''}`;
    
    const response = await instance.get(url);
    return response.data;
}

export const useGetAttendanceGroups = (filters = {}) => {
    return useQuery({
        queryKey: ['attendance-groups', filters],
        queryFn: () => getAttendanceGroups(filters),
    });
}

// 2️⃣ Bugungi darsni yaratish
// POST /api/attendance/groups/{group_id}/create-lesson
const createTodayLesson = async (group_id) => {
    const response = await instance.post(`/api/attendance/groups/${group_id}/create-lesson`);
    return response.data;
}

export const useCreateTodayLesson = () => {
    const queryClient = useQueryClient();
    
    return useMutation({
        mutationFn: createTodayLesson,
        onSuccess: () => {
            queryClient.invalidateQueries(['attendance-groups']);
        }
    });
}

// 3️⃣ Talabaning oylik davomat hisoboti
// GET /api/attendance/students/{student_id}/monthly
const getStudentMonthlyAttendance = async (student_id, month) => {
    const response = await instance.get(`/api/attendance/students/${student_id}/monthly?month=${month}`);
    return response.data;
}

export const useGetStudentMonthlyAttendance = (student_id, month) => {
    return useQuery({
        queryKey: ['student-monthly-attendance', student_id, month],
        queryFn: () => getStudentMonthlyAttendance(student_id, month),
        enabled: !!(student_id && month), // Only run when both params exist
    });
}

// 3️⃣ Dars studentlari va davomat holati
// GET /api/attendance/lessons/{lesson_id}/students
const getLessonStudents = async (lesson_id) => {
    const response = await instance.get(`/api/attendance/lessons/${lesson_id}/students`);
    return response.data;
}

export const useGetLessonStudents = (lesson_id) => {
    return useQuery({
        queryKey: ['lesson-students', lesson_id],
        queryFn: () => getLessonStudents(lesson_id),
        enabled: !!lesson_id,
    });
}

// 4️⃣ Davomatni saqlash
// POST /api/attendance/save
const saveAttendance = async ({ lesson_id, attendance_data }) => {
    const response = await instance.post('/api/attendance/save', {
        lesson_id,
        attendance_data
    });
    return response.data;
}

export const useSaveAttendance = () => {
    const queryClient = useQueryClient();
    
    return useMutation({
        mutationFn: saveAttendance,
        onSuccess: (data, variables) => {
            queryClient.invalidateQueries(['lesson-students', variables.lesson_id]);
            queryClient.invalidateQueries(['monthly-attendance']);
        }
    });
}

// 5️⃣ Oylik davomat jadvali
// GET /api/attendance/groups/{group_id}/monthly?month=YYYY-MM
const getMonthlyAttendance = async ({ group_id, month }) => {
    const params = new URLSearchParams();
    if (month) params.append('month', month);
    
    const response = await instance.get(`/api/attendance/groups/${group_id}/monthly?${params.toString()}`);
    return response.data;
}

export const useGetMonthlyAttendance = (group_id, month) => {
    return useQuery({
        queryKey: ['monthly-attendance', group_id, month],
        queryFn: () => getMonthlyAttendance({ group_id, month }),
        enabled: !!group_id && !!month,
    });
}
