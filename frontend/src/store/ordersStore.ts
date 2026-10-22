// Mijozning buyurtmalari — "Buyurtmalarim" va to'lov ekrani uchun
import { create } from 'zustand';
import { api } from '@/lib/api';
import type { Order } from '@/types';

interface OrdersState {
  orders: Order[];
  loaded: boolean;
  loading: boolean;
  load: () => Promise<void>;
  fetchOne: (id: number) => Promise<Order | null>;
  upsert: (order: Order) => void;
}

export const useOrders = create<OrdersState>()((set, get) => ({
  orders: [],
  loaded: false,
  loading: false,

  load: async () => {
    set({ loading: true });
    try {
      const { orders } = await api.myOrders();
      set({ orders, loaded: true });
    } finally {
      set({ loading: false });
    }
  },

  fetchOne: async (id) => {
    try {
      const { order } = await api.order(id);
      get().upsert(order);
      return order;
    } catch {
      return null;
    }
  },

  upsert: (order) =>
    set((s) => {
      const exists = s.orders.some((o) => o.id === order.id);
      return {
        orders: exists ? s.orders.map((o) => (o.id === order.id ? order : o)) : [order, ...s.orders],
      };
    }),
}));

export const useOrder = (id: number) => useOrders((s) => s.orders.find((o) => o.id === id));
