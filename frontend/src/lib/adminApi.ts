// Admin panel API: /api/admin/... — Bearer token bilan. 401 kelsa panel login ekraniga qaytadi.
import { getInitData } from './telegram';
import { useAdmin } from '@/store/adminStore';
import type { OrderStatus } from '@/types';
import type {
  AdminCategory,
  AdminOrder,
  AdminProduct,
  AdminSettings,
  ProductInput,
  Stats,
  StockItem,
} from '@/types/admin';

export class AdminApiError extends Error {
  constructor(
    public status: number,
    public code: string,
    public data: Record<string, unknown> = {},
  ) {
    super(code);
  }
}

async function request<T>(path: string, init: { method?: string; json?: unknown; form?: FormData } = {}): Promise<T> {
  const headers: Record<string, string> = {};
  const token = useAdmin.getState().token;
  if (token) headers.authorization = `Bearer ${token}`;
  if (init.json !== undefined) headers['content-type'] = 'application/json';
  const initData = getInitData();
  if (initData) headers['x-telegram-init-data'] = initData;

  let res: Response;
  try {
    res = await fetch(`/api/admin${path}`, {
      method: init.method || 'GET',
      headers,
      body: init.form ?? (init.json !== undefined ? JSON.stringify(init.json) : undefined),
    });
  } catch {
    throw new AdminApiError(0, 'network');
  }
  const data = await res.json().catch(() => ({}));
  if (res.status === 401 && data.error === 'admin_auth') useAdmin.getState().logout();
  if (!res.ok) throw new AdminApiError(res.status, data.error || 'server', data);
  return data as T;
}

export interface OrderQuery {
  status?: string;
  region?: string;
  q?: string;
}

const qs = (params: Record<string, string | undefined>) => {
  const s = new URLSearchParams(Object.entries(params).filter(([, v]) => v) as [string, string][]).toString();
  return s ? `?${s}` : '';
};

export const adminApi = {
  health: () => request<{ ok: boolean }>('/health'),
  login: (password: string) => request<{ token: string; name: string }>('/login', { method: 'POST', json: { password } }),
  telegram: () => request<{ token: string; name: string }>('/telegram', { method: 'POST', json: {} }),

  stats: () => request<Stats>('/stats'),

  orders: (query: OrderQuery) =>
    request<{ orders: AdminOrder[]; counts: Partial<Record<OrderStatus, number>> }>(`/orders${qs({ ...query })}`),
  order: (id: number) => request<{ order: AdminOrder }>(`/orders/${id}`),
  updateOrder: (id: number, patch: { status?: OrderStatus; trackingNumber?: string; adminNote?: string }) =>
    request<{ order: AdminOrder; delivered: boolean | null }>(`/orders/${id}`, { method: 'PATCH', json: patch }),

  products: () => request<{ products: AdminProduct[]; categories: AdminCategory[] }>('/products'),
  createProduct: (p: ProductInput) => request<{ product: AdminProduct }>('/products', { method: 'POST', json: p }),
  updateProduct: (id: number, p: ProductInput) =>
    request<{ product: AdminProduct }>(`/products/${id}`, { method: 'PUT', json: p }),
  deleteProduct: (id: number) => request<{ ok: boolean }>(`/products/${id}`, { method: 'DELETE' }),
  upload: (file: Blob, name = 'image.jpg') => {
    const form = new FormData();
    form.append('file', file, name);
    return request<{ url: string }>('/upload', { method: 'POST', form });
  },

  stock: () =>
    request<{ items: StockItem[]; categories: AdminCategory[]; stockVisible: boolean; lowStock: number }>('/stock'),
  saveStock: (changes: { variantId: number; stock: number }[], stockVisible?: boolean) =>
    request<{ updated: number }>('/stock', { method: 'PUT', json: { changes, stockVisible } }),

  settings: () => request<{ settings: AdminSettings; envPasswordSet: boolean }>('/settings'),
  saveSettings: (patch: Partial<AdminSettings>) =>
    request<{ settings: AdminSettings; envPasswordSet: boolean; token?: string }>('/settings', {
      method: 'PUT',
      json: patch,
    }),
};
