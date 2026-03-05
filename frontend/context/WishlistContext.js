import { createContext, useContext, useState, useEffect } from 'react';

const WishlistContext = createContext();

export function WishlistProvider({ children }) {
  const [items, setItems] = useState([]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('tooka-wishlist');
      if (saved) setItems(JSON.parse(saved));
    } catch {}
  }, []);

  const save = (newItems) => {
    setItems(newItems);
    localStorage.setItem('tooka-wishlist', JSON.stringify(newItems));
  };

  const toggleItem = (product) => {
    const exists = items.find((i) => i._id === product._id);
    if (exists) {
      save(items.filter((i) => i._id !== product._id));
    } else {
      save([...items, {
        _id: product._id,
        nameAr: product.nameAr,
        nameEn: product.nameEn,
        price: product.price,
        images: product.images,
        stock: product.stock,
      }]);
    }
  };

  const isInWishlist = (id) => items.some((i) => i._id === id);
  const removeItem = (id) => save(items.filter((i) => i._id !== id));

  return (
    <WishlistContext.Provider value={{ items, toggleItem, isInWishlist, removeItem, count: items.length }}>
      {children}
    </WishlistContext.Provider>
  );
}

export const useWishlist = () => useContext(WishlistContext);
