import { useQuery } from "@tanstack/react-query";
import { instance } from "./api";

// -------------- I am getting prifile information ----------
const getTeachers = async () => {
    const response = await instance.get('/api/users/teachers');
    return response.data
}


export const usegetTeachers = () => {
    const { data, isLoading, error } = useQuery({
        queryKey: ['teacher'],
        queryFn: getTeachers,
    })

    return { data, isLoading, error }
}