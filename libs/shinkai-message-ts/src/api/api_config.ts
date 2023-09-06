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
      this.API_ENDPOINT = endpoint;
    }
  
    public getEndpoint() {
      return this.API_ENDPOINT;
    }
  }