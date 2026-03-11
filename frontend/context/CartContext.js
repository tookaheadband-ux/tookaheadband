import { createContext, useContext, useState, useEffect } from 'react';


const CartContext = createContext();

export function CartProvider({ children }) {
  const [items, setItems] = useState([]);
  const [isOpen, setIsOpen] = useState(false);

  // Load from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('toka-cart');
      if (saved) setItems(JSON.parse(saved));
    } catch (e) {
      console.error('Cart load error:', e);
    }
  }, []);

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem('toka-cart', JSON.stringify(items));
  }, [items]);

  const addItem = (product, qty = 1) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.productId === product._id);
      if (existing) {
        return prev.map((i) =>
          i.productId === product._id ? { ...i, qty: i.qty + qty } : i
        );
      }
      return [
        ...prev,
        {
          productId: product._id,
          productNameSnapshot: product.nameEn || product.nameAr,
          priceSnapshot: product.price,
          qty,
          imageSnapshot: product.images?.[0] || '',
        },
      ];
    });

    // Dispatch event for toast notification (listened by ToastContext)
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('cart-toast', { detail: { message: 'Added to your Cart! 🛍️', type: 'success' } }));
    }
  };

  const updateQty = (productId, qty) => {
    if (qty <= 0) {
      removeItem(productId);
      return;
    }
    setItems((prev) =>
      prev.map((i) => (i.productId === productId ? { ...i, qty } : i))
    );
  };

  const removeItem = (productId) => {
    setItems((prev) => prev.filter((i) => i.productId !== productId));
  };

  const clearCart = () => setItems([]);

  const total = items.reduce((sum, i) => sum + i.priceSnapshot * i.qty, 0);
  const itemCount = items.reduce((sum, i) => sum + i.qty, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        updateQty,
        removeItem,
        clearCart,
        total,
        itemCount,
        isOpen,
        setIsOpen,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
