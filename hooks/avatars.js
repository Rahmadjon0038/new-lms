import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { instance } from "./api";

// ----------- Profil avatarlari ro'yxati -----------------
export const useGetAvatars = () => {
    return useQuery({
        queryKey: ['profile-avatars'],
        queryFn: async () => {
            const response = await instance.get('/api/profile-avatars');
            return response.data;
        },
    });
};

// ----------- Yangi avatar yuklash -----------------
export const useUploadAvatar = () => {
    const queryClient = useQueryClient();
    return useMutation({
        // { name, imageFile }
        mutationFn: async ({ name, imageFile }) => {
            const formData = new FormData();
            if (name) formData.append('name', name);
            formData.append('image', imageFile);
            const response = await instance.post('/api/profile-avatars', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            return response.data;
        },
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['profile-avatars'] }),
    });
};

// ----------- Avatarni o'chirish -----------------
export const useDeleteAvatar = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (id) => {
            const response = await instance.delete(`/api/profile-avatars/${id}`);
            return response.data;
        },
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['profile-avatars'] }),
    });
};
