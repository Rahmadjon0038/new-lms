
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { instance } from "./api";

// Get all students
const getAllstudent = async () => {
    const response = await instance.get('/api/students/all');
    return response.data
}

export const useGetAllStudents = () => {
    const { data, isLoading, error, refetch } = useQuery({
        queryKey: ['students'],
        queryFn: getAllstudent,
    })

    return { data, isLoading, error, refetch }
}

// Register new student
const registerStudent = async (studentData) => {
    const response = await instance.post('/api/users/register', studentData);
    return response.data;
}

export const useRegisterStudent = () => {
    const queryClient = useQueryClient();
    const registerStudentMutation = useMutation({
        mutationFn: registerStudent,
        onSuccess: () => {
            queryClient.invalidateQueries(['students']);
        }
    });
    return registerStudentMutation;
}

// Join student to group
const joinStudentToGroup = async (joinData) => {
    const response = await instance.post('/api/groups/admin/join-student', joinData);
    return response.data;
}

export const useJoinStudentToGroup = () => {
    const queryClient = useQueryClient();
    const joinStudentMutation = useMutation({
        mutationFn: joinStudentToGroup,
        onSuccess: (data, vars) => {
            if (vars.onSuccess) {
                vars.onSuccess(data)
            }
            queryClient.invalidateQueries(['students']);
            queryClient.invalidateQueries(['groups']);
        },
        onError: (error, vars) => {
            if (vars.onError) {
                vars.onError(error)
            }
        }
    });
    return joinStudentMutation;
}