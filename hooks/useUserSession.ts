import { useEffect, useState } from 'react';
import { useCart } from '../context/CartContext';

export const useUserSession = () => {
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  const { clearUserData, refreshUserData } = useCart();

  useEffect(() => {
    // Get current user from localStorage
    const getCurrentUser = () => {
      if (typeof window !== 'undefined') {
        return localStorage.getItem('user_email');
      }
      return null;
    };

    // Check for user changes
    const checkUserChange = () => {
      const newUser = getCurrentUser();
      
      if (newUser !== currentUser) {
        console.log('User changed from', currentUser, 'to', newUser);
        
        // Clear old user data
        clearUserData();
        
        // Update current user
        setCurrentUser(newUser);
        
        // Load new user data if logged in
        if (newUser) {
          setTimeout(() => {
            refreshUserData();
          }, 100); // Small delay to ensure state is updated
        }
      }
    };

    // Initial check
    checkUserChange();

    // Listen for storage changes (login/logout)
    const handleStorageChange = () => {
      checkUserChange();
    };

    // Listen for custom user change events
    const handleUserChange = () => {
      checkUserChange();
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('userChanged', handleUserChange);

    // Check periodically for user changes
    const interval = setInterval(checkUserChange, 1000);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('userChanged', handleUserChange);
      clearInterval(interval);
    };
  }, [currentUser, clearUserData, refreshUserData]);

  return { currentUser };
};