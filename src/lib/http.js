import axios from "axios";

// Axios instance for API calls
const http = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? "/api",
  timeout: 10000,
  withCredentials: true,
});

// In-memory access token getter (set by AuthProvider or similar)
let getAccessToken = () => null;
let onUnauthorized = () => {};

export const setAccessTokenGetter = (fn) => {
  getAccessToken = fn;
};

export const setUnauthorizedHandler = (fn) => {
  onUnauthorized = fn;
};

// Attach Authorization header if token exists
http.interceptors.request.use((config) => {
  const token = getAccessToken?.();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  } else {
  }
  return config;
});

// Normalize errors for consistent UI handling
function normalizeAxiosError(err) {
  if (err?.isAxiosError) {
    return {
      message:
        err.response?.data?.message ||
        err.response?.data?.error?.message ||
        err.response?.data?.error ||
        err.message ||
        "Request failed",
      status: err.response?.status ?? null,
      data: err.response?.data ?? null,
      url: err.config?.url ?? null,
      method: err.config?.method ?? null,
    };
  }
  return {
    message: String(err),
    status: null,
    data: null,
    url: null,
    method: null,
  };
}

// Handle 401 responses and trigger auto-logout
http.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      console.log("❌ 401 Unauthorized - token may be expired, triggering logout");
      // Trigger logout function from AuthProvider
      onUnauthorized();
    }
    return Promise.reject(normalizeAxiosError(error));
  }
);

// API helpers: always return .data
export const api = {
  get: (url, cfg = {}) => http.get(url, cfg).then((r) => r.data),
  post: (url, body, cfg = {}) => http.post(url, body, cfg).then((r) => r.data),
  patch: (url, body, cfg = {}) => http.patch(url, body, cfg).then((r) => r.data),
  put: (url, body, cfg = {}) => http.put(url, body, cfg).then((r) => r.data),
  delete: (url, cfg = {}) => http.delete(url, cfg).then((r) => r.data),
};

export default http;
