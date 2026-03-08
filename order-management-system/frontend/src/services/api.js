import axios from 'axios';

const API_BASE_URL = 'http://localhost:9090';

const api = axios.create({
    baseURL: `${API_BASE_URL}/api/v1`,
});

const getImageUrl = (path) => {
    if (!path) return null;
    if (path.startsWith('data:image')) return path;
    return `${API_BASE_URL}${path}`;
};

export { API_BASE_URL, getImageUrl };

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            localStorage.clear();
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export default api;
