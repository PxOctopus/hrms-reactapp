// src/lib/axios.ts
import axios, { AxiosError, AxiosRequestConfig } from "axios";

/** Augment Axios config to allow skipping global auth redirect */
declare module "axios" {
  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  export interface AxiosRequestConfig {
    /** When true, do not redirect to /login on 401/403 for this request */
    skipAuthRedirect?: boolean;
  }
}

/**
 * Single Axios instance used across the app.
 * - Attaches Bearer token from localStorage
 * - Sets JSON Content-Type by default
 * - Redirects to /login on 401/403 ONLY IF a token existed (guest users stay on public pages)
 */
const BASE_URL = process.env.REACT_APP_API_URL ?? "http://localhost:9090/api";

const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: false,
});

// ---- Request interceptor ----------------------------------------------------
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    config.headers = config.headers ?? {};

    if (token) {
      (config.headers as any).Authorization = `Bearer ${token}`;
    } else {
      delete (config.headers as any).Authorization;
    }

    if (!config.headers["Content-Type"]) {
      (config.headers as any)["Content-Type"] = "application/json";
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ---- Response interceptor (401/403 handling) --------------------------------
api.interceptors.response.use(
  (res) => res,
  (err: AxiosError) => {
    const status = err?.response?.status;
    const token = localStorage.getItem("token");
    const url = (err.config?.url ?? "").toString();
    const isAuthEndpoint = url.startsWith("/auth/") || url.includes("/auth/");
    const skip = (err.config as AxiosRequestConfig | undefined)?.skipAuthRedirect;

    // Only redirect if there was a token (i.e., user expected to be authenticated),
    // not for guests on public pages. Also respect per-request opt-out.
    if ((status === 401 || status === 403) && token && !isAuthEndpoint && !skip) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      delete api.defaults.headers.common.Authorization;

      if (typeof window !== "undefined" && window.location.pathname !== "/login") {
        window.location.assign("/login");
      }
    }
    return Promise.reject(err);
  }
);

export default api;
