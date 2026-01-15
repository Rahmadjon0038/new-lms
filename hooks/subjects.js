import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { instance } from "./api";

// -------------- Get all subjects ----------
const getAllSubjects = async () => {
    const response = await instance.get('/api/subjects');
    return response.data;
}

export const useGetAllSubjects = () => {
    const { data, isLoading, error } = useQuery({
        queryKey: ['subjects'],
        queryFn: getAllSubjects,
    });
    return { data, isLoading, error };
}

// -------------- Get subject stats ----------
const getSubjectStats = async (id) => {
    const response = await instance.get(`/api/subjects/${id}/stats`);
    return response.data;
}

export const useGetSubjectStats = (id) => {
    const { data, isLoading, error } = useQuery({
        queryKey: ['subject-stats', id],
        queryFn: () => getSubjectStats(id),
        enabled: !!id,
    });
    return { data, isLoading, error };
}

// -------------- Create subject ----------
const createSubject = async (subjectData) => {
    const response = await instance.post('/api/subjects/create', subjectData);
    return response.data;
}

export const useCreateSubject = () => {
    const queryClient = useQueryClient();
    const createSubjectMutation = useMutation({
        mutationFn: createSubject,
        onSuccess: (data, vars) => {
            queryClient.invalidateQueries(['subjects']);
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
    return createSubjectMutation;
}

// -------------- Update subject ----------
const updateSubject = async ({ id, subjectData }) => {
    const response = await instance.put(`/api/subjects/${id}`, subjectData);
    return response.data;
}

export const useUpdateSubject = () => {
    const queryClient = useQueryClient();
    const updateSubjectMutation = useMutation({
        mutationFn: updateSubject,
        onSuccess: (data, vars) => {
            queryClient.invalidateQueries(['subjects']);
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
    return updateSubjectMutation;
}

// -------------- Delete subject ----------
const deleteSubject = async (id) => {
    const response = await instance.delete(`/api/subjects/${id}`);
    return response.data;
}

export const useDeleteSubject = () => {
    const queryClient = useQueryClient();
    const deleteSubjectMutation = useMutation({
        mutationFn: deleteSubject,
        onSuccess: (data, vars) => {
            queryClient.invalidateQueries(['subjects']);
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
    return deleteSubjectMutation;
}