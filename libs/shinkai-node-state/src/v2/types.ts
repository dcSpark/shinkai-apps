import { type AxiosError } from 'axios';

export type APIError = AxiosError<{
  code: number;
  error: string;
  message: string;
}>;
