import axios from 'axios';
import { getToken, removeToken } from '@/utils/storage';
import { Message } from 'element-ui';
import router from '@/router';

const request = axios.create({
  baseURL: '/api',
  timeout: 15000,
});

request.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

request.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response && error.response.status === 401) {
      removeToken();
      router.push('/login');
    } else {
      const msg = error.response?.data?.message || '请求失败';
      Message.error(msg);
    }
    return Promise.reject(error);
  },
);

export default request;
