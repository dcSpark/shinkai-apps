import { invoke } from '@tauri-apps/api/core';

interface AxiosLikeResponse<T = any> {
  data: T;
  status: number;
  statusText: string;
  headers: Record<string, string>;
  config: any;
  request?: any;
}

interface AxiosLikeRequestConfig {
  url?: string;
  method?: string;
  headers?: Record<string, string>;
  data?: any;
  params?: Record<string, any>;
  timeout?: number;
  responseType?: string;
}

export const httpClient = {
  async request<T = any>(config: AxiosLikeRequestConfig): Promise<AxiosLikeResponse<T>> {
    try {
      const command = config.responseType === 'json' ? 'http_request_json' : 'http_request_string';
      const response = await invoke<AxiosLikeResponse<T>>(command, { config });
      return response;
    } catch (error) {
      console.error('Error invoking Rust method:', error);
      throw error;
    }
  },

  get<T = any>(url: string, config?: AxiosLikeRequestConfig): Promise<AxiosLikeResponse<T>> {
    console.log('get config', config);
    console.log('get url', url);
    return this.request<T>({ ...config, url, method: 'GET' });
  },

  post<T = any>(url: string, data?: any, config?: AxiosLikeRequestConfig): Promise<AxiosLikeResponse<T>> {
    console.log('post config', config);
    console.log('post data', data);
    console.log('post url', url);
    return this.request<T>({ ...config, url, method: 'POST', data });
  },

  // Add other methods like put, delete, etc., as needed
};
