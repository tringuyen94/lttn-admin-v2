// src/api/axios.js

import axios from "axios";

export const baseURL = import.meta.env.VITE_API_URL || "http://localhost:8080";
const api = axios.create({
  // eslint-disable-next-line no-undef
  baseURL, // Thay thế bằng URL API của bạn
  headers: {
    "Content-Type": "application/json",
  },
});

export default api;
