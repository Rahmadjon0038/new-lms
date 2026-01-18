
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
    if (filters.unassigned === 'true') {
        params.append('unassigned', 'true');
    }
    
    if (params.toString()) {
        url += `?${params.toString()}`;
    }
    
    const response = await instance.get(url);
    return response.data
}

export const useGetAllStudents = (filters = {}) => {
    const { data, isLoading, error, refetch } = useQuery({
        queryKey: ['students', filters],
        queryFn: () => getAllstudent(filters),
    })

    return { data, isLoading, error, refetch }
}

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
            queryClient.invalidateQueries(['students']);
            queryClient.invalidateQueries(['groups']);
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
const updateStudentStatus = async ({ id, status }) => {
    const response = await instance.patch(`/api/students/${id}/status`, { status });
    return response.data;
}

export const useUpdateStudentStatus = () => {
    const queryClient = useQueryClient();
    const updateStatusMutation = useMutation({
        mutationFn: updateStudentStatus,
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
    return updateStatusMutation;
}