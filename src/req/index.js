// src/axios.js
import axios from 'axios';

// 创建一个 axios 实例
const instance = axios.create({
  baseURL: 'http://127.0.0.1:8000', // 替换为你的API基础URL
  timeout: 5000, // 请求超时时间
});

// 添加请求拦截器
instance.interceptors.request.use(config => {
  // 在发送请求之前做些什么
  // 例如：在请求头中添加认证令牌
  // const token = localStorage.getItem('token');
  // if (token) {
  //   config.headers.Authorization = `Bearer ${token}`;
  // }
  return config;
}, error => {
  // 对请求错误做些什么
  return Promise.reject(error);
});

// 添加响应拦截器
instance.interceptors.response.use(response => {
  // 对响应数据做点什么
  return response;
}, error => {
  // 对响应错误做点什么
  return Promise.reject(error);
});

instance.post_json = (path, data, callback) => {
  instance.post(path, data, {
    headers: {
      'Content-Type': 'application/json'
    },
  }).then(resp => callback(resp))
  .catch(err => {
    console.log("axios-error", err)
  })
}

export default instance;
