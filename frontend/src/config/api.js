const FALLBACK_API_URL = "https://faculty-research-management-system.onrender.com/api";
const FALLBACK_BACKEND_ROOT = "https://faculty-research-management-system.onrender.com";

export const API_URL = import.meta.env.VITE_API_URL || FALLBACK_API_URL;
export const BACKEND_ROOT = import.meta.env.VITE_BACKEND_ROOT || API_URL.replace(/\/api\/?$/, "") || FALLBACK_BACKEND_ROOT;

export const toBackendFileUrl = (filePath = "") => {
  if (!filePath) return "";
  if (/^(https?:)?\/\//i.test(filePath) || filePath.startsWith("data:") || filePath.startsWith("blob:")) {
    return filePath;
  }

  const normalizedPath = filePath.startsWith("/") ? filePath : `/${filePath}`;
  return `${BACKEND_ROOT}${normalizedPath}`;
};
