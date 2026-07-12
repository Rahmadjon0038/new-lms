import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { instance } from "./api";

// Bosh sahifa kontenti: storis videolar va yangiliklar (admin boshqaruvi)

// ----------- storislar -----------------
export const useStories = (all = false) => {
    return useQuery({
        queryKey: ['stories', all],
        queryFn: async () => {
            const response = await instance.get('/api/content/stories', {
                params: all ? { all: 1 } : {},
            });
            return response.data;
        },
    });
};

export const useCreateStory = () => {
    const queryClient = useQueryClient();
    return useMutation({
        // { title, order_index, videoFile }
        mutationFn: async ({ title, order_index, videoFile }) => {
            const formData = new FormData();
            formData.append('title', title);
            if (order_index !== undefined) formData.append('order_index', String(order_index));
            formData.append('video', videoFile);
            const response = await instance.post('/api/content/stories', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            return response.data;
        },
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['stories'] }),
    });
};

export const useUpdateStory = () => {
    const queryClient = useQueryClient();
    return useMutation({
        // { id, title?, order_index?, is_active?, videoFile? }
        mutationFn: async ({ id, title, order_index, is_active, videoFile }) => {
            const formData = new FormData();
            if (title !== undefined) formData.append('title', title);
            if (order_index !== undefined) formData.append('order_index', String(order_index));
            if (is_active !== undefined) formData.append('is_active', String(is_active));
            if (videoFile) formData.append('video', videoFile);
            const response = await instance.patch(`/api/content/stories/${id}`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            return response.data;
        },
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['stories'] }),
    });
};

export const useDeleteStory = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (id) => {
            const response = await instance.delete(`/api/content/stories/${id}`);
            return response.data;
        },
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['stories'] }),
    });
};

// ----------- yangiliklar -----------------
export const useNews = (all = false) => {
    return useQuery({
        queryKey: ['news', all],
        queryFn: async () => {
            const response = await instance.get('/api/content/news', {
                params: all ? { all: 1 } : {},
            });
            return response.data;
        },
    });
};

export const useCreateNews = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (payload) => {
            const response = await instance.post('/api/content/news', payload);
            return response.data;
        },
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['news'] }),
    });
};

export const useUpdateNews = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ id, ...payload }) => {
            const response = await instance.patch(`/api/content/news/${id}`, payload);
            return response.data;
        },
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['news'] }),
    });
};

export const useDeleteNews = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (id) => {
            const response = await instance.delete(`/api/content/news/${id}`);
            return response.data;
        },
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['news'] }),
    });
};
