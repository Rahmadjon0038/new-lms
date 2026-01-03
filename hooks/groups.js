// ----------- update group -----------------
const updateGroup = async ({ id, groupdata }) => {
    const response = await instance.patch(`/api/groups/${id}`, groupdata);
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
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { instance } from "./api";

// -------------- I am getting prifile information ----------
const getAllgroups = async (is_active) => {
    let url = '/api/groups';
    if (typeof is_active === 'boolean') {
        url += `?is_active=${is_active}`;
    }
    const response = await instance.get(url);
    return response.data;
}

export const usegetAllgroups = (is_active) => {
    const { data, isLoading, error } = useQuery({
        queryKey: ['groups', is_active],
        queryFn: () => getAllgroups(is_active),
    });
    return { data, isLoading, error };
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

// ----------- get group by id -----------------
const getGroupById = async (id) => {
    const response = await instance.get(`/api/groups/${id}`);
    return response.data;
}

export const useGetGroupById = (id) => {
    const { data, isLoading, error } = useQuery({
        queryKey: ['group', id],
        queryFn: () => getGroupById(id),
        enabled: !!id, // Only run query if id exists
    });
    return { data, isLoading, error };
}