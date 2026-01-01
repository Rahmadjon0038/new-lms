
import { useQuery } from "@tanstack/react-query";
import { instance } from "./api";

const getAllstudent = async () => {
    const response = await instance.get('/api/students/all');
    return response.data
}


export const useGetAllStudents = () => {
    const { data, isLoading, error } = useQuery({
        queryKey: ['students'],
        queryFn: getAllstudent,
    })

    return { data, isLoading, error }
}