import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

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

// -------------- Update profile (logged in) ----------
const PROFILE_UPDATABLE_FIELDS = new Set([
    "username",
    "name",
    "surname",
    "phone",
    "phone2",
    "father_name",
    "father_phone",
    "address",
    "age",
    "certificate",
    "has_experience",
    "experience_years",
    "experience_place",
    "available_times",
    "work_days_hours",
]);

const INTEGER_FIELDS = new Set(["age", "experience_years"]);

const updateProfile = async (vars = {}) => {
    const payload = {};

    Object.keys(vars).forEach((key) => {
        if (!PROFILE_UPDATABLE_FIELDS.has(key)) return;

        let value = vars[key];
        if (typeof value === "string") value = value.trim();
        if (value === undefined) return;

        if (INTEGER_FIELDS.has(key)) {
            if (value === "" || value === null) {
                payload[key] = null;
                return;
            }
            if (typeof value === "string" && value !== "") {
                const parsed = Number(value);
                value = parsed;
            }
            if (!Number.isInteger(value)) {
                throw new Error(`${key} butun son bo'lishi kerak`);
            }
        }

        if (key === "has_experience" && typeof value !== "boolean") {
            throw new Error("has_experience boolean bo'lishi kerak");
        }

        payload[key] = value;
    });

    if (Object.keys(payload).length === 0) {
        throw new Error("Kamida bitta ruxsat etilgan maydon yuboring");
    }

    if (Object.prototype.hasOwnProperty.call(payload, "username") && !payload.username) {
        throw new Error("username bo'sh bo'lmasligi kerak");
    }

    const response = await instance.patch('/api/users/profile', payload);
    return response.data;
};

export const useUpdateProfile = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: updateProfile,
        onSuccess: (data, vars) => {
            queryClient.invalidateQueries({ queryKey: ['user'] });
            if (vars.onSuccess) vars.onSuccess(data);
        },
        onError: (err, vars) => {
            if (vars.onError) vars.onError(err);
        },
    });
};
