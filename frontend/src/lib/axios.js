import axios from "axios";

export const axiosInstance = axios.create({
  baseURL:
    import.meta.env.MODE === "developmen"
      ? "http://localhost:5001/api"
      : "/api", // adjust if needed
  withCredentials: true, // this is required
});
