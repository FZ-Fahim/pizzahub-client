import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import {
  ApiResponse,
  PaginatedResponse,
  MenuItem,
  Order,
  Transaction,
  User,
  AdminOverviewStats,
  Review,
} from '@/types';

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Request Interceptor: Inject JWT Bearer Token
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    if (typeof window !== 'undefined') {
      const token =
        localStorage.getItem('pizzahub_token') ||
        sessionStorage.getItem('pizzahub_token');
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error: AxiosError) => Promise.reject(error)
);

// Response Interceptor: Format errors and handle 401s
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<any>) => {
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      // Clear expired token
      localStorage.removeItem('pizzahub_token');
      sessionStorage.removeItem('pizzahub_token');
    }

    const message =
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.message ||
      'An unexpected network error occurred.';

    return Promise.reject(new Error(message));
  }
);

// -------------------------------------------------------------
// Dedicated Service APIs
// -------------------------------------------------------------

export const menuApi = {
  getPublicItems: async (params?: Record<string, any>) => {
    const res = await apiClient.get<PaginatedResponse<MenuItem>>('/menu', {
      params,
    });
    return res.data;
  },

  getItemById: async (id: string) => {
    const res = await apiClient.get<ApiResponse<MenuItem>>(`/menu/${id}`);
    return res.data;
  },

  getVendorItems: async () => {
    const res = await apiClient.get<ApiResponse<MenuItem[]>>('/menu/vendor');
    return res.data;
  },

  createItem: async (data: Partial<MenuItem>) => {
    const res = await apiClient.post<ApiResponse<MenuItem>>('/menu', data);
    return res.data;
  },

  updateItem: async (id: string, data: Partial<MenuItem>) => {
    const res = await apiClient.put<ApiResponse<MenuItem>>(`/menu/${id}`, data);
    return res.data;
  },

  deleteItem: async (id: string) => {
    const res = await apiClient.delete<ApiResponse>(`/menu/${id}`);
    return res.data;
  },
};

export const orderApi = {
  createOrder: async (data: {
    itemId: string;
    deliveryDate: string;
    deliveryAddress: string;
    message?: string;
  }) => {
    const res = await apiClient.post<ApiResponse<Order>>('/orders', data);
    return res.data;
  },

  getCustomerOrders: async () => {
    const res = await apiClient.get<ApiResponse<Order[]>>('/orders/customer');
    return res.data;
  },

  cancelOrder: async (id: string) => {
    const res = await apiClient.patch<ApiResponse<Order>>(`/orders/${id}/cancel`);
    return res.data;
  },

  getVendorOrders: async () => {
    const res = await apiClient.get<ApiResponse<Order[]>>('/orders/vendor');
    return res.data;
  },

  updateOrderStatus: async (id: string, status: 'accepted' | 'rejected') => {
    const res = await apiClient.patch<ApiResponse<Order>>(`/orders/${id}/status`, {
      status,
    });
    return res.data;
  },

  getOrderById: async (id: string) => {
    const res = await apiClient.get<ApiResponse<Order>>(`/orders/${id}`);
    return res.data;
  },
};

export const uploadApi = {
  uploadImage: async (file: File) => {
    const formData = new FormData();
    formData.append('image', file);

    const res = await apiClient.post<ApiResponse<{ url: string }>>(
      '/upload/image',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return res.data;
  },
};

export const subscriptionApi = {
  createCheckoutSession: async () => {
    const res = await apiClient.post<{
      success: boolean;
      url: string;
      sessionId: string;
    }>('/subscription/create-checkout-session');
    return res.data;
  },

  getStatus: async () => {
    const res = await apiClient.get<ApiResponse<any>>('/subscription/status');
    return res.data;
  },
};

export const adminApi = {
  getOverview: async () => {
    const res = await apiClient.get<ApiResponse<AdminOverviewStats>>(
      '/admin/overview'
    );
    return res.data;
  },

  getUsers: async (params?: Record<string, any>) => {
    const res = await apiClient.get<PaginatedResponse<User>>('/admin/users', {
      params,
    });
    return res.data;
  },

  toggleUserBlock: async (id: string) => {
    const res = await apiClient.patch<ApiResponse<User>>(
      `/admin/users/${id}/block`
    );
    return res.data;
  },

  getMenuItems: async (params?: Record<string, any>) => {
    const res = await apiClient.get<PaginatedResponse<MenuItem>>('/admin/menu', {
      params,
    });
    return res.data;
  },

  updateMenuItemStatus: async (
    id: string,
    status: 'approved' | 'rejected' | 'pending' | 'inactive'
  ) => {
    const res = await apiClient.patch<ApiResponse<MenuItem>>(
      `/admin/menu/${id}/status`,
      { status }
    );
    return res.data;
  },

  deleteMenuItem: async (id: string) => {
    const res = await apiClient.delete<ApiResponse>(`/admin/menu/${id}`);
    return res.data;
  },

  getTransactions: async (params?: Record<string, any>) => {
    const res = await apiClient.get<PaginatedResponse<Transaction>>(
      '/admin/transactions',
      { params }
    );
    return res.data;
  },
};

export const reviewApi = {
  getItemReviews: async (itemId: string) => {
    const res = await apiClient.get<ApiResponse<Review[]> & { averageRating: number }>(
      `/reviews/item/${itemId}`
    );
    return res.data;
  },

  createReview: async (data: { itemId: string; rating: number; comment: string }) => {
    const res = await apiClient.post<ApiResponse<Review>>('/reviews', data);
    return res.data;
  },
};

export default apiClient;
