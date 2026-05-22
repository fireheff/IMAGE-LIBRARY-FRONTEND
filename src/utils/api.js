export const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

export const fixLocalhost = (url) => {
  if (!url) return "";

  return url.replace("http://localhost:4000", API_URL);
};
