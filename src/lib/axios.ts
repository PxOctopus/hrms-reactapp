import axios from "axios";

const BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:9090/api";

const axiosInstance = axios.create({
  baseURL: BASE_URL,
  //  headers: { "Content-Type": "application/json" }, move to interceptor
});

// Add Authorization token to every request if available
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    config.headers["Content-Type"] = "application/json";
    return config;
  },
  (error) => Promise.reject(error)
);

// Handle global 401s
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.warn("Unauthorized access – possibly expired token.");
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;