// src/api/axiosInstance.js
import axios from "axios";

const instance = axios.create({
  baseURL: "http://localhost:8000/api/",
  withCredentials: true, // if you're using cookies/token auth
});

export default instance;
