import { create } from 'zustand';
import { persist } from 'zustand/middleware'; 
import { Product } from '@/data/products';

export interface CartItem extends Product {
  quantity: number;
  selectedSize?: string;
  cartItemId: string; 
}

interface CartStore {
  items: CartItem[];
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  addToCart: (product: Product, size?: string) => void;
  removeFromCart: (cartItemId: string) => void;
  clearCart: () => void;
  getTotal: () => number;
}

export const useCart = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,
      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),
      
      addToCart: (product, size) => {
        const cartItemId = `${product.id}-${size || 'unica'}`;
        const currentItems = get().items;
        const existingItem = currentItems.find(item => item.cartItemId === cartItemId);

        if (existingItem) {
          set({
            items: currentItems.map(item => 
              item.cartItemId === cartItemId 
                ? { ...item, quantity: item.quantity + 1 }
                : item
            ),
            isOpen: true 
          });
        } else {
          set({
            items: [...currentItems, { ...product, quantity: 1, selectedSize: size, cartItemId }],
            isOpen: true
          });
        }
      },

      removeFromCart: (cartItemId) => {
        set({ items: get().items.filter(item => item.cartItemId !== cartItemId) });
      },

      clearCart: () => set({ items: [] }),

      getTotal: () => {
        return get().items.reduce((total, item) => total + (item.price * item.quantity), 0);
      }
    }),
    {
      name: 'sports-store-cart',
      partialize: (state) => ({ items: state.items }), 
    }
  )
);