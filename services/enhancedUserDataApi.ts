// Enhanced User Data API Service - Complete User Isolation with Return/Refund System
const API_URL = 'http://localhost:5000/api';

// Get JWT token from localStorage
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
    console.error('Token decode error:', error);
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

// ============= SEARCH HISTORY =============
export interface SearchHistoryItem {
  id: number;
  search_query: string;
  search_filters: any;
  results_count: number;
  search_type: 'text' | 'voice' | 'image' | 'filter';
  created_at: string;
}

export const searchHistoryApi = {
  // Get user's search history
  async getHistory(limit?: number): Promise<SearchHistoryItem[]> {
    try {
      const url = limit ? `${API_URL}/user/search-history?limit=${limit}` : `${API_URL}/user/search-history`;
      const response = await fetch(url, {
        headers: getAuthHeaders()
      });
      
      if (!response.ok) throw new Error('Failed to fetch search history');
      
      const data = await response.json();
      return data.searches || [];
    } catch (error) {
      console.error('Search history error:', error);
      return [];
    }
  },

  // Save search query
  async saveSearch(query: string, filters: any, resultsCount: number, searchType: 'text' | 'voice' | 'image' | 'filter' = 'text'): Promise<boolean> {
    try {
      const response = await fetch(`${API_URL}/user/search-history`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          query,
          filters,
          results_count: resultsCount,
          search_type: searchType
        })
      });
      
      return response.ok;
    } catch (error) {
      console.error('Save search error:', error);
      return false;
    }
  },

  // Clear search history
  async clearHistory(): Promise<boolean> {
    try {
      const response = await fetch(`${API_URL}/user/search-history`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      
      return response.ok;
    } catch (error) {
      console.error('Clear search history error:', error);
      return false;
    }
  }
};

// ============= WISHLIST =============
export interface WishlistItem {
  id: number;
  product_id: string;
  product_name: string;
  product_image: string;
  product_price: number;
  product_category: string;
  product_brand: string;
  product_size: string;
  product_color: string;
  notes: string;
  priority: 'low' | 'medium' | 'high';
  added_at: string;
}

export const wishlistApi = {
  // Get user's wishlist
  async getWishlist(): Promise<WishlistItem[]> {
    try {
      const response = await fetch(`${API_URL}/user/wishlist`, {
        headers: getAuthHeaders()
      });
      
      if (!response.ok) throw new Error('Failed to fetch wishlist');
      
      const data = await response.json();
      return data.wishlist || [];
    } catch (error) {
      console.error('Wishlist error:', error);
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
    product_brand?: string;
    product_size?: string;
    product_color?: string;
    notes?: string;
    priority?: 'low' | 'medium' | 'high';
  }): Promise<boolean> {
    try {
      const response = await fetch(`${API_URL}/user/wishlist`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          ...product,
          priority: product.priority || 'medium'
        })
      });
      
      return response.ok;
    } catch (error) {
      console.error('Add to wishlist error:', error);
      return false;
    }
  },

  // Update wishlist item
  async updateWishlistItem(productId: string, updates: {
    notes?: string;
    priority?: 'low' | 'medium' | 'high';
  }): Promise<boolean> {
    try {
      const response = await fetch(`${API_URL}/user/wishlist`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ product_id: productId, ...updates })
      });
      
      return response.ok;
    } catch (error) {
      console.error('Update wishlist error:', error);
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
  },

  // Clear entire wishlist
  async clearWishlist(): Promise<boolean> {
    try {
      const response = await fetch(`${API_URL}/user/wishlist`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      
      return response.ok;
    } catch (error) {
      console.error('Clear wishlist error:', error);
      return false;
    }
  }
};

// ============= CART =============
export interface CartItem {
  id: number;
  product_id: string;
  product_name: string;
  product_image: string;
  product_price: number;
  product_category: string;
  product_brand: string;
  product_size: string;
  product_color: string;
  quantity: number;
  selected_for_checkout: boolean;
  added_at: string;
  updated_at: string;
}

export const cartApi = {
  // Get user's cart
  async getCart(): Promise<{ items: CartItem[], total: number, count: number, selectedTotal: number }> {
    try {
      const response = await fetch(`${API_URL}/user/cart`, {
        headers: getAuthHeaders()
      });
      
      if (!response.ok) throw new Error('Failed to fetch cart');
      
      const data = await response.json();
      return {
        items: data.cart || [],
        total: data.total || 0,
        count: data.count || 0,
        selectedTotal: data.selectedTotal || 0
      };
    } catch (error) {
      console.error('Cart error:', error);
      return { items: [], total: 0, count: 0, selectedTotal: 0 };
    }
  },

  // Add item to cart
  async addToCart(product: {
    product_id: string;
    product_name: string;
    product_image: string;
    product_price: number;
    product_category: string;
    product_brand?: string;
    product_size?: string;
    product_color?: string;
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

  // Update cart item
  async updateCartItem(productId: string, updates: {
    quantity?: number;
    selected_for_checkout?: boolean;
    product_size?: string;
    product_color?: string;
  }): Promise<boolean> {
    try {
      const response = await fetch(`${API_URL}/user/cart`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ product_id: productId, ...updates })
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
  id: number;
  order_id: string;
  total_amount: number;
  discount_amount: number;
  tax_amount: number;
  shipping_cost: number;
  final_amount: number;
  order_status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  payment_status: 'pending' | 'paid' | 'failed' | 'refunded' | 'partial_refund';
  payment_method: string;
  shipping_address: string;
  billing_address: string;
  tracking_number: string;
  estimated_delivery: string;
  actual_delivery: string;
  order_items: any[];
  order_notes: string;
  created_at: string;
  updated_at: string;
}

export interface OrderItem {
  id: number;
  order_id: string;
  product_id: string;
  product_name: string;
  product_image: string;
  product_price: number;
  product_category: string;
  product_brand: string;
  product_size: string;
  product_color: string;
  quantity: number;
  item_total: number;
  item_status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'returned' | 'cancelled';
  created_at: string;
}

export const ordersApi = {
  // Get user's orders
  async getOrders(status?: string): Promise<Order[]> {
    try {
      const url = status ? `${API_URL}/user/orders?status=${status}` : `${API_URL}/user/orders`;
      const response = await fetch(url, {
        headers: getAuthHeaders()
      });
      
      if (!response.ok) throw new Error('Failed to fetch orders');
      
      const data = await response.json();
      return data.orders || [];
    } catch (error) {
      console.error('Orders error:', error);
      return [];
    }
  },

  // Get specific order details
  async getOrderDetails(orderId: string): Promise<Order | null> {
    try {
      const response = await fetch(`${API_URL}/user/orders/${orderId}`, {
        headers: getAuthHeaders()
      });
      
      if (!response.ok) throw new Error('Failed to fetch order details');
      
      const data = await response.json();
      return data.order || null;
    } catch (error) {
      console.error('Order details error:', error);
      return null;
    }
  },

  // Get order items
  async getOrderItems(orderId: string): Promise<OrderItem[]> {
    try {
      const response = await fetch(`${API_URL}/user/orders/${orderId}/items`, {
        headers: getAuthHeaders()
      });
      
      if (!response.ok) throw new Error('Failed to fetch order items');
      
      const data = await response.json();
      return data.items || [];
    } catch (error) {
      console.error('Order items error:', error);
      return [];
    }
  },

  // Place new order
  async placeOrder(orderData: {
    total_amount: number;
    discount_amount?: number;
    tax_amount?: number;
    shipping_cost?: number;
    payment_method: string;
    shipping_address: string;
    billing_address?: string;
    order_items: any[];
    order_notes?: string;
  }): Promise<{ success: boolean; order_id?: string; error?: string }> {
    try {
      const response = await fetch(`${API_URL}/user/orders`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          ...orderData,
          order_id: `ORD_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        return { success: true, order_id: data.order_id };
      } else {
        return { success: false, error: data.error || 'Failed to place order' };
      }
    } catch (error) {
      console.error('Place order error:', error);
      return { success: false, error: 'Network error' };
    }
  },

  // Cancel order
  async cancelOrder(orderId: string, reason: string): Promise<boolean> {
    try {
      const response = await fetch(`${API_URL}/user/orders/${orderId}/cancel`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ reason })
      });
      
      return response.ok;
    } catch (error) {
      console.error('Cancel order error:', error);
      return false;
    }
  }
};

// ============= RETURNS & REFUNDS =============
export interface ReturnRequest {
  id: number;
  return_id: string;
  original_order_id: string;
  return_type: 'return' | 'exchange' | 'refund';
  return_reason: 'defective' | 'wrong_size' | 'wrong_color' | 'not_as_described' | 'damaged' | 'changed_mind' | 'other';
  return_description: string;
  returned_items: any[];
  return_amount: number;
  return_status: 'requested' | 'approved' | 'rejected' | 'pickup_scheduled' | 'picked_up' | 'processing' | 'completed' | 'cancelled';
  refund_status: 'pending' | 'processing' | 'completed' | 'failed';
  refund_amount: number;
  refund_method: string;
  pickup_address: string;
  pickup_date: string;
  return_tracking_number: string;
  admin_notes: string;
  images: string[];
  created_at: string;
  updated_at: string;
}

export const returnsApi = {
  // Get user's return history
  async getReturns(status?: string): Promise<ReturnRequest[]> {
    try {
      const url = status ? `${API_URL}/user/returns?status=${status}` : `${API_URL}/user/returns`;
      const response = await fetch(url, {
        headers: getAuthHeaders()
      });
      
      if (!response.ok) throw new Error('Failed to fetch returns');
      
      const data = await response.json();
      return data.returns || [];
    } catch (error) {
      console.error('Returns error:', error);
      return [];
    }
  },

  // Get specific return details
  async getReturnDetails(returnId: string): Promise<ReturnRequest | null> {
    try {
      const response = await fetch(`${API_URL}/user/returns/${returnId}`, {
        headers: getAuthHeaders()
      });
      
      if (!response.ok) throw new Error('Failed to fetch return details');
      
      const data = await response.json();
      return data.return || null;
    } catch (error) {
      console.error('Return details error:', error);
      return null;
    }
  },

  // Create return request
  async createReturn(returnData: {
    order_id: string;
    return_type: 'return' | 'exchange' | 'refund';
    return_reason: 'defective' | 'wrong_size' | 'wrong_color' | 'not_as_described' | 'damaged' | 'changed_mind' | 'other';
    return_description: string;
    returned_items: any[];
    pickup_address: string;
    images?: string[];
  }): Promise<{ success: boolean; return_id?: string; error?: string }> {
    try {
      const response = await fetch(`${API_URL}/user/returns`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          ...returnData,
          return_id: `RET_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        return { success: true, return_id: data.return_id };
      } else {
        return { success: false, error: data.error || 'Failed to create return request' };
      }
    } catch (error) {
      console.error('Create return error:', error);
      return { success: false, error: 'Network error' };
    }
  },

  // Cancel return request
  async cancelReturn(returnId: string): Promise<boolean> {
    try {
      const response = await fetch(`${API_URL}/user/returns/${returnId}/cancel`, {
        method: 'POST',
        headers: getAuthHeaders()
      });
      
      return response.ok;
    } catch (error) {
      console.error('Cancel return error:', error);
      return false;
    }
  }
};

// ============= CHAT HISTORY =============
export interface ChatMessage {
  id: number;
  session_id: string;
  message_text: string;
  is_user_message: boolean;
  message_type: string;
  message_data: any;
  response_time_ms: number;
  user_rating: number | null;
  created_at: string;
}

export const chatHistoryApi = {
  // Get user's chat history
  async getChatHistory(sessionId?: string, limit?: number): Promise<ChatMessage[]> {
    try {
      let url = `${API_URL}/user/chat-history`;
      const params = new URLSearchParams();
      
      if (sessionId) params.append('session_id', sessionId);
      if (limit) params.append('limit', limit.toString());
      
      if (params.toString()) url += `?${params.toString()}`;
        
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

  // Save chat message
  async saveChatMessage(message: {
    session_id?: string;
    message_text: string;
    is_user_message: boolean;
    message_type?: string;
    message_data?: any;
    response_time_ms?: number;
  }): Promise<boolean> {
    try {
      const response = await fetch(`${API_URL}/user/chat-history`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          ...message,
          message_type: message.message_type || 'text',
          message_data: message.message_data || {},
          response_time_ms: message.response_time_ms || 0
        })
      });
      
      return response.ok;
    } catch (error) {
      console.error('Save chat message error:', error);
      return false;
    }
  },

  // Rate AI response
  async rateResponse(messageId: number, rating: number): Promise<boolean> {
    try {
      const response = await fetch(`${API_URL}/user/chat-history/${messageId}/rate`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ rating })
      });
      
      return response.ok;
    } catch (error) {
      console.error('Rate response error:', error);
      return false;
    }
  },

  // Clear chat history
  async clearChatHistory(sessionId?: string): Promise<boolean> {
    try {
      const url = sessionId 
        ? `${API_URL}/user/chat-history?session_id=${sessionId}`
        : `${API_URL}/user/chat-history`;
        
      const response = await fetch(url, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      
      return response.ok;
    } catch (error) {
      console.error('Clear chat history error:', error);
      return false;
    }
  }
};

// ============= CALENDAR EVENTS =============
export interface CalendarEvent {
  id: number;
  user_gender: 'Men' | 'Women';
  event_date: string;
  event_name: string;
  event_category: string;
  event_type: 'festival' | 'personal' | 'work' | 'social' | 'custom';
  outfit_suggestions: any[];
  recommended_products: any[];
  notes: string;
  reminder_sent: boolean;
  reminder_date: string;
  event_importance: 'low' | 'medium' | 'high';
  created_at: string;
  updated_at: string;
}

export const calendarApi = {
  // Get user's calendar events
  async getEvents(startDate?: string, endDate?: string): Promise<CalendarEvent[]> {
    try {
      let url = `${API_URL}/user/calendar-events`;
      const params = new URLSearchParams();
      
      if (startDate) params.append('start_date', startDate);
      if (endDate) params.append('end_date', endDate);
      
      if (params.toString()) url += `?${params.toString()}`;
      
      const response = await fetch(url, {
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
    event_type?: 'festival' | 'personal' | 'work' | 'social' | 'custom';
    outfit_suggestions?: any[];
    recommended_products?: any[];
    notes?: string;
    reminder_date?: string;
    event_importance?: 'low' | 'medium' | 'high';
  }): Promise<boolean> {
    try {
      const response = await fetch(`${API_URL}/user/calendar-events`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          ...event,
          event_category: event.event_category || 'personal',
          event_type: event.event_type || 'personal',
          outfit_suggestions: event.outfit_suggestions || [],
          recommended_products: event.recommended_products || [],
          notes: event.notes || '',
          event_importance: event.event_importance || 'medium'
        })
      });
      
      return response.ok;
    } catch (error) {
      console.error('Save calendar event error:', error);
      return false;
    }
  },

  // Update calendar event
  async updateEvent(eventId: number, updates: Partial<CalendarEvent>): Promise<boolean> {
    try {
      const response = await fetch(`${API_URL}/user/calendar-events/${eventId}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(updates)
      });
      
      return response.ok;
    } catch (error) {
      console.error('Update calendar event error:', error);
      return false;
    }
  },

  // Delete calendar event
  async deleteEvent(eventId: number): Promise<boolean> {
    try {
      const response = await fetch(`${API_URL}/user/calendar-events/${eventId}`, {
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

// ============= USER PREFERENCES =============
export interface UserPreferences {
  preferred_gender: 'Men' | 'Women';
  preferred_categories: string[];
  preferred_colors: string[];
  preferred_brands: string[];
  preferred_sizes: string[];
  price_range_min: number;
  price_range_max: number;
  notification_settings: any;
  privacy_settings: any;
  language_preference: string;
  currency_preference: string;
}

export const preferencesApi = {
  // Get user preferences
  async getPreferences(): Promise<UserPreferences | null> {
    try {
      const response = await fetch(`${API_URL}/user/preferences`, {
        headers: getAuthHeaders()
      });
      
      if (!response.ok) throw new Error('Failed to fetch preferences');
      
      const data = await response.json();
      return data.preferences || null;
    } catch (error) {
      console.error('Preferences error:', error);
      return null;
    }
  },

  // Update user preferences
  async updatePreferences(preferences: Partial<UserPreferences>): Promise<boolean> {
    try {
      const response = await fetch(`${API_URL}/user/preferences`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(preferences)
      });
      
      return response.ok;
    } catch (error) {
      console.error('Update preferences error:', error);
      return false;
    }
  }
};

// ============= NOTIFICATIONS =============
export interface UserNotification {
  id: number;
  notification_type: string;
  title: string;
  message: string;
  notification_data: any;
  is_read: boolean;
  is_important: boolean;
  expires_at: string | null;
  created_at: string;
  read_at: string | null;
}

export const notificationsApi = {
  // Get user notifications
  async getNotifications(unreadOnly?: boolean): Promise<UserNotification[]> {
    try {
      const url = unreadOnly 
        ? `${API_URL}/user/notifications?unread_only=true`
        : `${API_URL}/user/notifications`;
        
      const response = await fetch(url, {
        headers: getAuthHeaders()
      });
      
      if (!response.ok) throw new Error('Failed to fetch notifications');
      
      const data = await response.json();
      return data.notifications || [];
    } catch (error) {
      console.error('Notifications error:', error);
      return [];
    }
  },

  // Mark notification as read
  async markAsRead(notificationId: number): Promise<boolean> {
    try {
      const response = await fetch(`${API_URL}/user/notifications/${notificationId}/read`, {
        method: 'POST',
        headers: getAuthHeaders()
      });
      
      return response.ok;
    } catch (error) {
      console.error('Mark notification read error:', error);
      return false;
    }
  },

  // Mark all notifications as read
  async markAllAsRead(): Promise<boolean> {
    try {
      const response = await fetch(`${API_URL}/user/notifications/read-all`, {
        method: 'POST',
        headers: getAuthHeaders()
      });
      
      return response.ok;
    } catch (error) {
      console.error('Mark all notifications read error:', error);
      return false;
    }
  }
};

// ============= AUTHENTICATION & SESSION =============
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
      // Clear all user data from localStorage
      const userEmail = getUserEmail();
      if (userEmail) {
        // Clear user-specific localStorage data
        Object.keys(localStorage).forEach(key => {
          if (key.includes(userEmail) || key.startsWith('user_')) {
            localStorage.removeItem(key);
          }
        });
      }
      
      // Clear auth token
      localStorage.removeItem('authToken');
      localStorage.removeItem('user_email');
      
      // Redirect to login page
      window.location.href = '/login';
    }
  },

  // Clear session data (but keep persistent data)
  clearSession(): void {
    if (typeof window !== 'undefined') {
      // Only clear session-specific data, not persistent user data
      const keysToKeep = ['authToken', 'user_email'];
      const userEmail = getUserEmail();
      
      Object.keys(localStorage).forEach(key => {
        if (!keysToKeep.includes(key) && !key.includes('_persistent_')) {
          localStorage.removeItem(key);
        }
      });
    }
  }
};

// ============= DATA ISOLATION UTILITIES =============
export const dataIsolationUtils = {
  // Get user-specific localStorage key
  getUserKey(baseKey: string): string {
    const userEmail = getUserEmail();
    return userEmail ? `${baseKey}_${userEmail}` : baseKey;
  },

  // Set user-specific data in localStorage
  setUserData(key: string, data: any, persistent: boolean = true): void {
    if (typeof window !== 'undefined') {
      const userKey = this.getUserKey(key);
      const finalKey = persistent ? `${userKey}_persistent` : userKey;
      localStorage.setItem(finalKey, JSON.stringify(data));
    }
  },

  // Get user-specific data from localStorage
  getUserData(key: string, persistent: boolean = true): any {
    if (typeof window !== 'undefined') {
      const userKey = this.getUserKey(key);
      const finalKey = persistent ? `${userKey}_persistent` : userKey;
      const data = localStorage.getItem(finalKey);
      return data ? JSON.parse(data) : null;
    }
    return null;
  },

  // Clear user-specific data
  clearUserData(key?: string): void {
    if (typeof window !== 'undefined') {
      const userEmail = getUserEmail();
      if (!userEmail) return;
      
      if (key) {
        // Clear specific key
        const userKey = this.getUserKey(key);
        localStorage.removeItem(userKey);
        localStorage.removeItem(`${userKey}_persistent`);
      } else {
        // Clear all user data
        Object.keys(localStorage).forEach(storageKey => {
          if (storageKey.includes(userEmail)) {
            localStorage.removeItem(storageKey);
          }
        });
      }
    }
  }
};

// Export all APIs
export default {
  searchHistory: searchHistoryApi,
  wishlist: wishlistApi,
  cart: cartApi,
  orders: ordersApi,
  returns: returnsApi,
  chatHistory: chatHistoryApi,
  calendar: calendarApi,
  preferences: preferencesApi,
  notifications: notificationsApi,
  auth: authApi,
  utils: dataIsolationUtils
};