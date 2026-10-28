import axios from 'axios';

// One Axios instance for the whole app
const api = axios.create({ baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api' });

// Attach the JWT to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('taskflow_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// If the server says the token is invalid/expired, log the user out
api.interceptors.response.use(
  (res) => res,
  (err) => {
    const isAuthCall = err.config?.url?.startsWith('/auth/login') || err.config?.url?.startsWith('/auth/register');
    if (err.response?.status === 401 && !isAuthCall) window.dispatchEvent(new Event('taskflow:unauthorized'));
    return Promise.reject(err);
  }
);

export const errMsg = (err) => err.response?.data?.message || (err.request ? 'Cannot reach the server. Is the backend running?' : 'Something went wrong');
export default api;
