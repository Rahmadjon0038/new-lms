
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { instance } from "./api";

// Get all students with filters
const getAllstudent = async (filters = {}) => {
    let url = '/api/students/all';
    const params = new URLSearchParams();
    
    if (filters.teacher_id && filters.teacher_id !== 'all') {
        params.append('teacher_id', filters.teacher_id);
    }
    if (filters.group_id && filters.group_id !== 'all') {
        params.append('group_id', filters.group_id);
    }
    if (filters.subject_id && filters.subject_id !== 'all') {
        params.append('subject_id', filters.subject_id);
    }
    if (filters.status && filters.status !== 'all') {
        params.append('status', filters.status);
    }
    if (filters.group_status && filters.group_status !== 'all') {
        params.append('group_status', filters.group_status);
    }
    if (filters.unassigned === 'true') {
        params.append('unassigned', 'true');
    }
    if (filters.search) {
        params.append('search', filters.search);
    }
    if (filters.page) {
        params.append('page', String(filters.page));
    }
    if (filters.limit) {
        params.append('limit', String(filters.limit));
    }
    
    if (params.toString()) {
        url += `?${params.toString()}`;
    }
    
    const response = await instance.get(url);
    return response.data
}

export const useGetAllStudents = (filters = {}, options = {}) => {
    const { data, isLoading, isFetching, error, refetch } = useQuery({
        queryKey: ['students', filters],
        queryFn: () => getAllstudent(filters),
        ...options
    })

    return { data, isLoading, isFetching, error, refetch }
}

const getAllStudentsAcrossPages = async (filters = {}) => {
    const pageSize = Math.min(Number(filters.limit) || 100, 100);
    let page = 1;
    let mergedStudents = [];
    let lastResponse = null;
    let total = 0;
    let totalPages = 1;

    while (true) {
        const response = await getAllstudent({
            ...filters,
            page,
            limit: pageSize,
        });

        lastResponse = response;
        const students = Array.isArray(response?.students) ? response.students : [];
        mergedStudents = mergedStudents.concat(students);
        total = Number(response?.pagination?.total || total || mergedStudents.length);
        totalPages = Number(response?.pagination?.total_pages || totalPages || 1);

        if (!students.length || page >= totalPages) {
            break;
        }

        page += 1;
    }

    return {
        ...lastResponse,
        students: mergedStudents,
        pagination: {
            ...(lastResponse?.pagination || {}),
            page: 1,
            limit: mergedStudents.length || pageSize,
            total: total || mergedStudents.length,
            total_pages: 1,
        },
    };
};

export const useGetAllStudentsAll = (filters = {}, options = {}) => {
    const { data, isLoading, isFetching, error, refetch } = useQuery({
        queryKey: ['students-all-pages', filters],
        queryFn: () => getAllStudentsAcrossPages(filters),
        ...options,
    });

    return { data, isLoading, isFetching, error, refetch };
};

const fetchDuplicateStudents = async () => {
    const response = await instance.get('/api/students/duplicates');
    return response.data;
};

export const useGetDuplicateStudents = (options = {}) => {
    const { data, isLoading, isFetching, error, refetch } = useQuery({
        queryKey: ['duplicate-students'],
        queryFn: fetchDuplicateStudents,
        ...options,
    });

    return { data, isLoading, isFetching, error, refetch };
};

// Register new student
const registerStudent = async (studentData) => {
    const response = await instance.post('/api/users/register', studentData);
    return response.data;
}

export const useRegisterStudent = () => {
    const queryClient = useQueryClient();
    const registerStudentMutation = useMutation({
        mutationFn: registerStudent,
        onSuccess: () => {
            queryClient.invalidateQueries(['students']);
        }
    });
    return registerStudentMutation;
}

// Join student to group
const joinStudentToGroup = async (joinData) => {
    const response = await instance.post('/api/groups/admin/join-student', joinData);
    return response.data;
}

export const useJoinStudentToGroup = () => {
    const queryClient = useQueryClient();
    const joinStudentMutation = useMutation({
        mutationFn: joinStudentToGroup,
        onSuccess: (data, vars) => {
            if (vars.onSuccess) {
                vars.onSuccess(data)
            }
            queryClient.invalidateQueries({ queryKey: ['students'] });
            queryClient.invalidateQueries({ queryKey: ['groups'] });
            queryClient.invalidateQueries({ queryKey: ['new-students-notification'] });
            queryClient.invalidateQueries({ queryKey: ['monthly-payments'] });
        },
        onError: (error, vars) => {
            if (vars.onError) {
                vars.onError(error)
            }
        }
    });
    return joinStudentMutation;
}

// -------------- Update student status ----------
const updateStudentStatus = async ({ studentId, groupId, status }) => {
    const response = await instance.patch(`/api/students/${studentId}/groups/${groupId}/status`, { status });
    return response.data;
}

export const useUpdateStudentStatus = () => {
    const queryClient = useQueryClient();
    const updateStatusMutation = useMutation({
        mutationFn: updateStudentStatus,
        onSuccess: (data, vars) => {
            queryClient.invalidateQueries({ queryKey: ['students'] });
            if (vars.onSuccess) {
                vars.onSuccess(data);
            }
        },
        onError: (err, vars) => {
            if (vars.onError) {
                vars.onError(err);
            }
        }
    });
    return updateStatusMutation;
}

// -------------- Update student info ----------
const updateStudentInfo = async ({ studentId, data }) => {
    const response = await instance.patch(`/api/users/students/${studentId}`, data);
    return response.data;
};

export const useUpdateStudentInfo = () => {
    const queryClient = useQueryClient();
    const updateStudentMutation = useMutation({
        mutationFn: updateStudentInfo,
        onSuccess: (data, vars) => {
            queryClient.invalidateQueries(['students']);
            if (vars.onSuccess) {
                vars.onSuccess(data);
            }
        },
        onError: (err, vars) => {
            if (vars.onError) {
                vars.onError(err);
            }
        }
    });
    return updateStudentMutation;
};

// -------------- Delete student ----------
const deleteStudent = async (studentId) => {
    const response = await instance.delete(`/api/students/${studentId}`);
    return response.data;
};

export const useDeleteStudent = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: deleteStudent,
        onSuccess: (data, vars) => {
            queryClient.invalidateQueries(['students']);
            if (vars?.onSuccess) {
                vars.onSuccess(data);
            }
        },
        onError: (err, vars) => {
            if (vars?.onError) {
                vars.onError(err);
            }
        }
    });
};

// -------------- Delete all unassigned students ----------
const deleteUnassignedStudents = async () => {
    const response = await instance.delete('/api/students/unassigned');
    return response.data;
};

export const useDeleteUnassignedStudents = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: deleteUnassignedStudents,
        onSuccess: (data, vars) => {
            queryClient.invalidateQueries(['students']);
            if (vars?.onSuccess) {
                vars.onSuccess(data);
            }
        },
        onError: (err, vars) => {
            if (vars?.onError) {
                vars.onError(err);
            }
        }
    });
};
