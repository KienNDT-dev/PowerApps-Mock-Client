import axios from "axios";

const authAxios = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
  timeout: 10000,
});

// Token getter/setter
let getAccessToken = () => null;
export function setAccessTokenGetter(fn) {
  getAccessToken = fn;
}

// Add token to requests
authAxios.interceptors.request.use(
  (config) => {
    const token = getAccessToken();
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

// Refresh on 401
let isRefreshing = false;
let refreshPromise = null;

authAxios.interceptors.response.use(
  (res) => res,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        if (!isRefreshing) {
          isRefreshing = true;
          const { data } = await authAxios.post(
            "/auth/refresh",
            {},
            { withCredentials: true }
          );
          const newAccessToken = data.accessToken;

          if (typeof window !== "undefined" && window.setAccessToken) {
            window.setAccessToken(newAccessToken);
          }

          isRefreshing = false;
          refreshPromise = null;
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          return authAxios(originalRequest);
        }

        if (!refreshPromise) {
          refreshPromise = new Promise((resolve) => {
            const check = () =>
              !isRefreshing ? resolve() : setTimeout(check, 50);
            check();
          });
        }
        await refreshPromise;

        const token = getAccessToken();
        originalRequest.headers.Authorization = `Bearer ${token}`;
        return authAxios(originalRequest);
      } catch (err) {
        isRefreshing = false;
        refreshPromise = null;
        if (typeof window !== "undefined" && window.setAccessToken) {
          window.setAccessToken(null);
        }
        return Promise.reject(err);
      }
    }

    return Promise.reject(error);
  }
);

export default authAxios;
