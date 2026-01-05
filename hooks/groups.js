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
const getAllgroups = async (is_active, teacher_id) => {
    let url = '/api/groups';
    const params = new URLSearchParams();
    
    if (typeof is_active === 'boolean') {
        params.append('is_active', is_active);
    }
    if (teacher_id && teacher_id !== 'all') {
        params.append('teacher_id', teacher_id);
    }
    
    if (params.toString()) {
        url += `?${params.toString()}`;
    }
    
    const response = await instance.get(url);
    return response.data;
}

export const usegetAllgroups = (is_active, teacher_id) => {
    const { data, isLoading, error } = useQuery({
        queryKey: ['groups', is_active, teacher_id],
        queryFn: () => getAllgroups(is_active, teacher_id),
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

// ----------- get group view (for students) -----------------
const getGroupView = async (id) => {
    const response = await instance.get(`/api/groups/${id}/view`);
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
const changeStudentGroup = async ({ student_id, new_group_id }) => {
    const response = await instance.post('/api/groups/change-student-group', {
        student_id: parseInt(student_id),
        new_group_id: parseInt(new_group_id)
    });
    return response.data;
}

export const useChangeStudentGroup = () => {
    const queryClient = useQueryClient();
    const changeGroupMutation = useMutation({
        mutationFn: changeStudentGroup,
        onSuccess: () => {
            queryClient.invalidateQueries(['students']);
            queryClient.invalidateQueries(['groups']);
        }
    });
    return changeGroupMutation;
}

// ----------- remove student from group -----------------
const removeStudentFromGroup = async ({ group_id, student_id }) => {
    const response = await instance.delete(`/api/groups/${group_id}/remove-student/${student_id}`);
    return response.data;
}

export const useRemoveStudentFromGroup = () => {
    const queryClient = useQueryClient();
    const removeStudentMutation = useMutation({
        mutationFn: removeStudentFromGroup,
        onSuccess: () => {
            queryClient.invalidateQueries(['students']);
            queryClient.invalidateQueries(['groups']);
        }
    });
    return removeStudentMutation;
}