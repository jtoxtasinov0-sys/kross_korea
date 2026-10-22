// Backend (bot) ga so'rov yuborish. Telegram ichida — initData, brauzerda — mehmon ID.
import { STORAGE } from './constants';
import { getInitData } from './telegram';
import { randomId } from './utils';
import type { Catalog, Order, Product, Region, SavedAddress, User, CustomerForm, Lang } from '@/types';

export class ApiError extends Error {
  constructor(
    public status: number,
    public code: string,
    public data: Record<string, unknown> = {},
  ) {
    super(code);
  }
}

function guestId() {
  try {
    let id = localStorage.getItem(STORAGE.guestId);
    if (!id) {
      id = randomId(20);
      localStorage.setItem(STORAGE.guestId, id);
    }
    return id;
  } catch {
    return randomId(20);
  }
}

async function request<T>(path: string, init: { method?: string; json?: unknown; form?: FormData } = {}): Promise<T> {
  const headers: Record<string, string> = {};
  const initData = getInitData();
  if (initData) headers['x-telegram-init-data'] = initData;
  else headers['x-guest-id'] = guestId();
  if (init.json !== undefined) headers['content-type'] = 'application/json';

  let res: Response;
  try {
    res = await fetch(`/api${path}`, {
      method: init.method || 'GET',
      headers,
      body: init.form ?? (init.json !== undefined ? JSON.stringify(init.json) : undefined),
    });
  } catch {
    throw new ApiError(0, 'network');
  }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new ApiError(res.status, data.error || 'server', data);
  return data as T;
}

export interface AuthResponse {
  user: User;
  stats: { total: number; delivered: number };
  addresses: Record<Region, SavedAddress | null>;
}

export interface NewOrder {
  region: Region;
  items: { productId: number; variantId: number; qty: number }[];
  customer: CustomerForm;
  comment: string;
  saveAddress: boolean;
}

export const api = {
  access: () => request<{ browserAccess: boolean; botUrl: string }>('/access'),
  auth: () => request<AuthResponse>('/auth', { method: 'POST', json: {} }),
  updateMe: (patch: { language?: Lang; region?: Region }) =>
    request<{ user: User }>('/me', { method: 'PATCH', json: patch }),
  catalog: () => request<Catalog>('/catalog'),
  product: (id: number) => request<{ product: Product }>(`/products/${id}`),
  myOrders: () => request<{ orders: Order[] }>('/orders/mine'),
  order: (id: number) => request<{ order: Order }>(`/orders/${id}`),
  createOrder: (body: NewOrder) => request<{ order: Order }>('/orders', { method: 'POST', json: body }),
  uploadReceipt: (id: number, file: Blob) => {
    const form = new FormData();
    form.append('file', file, 'receipt.jpg');
    return request<{ order: Order }>(`/orders/${id}/receipt`, { method: 'POST', form });
  },
};
