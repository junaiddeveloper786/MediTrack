// src/services/api.js
import axios from "axios";

const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL,
});

// Interceptor to attach token from localStorage or sessionStorage
API.interceptors.request.use((req) => {
  const token =
    localStorage.getItem("token") || sessionStorage.getItem("token");
  if (token) {
    req.headers.Authorization = `Bearer ${token}`;
  }
  return req;
});

export default API;
