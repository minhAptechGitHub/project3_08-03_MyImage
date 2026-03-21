import axios from 'axios';

const axiosClient = axios.create({
  baseURL: 'http://localhost:5002/api', 
  headers: {
    'Content-Type': 'application/json',
  },
});

axiosClient.interceptors.request.use(
  (config) => {
    const storedUser = localStorage.getItem('user');
    const token = storedUser ? JSON.parse(storedUser)?.token : null;
    
    if (token && !config.url.includes('/login') && !config.url.includes('/register')) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => Promise.reject(error)
);

axiosClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    // In lỗi chi tiết hơn
    if (error.response) {
      console.error('API Error:', {
        status: error.response.status,
        data: error.response.data,           // ← Đây là phần quan trọng: backend trả message gì
        headers: error.response.headers,
      });

      // Nếu 401, in rõ message từ backend
      if (error.response.status === 401) {
        const backendMessage = error.response.data?.message || 'Không có quyền hoặc token không hợp lệ.';
        console.error('401 chi tiết:', backendMessage);
      }
    } else if (error.request) {
      console.error('No response received:', error.request);
    } else {
      console.error('Error setting up request:', error.message);
    }

    return Promise.reject(error);
  }
);

export default axiosClient;