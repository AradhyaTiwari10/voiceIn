import axios from "axios";
const instance = axios.create({
  baseURL: "http://voicein-production.up.railway.app/api",
});
export default instance;