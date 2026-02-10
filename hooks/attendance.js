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

// 3️⃣ Talabaning oylik davomat hisoboti (snapshot API)
// GET /api/snapshots/attendance?group_id={group_id}&month={month}[&student_id={student_id}]
const getStudentMonthlyAttendance = async (group_id, month, student_id = null) => {
    const params = new URLSearchParams();
    params.append('group_id', group_id);
    params.append('month', month);
    if (student_id) {
        params.append('student_id', student_id);
    }
    const response = await instance.get(`/api/snapshots/attendance?${params.toString()}`);
    return response.data;
}

export const useGetStudentMonthlyAttendance = (group_id, month, student_id = null) => {
    return useQuery({
        queryKey: ['student-monthly-attendance', group_id, month, student_id],
        queryFn: () => getStudentMonthlyAttendance(group_id, month, student_id),
        enabled: !!(group_id && month), // Only run when required params exist
    });
}

// 📊 Snapshot davomat ma'lumotlari - yangi API
// GET /api/snapshots/attendance?student_id={student_id}&group_id={group_id}&month={month}&teacher_id={teacher_id}&subject_id={subject_id}
const getStudentAttendanceSnapshot = async (student_id, group_id, month, teacher_id = null, subject_id = null) => {
    const params = new URLSearchParams();
    params.append('student_id', student_id);
    params.append('group_id', group_id);
    params.append('month', month);
    
    // Add optional filters
    if (teacher_id) {
        params.append('teacher_id', teacher_id);
    }
    if (subject_id) {
        params.append('subject_id', subject_id);
    }
    
    const response = await instance.get(`/api/snapshots/attendance?${params.toString()}`);
    return response.data;
}

export const useGetStudentAttendanceSnapshot = (student_id, group_id, month, teacher_id = null, subject_id = null) => {
    return useQuery({
        queryKey: ['student-attendance-snapshot', student_id, group_id, month, teacher_id, subject_id],
        queryFn: () => getStudentAttendanceSnapshot(student_id, group_id, month, teacher_id, subject_id),
        enabled: !!(student_id && group_id && month), // Only run when all required params exist
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

// 6️⃣ Guruh darslari (auto-generate bilan)
// GET /api/attendance/groups/{group_id}/lessons?month=YYYY-MM
const getGroupLessons = async ({ group_id, month }) => {
    const params = new URLSearchParams();
    if (month) {
        params.append('month', month);
    }

    const queryString = params.toString();
    const response = await instance.get(
        `/api/attendance/groups/${group_id}/lessons${queryString ? `?${queryString}` : ''}`
    );
    return response.data?.data ?? response.data;
}

export const useGetGroupLessons = (group_id, month) => {
    return useQuery({
        queryKey: ['group-lessons', group_id, month],
        queryFn: () => getGroupLessons({ group_id, month }),
        enabled: !!group_id,
    });
}

// 7️⃣ Lesson sanasini o'zgartirish
// PUT /api/attendance/lessons/{lesson_id}/date
const updateLessonDate = async ({ lesson_id, date }) => {
    const response = await instance.put(`/api/attendance/lessons/${lesson_id}/date`, { date });
    return response.data;
}

export const useUpdateLessonDate = (group_id, month) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: updateLessonDate,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['group-lessons', group_id, month] });
        },
    });
}
