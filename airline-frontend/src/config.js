// In unified production deployment (Render), both frontend & backend are on the same origin.
// In local dev without full build, fallback to localhost:8000.
export const API_BASE_URL = import.meta.env.VITE_API_URL !== undefined 
  ? import.meta.env.VITE_API_URL 
  : (import.meta.env.DEV ? 'http://127.0.0.1:8000' : '');

