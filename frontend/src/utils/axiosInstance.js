import axios from "axios";

const baseURL = import.meta.env.VITE_API_URL || "http://localhost:5001/api";

const instance = axios.create({
  baseURL: baseURL,
});

export default instance;