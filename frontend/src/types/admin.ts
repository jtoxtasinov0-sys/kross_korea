// Admin panel turlari
import type { Category, Order, Product, Region } from './index';

export type AdminSection = 'dashboard' | 'orders' | 'products' | 'stock' | 'settings';

export interface AdminOrder extends Order {
  userId: number | null;
  adminNote: string | null;
  username: string | null;
  telegramId: string | null;
  isWeb: boolean;
  isBlocked: boolean;
  updatedAt: string;
}

export interface AdminProduct extends Product {
  isActive: boolean;
  totalStock: number;
  updatedAt: string;
}

export interface AdminCategory extends Category {
  isActive: boolean;
  sortOrder: number;
}

export interface StockItem {
  variantId: number;
  label: string;
  stock: number;
  productId: number;
  name: string;
  brand: string;
  color: string | null;
  categoryId: number;
  isActive: boolean;
  image: string | null;
}

export interface Stats {
  orders: {
    total: number;
    today: number;
    pending: number;
    receipts: number;
    revenue: Record<Region, number>;
    revenueToday: Record<Region, number>;
  };
  customers: { total: number; telegram: number };
  top: { productId: number; brand: string; name: string; image: string | null; qty: number }[];
  lowStock: { variantId: number; label: string; stock: number; productId: number; name: string; brand: string; image: string | null }[];
  lowStockThreshold: number;
  testCards: Record<Region, boolean>;
  isOpen: boolean;
}

export interface AdminSettings {
  shopName: string;
  phone: string;
  supportUsername: string;
  instagramUrl: string;
  channelUrl: string;
  payUzBank: string;
  payUzCard: string;
  payUzHolder: string;
  prepayUz: number;
  deliveryUzFee: number;
  deliveryUzDays: string;
  uzsRate: number;
  payKrBank: string;
  payKrCard: string;
  payKrHolder: string;
  prepayKr: number;
  deliveryKrFee: number;
  deliveryKrFreeFrom: number;
  deliveryKrDays: string;
  webAppUrl: string | null;
  adminUrl: string | null;
  panelPassword: string | null;
  aboutUz: string | null;
  aboutRu: string | null;
  isOpen: boolean;
  stockVisible: boolean;
  testCards: Record<Region, boolean>;
  updatedAt: string;
}

/** Mahsulot formasi — yaratish va tahrirlash uchun */
export interface ProductInput {
  nameUz: string;
  nameRu: string;
  brand: string;
  colorUz: string;
  colorRu: string;
  descUz: string;
  descRu: string;
  priceUsd: number | '';
  oldPriceUsd: number | '';
  priceKrw: number | '';
  oldPriceKrw: number | '';
  categoryId: number | '';
  isActive: boolean;
  isNew: boolean;
  sortOrder: number | '';
  images: string[];
  variants: { id?: number; label: string; stock: number | '' }[];
}
