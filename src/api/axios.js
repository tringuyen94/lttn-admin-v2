// src/api/axios.js

import axios from "axios";

const rawBaseURL = import.meta.env.VITE_API_URL || "http://localhost:8080";
export const baseURL = rawBaseURL.endsWith("/")
  ? rawBaseURL
  : `${rawBaseURL}/`;

const api = axios.create({
  // eslint-disable-next-line no-undef
  baseURL,
  headers: {
    "Content-Type": "application/json",
  },
});

export default api;
