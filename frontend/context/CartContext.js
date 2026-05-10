import { createContext, useContext, useState, useEffect } from 'react';


const CartContext = createContext();

const buildCartItemId = (productId, color, size) =>
  `${productId}|${color || ''}|${size || ''}`;

export function CartProvider({ children }) {
  const [items, setItems] = useState([]);
  const [isOpen, setIsOpen] = useState(false);

  // Load from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('toka-cart');
      if (saved) {
        const parsed = JSON.parse(saved);
        // Backfill cartItemId for legacy items
        const upgraded = parsed.map((i) => ({
          ...i,
          cartItemId: i.cartItemId || buildCartItemId(i.productId, i.color, i.size),
        }));
        setItems(upgraded);
      }
    } catch (e) {
      console.error('Cart load error:', e);
    }
  }, []);

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem('toka-cart', JSON.stringify(items));
  }, [items]);

  const addItem = (product, qty = 1, variant = {}) => {
    const color = variant.color || '';
    const size = variant.size || '';
    const cartItemId = buildCartItemId(product._id, color, size);

    // Snapshot the Arabic translations so the cart still shows the right label
    // even if the admin later edits the product.
    const colorT = product.colorTranslations || {};
    const sizeT = product.sizeTranslations || {};
    const colorAr = (typeof colorT.get === 'function' ? colorT.get(color) : colorT[color]) || '';
    const sizeAr = (typeof sizeT.get === 'function' ? sizeT.get(size) : sizeT[size]) || '';

    setItems((prev) => {
      const existing = prev.find((i) => i.cartItemId === cartItemId);
      if (existing) {
        return prev.map((i) =>
          i.cartItemId === cartItemId ? { ...i, qty: i.qty + qty } : i
        );
      }
      return [
        ...prev,
        {
          cartItemId,
          productId: product._id,
          productNameSnapshot: product.nameEn || product.nameAr,
          priceSnapshot: product.price,
          qty,
          imageSnapshot: product.images?.[0] || '',
          color,
          size,
          colorAr,
          sizeAr,
        },
      ];
    });

    // Dispatch event for toast notification (listened by ToastContext)
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('cart-toast', { detail: { message: 'Added to your Cart! 🛍️', type: 'success' } }));
    }
  };

  const updateQty = (cartItemId, qty) => {
    if (qty <= 0) {
      removeItem(cartItemId);
      return;
    }
    setItems((prev) =>
      prev.map((i) => (i.cartItemId === cartItemId ? { ...i, qty } : i))
    );
  };

  const removeItem = (cartItemId) => {
    setItems((prev) => prev.filter((i) => i.cartItemId !== cartItemId));
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
