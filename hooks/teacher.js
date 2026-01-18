import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { instance } from "./api";

// -------------- Get teachers information ----------
const getTeachers = async (subject_filter, status_filter) => {
    let url = '/api/users/teachers';
    const params = new URLSearchParams();
    if (subject_filter && subject_filter !== 'all') {
        params.append('subject_id', subject_filter);
    }
    if (status_filter && status_filter !== 'all') {
        params.append('status', status_filter);
    }
    if (params.toString()) {
        url += `?${params.toString()}`;
    }
    const response = await instance.get(url);
    return response.data;
}

export const usegetTeachers = (subject_filter, status_filter) => {
    const { data, isLoading, error } = useQuery({
        queryKey: ['teachers', subject_filter, status_filter],
        queryFn: () => getTeachers(subject_filter, status_filter),
    });

    return { data, isLoading, error };
}

// -------------- Register new teacher ----------
const registerTeacher = async (teacherData) => {
    const response = await instance.post('/api/users/register-teacher', teacherData);
    return response.data;
}

export const useRegisterTeacher = () => {
    const queryClient = useQueryClient();
    const registerTeacherMutation = useMutation({
        mutationFn: registerTeacher,
        onSuccess: (data, vars) => {
            queryClient.invalidateQueries(['teachers']);
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
    return registerTeacherMutation;
}

// -------------- Delete teacher ----------
const deleteTeacher = async (teacherId) => {
    const response = await instance.delete(`/api/users/teachers/${teacherId}`);
    return response.data;
}

export const useDeleteTeacher = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: deleteTeacher,
        onSuccess: (data, vars) => {
            queryClient.invalidateQueries(['teachers']);
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
}

// -------------- Update teacher information ----------
const updateTeacher = async ({ teacherId, teacherData }) => {
    const response = await instance.patch(`/api/users/teachers/${teacherId}`, teacherData);
    return response.data;
}

export const useUpdateTeacher = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: updateTeacher,
        onSuccess: (data, vars) => {
            queryClient.invalidateQueries(['teachers']);
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
}

// -------------- Add subject to teacher ----------
const addSubjectToTeacher = async ({ teacherId, subjectData }) => {
    const response = await instance.post(`/api/users/teachers/${teacherId}/subjects`, subjectData);
    return response.data;
}

export const useAddSubjectToTeacher = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: addSubjectToTeacher,
        onSuccess: (data, vars) => {
            queryClient.invalidateQueries(['teachers']);
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
}

// -------------- Remove subject from teacher ----------
const removeSubjectFromTeacher = async ({ teacherId, subjectId }) => {
    const response = await instance.delete(`/api/users/teachers/${teacherId}/subjects/${subjectId}`);
    return response.data;
}

export const useRemoveSubjectFromTeacher = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: removeSubjectFromTeacher,
        onSuccess: (data, vars) => {
            queryClient.invalidateQueries(['teachers']);
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
}

// -------------- Put teacher on leave ----------
const putTeacherOnLeave = async (teacherId) => {
    const response = await instance.patch(`/api/users/teachers/${teacherId}/leave`);
    return response.data;
}

export const usePutTeacherOnLeave = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: putTeacherOnLeave,
        onSuccess: (data, vars) => {
            queryClient.invalidateQueries(['teachers']);
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
}

// -------------- Terminate teacher ----------
const terminateTeacher = async (teacherId) => {
    const response = await instance.patch(`/api/users/teachers/${teacherId}/terminate`);
    return response.data;
}

export const useTerminateTeacher = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: terminateTeacher,
        onSuccess: (data, vars) => {
            queryClient.invalidateQueries(['teachers']);
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
}

// -------------- Reactivate teacher ----------
const reactivateTeacher = async (teacherId) => {
    const response = await instance.patch(`/api/users/teachers/${teacherId}/reactivate`);
    return response.data;
}

export const useReactivateTeacher = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: reactivateTeacher,
        onSuccess: (data, vars) => {
            queryClient.invalidateQueries(['teachers']);
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
}

// -------------- Update teacher full information ----------
const updateTeacherFull = async ({ teacherId, teacherData }) => {
    const response = await instance.put(`/api/users/teachers/${teacherId}`, teacherData);
    return response.data;
}

export const useUpdateTeacherFull = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: updateTeacherFull,
        onSuccess: (data, vars) => {
            queryClient.invalidateQueries(['teachers']);
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
}