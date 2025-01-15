import axios from 'axios';

export const httpClient = axios.create({
  timeout: 10 * 60 * 1000, // 10 minutes
});
