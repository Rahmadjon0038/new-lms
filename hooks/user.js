import { useMutation, useQuery } from "@tanstack/react-query"

const { instance } = require("./api")

// --------------login user----------

const registerUser = async ({ logindata }) => {
    const response = await instance.post('/api/users/login', logindata)
    return response.data
}

export const useAddUser = () => {
    const addUserMutation = useMutation({
        mutationFn: registerUser,
        onSuccess: (data, vars) => {
            if (vars.onSuccess) {
                vars.onSuccess(data)
            }
        },
        onError: (err, vars) => {
            if (vars.onError) {
                vars.onError(err)
            }
        }
    })

    return addUserMutation
}

// -------------- I am getting prifile information ----------
const getProfile = async () => {
    const response = await instance.get('/api/users/profile');
    return response.data
}


export const usegetProfile = () => {
    const { data, isLoading, error } = useQuery({
        queryKey: ['user'],
        queryFn: getProfile,
    })

    return { data, isLoading, error }
}