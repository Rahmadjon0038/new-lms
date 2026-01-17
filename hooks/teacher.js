import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { instance } from "./api";

// -------------- Get teachers information ----------
const getTeachers = async (subject_filter) => {
    let url = '/api/users/teachers';
    const params = new URLSearchParams();
    if (subject_filter && subject_filter !== 'all') {
        params.append('subject_id', subject_filter);
    }
    if (params.toString()) {
        url += `?${params.toString()}`;
    }
    const response = await instance.get(url);
    return response.data;
}

export const usegetTeachers = (subject_filter) => {
    const { data, isLoading, error } = useQuery({
        queryKey: ['teachers', subject_filter],
        queryFn: () => getTeachers(subject_filter),
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