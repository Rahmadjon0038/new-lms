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

// 1️⃣b Teacher My Groups (teacher alias)
// GET /api/attendance/my-groups
const getMyAttendanceGroups = async (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.status_filter) params.append('status_filter', filters.status_filter);
    if (filters.subject_id) params.append('subject_id', filters.subject_id);
    if (filters.date) params.append('date', filters.date);
    if (filters.day) params.append('day', filters.day);
    if (filters.shift) params.append('shift', filters.shift);

    const queryString = params.toString();
    const response = await instance.get(`/api/attendance/my-groups${queryString ? `?${queryString}` : ''}`);
    return response.data;
};

export const useGetMyAttendanceGroups = (filters = {}) => {
    return useQuery({
        queryKey: ['attendance-my-groups', filters],
        queryFn: () => getMyAttendanceGroups(filters),
    });
};

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

// 8️⃣ Teacher My Lessons
// GET /api/attendance/my-lessons?date=YYYY-MM-DD
// GET /api/attendance/my-lessons?month=YYYY-MM
const getMyLessons = async ({ date, month }) => {
    const params = new URLSearchParams();
    if (month) {
        params.append('month', month);
    } else if (date) {
        params.append('date', date);
    }

    const response = await instance.get(`/api/attendance/my-lessons?${params.toString()}`);
    return response.data;
};

export const useGetMyLessons = ({ date, month }) => {
    return useQuery({
        queryKey: ['attendance-my-lessons', date, month],
        queryFn: () => getMyLessons({ date, month }),
        enabled: Boolean(date || month),
    });
};

// 9️⃣ Admin Teachers Board
// GET /api/attendance/admin/teachers?date=YYYY-MM-DD&shift=morning|evening
const getAdminTeachersBoard = async ({ date, shift }) => {
    const params = new URLSearchParams();
    if (date) params.append('date', date);
    if (shift) params.append('shift', shift);

    const response = await instance.get(`/api/attendance/admin/teachers?${params.toString()}`);
    return response.data;
};

export const useGetAdminTeachersBoard = ({ date, shift }) => {
    return useQuery({
        queryKey: ['attendance-admin-teachers', date, shift],
        queryFn: () => getAdminTeachersBoard({ date, shift }),
        enabled: Boolean(date && shift),
    });
};

// 🔟 Admin Teacher Lessons
// GET /api/attendance/admin/teachers/:teacher_id/lessons?date=...&shift=...
const getAdminTeacherLessons = async ({ teacher_id, date, shift }) => {
    const params = new URLSearchParams();
    if (date) params.append('date', date);
    if (shift) params.append('shift', shift);

    const response = await instance.get(
        `/api/attendance/admin/teachers/${teacher_id}/lessons?${params.toString()}`
    );
    return response.data;
};

export const useGetAdminTeacherLessons = ({ teacher_id, date, shift }) => {
    return useQuery({
        queryKey: ['attendance-admin-teacher-lessons', teacher_id, date, shift],
        queryFn: () => getAdminTeacherLessons({ teacher_id, date, shift }),
        enabled: Boolean(teacher_id && date && shift),
    });
};

// 1️⃣4️⃣ Attendance teacher list (admin/super_admin)
// GET /api/attendance/teachers?date=YYYY-MM-DD&shift=morning|evening
const getAttendanceTeachers = async (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.date) params.append('date', filters.date);
    if (filters.shift) params.append('shift', filters.shift);
    const queryString = params.toString();

    const response = await instance.get(`/api/attendance/teachers${queryString ? `?${queryString}` : ''}`);
    return response.data;
};

export const useGetAttendanceTeachers = (filters = {}) => {
    return useQuery({
        queryKey: ['attendance-teachers-list', filters],
        queryFn: () => getAttendanceTeachers(filters),
    });
};

// 1️⃣5️⃣ Teacher groups in attendance
// GET /api/attendance/teachers/:teacher_id/groups
const getAttendanceTeacherGroups = async (teacher_id, filters = {}) => {
    const params = new URLSearchParams();
    if (filters.date) params.append('date', filters.date);
    if (filters.day) params.append('day', filters.day);
    if (filters.shift) params.append('shift', filters.shift);

    const queryString = params.toString();
    const response = await instance.get(
        `/api/attendance/teachers/${teacher_id}/groups${queryString ? `?${queryString}` : ''}`
    );
    return response.data;
};

export const useGetAttendanceTeacherGroups = (teacher_id, filters = {}, options = {}) => {
    return useQuery({
        queryKey: ['attendance-teacher-groups', teacher_id, filters],
        queryFn: () => getAttendanceTeacherGroups(teacher_id, filters),
        enabled: Boolean(teacher_id) && (options.enabled ?? true),
    });
};

// 1️⃣1️⃣ PUT /api/attendance/lessons/:lesson_id/mark
const markLessonAttendance = async ({ lesson_id, attendance_records }) => {
    const response = await instance.put(`/api/attendance/lessons/${lesson_id}/mark`, {
        attendance_records,
    });
    return response.data;
};

export const useMarkLessonAttendance = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: markLessonAttendance,
        onSuccess: (_data, variables) => {
            queryClient.invalidateQueries({ queryKey: ['lesson-students', variables.lesson_id] });
            queryClient.invalidateQueries({ queryKey: ['attendance-my-lessons'] });
            queryClient.invalidateQueries({ queryKey: ['attendance-admin-teacher-lessons'] });
            queryClient.invalidateQueries({ queryKey: ['attendance-admin-teachers'] });
        },
    });
};

// 1️⃣2️⃣ POST /api/attendance/lessons/manual
const createManualLesson = async (payload) => {
    const response = await instance.post('/api/attendance/lessons/manual', payload);
    return response.data;
};

export const useCreateManualLesson = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: createManualLesson,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['attendance-admin-teachers'] });
            queryClient.invalidateQueries({ queryKey: ['attendance-admin-teacher-lessons'] });
            queryClient.invalidateQueries({ queryKey: ['attendance-my-lessons'] });
        },
    });
};

// 1️⃣3️⃣ PATCH /api/attendance/lessons/:lesson_id
const patchLesson = async ({ lesson_id, payload }) => {
    const response = await instance.patch(`/api/attendance/lessons/${lesson_id}`, payload);
    return response.data;
};

export const usePatchLesson = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: patchLesson,
        onSuccess: (_data, variables) => {
            queryClient.invalidateQueries({ queryKey: ['lesson-students', variables.lesson_id] });
            queryClient.invalidateQueries({ queryKey: ['attendance-admin-teachers'] });
            queryClient.invalidateQueries({ queryKey: ['attendance-admin-teacher-lessons'] });
            queryClient.invalidateQueries({ queryKey: ['attendance-my-lessons'] });
        },
    });
};

// 1️⃣6️⃣ PUT /api/attendance/student/monthly-status
const updateStudentMonthlyStatus = async (payload) => {
    const response = await instance.put('/api/attendance/student/monthly-status', payload);
    return response.data;
};

export const useUpdateStudentMonthlyStatus = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: updateStudentMonthlyStatus,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['lesson-students'] });
            queryClient.invalidateQueries({ queryKey: ['group-lessons'] });
        },
    });
};
