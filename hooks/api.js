import axios from "axios";
import Cookies from "js-cookie";

export const instance = axios.create({
  baseURL: "http://localhost:5001",
  // http://192.168.0.121:5001/
});

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Request Interceptor
instance.interceptors.request.use(
  (config) => {
    const token = Cookies.get("accessToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor
instance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      
      if (isRefreshing) {
        // Agar hozir refresh jarayoni ketayotgan bo'lsa, bu so'rovni navbatga qo'yamiz
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return instance(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = Cookies.get("refreshToken");
      
      if (!refreshToken) {
        isRefreshing = false;
        if (window.location.pathname !== "/login") {
            window.location.href = "/login";
        }
        return Promise.reject(error);
      }

      return new Promise((resolve, reject) => {
        // Oddiy axios orqali refresh qilish
        axios.post("http://localhost:5000/api/users/refresh", { refreshToken })
          .then(({ data }) => {
            const { accessToken } = data;
            Cookies.set("accessToken", accessToken);
            
            instance.defaults.headers.common["Authorization"] = `Bearer ${accessToken}`;
            originalRequest.headers.Authorization = `Bearer ${accessToken}`;
            
            processQueue(null, accessToken); // Navbatdagilarga "token tayyor" deb aytamiz
            resolve(instance(originalRequest));
          })
          .catch((err) => {
            processQueue(err, null);
            Cookies.remove("accessToken");
            Cookies.remove("refreshToken");
            if (window.location.pathname !== "/login") {
                window.location.href = "/login";
            }
            reject(err);
          })
          .finally(() => {
            isRefreshing = false;
          });
      });
    }

    return Promise.reject(error);
  }
);