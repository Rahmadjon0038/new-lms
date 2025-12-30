import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { instance } from "./api";

// -------------- I am getting prifile information ----------
const getAllgroups = async () => {
    const response = await instance.get('/api/groups');
    return response.data
}


export const usegetAllgroups = () => {
    const { data, isLoading, error } = useQuery({
        queryKey: ['groups'],
        queryFn: getAllgroups,
    })

    return { data, isLoading, error }
}

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