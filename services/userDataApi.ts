// User Data API Service - Complete User Isolation
const API_URL = 'http://localhost:5000/api';

// Get JWT token from localStorage
const getAuthToken = (): string | null => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('authToken');
  }
  return null;
};

// Create headers with authentication
const getAuthHeaders = () => {
  const token = getAuthToken();
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` })
  };
};

// ============= SEARCH HISTORY =============
export interface SearchHistoryItem {
  search_query: string;
  search_filters: any;
  results_count: number;
  created_at: string;
}

export const searchHistoryApi = {
  // Get user's search history
  async getHistory(): Promise<SearchHistoryItem[]> {
    try {
      const token = getAuthToken();
      if (!token) {
        return [];
      }

      const response = await fetch(`${API_URL}/user/search-history`, {
        headers: getAuthHeaders()
      });
      
      if (!response.ok) {
        console.warn('Search history fetch failed:', response.status);
        return [];
      }
      
      const data = await response.json();
      return data.searches || [];
    } catch (error) {
      console.warn('Search history fetch error (connection issue):', error);
      return [];
    }
  },

  // Save search query
  async saveSearch(query: string, filters: any, resultsCount: number): Promise<boolean> {
    try {
      const response = await fetch(`${API_URL}/user/search-history`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          query,
          filters,
          results_count: resultsCount
        })
      });
      
      return response.ok;
    } catch (error) {
      console.error('Save search error:', error);
      return false;
    }
  }
};

// ============= WISHLIST =============
export interface WishlistItem {
  product_id: string;
  product_name: string;
  product_image: string;
  product_price: number;
  product_category: string;
  added_at: string;
}

export const wishlistApi = {
  // Get user's wishlist
  async getWishlist(): Promise<WishlistItem[]> {
    try {
      const token = getAuthToken();
      if (!token) {
        // No authentication token, return empty wishlist
        return [];
      }

      const response = await fetch(`${API_URL}/user/wishlist`, {
        headers: getAuthHeaders()
      });
      
      if (!response.ok) {
        // If authentication fails or other error, return empty wishlist
        console.warn('Wishlist fetch failed:', response.status);
        return [];
      }
      
      const data = await response.json();
      return data.wishlist || [];
    } catch (error) {
      console.warn('Wishlist fetch error (connection issue):', error);
      // Return empty wishlist instead of throwing error
      return [];
    }
  },

  // Add item to wishlist
  async addToWishlist(product: {
    product_id: string;
    product_name: string;
    product_image: string;
    product_price: number;
    product_category: string;
  }): Promise<boolean> {
    try {
      const response = await fetch(`${API_URL}/user/wishlist`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(product)
      });
      
      return response.ok;
    } catch (error) {
      console.error('Add to wishlist error:', error);
      return false;
    }
  },

  // Remove from wishlist
  async removeFromWishlist(productId: string): Promise<boolean> {
    try {
      const response = await fetch(`${API_URL}/user/wishlist?product_id=${productId}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      
      return response.ok;
    } catch (error) {
      console.error('Remove from wishlist error:', error);
      return false;
    }
  }
};

// ============= CART =============
export interface CartItem {
  product_id: string;
  product_name: string;
  product_image: string;
  product_price: number;
  product_category: string;
  quantity: number;
  added_at: string;
}

export const cartApi = {
  // Get user's cart
  async getCart(): Promise<{ items: CartItem[], total: number, count: number }> {
    try {
      const token = getAuthToken();
      if (!token) {
        // No authentication token, return empty cart
        return { items: [], total: 0, count: 0 };
      }

      const response = await fetch(`${API_URL}/user/cart`, {
        headers: getAuthHeaders()
      });
      
      if (!response.ok) {
        // If authentication fails or other error, return empty cart
        console.warn('Cart fetch failed:', response.status);
        return { items: [], total: 0, count: 0 };
      }
      
      const data = await response.json();
      return {
        items: data.cart || [],
        total: data.total || 0,
        count: data.count || 0
      };
    } catch (error) {
      console.warn('Cart fetch error (connection issue):', error);
      // Return empty cart instead of throwing error
      return { items: [], total: 0, count: 0 };
    }
  },

  // Add item to cart
  async addToCart(product: {
    product_id: string;
    product_name: string;
    product_image: string;
    product_price: number;
    product_category: string;
    quantity?: number;
  }): Promise<boolean> {
    try {
      const response = await fetch(`${API_URL}/user/cart`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ ...product, quantity: product.quantity || 1 })
      });
      
      return response.ok;
    } catch (error) {
      console.error('Add to cart error:', error);
      return false;
    }
  },

  // Update cart item quantity
  async updateQuantity(productId: string, quantity: number): Promise<boolean> {
    try {
      const response = await fetch(`${API_URL}/user/cart`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ product_id: productId, quantity })
      });
      
      return response.ok;
    } catch (error) {
      console.error('Update cart error:', error);
      return false;
    }
  },

  // Remove from cart
  async removeFromCart(productId: string): Promise<boolean> {
    try {
      const response = await fetch(`${API_URL}/user/cart?product_id=${productId}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      
      return response.ok;
    } catch (error) {
      console.error('Remove from cart error:', error);
      return false;
    }
  },

  // Clear entire cart
  async clearCart(): Promise<boolean> {
    try {
      const response = await fetch(`${API_URL}/user/cart`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      
      return response.ok;
    } catch (error) {
      console.error('Clear cart error:', error);
      return false;
    }
  }
};

// ============= ORDERS =============
export interface Order {
  order_id: string;
  total_amount: number;
  order_status: string;
  payment_status: string;
  shipping_address: string;
  order_items: any[];
  created_at: string;
  updated_at: string;
}

export const ordersApi = {
  // Get user's orders
  async getOrders(): Promise<Order[]> {
    try {
      const token = getAuthToken();
      if (!token) {
        return [];
      }

      const response = await fetch(`${API_URL}/user/orders`, {
        headers: getAuthHeaders()
      });
      
      if (!response.ok) {
        console.warn('Orders fetch failed:', response.status);
        return [];
      }
      
      const data = await response.json();
      return data.orders || [];
    } catch (error) {
      console.warn('Orders fetch error (connection issue):', error);
      return [];
    }
  },

  // Place new order
  async placeOrder(orderData: {
    order_id: string;
    total_amount: number;
    shipping_address: string;
    order_items: any[];
  }): Promise<boolean> {
    try {
      const response = await fetch(`${API_URL}/user/orders`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(orderData)
      });
      
      return response.ok;
    } catch (error) {
      console.error('Place order error:', error);
      return false;
    }
  },

  // Cancel order
  async cancelOrder(orderId: string, reason: string): Promise<boolean> {
    try {
      const response = await fetch(`${API_URL}/user/orders/cancel`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          order_id: orderId,
          reason: reason
        })
      });
      
      return response.ok;
    } catch (error) {
      console.error('Cancel order error:', error);
      return false;
    }
  }
};

// ============= CHAT HISTORY =============
export interface ChatMessage {
  message_text: string;
  is_user_message: boolean;
  message_type: string;
  message_data: any;
  created_at: string;
}

export interface ChatSession {
  id: string;
  messages: any[];
  timestamp: string;
  title: string;
  message_count: number;
}

export const chatHistoryApi = {
  // Get user's chat history (individual messages - for active session)
  async getChatHistory(sessionId?: string): Promise<ChatMessage[]> {
    try {
      const url = sessionId 
        ? `${API_URL}/user/chat-history?session_id=${sessionId}`
        : `${API_URL}/user/chat-history`;
        
      const response = await fetch(url, {
        headers: getAuthHeaders()
      });
      
      if (!response.ok) throw new Error('Failed to fetch chat history');
      
      const data = await response.json();
      return data.messages || [];
    } catch (error) {
      console.error('Chat history error:', error);
      return [];
    }
  },

  // Save chat message (for active session)
  async saveChatMessage(message: {
    session_id?: string;
    message_text: string;
    is_user_message: boolean;
    message_type?: string;
    message_data?: any;
  }): Promise<boolean> {
    try {
      const response = await fetch(`${API_URL}/user/chat-history`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          ...message,
          message_type: message.message_type || 'text',
          message_data: message.message_data || {}
        })
      });
      
      return response.ok;
    } catch (error) {
      console.error('Save chat message error:', error);
      return false;
    }
  },

  // Get chat sessions (for History option - read-only)
  async getChatSessions(): Promise<ChatSession[]> {
    try {
      const response = await fetch(`${API_URL}/user/chat-sessions`, {
        headers: getAuthHeaders()
      });
      
      if (!response.ok) throw new Error('Failed to fetch chat sessions');
      
      const data = await response.json();
      return data.sessions || [];
    } catch (error) {
      console.error('Chat sessions error:', error);
      return [];
    }
  },

  // Save complete chat session (on logout only)
  async saveChatSession(sessionId: string, messages: any[]): Promise<boolean> {
    try {
      const response = await fetch(`${API_URL}/user/chat-sessions`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          session_id: sessionId,
          messages: messages
        })
      });
      
      return response.ok;
    } catch (error) {
      console.error('Save chat session error:', error);
      return false;
    }
  }
};

// ============= CALENDAR EVENTS =============
export interface CalendarEvent {
  user_gender: 'Men' | 'Women';
  event_date: string;
  event_name: string;
  event_category: string;
  outfit_suggestions: any[];
  notes: string;
  reminder_sent: boolean;
  created_at: string;
}

export const calendarApi = {
  // Get user's calendar events
  async getEvents(): Promise<CalendarEvent[]> {
    try {
      const response = await fetch(`${API_URL}/user/calendar-events`, {
        headers: getAuthHeaders()
      });
      
      if (!response.ok) throw new Error('Failed to fetch calendar events');
      
      const data = await response.json();
      return data.events || [];
    } catch (error) {
      console.error('Calendar events error:', error);
      return [];
    }
  },

  // Save calendar event
  async saveEvent(event: {
    user_gender: 'Men' | 'Women';
    event_date: string;
    event_name: string;
    event_category?: string;
    outfit_suggestions?: any[];
    notes?: string;
  }): Promise<boolean> {
    try {
      const response = await fetch(`${API_URL}/user/calendar-events`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          ...event,
          event_category: event.event_category || 'personal',
          outfit_suggestions: event.outfit_suggestions || [],
          notes: event.notes || ''
        })
      });
      
      return response.ok;
    } catch (error) {
      console.error('Save calendar event error:', error);
      return false;
    }
  },

  // Delete calendar event
  async deleteEvent(eventDate: string, eventName: string): Promise<boolean> {
    try {
      const response = await fetch(`${API_URL}/user/calendar-events?event_date=${eventDate}&event_name=${encodeURIComponent(eventName)}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      
      return response.ok;
    } catch (error) {
      console.error('Delete calendar event error:', error);
      return false;
    }
  }
};

// ============= AUTHENTICATION STATUS =============
export const authApi = {
  // Check if user is logged in
  isLoggedIn(): boolean {
    return !!getAuthToken();
  },

  // Get current user info from token
  getCurrentUser(): { email?: string } | null {
    const token = getAuthToken();
    if (!token) return null;
    
    try {
      // Decode JWT token (basic decode, not verification)
      const payload = JSON.parse(atob(token.split('.')[1]));
      return { email: payload.email };
    } catch (error) {
      console.error('Token decode error:', error);
      return null;
    }
  },

  // Logout user
  logout(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('authToken');
      // Redirect to login page
      window.location.href = '/login';
    }
  }
};

export default {
  searchHistory: searchHistoryApi,
  wishlist: wishlistApi,
  cart: cartApi,
  orders: ordersApi,
  chatHistory: chatHistoryApi,
  calendar: calendarApi,
  auth: authApi
};