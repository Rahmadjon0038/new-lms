import { useMutation, useQueries, useQuery, useQueryClient } from "@tanstack/react-query";
import { instance } from './api';
import { useGetNotify } from './notify';

// ----------- update group -----------------
const updateGroup = async ({ id, groupdata }) => {
    const payload = { ...groupdata };
    if (typeof window !== "undefined" && window.location.pathname.startsWith("/teacher")) {
        delete payload.teacher_id;
    }
    const response = await instance.patch(`/api/groups/${id}`, payload);
    return response.data;
}

export const useUpdateGroup = () => {
    const quericlient = useQueryClient();
    const updateGroupMutation = useMutation({
        mutationFn: updateGroup,
        onSuccess: (data, vars) => {
            if (vars.onSuccess) {
                vars.onSuccess(data);
                quericlient.invalidateQueries(['groups']);
            }
        },
        onError: (err, vars) => {
            if (vars.onError) {
                vars.onError(err);
            }
        }
    });
    return updateGroupMutation;
}

// ----------- change group status -----------------
const changeGroupStatus = async ({ id, status }) => {
    const response = await instance.patch(`/api/groups/${id}/status`, { status });
    return response.data;
}

export const useChangeGroupStatus = () => {
    const quericlient = useQueryClient();
    const notify = useGetNotify();
    
    const changeStatusMutation = useMutation({
        mutationFn: changeGroupStatus,
        onSuccess: (data, vars) => {
            quericlient.invalidateQueries(['groups']);
            
            // Backend xabarini ko'rsatish
            const message = data.message || 'Guruh holati muvaffaqiyatli o\'zgartirildi';
            notify('ok', message);
            
            if (vars.onSuccess) {
                vars.onSuccess(data);
            }
        },
        onError: (err, vars) => {
            // Backend error xabarini ko'rsatish
            const errorMessage = err?.response?.data?.message || 'Guruh holatini o\'zgartirishda xatolik yuz berdi';
            notify('err', errorMessage);
            
            if (vars.onError) {
                vars.onError(err);
            }
        }
    });
    return changeStatusMutation;
}

// ----------- delete group -----------------
const deleteGroup = async (id) => {
    const response = await instance.delete(`/api/groups/${id}`);
    return response.data;
}

export const useDeleteGroup = () => {
    const quericlient = useQueryClient();
    const notify = useGetNotify();

    const deleteGroupMutation = useMutation({
        mutationFn: deleteGroup,
        onSuccess: (data, vars) => {
            quericlient.invalidateQueries(['groups']);

            const message = data?.message || "Guruh muvaffaqiyatli o'chirildi";
            notify('ok', message);

            if (vars?.onSuccess) {
                vars.onSuccess(data);
            }
        },
        onError: (err, vars) => {
            const errorMessage = err?.response?.data?.message || "Guruhni o'chirishda xatolik yuz berdi";
            notify('err', errorMessage);

            if (vars?.onError) {
                vars.onError(err);
            }
        }
    });

    return deleteGroupMutation;
}

// -------------- Get all groups information ----------
const getAllgroups = async (status, teacher_id, subject_id) => {
    let url = '/api/groups';
    const params = new URLSearchParams();
    
    if (status && status !== 'all') {
        params.append('status', status);
    }
    if (teacher_id && teacher_id !== 'all') {
        params.append('teacher_id', teacher_id);
    }
    if (subject_id && subject_id !== 'all') {
        params.append('subject_id', subject_id);
    }
    
    if (params.toString()) {
        url += `?${params.toString()}`;
    }
    
    const response = await instance.get(url);
    return response.data;
}

export const useGetAllgroups = (status, teacher_id, subject_id, options = {}) => {
    const { data, isLoading, error } = useQuery({
        queryKey: ['groups', status, teacher_id, subject_id],
        queryFn: () => getAllgroups(status, teacher_id, subject_id),
        ...options,
    });
    return { data, isLoading, error };
}

export const usegetAllgroups = useGetAllgroups;

// -----------  create new group -----------------
const createGroup = async ({ groupdata }) => {
    const response = await instance.post('/api/groups/create', groupdata)
    return response.data
}

export const useCreateGroup = () => {
    const quericlient = useQueryClient();
    const createGroupMutation = useMutation({
        mutationFn: createGroup,
        onSuccess: (data, vars) => {
            if (vars.onSuccess) {
                vars.onSuccess(data)
                quericlient.invalidateQueries(['groups'])
            }
        },
        onError: (err, vars) => {
            if (vars.onError) {
                vars.onError(err)
            }
        }
    })

    return createGroupMutation
}

// ----------- get group by id -----------------
// month (YYYY-MM) berilsa studentlarning monthly_points balli o'sha oy uchun keladi
const getGroupById = async (id, month) => {
    const response = await instance.get(`/api/groups/${id}`, {
        params: month ? { month } : {},
    });
    return response.data;
}

export const useGetGroupById = (id, month) => {
    const { data, isLoading, error } = useQuery({
        queryKey: month ? ['group', id, month] : ['group', id],
        queryFn: () => getGroupById(id, month),
        enabled: !!id, // Only run query if id exists
    });
    return { data, isLoading, error };
}

// ----------- bir nechta guruh tafsiloti (eng yaxshi o'quvchilar uchun) -----------------
// Har bir guruh uchun /api/groups/:id ni parallel chaqiradi
export const useGetGroupsDetails = (groupIds, month) => {
    const results = useQueries({
        queries: (groupIds || []).map((id) => ({
            queryKey: month ? ['group', id, month] : ['group', id],
            queryFn: () => getGroupById(id, month),
            enabled: !!id,
        })),
    });
    return {
        details: results.map((r) => r.data).filter(Boolean),
        isLoading: results.some((r) => r.isLoading),
    };
}

// ----------- get group view (for students) -----------------
const getGroupView = async (id) => {
    const response = await instance.get(`/api/students/my-group-info/${id}`);
    return response.data;
}

export const useGetGroupView = (id) => {
    const { data, isLoading, error } = useQuery({
        queryKey: ['group-view', id],
        queryFn: () => getGroupView(id),
        enabled: !!id, // Only run query if id exists
    });
    return { data, isLoading, error };
}

// ----------- get student's groups -----------------
const getStudentGroups = async () => {
    const response = await instance.get('/api/students/my-groups');
    return response.data;
}

export const useGetStudentGroups = () => {
    const { data, isLoading, error } = useQuery({
        queryKey: ['student-groups'],
        queryFn: getStudentGroups,
    });
    return { data, isLoading, error };
}

// ----------- join group by code -----------------
const joinGroupByCode = async (unique_code) => {
    const response = await instance.post('/api/groups/join', { unique_code });
    return response.data;
}

export const useJoinGroupByCode = () => {
    const queryClient = useQueryClient();
    const joinGroupMutation = useMutation({
        mutationFn: joinGroupByCode,
        onSuccess: (data) => {
            // Refresh student groups after joining
            queryClient.invalidateQueries(['student-groups']);
        }
    });
    return joinGroupMutation;
}

// ----------- change student group -----------------
const changeStudentGroup = async ({ student_id, new_group_id, old_group_id }) => {
    const payload = {
        student_id: parseInt(student_id),
        new_group_id: parseInt(new_group_id)
    };
    // Admin aynan qaysi guruh qatoridan o'zgartirganini backendga yuboramiz —
    // talaba bir nechta guruhda bo'lsa, to'g'ri a'zolik o'chiriladi
    if (old_group_id) {
        payload.old_group_id = parseInt(old_group_id);
    }
    const response = await instance.post('/api/groups/change-student-group', payload);
    return response.data;
}

export const useChangeStudentGroup = () => {
    const queryClient = useQueryClient();
    const changeGroupMutation = useMutation({
        mutationFn: changeStudentGroup,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['students'] });
            queryClient.invalidateQueries({ queryKey: ['groups'] });
            queryClient.invalidateQueries({ queryKey: ['new-students-notification'] });
            queryClient.invalidateQueries({ queryKey: ['monthly-payments'] });
        }
    });
    return changeGroupMutation;
}

// ----------- bulk join students to group -----------------
const bulkJoinStudentsToGroup = async ({ group_id, student_ids }) => {
    const response = await instance.post('/api/groups/admin/bulk-join-students', {
        group_id: Number(group_id),
        student_ids: student_ids.map((id) => Number(id))
    });
    return response.data;
}

export const useBulkJoinStudentsToGroup = () => {
    const queryClient = useQueryClient();
    const bulkJoinMutation = useMutation({
        mutationFn: bulkJoinStudentsToGroup,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['students'] });
            queryClient.invalidateQueries({ queryKey: ['groups'] });
            queryClient.invalidateQueries({ queryKey: ['new-students-notification'] });
            queryClient.invalidateQueries({ queryKey: ['monthly-payments'] });
        }
    });
    return bulkJoinMutation;
}

// ----------- remove student from group -----------------
const removeStudentFromGroup = async ({ group_id, student_id, reason }) => {
    const normalizedReason = String(reason || '').trim();
    const response = await instance.delete(`/api/groups/${group_id}/remove-student/${student_id}`, {
        params: {
            reason: normalizedReason
        },
        data: {
            reason: normalizedReason
        }
    });
    return response.data;
}

export const useRemoveStudentFromGroup = () => {
    const queryClient = useQueryClient();
    const removeStudentMutation = useMutation({
        mutationFn: removeStudentFromGroup,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['students'] });
            queryClient.invalidateQueries({ queryKey: ['groups'] });
            queryClient.invalidateQueries({ queryKey: ['lesson-students'] });
            queryClient.invalidateQueries({ queryKey: ['group-lessons'] });
            queryClient.invalidateQueries({ queryKey: ['monthly-attendance'] });
            queryClient.invalidateQueries({ queryKey: ['new-students-notification'] });
            queryClient.invalidateQueries({ queryKey: ['monthly-payments'] });
        }
    });
    return removeStudentMutation;
}

// ----------- bulk remove students from group -----------------
const bulkRemoveStudentsFromGroup = async ({ group_id, student_ids, reason }) => {
    const normalizedReason = String(reason || '').trim();
    const response = await instance.delete(`/api/groups/${group_id}/remove-students`, {
        params: {
            reason: normalizedReason
        },
        data: {
            student_ids: student_ids.map((id) => Number(id)),
            reason: normalizedReason
        }
    });
    return response.data;
}

export const useBulkRemoveStudentsFromGroup = () => {
    const queryClient = useQueryClient();
    const bulkRemoveMutation = useMutation({
        mutationFn: bulkRemoveStudentsFromGroup,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['students'] });
            queryClient.invalidateQueries({ queryKey: ['groups'] });
            queryClient.invalidateQueries({ queryKey: ['new-students-notification'] });
            queryClient.invalidateQueries({ queryKey: ['monthly-payments'] });
        }
    });
    return bulkRemoveMutation;
}

// ----------- bulk change students group -----------------
const bulkChangeStudentsGroup = async ({ from_group_id, new_group_id, student_ids }) => {
    const payload = {
        new_group_id: Number(new_group_id),
        student_ids: student_ids.map((id) => Number(id))
    };

    if (from_group_id) {
        payload.from_group_id = Number(from_group_id);
    }

    const response = await instance.post('/api/groups/change-students-group', payload);
    return response.data;
}

export const useBulkChangeStudentsGroup = () => {
    const queryClient = useQueryClient();
    const bulkChangeMutation = useMutation({
        mutationFn: bulkChangeStudentsGroup,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['students'] });
            queryClient.invalidateQueries({ queryKey: ['groups'] });
            queryClient.invalidateQueries({ queryKey: ['new-students-notification'] });
            queryClient.invalidateQueries({ queryKey: ['monthly-payments'] });
        }
    });
    return bulkChangeMutation;
}

// ----------- get teacher's groups -----------------
const getTeacherGroups = async () => {
    const response = await instance.get('/api/groups/teacher/my-groups');
    return response.data;
}

export const useGetTeacherGroups = () => {
    const { data, isLoading, error, refetch } = useQuery({
        queryKey: ['teacher-groups'],
        queryFn: getTeacherGroups,
    });
    return { data, isLoading, error, refetch };
}

// ----------- get teacher's group by id -----------------
const getTeacherGroupById = async (id) => {
    const response = await instance.get(`/api/groups/teacher/my-groups/${id}`);
    return response.data;
}

export const useGetTeacherGroupById = (id) => {
    const { data, isLoading, error, refetch } = useQuery({
        queryKey: ['teacher-group', id],
        queryFn: () => getTeacherGroupById(id),
        enabled: !!id,
    });
    return { data, isLoading, error, refetch };
}
