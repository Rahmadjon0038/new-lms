import { useMutation } from "@tanstack/react-query"

const { instance } = require("./api")

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
        onError: (err,vars) => {
            if (vars.onSuccess) {
                vars.onSuccess(err)
            }
        }
    })

    return addUserMutation
}