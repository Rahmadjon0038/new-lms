import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { instance } from './api';

// ----------- Get all rooms -----------------
const getAllRooms = async () => {
    const response = await instance.get('/api/rooms');
    return response.data;
}

export const useGetAllRooms = () => {
    const { data, isLoading, error } = useQuery({
        queryKey: ['rooms'],
        queryFn: getAllRooms,
    });
    return { data, isLoading, error };
}

// ----------- Create room -----------------
const createRoom = async (roomData) => {
    const response = await instance.post('/api/rooms', roomData);
    return response.data;
}

export const useCreateRoom = () => {
    const queryClient = useQueryClient();
    const createRoomMutation = useMutation({
        mutationFn: createRoom,
        onSuccess: (data) => {
            queryClient.invalidateQueries(['rooms']);
        }
    });
    return createRoomMutation;
}

// ----------- Delete room -----------------
const deleteRoom = async (id) => {
    const response = await instance.delete(`/api/rooms/${id}`);
    return response.data;
}

export const useDeleteRoom = () => {
    const queryClient = useQueryClient();
    const deleteRoomMutation = useMutation({
        mutationFn: deleteRoom,
        onSuccess: () => {
            queryClient.invalidateQueries(['rooms']);
        }
    });
    return deleteRoomMutation;
}

// ----------- Update room -----------------
const updateRoom = async ({ id, roomData }) => {
    const response = await instance.patch(`/api/rooms/${id}`, roomData);
    return response.data;
}

export const useUpdateRoom = () => {
    const queryClient = useQueryClient();
    const updateRoomMutation = useMutation({
        mutationFn: updateRoom,
        onSuccess: () => {
            queryClient.invalidateQueries(['rooms']);
        }
    });
    return updateRoomMutation;
}

// ----------- Get room schedule -----------------
const getRoomSchedule = async (id) => {
    const response = await instance.get(`/api/rooms/${id}/schedule`);
    return response.data;
}

export const useGetRoomSchedule = (id) => {
    const { data, isLoading, error } = useQuery({
        queryKey: ['room-schedule', id],
        queryFn: () => getRoomSchedule(id),
        enabled: !!id,
    });
    return { data, isLoading, error };
}
