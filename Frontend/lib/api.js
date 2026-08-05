export const API_BASE_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3001";

export function apiUrl(path) {
  return `${API_BASE_URL}${path}`;
}
