// Order synchronization utility for cross-page updates
export class OrderSyncManager {
  private static instance: OrderSyncManager;
  private listeners: Map<string, Function[]> = new Map();

  static getInstance(): OrderSyncManager {
    if (!OrderSyncManager.instance) {
      OrderSyncManager.instance = new OrderSyncManager();
    }
    return OrderSyncManager.instance;
  }

  // Emit order update event
  emitOrderUpdate(orderId: string, newStatus: string, userEmail: string) {
    // Use localStorage to sync across tabs/pages
    const updateData = {
      orderId,
      newStatus,
      userEmail,
      timestamp: Date.now()
    };
    
    localStorage.setItem('order_update', JSON.stringify(updateData));
    
    // Trigger storage event manually for same tab
    window.dispatchEvent(new StorageEvent('storage', {
      key: 'order_update',
      newValue: JSON.stringify(updateData)
    }));
  }

  // Listen for order updates
  onOrderUpdate(callback: (orderId: string, newStatus: string, userEmail: string) => void) {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'order_update' && e.newValue) {
        try {
          const updateData = JSON.parse(e.newValue);
          callback(updateData.orderId, updateData.newStatus, updateData.userEmail);
        } catch (error) {
          console.error('Error parsing order update:', error);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    
    // Return cleanup function
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }

  // Emit cart update event (for future use)
  emitCartUpdate() {
    localStorage.setItem('cart_update', Date.now().toString());
    window.dispatchEvent(new StorageEvent('storage', {
      key: 'cart_update',
      newValue: Date.now().toString()
    }));
  }
}

export const orderSync = OrderSyncManager.getInstance();