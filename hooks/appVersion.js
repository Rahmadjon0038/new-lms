import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { instance } from './api';

// ----------- Get all app versions (android + ios) -----------------
const getAppVersions = async () => {
    const response = await instance.get('/api/app/versions');
    return response.data;
}

export const useGetAppVersions = () => {
    const { data, isLoading, error } = useQuery({
        queryKey: ['app-versions'],
        queryFn: getAppVersions,
    });
    return { data, isLoading, error };
}

// ----------- Update app version for a platform -----------------
const updateAppVersion = async ({ platform, versionData }) => {
    const response = await instance.patch(`/api/app/versions/${platform}`, versionData);
    return response.data;
}

export const useUpdateAppVersion = () => {
    const queryClient = useQueryClient();
    const updateAppVersionMutation = useMutation({
        mutationFn: updateAppVersion,
        onSuccess: () => {
            queryClient.invalidateQueries(['app-versions']);
        }
    });
    return updateAppVersionMutation;
}
