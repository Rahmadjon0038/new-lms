import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { instance } from "./api";

const buildQuery = (params = {}) => {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "" && value !== "all") {
      search.append(key, value);
    }
  });
  const q = search.toString();
  return q ? `?${q}` : "";
};

const extractData = (res) => res?.data?.data ?? res?.data ?? null;

const registerAdmin = async (payload) => {
  const res = await instance.post("/api/users/register-admin", payload);
  return extractData(res);
};

const getAdmins = async ({ status, month_name } = {}) => {
  const res = await instance.get(`/api/users/admins${buildQuery({ status, month_name })}`);
  return extractData(res);
};

const updateAdminStatus = async ({ adminId, status, terminationDate }) => {
  const res = await instance.patch(`/api/users/admins/${adminId}/status`, {
    status,
    terminationDate: terminationDate || null,
  });
  return extractData(res);
};

const payAdminSalary = async (payload) => {
  const res = await instance.post("/api/admin-salary/pay", payload);
  return extractData(res);
};

const getAdminSalaries = async ({ admin_id, month_name } = {}) => {
  const res = await instance.get(`/api/admin-salary${buildQuery({ admin_id, month_name })}`);
  return extractData(res);
};

export const useAdmins = ({ status, month_name }, options = {}) =>
  useQuery({
    queryKey: ["admins", status || "all", month_name || ""],
    queryFn: () => getAdmins({ status, month_name }),
    ...options,
  });

export const useCreateAdmin = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: registerAdmin,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admins"] });
    },
  });
};

export const useUpdateAdminStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateAdminStatus,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admins"] });
    },
  });
};

export const usePayAdminSalary = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: payAdminSalary,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admins"] });
      queryClient.invalidateQueries({ queryKey: ["admin-salaries"] });
    },
  });
};

export const useAdminSalaries = ({ admin_id, month_name }, options = {}) =>
  useQuery({
    queryKey: ["admin-salaries", admin_id || "all", month_name || ""],
    queryFn: () => getAdminSalaries({ admin_id, month_name }),
    ...options,
  });
