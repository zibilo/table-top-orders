import { useState } from "react";

export interface CartItem {
  id: string;
  menuItemId: string;
  name: string;
  price: number;
  quantity: number;
  emoji?: string;
  image_url?: string;
}

export const useCart = () => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  const addToCart = (item: {
    id: string;
    name: string;
    price: number;
    emoji?: string;
    image_url?: string;
  }) => {
    setCartItems((prev) => {
      const existingItem = prev.find((i) => i.menuItemId === item.id);
      
      if (existingItem) {
        return prev.map((i) =>
          i.menuItemId === item.id
            ? { ...i, quantity: i.quantity + 1 }
            : i
        );
      }
      
      return [
        ...prev,
        {
          id: Math.random().toString(),
          menuItemId: item.id,
          name: item.name,
          price: item.price,
          quantity: 1,
          emoji: item.emoji,
          image_url: item.image_url,
        },
      ];
    });
  };

  const removeFromCart = (cartItemId: string) => {
    setCartItems((prev) => prev.filter((i) => i.id !== cartItemId));
  };

  const updateQuantity = (cartItemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(cartItemId);
      return;
    }
    
    setCartItems((prev) =>
      prev.map((i) => (i.id === cartItemId ? { ...i, quantity } : i))
    );
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  return {
    cartItems,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    totalItems,
    totalPrice,
  };
};
