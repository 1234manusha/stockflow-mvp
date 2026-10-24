
import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token && token !== "undefined" && token !== "null") {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  } else {
    if (config.headers) {
      delete config.headers.Authorization;
    }
  }

  return config;
});

export default api;
