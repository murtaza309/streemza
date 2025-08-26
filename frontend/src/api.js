import axios from "axios";

const api = axios.create({
  baseURL: process.env.REACT_APP_API_BASE_URL, // comes from .env
  withCredentials: true, // if you use cookies/auth
});

export default api;
