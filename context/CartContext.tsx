"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import userDataApi from "../services/userDataApi";

export type CartItem = {
  id: string | number;
  title: string;
  price: number;
  qty: number;
  image?: string;
};

export type WishlistItem = {
  id: string | number;
  title: string;
  image?: string;
  price?: number;
};

interface CartContextType {
  cart: CartItem[];
  wishlist: WishlistItem[];
  addToCart: (item: CartItem) => void;
  removeFromCart: (id: string | number) => void;
  incrementQuantity: (id: string | number) => void;
  decrementQuantity: (id: string | number) => void;
  toggleWishlist: (item: WishlistItem) => void;
  removeFromWishlist: (id: string | number) => void;
  clearCart: () => void;
  clearUserData: () => void; // Add this function
  refreshUserData: () => Promise<void>; // Add this function
  cartCount: number;
  cartTotal: number;
  showNotification: boolean;
  lastAddedProduct: string;
  hideNotification: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
  const [isHydrated, setIsHydrated] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  const [lastAddedProduct, setLastAddedProduct] = useState("");

  // Load from user isolation API on mount and when user changes
  useEffect(() => {
    const loadUserData = async () => {
      // Clear existing data first
      setCart([]);
      setWishlist([]);
      
      if (userDataApi.auth.isLoggedIn()) {
        try {
          // Load cart from API
          const cartData = await userDataApi.cart.getCart();
          const cartItems = cartData.items.map(item => ({
            id: item.product_id,
            title: item.product_name,
            price: item.product_price,
            qty: item.quantity,
            image: item.product_image
          }));
          setCart(cartItems);

          // Load wishlist from API
          const wishlistData = await userDataApi.wishlist.getWishlist();
          const wishlistItems = wishlistData.map(item => ({
            id: item.product_id,
            title: item.product_name,
            image: item.product_image,
            price: item.product_price
          }));
          setWishlist(wishlistItems);
        } catch (error) {
          console.error('Error loading user data:', error);
          // Fallback to localStorage for guests
          loadFromLocalStorage();
        }
      } else {
        // Load from localStorage for guests
        loadFromLocalStorage();
      }
      setIsHydrated(true);
    };

    const loadFromLocalStorage = () => {
      try {
        const savedCart = localStorage.getItem("cart");
        if (savedCart) setCart(JSON.parse(savedCart));
      } catch {
        // Ignore parse errors
      }

      try {
        const savedWishlist = localStorage.getItem("wishlist");
        if (savedWishlist) setWishlist(JSON.parse(savedWishlist));
      } catch {
        // Ignore parse errors
      }
    };

    // Listen for user changes
    const handleUserChange = () => {
      loadUserData();
    };

    // Listen for storage changes (user login/logout)
    window.addEventListener('storage', handleUserChange);
    
    // Initial load
    loadUserData();

    return () => {
      window.removeEventListener('storage', handleUserChange);
    };
  }, []);

  // Save cart to API or localStorage whenever it changes
  useEffect(() => {
    if (isHydrated) {
      const saveCart = async () => {
        if (userDataApi.auth.isLoggedIn()) {
          // Save to API - we'll sync the entire cart
          // Note: This is a simplified approach. In production, you might want to track individual changes
          try {
            // Clear existing cart first
            await userDataApi.cart.clearCart();
            
            // Add all current items
            for (const item of cart) {
              await userDataApi.cart.addToCart({
                product_id: String(item.id),
                product_name: item.title,
                product_image: item.image || '',
                product_price: item.price,
                product_category: 'Fashion',
                quantity: item.qty
              });
            }
          } catch (error) {
            console.error('Error saving cart to API:', error);
            // Fallback to localStorage
            localStorage.setItem("cart", JSON.stringify(cart));
          }
        } else {
          // Save to localStorage for guests
          try {
            localStorage.setItem("cart", JSON.stringify(cart));
          } catch {
            // Ignore storage errors
          }
        }
      };

      saveCart();
    }
  }, [cart, isHydrated]);

  // Save wishlist to API or localStorage whenever it changes
  useEffect(() => {
    if (isHydrated) {
      const saveWishlist = async () => {
        if (userDataApi.auth.isLoggedIn()) {
          // This is a simplified sync approach
          // In production, you might want to track individual add/remove operations
          try {
            // Get current wishlist from API
            const currentWishlist = await userDataApi.wishlist.getWishlist();
            
            // Remove items that are no longer in local wishlist
            for (const apiItem of currentWishlist) {
              const stillInWishlist = wishlist.find(item => String(item.id) === apiItem.product_id);
              if (!stillInWishlist) {
                await userDataApi.wishlist.removeFromWishlist(apiItem.product_id);
              }
            }
            
            // Add new items to API
            for (const item of wishlist) {
              const alreadyInAPI = currentWishlist.find(apiItem => apiItem.product_id === String(item.id));
              if (!alreadyInAPI) {
                await userDataApi.wishlist.addToWishlist({
                  product_id: String(item.id),
                  product_name: item.title,
                  product_image: item.image || '',
                  product_price: item.price || 0,
                  product_category: 'Fashion'
                });
              }
            }
          } catch (error) {
            console.error('Error saving wishlist to API:', error);
            // Fallback to localStorage
            localStorage.setItem("wishlist", JSON.stringify(wishlist));
          }
        } else {
          // Save to localStorage for guests
          try {
            localStorage.setItem("wishlist", JSON.stringify(wishlist));
          } catch {
            // Ignore storage errors
          }
        }
      };

      saveWishlist();
    }
  }, [wishlist, isHydrated]);

  const addToCart = (item: CartItem) => {
    setCart((prev) => {
      const found = prev.find((it) => it.id === item.id);
      if (found) {
        return prev.map((it) => (it.id === item.id ? { ...it, qty: it.qty + item.qty } : it));
      }
      return [...prev, item];
    });
    
    // Show notification
    setLastAddedProduct(item.title);
    setShowNotification(true);
  };

  const hideNotification = () => {
    setShowNotification(false);
  };

  const removeFromCart = (id: string | number) => {
    setCart((prev) => prev.filter((it) => it.id !== id));
  };

  const incrementQuantity = (id: string | number) => {
    setCart((prev) => prev.map((it) => (it.id === id ? { ...it, qty: it.qty + 1 } : it)));
  };

  const decrementQuantity = (id: string | number) => {
    setCart((prev) => {
      const found = prev.find((it) => it.id === id);
      if (!found) return prev;
      if (found.qty <= 1) {
        return prev.filter((it) => it.id !== id);
      }
      return prev.map((it) => (it.id === id ? { ...it, qty: it.qty - 1 } : it));
    });
  };

  const toggleWishlist = (item: WishlistItem) => {
    setWishlist((prev) => {
      const exists = prev.find((it) => it.id === item.id);
      if (exists) {
        return prev.filter((it) => it.id !== item.id);
      }
      return [...prev, item];
    });
  };

  const removeFromWishlist = (id: string | number) => {
    setWishlist((prev) => prev.filter((it) => it.id !== id));
  };

  const clearCart = () => {
    setCart([]);
  };

  const clearUserData = () => {
    setCart([]);
    setWishlist([]);
    setIsHydrated(false);
  };

  const refreshUserData = async () => {
    // Clear existing data first
    setCart([]);
    setWishlist([]);
    
    if (userDataApi.auth.isLoggedIn()) {
      try {
        // Load cart from API
        const cartData = await userDataApi.cart.getCart();
        const cartItems = cartData.items.map(item => ({
          id: item.product_id,
          title: item.product_name,
          price: item.product_price,
          qty: item.quantity,
          image: item.product_image
        }));
        setCart(cartItems);

        // Load wishlist from API
        const wishlistData = await userDataApi.wishlist.getWishlist();
        const wishlistItems = wishlistData.map(item => ({
          id: item.product_id,
          title: item.product_name,
          image: item.product_image,
          price: item.product_price
        }));
        setWishlist(wishlistItems);
      } catch (error) {
        console.error('Error refreshing user data:', error);
      }
    }
    setIsHydrated(true);
  };

  const cartCount = cart.reduce((sum, item) => sum + item.qty, 0);
  const cartTotal = cart.reduce((sum, item) => sum + (item.price || 0) * item.qty, 0);

  return (
    <CartContext.Provider
      value={{
        cart,
        wishlist,
        addToCart,
        removeFromCart,
        incrementQuantity,
        decrementQuantity,
        toggleWishlist,
        removeFromWishlist,
        clearCart,
        clearUserData,
        refreshUserData,
        cartCount,
        cartTotal,
        showNotification,
        lastAddedProduct,
        hideNotification,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
