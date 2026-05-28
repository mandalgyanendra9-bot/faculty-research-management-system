const FALLBACK_API_URL = "https://faculty-research-management-system.onrender.com/api";

export const API_URL = import.meta.env.VITE_API_URL || FALLBACK_API_URL;
export const API_ROOT = API_URL.replace(/\/api\/?$/, "");

export const toBackendFileUrl = (filePath = "") =>
  /^https?:\/\//i.test(filePath) ? filePath : `${API_ROOT}${filePath}`;
