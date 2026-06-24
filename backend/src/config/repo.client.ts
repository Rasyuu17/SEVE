import axios, { AxiosInstance } from 'axios';

export interface RepoClientConfig {
  baseURL: string;
  apiToken: string;
}

export class RepoClient {
  private static instance: RepoClient;
  private client: AxiosInstance;
  private apiToken: string;

  private constructor(config: RepoClientConfig) {
    this.apiToken = config.apiToken;
    this.client = axios.create({
      baseURL: config.baseURL,
      timeout: 30000,
    });
  }

  static getInstance(config?: RepoClientConfig): RepoClient {
    if (!RepoClient.instance) {
      if (!config) {
        throw new Error('RepoClient debe ser inicializado con una configuración');
      }
      RepoClient.instance = new RepoClient(config);
    }
    return RepoClient.instance;
  }

  getClient(): AxiosInstance {
    return this.client;
  }

  getApiToken(): string {
    return this.apiToken;
  }
}

export default RepoClient;