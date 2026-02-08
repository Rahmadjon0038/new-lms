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


export const useGetProfile = () => {
    const { data, isLoading, error } = useQuery({
        queryKey: ['user'],
        queryFn: getProfile,
    })

    return { data, isLoading, error }
}

// Backward-compatible alias
export const usegetProfile = useGetProfile;

// -------------- Forgot password with recovery key ----------
const resetPasswordWithRecoveryKey = async ({ username, recovery_key, new_password }) => {
    const response = await instance.post('/api/users/forgot-password/reset-with-key', {
        username,
        recovery_key,
        new_password,
    });
    return response.data;
};

export const useResetPasswordWithKey = () => {
    return useMutation({
        mutationFn: resetPasswordWithRecoveryKey,
        onSuccess: (data, vars) => {
            if (vars.onSuccess) vars.onSuccess(data);
        },
        onError: (err, vars) => {
            if (vars.onError) vars.onError(err);
        },
    });
};

// -------------- Change password (logged in) ----------
const changePassword = async ({ username, old_password, new_password }) => {
    const payload = { old_password, new_password };
    if (username) payload.username = username;
    const response = await instance.post('/api/users/change-password', payload);
    return response.data;
};

export const useChangePassword = () => {
    return useMutation({
        mutationFn: changePassword,
        onSuccess: (data, vars) => {
            if (vars.onSuccess) vars.onSuccess(data);
        },
        onError: (err, vars) => {
            if (vars.onError) vars.onError(err);
        },
    });
};
