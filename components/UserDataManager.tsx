"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';

// Enhanced User Data API with complete isolation
const API_URL = 'http://localhost:5000/api';

// Get JWT token
const getAuthToken = (): string | null => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('authToken');
  }
  return null;
};

// Get user email from token
const getUserEmail = (): string | null => {
  const token = getAuthToken();
  if (!token) return null;
  
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.email;
  } catch (error) {
    return null;
  }
};

// Create headers with authentication
const getAuthHeaders = () => {
  const token = getAuthToken();
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` })
  };
};

// User Data Context
interface UserDataContextType {
  isLoggedIn: boolean;
  userEmail: string | null;
  wishlist: any[];
  cart: any[];
  orders: any[];
  returns: any[];
  searchHistory: any[];
  notifications: any[];
  loadUserData: () => Promise<void>;
  clearUserData: () => void;
  addToWishlist: (product: any) => Promise<boolean>;
  addToCart: (product: any) => Promise<boolean>;
  removeFromWishlist: (productId: string) => Promise<boolean>;
  removeFromCart: (productId: string) => Promise<boolean>;
  createReturn: (returnData: any) => Promise<boolean>;
}

const UserDataContext = createContext<UserDataContextType | undefined>(undefined);

export const useUserData = () => {
  const context = useContext(UserDataContext);
  if (!context) {
    throw new Error('useUserData must be used within a UserDataProvider');
  }
  return context;
};

export const UserDataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [wishlist, setWishlist] = useState<any[]>([]);
  const [cart, setCart] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [returns, setReturns] = useState<any[]>([]);
  const [searchHistory, setSearchHistory] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);

  // Check authentication status
  useEffect(() => {
    const token = getAuthToken();
    const email = getUserEmail();
    
    if (token && email) {
      setIsLoggedIn(true);
      setUserEmail(email);
      loadUserData();
    } else {
      setIsLoggedIn(false);
      setUserEmail(null);
      clearUserData();
    }
  }, []);

  // Load all user data
  const loadUserData = async () => {
    if (!isLoggedIn) return;

    try {
      const headers = getAuthHeaders();

      // Load wishlist
      const wishlistResponse = await fetch(`${API_URL}/user/wishlist`, { headers });
      if (wishlistResponse.ok) {
        const wishlistData = await wishlistResponse.json();
        setWishlist(wishlistData.wishlist || []);
      }

      // Load cart
      const cartResponse = await fetch(`${API_URL}/user/cart`, { headers });
      if (cartResponse.ok) {
        const cartData = await cartResponse.json();
        setCart(cartData.cart || []);
      }

      // Load orders
      const ordersResponse = await fetch(`${API_URL}/user/orders`, { headers });
      if (ordersResponse.ok) {
        const ordersData = await ordersResponse.json();
        setOrders(ordersData.orders || []);
      }

      // Load returns
      const returnsResponse = await fetch(`${API_URL}/user/returns`, { headers });
      if (returnsResponse.ok) {
        const returnsData = await returnsResponse.json();
        setReturns(returnsData.returns || []);
      }

      // Load search history
      const searchResponse = await fetch(`${API_URL}/user/search-history`, { headers });
      if (searchResponse.ok) {
        const searchData = await searchResponse.json();
        setSearchHistory(searchData.searches || []);
      }

      // Load notifications
      const notificationsResponse = await fetch(`${API_URL}/user/notifications`, { headers });
      if (notificationsResponse.ok) {
        const notificationsData = await notificationsResponse.json();
        setNotifications(notificationsData.notifications || []);
      }

    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  // Clear user data (logout)
  const clearUserData = () => {
    setWishlist([]);
    setCart([]);
    setOrders([]);
    setReturns([]);
    setSearchHistory([]);
    setNotifications([]);
    
    // Clear localStorage data for this user
    if (typeof window !== 'undefined') {
      const email = getUserEmail();
      if (email) {
        Object.keys(localStorage).forEach(key => {
          if (key.includes(email) || key.startsWith('user_')) {
            localStorage.removeItem(key);
          }
        });
      }
    }
  };

  // Add to wishlist
  const addToWishlist = async (product: any): Promise<boolean> => {
    try {
      const response = await fetch(`${API_URL}/user/wishlist`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(product)
      });

      if (response.ok) {
        await loadUserData(); // Reload data
        return true;
      }
      return false;
    } catch (error) {
      console.error('Add to wishlist error:', error);
      return false;
    }
  };

  // Add to cart
  const addToCart = async (product: any): Promise<boolean> => {
    try {
      const response = await fetch(`${API_URL}/user/cart`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(product)
      });

      if (response.ok) {
        await loadUserData(); // Reload data
        return true;
      }
      return false;
    } catch (error) {
      console.error('Add to cart error:', error);
      return false;
    }
  };

  // Remove from wishlist
  const removeFromWishlist = async (productId: string): Promise<boolean> => {
    try {
      const response = await fetch(`${API_URL}/user/wishlist?product_id=${productId}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });

      if (response.ok) {
        await loadUserData(); // Reload data
        return true;
      }
      return false;
    } catch (error) {
      console.error('Remove from wishlist error:', error);
      return false;
    }
  };

  // Remove from cart
  const removeFromCart = async (productId: string): Promise<boolean> => {
    try {
      const response = await fetch(`${API_URL}/user/cart?product_id=${productId}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });

      if (response.ok) {
        await loadUserData(); // Reload data
        return true;
      }
      return false;
    } catch (error) {
      console.error('Remove from cart error:', error);
      return false;
    }
  };

  // Create return request
  const createReturn = async (returnData: any): Promise<boolean> => {
    try {
      const response = await fetch(`${API_URL}/user/returns`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(returnData)
      });

      if (response.ok) {
        await loadUserData(); // Reload data
        return true;
      }
      return false;
    } catch (error) {
      console.error('Create return error:', error);
      return false;
    }
  };

  const value: UserDataContextType = {
    isLoggedIn,
    userEmail,
    wishlist,
    cart,
    orders,
    returns,
    searchHistory,
    notifications,
    loadUserData,
    clearUserData,
    addToWishlist,
    addToCart,
    removeFromWishlist,
    removeFromCart,
    createReturn
  };

  return (
    <UserDataContext.Provider value={value}>
      {children}
    </UserDataContext.Provider>
  );
};

export default UserDataProvider;