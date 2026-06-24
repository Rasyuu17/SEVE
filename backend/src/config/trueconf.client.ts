import axios, { AxiosInstance, AxiosError } from 'axios';

export interface TrueConfConfig {
  baseURL: string;
  clientId: string;
  clientSecret: string;
}

export class TrueConfClient {
  private static instance: TrueConfClient;
  private client: AxiosInstance;
  private accessToken: string | null = null;
  private tokenExpiresAt: Date | null = null;
  private isRefreshing = false;
  private refreshSubscribers: ((token: string) => void)[] = [];

  private constructor(config: TrueConfConfig) {
    this.client = axios.create({
      baseURL: `${config.baseURL}/api/v3.10`,
      headers: { 'Content-Type': 'application/json' },
      timeout: 30000,
    });

    this.setupInterceptors();
    this.authenticate();
  }

  static getInstance(config?: TrueConfConfig): TrueConfClient {
    if (!TrueConfClient.instance) {
      if (!config) {
        throw new Error('TrueConfClient debe ser inicializado con una configuración');
      }
      TrueConfClient.instance = new TrueConfClient(config);
    }
    return TrueConfClient.instance;
  }

  private setupInterceptors(): void {
    this.client.interceptors.request.use(async (config) => {
      const token = await this.getValidToken();
      if (token) {
        config.params = { ...config.params, access_token: token };
      }
      return config;
    });

    this.client.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        const originalRequest = error.config as any;
        if (error.response?.status === 403 && !(originalRequest?._retry)) {
          originalRequest!._retry = true;
          await this.refreshToken();
          return this.client(originalRequest!);
        }
        return Promise.reject(error);
      }
    );
  }

  private async getValidToken(): Promise<string | null> {
    if (this.accessToken && this.tokenExpiresAt && this.tokenExpiresAt > new Date()) {
      return this.accessToken;
    }
    await this.authenticate();
    return this.accessToken;
  }

  private async authenticate(): Promise<void> {
    try {
      const response = await this.client.post(
        '/auth/token',
        {
          grant_type: 'client_credentials',
          client_id: process.env.TRUECONF_CLIENT_ID,
          client_secret: process.env.TRUECONF_CLIENT_SECRET,
        }
      );

      this.accessToken = response.data.access_token;
      this.tokenExpiresAt = new Date(Date.now() + (response.data.expires_in - 60) * 1000);
    } catch (error) {
      console.error('Error autenticando con TrueConf:', error);
      throw new Error('No se pudo obtener token de autenticación');
    }
  }

  private async refreshToken(): Promise<void> {
    if (this.isRefreshing) {
      return new Promise((resolve) => {
        this.refreshSubscribers.push(() => resolve());
      });
    }

    this.isRefreshing = true;
    try {
      await this.authenticate();
      this.refreshSubscribers.forEach(cb => cb(this.accessToken!));
      this.refreshSubscribers = [];
    } finally {
      this.isRefreshing = false;
    }
  }

  getClient(): AxiosInstance {
    return this.client;
  }
}