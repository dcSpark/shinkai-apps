import axios from "axios";

export const httpClient = axios.create({
  timeout: 2 * 60 * 1000, // 2 minutes
});
