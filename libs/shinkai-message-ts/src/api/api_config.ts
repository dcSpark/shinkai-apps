import { urlJoin } from "../utils/url-join";

export class ApiConfig {
    private static instance: ApiConfig;
    private API_ENDPOINT: string;
  
    private constructor() {
        this.API_ENDPOINT = "";
    }
  
    public static getInstance(): ApiConfig {
      if (!ApiConfig.instance) {
        ApiConfig.instance = new ApiConfig();
      }
      return ApiConfig.instance;
    }
  
    public setEndpoint(endpoint: string) {
      // hack to sanitize/remove '/' at the end
      this.API_ENDPOINT = urlJoin(endpoint);
    }
  
    public getEndpoint() {
      return this.API_ENDPOINT;
    }
  }