// API client for backend communication
const API_BASE_URL = import.meta.env.DEV ? '/api/v1' : `${window.location.origin}/api/v1`;

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const url = `${this.baseUrl}${endpoint}`;
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.error || 'Request failed',
        };
      }

      return {
        success: true,
        data,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error',
      };
    }
  }

  // Auth endpoints
  async verifySession(accessToken: string) {
    return this.request('/auth/verify-session', {
      method: 'POST',
      body: JSON.stringify({ access_token: accessToken }),
    });
  }

  async getSession(token: string) {
    return this.request('/auth/session', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  async refreshToken(refreshToken: string) {
    return this.request('/auth/refresh', {
      method: 'POST',
      body: JSON.stringify({ refresh_token: refreshToken }),
    });
  }

  // Profile endpoints
  async getProfile(userId: string) {
    return this.request(`/profiles/${userId}`);
  }

  async updateProfile(userId: string, data: any) {
    return this.request(`/profiles/${userId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async completeProfile(userId: string) {
    return this.request(`/profiles/${userId}/complete`, {
      method: 'POST',
    });
  }

  async getProfileStatus(userId: string) {
    return this.request(`/profiles/${userId}/status`);
  }

  // User endpoints
  async getPublicUser(userId: string) {
    return this.request(`/users/${userId}/public`);
  }

  async getUserStats(userId: string) {
    return this.request(`/users/${userId}/stats`);
  }

  async searchUsers(params: {
    search?: string;
    account_type?: string;
    limit?: number;
    offset?: number;
  } = {}) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        searchParams.append(key, value.toString());
      }
    });
    
    return this.request(`/users?${searchParams.toString()}`);
  }

  // Marketplace endpoints
  async getMarketplaceListings(params: {
    category?: string;
    search?: string;
    limit?: number;
    offset?: number;
    sort_by?: string;
    order?: string;
  } = {}) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        searchParams.append(key, value.toString());
      }
    });
    
    return this.request(`/marketplace/listings?${searchParams.toString()}`);
  }

  async getListing(listingId: string) {
    return this.request(`/marketplace/listings/${listingId}`);
  }

  async createListing(data: {
    title: string;
    description: string;
    category: string;
    price: number;
    currency?: string;
  }) {
    return this.request('/marketplace/listings', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getMarketplaceCategories() {
    return this.request('/marketplace/categories');
  }

  async getMarketplaceStats() {
    return this.request('/marketplace/stats');
  }

  // Health check
  async healthCheck() {
    try {
      const response = await fetch(`${this.baseUrl.replace('/api/v1', '')}/health`);
      return await response.json();
    } catch (error) {
      return { status: 'error', message: 'Health check failed' };
    }
  }
}

// Export singleton instance
export const apiClient = new ApiClient();
export default ApiClient;