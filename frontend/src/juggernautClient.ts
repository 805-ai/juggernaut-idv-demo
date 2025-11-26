import axios, { AxiosInstance, AxiosError } from 'axios';
import toast from 'react-hot-toast';

// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  permissions: string[];
}

export interface ReceiptData {
  id?: string;
  transactionId?: string;
  timestamp?: Date;
  amount?: number;
  currency?: string;
  merchant?: string;
  items?: any[];
  signature?: string;
  hash?: string;
}

export interface ChainData {
  blocks?: Block[];
  chainId?: string;
  networkId?: string;
}

export interface Block {
  hash: string;
  previousHash: string;
  timestamp: number;
  data: any;
  nonce?: number;
}

export interface GamingDetectionResult {
  id: string;
  gamingDetected: boolean;
  riskScore: number;
  patterns: any[];
  anomalies: any[];
  recommendations: string[];
}

export interface ComputationResult {
  id: string;
  status: string;
  progress: number;
  results?: any;
}

// JuggernautClient class
class JuggernautClient {
  private api: AxiosInstance;
  private authToken: string | null = null;
  private apiKey: string | null = null;

  constructor() {
    this.api = axios.create({
      baseURL: API_BASE_URL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor to add auth headers
    this.api.interceptors.request.use(
      (config) => {
        if (this.authToken) {
          config.headers.Authorization = `Bearer ${this.authToken}`;
        } else if (this.apiKey) {
          config.headers['X-API-Key'] = this.apiKey;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor for error handling
    this.api.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        if (error.response?.status === 401) {
          // Handle token refresh or redirect to login
          this.clearAuth();
          toast.error('Authentication expired. Please login again.');
        } else if (error.response?.status === 429) {
          toast.error('Too many requests. Please slow down.');
        } else if (error.response?.status === 500) {
          toast.error('Server error. Please try again later.');
        }
        return Promise.reject(error);
      }
    );

    // Load auth from localStorage if available
    this.loadAuth();
  }

  // Authentication methods
  private loadAuth(): void {
    const token = localStorage.getItem('authToken');
    const apiKey = localStorage.getItem('apiKey');

    if (token) {
      this.authToken = token;
    } else if (apiKey) {
      this.apiKey = apiKey;
    }
  }

  private saveAuth(token?: string, apiKey?: string): void {
    if (token) {
      this.authToken = token;
      localStorage.setItem('authToken', token);
    }
    if (apiKey) {
      this.apiKey = apiKey;
      localStorage.setItem('apiKey', apiKey);
    }
  }

  private clearAuth(): void {
    this.authToken = null;
    this.apiKey = null;
    localStorage.removeItem('authToken');
    localStorage.removeItem('apiKey');
  }

  // Auth endpoints
  async register(email: string, password: string, name: string): Promise<ApiResponse<User>> {
    try {
      const response = await this.api.post('/auth/register', { email, password, name });
      if (response.data.tokens?.accessToken) {
        this.saveAuth(response.data.tokens.accessToken);
      }
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async login(email: string, password: string): Promise<ApiResponse<User>> {
    try {
      const response = await this.api.post('/auth/login', { email, password });
      if (response.data.tokens?.accessToken) {
        this.saveAuth(response.data.tokens.accessToken);
      }
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async logout(): Promise<void> {
    try {
      await this.api.post('/auth/logout');
    } finally {
      this.clearAuth();
    }
  }

  async getProfile(): Promise<ApiResponse<User>> {
    try {
      const response = await this.api.get('/auth/profile');
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async generateApiKey(name: string, permissions?: string[]): Promise<ApiResponse<any>> {
    try {
      const response = await this.api.post('/auth/api-key', { name, permissions });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Health check endpoints
  async healthCheck(): Promise<ApiResponse<any>> {
    try {
      const response = await this.api.get('/health/check');
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async detailedHealthCheck(): Promise<ApiResponse<any>> {
    try {
      const response = await this.api.get('/health/detailed');
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Public key endpoints
  async getPublicKey(): Promise<ApiResponse<any>> {
    try {
      const response = await this.api.get('/keys/public');
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async verifySignature(message: string, signature: string): Promise<ApiResponse<boolean>> {
    try {
      const response = await this.api.post('/keys/verify-signature', { message, signature });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Receipt verification endpoints
  async verifyReceipt(receiptData: ReceiptData, metadata?: any): Promise<ApiResponse<any>> {
    try {
      const response = await this.api.post('/receipts/verify', { receiptData, metadata });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async batchVerifyReceipts(receipts: ReceiptData[]): Promise<ApiResponse<any>> {
    try {
      const response = await this.api.post('/receipts/batch-verify', { receipts });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async uploadReceipt(file: File): Promise<ApiResponse<any>> {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await this.api.post('/receipts/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getReceipt(receiptId: string): Promise<ApiResponse<any>> {
    try {
      const response = await this.api.get(`/receipts/${receiptId}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async listReceipts(params?: any): Promise<ApiResponse<any>> {
    try {
      const response = await this.api.get('/receipts', { params });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getReceiptStatistics(): Promise<ApiResponse<any>> {
    try {
      const response = await this.api.get('/receipts/stats');
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Chain verification endpoints
  async verifyChain(chainData: ChainData, startBlock?: number, endBlock?: number): Promise<ApiResponse<any>> {
    try {
      const response = await this.api.post('/chain/verify', { chainData, startBlock, endBlock });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getBlock(blockId: string): Promise<ApiResponse<Block>> {
    try {
      const response = await this.api.get(`/chain/block/${blockId}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getTransaction(txId: string): Promise<ApiResponse<any>> {
    try {
      const response = await this.api.get(`/chain/transaction/${txId}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async checkChainIntegrity(): Promise<ApiResponse<any>> {
    try {
      const response = await this.api.get('/chain/integrity');
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getChainStatistics(): Promise<ApiResponse<any>> {
    try {
      const response = await this.api.get('/chain/stats');
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Autonomy recomputation endpoints
  async triggerRecomputation(datasetId: string, parameters?: any): Promise<ApiResponse<ComputationResult>> {
    try {
      const response = await this.api.post('/autonomy/recompute', { datasetId, parameters });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getComputationStatus(computationId: string): Promise<ApiResponse<any>> {
    try {
      const response = await this.api.get(`/autonomy/status/${computationId}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getComputationResults(computationId: string): Promise<ApiResponse<any>> {
    try {
      const response = await this.api.get(`/autonomy/results/${computationId}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async cancelComputation(computationId: string): Promise<ApiResponse<any>> {
    try {
      const response = await this.api.post(`/autonomy/cancel/${computationId}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getComputationHistory(params?: any): Promise<ApiResponse<any>> {
    try {
      const response = await this.api.get('/autonomy/history', { params });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getAutonomyMetrics(): Promise<ApiResponse<any>> {
    try {
      const response = await this.api.get('/autonomy/metrics');
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Gaming detection endpoints
  async detectGaming(data: any, analysisType?: string): Promise<ApiResponse<GamingDetectionResult>> {
    try {
      const response = await this.api.post('/gaming/detect', { data, analysisType });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async evaluateGamingRisk(entityId: string, timeRange: { start: Date; end: Date }): Promise<ApiResponse<any>> {
    try {
      const response = await this.api.post('/gaming/evaluate', { entityId, timeRange });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getGamingPatterns(params?: any): Promise<ApiResponse<any>> {
    try {
      const response = await this.api.get('/gaming/patterns', { params });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getGamingReport(entityId: string): Promise<ApiResponse<any>> {
    try {
      const response = await this.api.get(`/gaming/report/${entityId}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getGamingAlerts(params?: any): Promise<ApiResponse<any>> {
    try {
      const response = await this.api.get('/gaming/alerts', { params });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async resolveAlert(alertId: string, resolution: string, notes?: string): Promise<ApiResponse<any>> {
    try {
      const response = await this.api.post(`/gaming/alert/${alertId}/resolve`, { resolution, notes });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getGamingStatistics(): Promise<ApiResponse<any>> {
    try {
      const response = await this.api.get('/gaming/statistics');
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Error handling
  private handleError(error: any): Error {
    if (axios.isAxiosError(error)) {
      const message = error.response?.data?.error || error.message || 'An error occurred';
      return new Error(message);
    }
    return error;
  }

  // Utility methods
  setAuthToken(token: string): void {
    this.saveAuth(token);
  }

  setApiKey(apiKey: string): void {
    this.saveAuth(undefined, apiKey);
  }

  isAuthenticated(): boolean {
    return !!(this.authToken || this.apiKey);
  }
}

// Export singleton instance
export const juggernautClient = new JuggernautClient();
export default juggernautClient;