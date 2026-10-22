// Backend javoblari va ilova ichidagi umumiy turlar

export type Region = 'uz' | 'kr';
export type Lang = 'uz' | 'ru';
export type Tab = 'home' | 'catalog' | 'cart' | 'favorites' | 'profile';

export interface Variant {
  id: number;
  label: string; // o'lcham, mm
  stock: number;
}

export interface Product {
  id: number;
  nameUz: string;
  nameRu: string;
  brand: string;
  colorUz: string | null;
  colorRu: string | null;
  descUz: string | null;
  descRu: string | null;
  priceKrw: number;
  oldPriceKrw: number | null;
  priceUsd: number;
  oldPriceUsd: number | null;
  categoryId: number;
  isNew: boolean;
  sortOrder: number;
  createdAt: string;
  images: string[];
  variants: Variant[];
  inStock: boolean;
}

export interface Category {
  id: number;
  slug: string;
  nameUz: string;
  nameRu: string;
  emoji: string | null;
  imageUrl: string | null;
  noteUz: string | null;
  noteRu: string | null;
  count: number;
}

export interface Story {
  id: number;
  imageUrl: string;
  titleUz: string | null;
  titleRu: string | null;
  link: string | null;
}

export interface RegionRules {
  bank: string;
  card: string;
  holder: string;
  prepay: number;
  deliveryFee: number;
  freeFrom: number;
  deliveryDays: string;
  uzsRate?: number;
}

export interface Settings {
  shopName: string;
  phone: string;
  supportUsername: string;
  instagramUrl: string;
  channelUrl: string;
  isOpen: boolean;
  stockVisible: boolean;
  lowStock: number;
  aboutUz: string | null;
  aboutRu: string | null;
  regions: Record<Region, RegionRules>;
}

export interface Catalog {
  settings: Settings;
  categories: Category[];
  products: Product[];
  stories: Story[];
  bestsellerIds: number[];
}

export interface User {
  id: number;
  firstName: string | null;
  lastName: string | null;
  username: string | null;
  phone: string | null;
  language: Lang;
  region: Region | null;
  isGuest: boolean;
}

export interface SavedAddress {
  name: string;
  phone: string;
  city: string;
  street: string;
  detail: string;
  zipCode: string;
}

export type OrderStatus = 'PENDING_PAYMENT' | 'RECEIPT_SENT' | 'CONFIRMED' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';

export interface OrderItem {
  productId: number;
  variantId: number;
  name: string;
  nameRu?: string;
  brand: string;
  variant: string;
  price: number;
  qty: number;
  image: string | null;
}

export interface Order {
  id: number;
  orderNumber: string;
  region: Region;
  items: OrderItem[];
  subtotal: number;
  deliveryFee: number;
  total: number;
  prepayAmount: number;
  status: OrderStatus;
  customerName: string;
  phone: string;
  city: string | null;
  street: string;
  detail: string | null;
  zipCode: string | null;
  comment: string | null;
  receiptUrl: string | null;
  trackingNumber: string | null;
  createdAt: string;
}

export interface CustomerForm {
  name: string;
  phone: string;
  city: string;
  street: string;
  detail: string;
  zipCode: string;
}
