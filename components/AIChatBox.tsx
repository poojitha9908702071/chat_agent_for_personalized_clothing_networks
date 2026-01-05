"use client";

import { useState, useEffect, useRef } from "react";
import { useCart } from "../context/CartContext";
import userDataApi from "../services/userDataApi";

interface Message {
  text: string;
  isUser: boolean;
  timestamp: string;
  products?: Product[];
  showAllProducts?: boolean; // New field to track if all products should be shown
  type?: string; // Add type field for special messages
  options?: string[]; // Add options for interactive buttons
  flowState?: any; // Add flow state for multi-step processes
  orders?: any[]; // Add orders field for order display messages
}

interface PolicyResponse {
  text: string;
  products: Product[];
  type?: string;
  options?: string[];
}

interface Product {
  product_id: string;
  product_name: string;
  price: number;
  product_image: string;
  color: string;
  gender: string;
  product_category: string;
  stock: number;
  product_description?: string;
}

// Custom Calendar Component
interface CustomCalendarProps {
  onDateSelect: (year: number, month: number, day: number) => void;
  selectedDate?: string;
}

const CustomCalendar: React.FC<CustomCalendarProps> = ({ onDateSelect, selectedDate }) => {
  const [currentStep, setCurrentStep] = useState<'year' | 'month' | 'day'>('year');
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth());
  
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear + i);
  
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  
  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };
  
  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay();
  };
  
  const isMonthInPast = (year: number, month: number) => {
    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth();
    
    if (year < currentYear) return true;
    if (year === currentYear && month < currentMonth) return true;
    return false;
  };
  
  const handleYearSelect = (year: number) => {
    setSelectedYear(year);
    setCurrentStep('month');
  };
  
  const handleMonthSelect = (monthIndex: number) => {
    setSelectedMonth(monthIndex);
    setCurrentStep('day');
  };
  
  const handleDaySelect = (day: number) => {
    onDateSelect(selectedYear, selectedMonth, day);
  };
  
  const goBack = () => {
    if (currentStep === 'month') {
      setCurrentStep('year');
    } else if (currentStep === 'day') {
      setCurrentStep('month');
    }
  };
  
  return (
    <div className="w-full max-w-md mx-auto">
      {/* Header with back button */}
      <div className="flex items-center justify-between mb-4">
        {currentStep !== 'year' && (
          <button
            onClick={goBack}
            className="flex items-center gap-2 text-purple-600 hover:text-purple-800 font-medium"
          >
            <span>←</span>
            <span>Back</span>
          </button>
        )}
        <div className="text-lg font-bold text-gray-800">
          {currentStep === 'year' && 'Select Year'}
          {currentStep === 'month' && `Select Month - ${selectedYear}`}
          {currentStep === 'day' && `Select Day - ${months[selectedMonth]} ${selectedYear}`}
        </div>
        <div></div> {/* Spacer for centering */}
      </div>
      
      {/* Year Selection */}
      {currentStep === 'year' && (
        <div className="grid grid-cols-2 gap-3">
          {years.map((year) => (
            <button
              key={year}
              onClick={() => handleYearSelect(year)}
              className="bg-white border-2 border-purple-200 hover:border-purple-400 hover:bg-purple-50 rounded-xl p-4 font-semibold text-gray-800 transition-all"
            >
              {year}
            </button>
          ))}
        </div>
      )}
      
      {/* Month Selection */}
      {currentStep === 'month' && (
        <div className="grid grid-cols-3 gap-2">
          {months.map((month, index) => {
            const isPastMonth = isMonthInPast(selectedYear, index);
            
            if (isPastMonth) return null; // Don't render past months
            
            return (
              <button
                key={month}
                onClick={() => handleMonthSelect(index)}
                className="bg-white border-2 border-purple-200 hover:border-purple-400 hover:bg-purple-50 rounded-lg p-3 font-medium text-gray-800 transition-all text-sm"
              >
                {month.substring(0, 3)}
              </button>
            );
          })}
        </div>
      )}
      
      {/* Day Selection */}
      {currentStep === 'day' && (
        <div>
          {/* Days of week header */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
              <div key={day} className="text-center text-xs font-medium text-gray-500 p-2">
                {day}
              </div>
            ))}
          </div>
          
          {/* Calendar grid */}
          <div className="grid grid-cols-7 gap-1">
            {/* Empty cells for days before month starts */}
            {Array.from({ length: getFirstDayOfMonth(selectedYear, selectedMonth) }).map((_, index) => (
              <div key={`empty-${index}`} className="p-2"></div>
            ))}
            
            {/* Days of the month */}
            {Array.from({ length: getDaysInMonth(selectedYear, selectedMonth) }).map((_, index) => {
              const day = index + 1;
              const today = new Date();
              const isToday = selectedYear === today.getFullYear() && 
                            selectedMonth === today.getMonth() && 
                            day === today.getDate();
              const isPast = new Date(selectedYear, selectedMonth, day) < new Date(today.getFullYear(), today.getMonth(), today.getDate());
              
              return (
                <button
                  key={day}
                  onClick={() => !isPast && handleDaySelect(day)}
                  disabled={isPast}
                  className={`
                    p-2 text-sm font-medium rounded-lg transition-all
                    ${isPast 
                      ? 'text-gray-300 cursor-not-allowed' 
                      : 'text-gray-800 hover:bg-purple-100 hover:border-purple-300'
                    }
                    ${isToday ? 'bg-purple-200 border-2 border-purple-400' : 'bg-white border border-gray-200'}
                  `}
                >
                  {day}
                </button>
              );
            })}
          </div>
          
          <div className="text-xs text-gray-500 mt-3 text-center">
            Past dates are disabled. Select a future date for your event.
          </div>
        </div>
      )}
    </div>
  );
};

export default function AIChatBox() {
  const { cart, wishlist } = useCart();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { 
      text: "Hi! I'm FashioPulse assistant. How can I help you?", 
      isUser: false,
      timestamp: new Date().toISOString(),
      options: ["1️⃣ Face Tone", "2️⃣ Body Fit"]
    },
  ]);
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId] = useState(() => `session_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`);
  
  // Flow state management
  const [currentFlow, setCurrentFlow] = useState<'none' | 'face_tone' | 'body_fit' | 'calendar'>('none');
  const [flowData, setFlowData] = useState<any>({});
  
  // Product search context for follow-up queries
  const [lastSearchContext, setLastSearchContext] = useState<{
    filters: any;
    query: string;
    timestamp: string;
  } | null>(null);

  // Menu state management
  const [showDropdown, setShowDropdown] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showFeatures, setShowFeatures] = useState(false);
  const [chatHistory, setChatHistory] = useState<any[]>([]);

  // Calendar state management
  const [showCalendar, setShowCalendar] = useState(false);
  const [calendarStep, setCalendarStep] = useState<'gender' | 'date' | 'event' | 'complete'>('gender');
  const [calendarData, setCalendarData] = useState<{
    gender?: string;
    date?: string;
    event?: string;
    selectedYear?: number;
    selectedMonth?: number;
    selectedDay?: number;
  }>({});
  const [userEvents, setUserEvents] = useState<any[]>([]);
  const [hasUpcomingEvents, setHasUpcomingEvents] = useState(false);
  const [showCustomEventInput, setShowCustomEventInput] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  const [expandedMessages, setExpandedMessages] = useState<Set<number>>(new Set()); // Track which messages have expanded products
  const messagesEndRef = useRef<HTMLDivElement>(null); // Reference for auto-scroll

  // Function to reset chat to initial state with options
  const resetChatToInitialState = () => {
    setMessages([
      { 
        text: "Hi! I'm FashioPulse assistant. How can I help you?", 
        isUser: false,
        timestamp: new Date().toISOString(),
        options: ["1️⃣ Face Tone", "2️⃣ Body Fit"]
      },
    ]);
    setCurrentFlow('none');
    setFlowData({});
  };

  // Chat persistence system - Save only on logout, restore on login
  const saveChatToDatabase = async () => {
    if (!userDataApi.auth.isLoggedIn()) {
      console.log('User not logged in, skipping chat history save');
      return;
    }

    try {
      // Save complete chat session to database (ONLY ON LOGOUT)
      const success = await userDataApi.chatHistory.saveChatSession(sessionId, messages);
      
      if (success) {
        console.log('✅ Complete chat session saved to database on logout');
      } else {
        console.error('❌ Failed to save chat session to database');
      }
    } catch (error) {
      console.error('Error saving chat session to database:', error);
    }
  };

  const loadChatFromDatabase = async () => {
    // ❌ NEVER auto-load previous chat into active chat
    // This function is intentionally empty per user requirements
    // Previous chats are accessible ONLY via History option
    console.log('🚫 Auto-loading previous chat is disabled per requirements');
    return [];
  };

  const loadChatHistory = async () => {
    if (!userDataApi.auth.isLoggedIn()) {
      setChatHistory([]);
      return;
    }

    try {
      // Load chat sessions for History option (read-only)
      const sessions = await userDataApi.chatHistory.getChatSessions();
      setChatHistory(sessions);
      console.log(`📜 Loaded ${sessions.length} chat sessions for history view`);
    } catch (error) {
      console.error('Error loading chat sessions:', error);
      setChatHistory([]);
    }
  };

  const loadHistoryChat = (historyItem: any) => {
    // ❌ DO NOT load history into active chat per requirements
    // History is read-only, just close the history view
    setShowHistory(false);
    setShowDropdown(false);
    
    // Show a message that history is read-only
    setMessages(prev => [...prev, {
      text: "📜 **History is Read-Only**\n\nHistory chats are for viewing only. Your current active chat remains unchanged.\n\n💡 Continue chatting normally - your conversation will be saved when you log out.",
      isUser: false,
      timestamp: new Date().toISOString(),
      type: 'info'
    }]);
  };

  const handleDropdownAction = (action: string) => {
    if (action === 'history') {
      loadChatHistory();
      setShowHistory(true);
      setShowFeatures(false);
    } else if (action === 'features') {
      setShowFeatures(true);
      setShowHistory(false);
    }
    setShowDropdown(false);
  };

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Load chat state from localStorage/sessionStorage on component mount
  useEffect(() => {
    const initializeChat = async () => {
      // Load user events and check for upcoming events
      await loadUserEvents();
      await checkUpcomingEvents();
      
      // Check if returning from product page
      const returnState = sessionStorage.getItem('fashionpulse_chat_return');
      if (returnState) {
        try {
          const { isOpen: wasOpen, messages: returnMessages, fromChat } = JSON.parse(returnState);
          if (fromChat && wasOpen && returnMessages) {
            setIsOpen(true);
            setMessages(returnMessages);
            sessionStorage.removeItem('fashionpulse_chat_return');
            console.log('Chat restored from product page navigation');
            return;
          }
        } catch (error) {
          console.error('Error restoring chat from return state:', error);
        }
      }
      
      // 🟢 WHILE USER IS LOGGED IN: Chat messages stay in active chat
      if (userDataApi.auth.isLoggedIn()) {
        const currentUser = userDataApi.auth.getCurrentUser();
        console.log('Starting chat session for logged-in user:', currentUser?.email);
        
        // Check if there's an active session in sessionStorage (during login session)
        const activeSession = sessionStorage.getItem('fashionpulse_active_chat');
        if (activeSession) {
          try {
            const sessionData = JSON.parse(activeSession);
            if (sessionData.userEmail === currentUser?.email && sessionData.messages) {
              setMessages(sessionData.messages);
              console.log('🟢 Chat restored from active session (user still logged in)');
              return;
            }
          } catch (error) {
            console.error('Error restoring active session:', error);
          }
        }
        
        // 🔄 WHEN USER LOGS IN AGAIN: Start with fresh empty chat
        // Do NOT auto-load previous chat into live chat
        console.log('🔄 Starting fresh chat session on login (previous chats accessible via History)');
      } else {
        console.log('Starting fresh chat session for guest user');
      }
    };

    initializeChat();
  }, [sessionId]);

  // Calendar and Event Management Functions - Using User Isolation API
  const loadUserEvents = async () => {
    if (!userDataApi.auth.isLoggedIn()) {
      setUserEvents([]);
      return;
    }

    try {
      const events = await userDataApi.calendar.getEvents();
      setUserEvents(events);
    } catch (error) {
      console.error('Error loading user events:', error);
      setUserEvents([]);
    }
  };

  const saveUserEvent = async (eventData: any) => {
    if (!userDataApi.auth.isLoggedIn()) {
      console.log('User not logged in, cannot save event');
      return null;
    }

    try {
      const success = await userDataApi.calendar.saveEvent({
        user_gender: eventData.gender,
        event_date: eventData.date,
        event_name: eventData.event,
        event_category: 'personal',
        outfit_suggestions: [],
        notes: ''
      });

      if (success) {
        // Reload events to get updated list
        await loadUserEvents();
        
        return {
          id: `event_${Date.now()}`,
          ...eventData,
          createdAt: new Date().toISOString()
        };
      }
      
      return null;
    } catch (error) {
      console.error('Error saving user event:', error);
      return null;
    }
  };

  const checkUpcomingEvents = async () => {
    if (!userDataApi.auth.isLoggedIn()) {
      setHasUpcomingEvents(false);
      return;
    }

    try {
      const events = await userDataApi.calendar.getEvents();
      
      const today = new Date();
      const threeDaysFromNow = new Date();
      threeDaysFromNow.setDate(today.getDate() + 3);
      
      const upcomingEvents = events.filter((event: any) => {
        const eventDate = new Date(event.event_date);
        return eventDate >= today && eventDate <= threeDaysFromNow;
      });
      
      setHasUpcomingEvents(upcomingEvents.length > 0);
      
      // Show reminder if there are upcoming events and chat is opened
      if (upcomingEvents.length > 0 && isOpen) {
        showEventReminders(upcomingEvents);
      }
    } catch (error) {
      console.error('Error checking upcoming events:', error);
      setHasUpcomingEvents(false);
    }
  };

  const showEventReminders = (upcomingEvents: any[]) => {
    upcomingEvents.forEach((event, index) => {
      setTimeout(() => {
        const eventDate = new Date(event.event_date).toLocaleDateString();
        const daysUntil = Math.ceil((new Date(event.event_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
        
        let reminderText = `🔔 **Event Reminder**\n\n`;
        reminderText += `Your event "${event.event_name}" on ${eventDate} is `;
        reminderText += daysUntil === 0 ? 'today!' : daysUntil === 1 ? 'tomorrow!' : `in ${daysUntil} days!`;
        reminderText += `\n\nHere are the best outfit suggestions for you:`;
        
        setMessages((prev) => [...prev, {
          text: reminderText,
          isUser: false,
          timestamp: new Date().toISOString(),
          type: 'event_reminder'
        }]);
        
        // Get outfit suggestions for this event
        getEventOutfitSuggestions({
          ...event,
          event: event.event_name,
          date: event.event_date,
          gender: event.user_gender
        });
      }, index * 1000); // Stagger reminders by 1 second
    });
  };

  const getEventOutfitSuggestions = async (event: any) => {
    try {
      // Generate outfit suggestions based on gender and event type
      const outfitSuggestions = generateOutfitSuggestions(event.gender, event.event);
      
      // Get products from backend based on suggested categories
      const response = await fetch(`http://localhost:5000/api/products/search?query=clothing&category=fashion`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Filter products based on gender and suggested categories
      const filteredProducts = (data.products || []).filter((p: any) => {
        // Gender matching
        const matchesGender = p.gender?.toLowerCase() === event.gender.toLowerCase() ||
                             p.gender?.toLowerCase() === 'unisex';
        
        // Category matching based on outfit suggestions
        const matchesCategory = outfitSuggestions.categories.some(category => {
          const productCategory = p.category?.toLowerCase() || '';
          const categoryLower = category.toLowerCase();
          
          // Map categories to database fields
          if (categoryLower.includes('western wear')) {
            return productCategory.includes('western') || productCategory.includes('casual');
          } else if (categoryLower.includes('dresses')) {
            return productCategory.includes('dress');
          } else if (categoryLower.includes('ethnic wear')) {
            return productCategory.includes('ethnic') || productCategory.includes('traditional');
          } else if (categoryLower.includes('tops') || categoryLower.includes('co-ord')) {
            return productCategory.includes('top') || productCategory.includes('coord');
          } else if (categoryLower.includes('bottom wear')) {
            return productCategory.includes('pant') || productCategory.includes('jean') || 
                   productCategory.includes('trouser') || productCategory.includes('bottom');
          } else if (categoryLower.includes('shirts')) {
            return productCategory.includes('shirt') && !productCategory.includes('t-shirt');
          } else if (categoryLower.includes('t-shirts')) {
            return productCategory.includes('t-shirt') || productCategory.includes('tshirt');
          }
          
          return productCategory.includes(categoryLower);
        });
        
        return matchesGender && matchesCategory;
      });
      
      if (filteredProducts.length > 0) {
        // Transform products to match expected format
        const products = filteredProducts.slice(0, 8).map((p: any) => ({
          product_id: p.product_id,
          product_name: p.title,
          price: p.price,
          product_image: p.image_url,
          color: p.color || 'Mixed',
          gender: p.gender || event.gender,
          product_category: p.category || 'Fashion',
          stock: p.stock || 10,
          product_description: p.description || `Perfect for your ${event.event}`
        }));

        // Show event reminder with outfit suggestions
        const eventDate = new Date(event.date).toLocaleDateString();
        const daysUntil = Math.ceil((new Date(event.date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
        
        let reminderText = `🔔 **Event Reminder**\n\n`;
        reminderText += `Your event "${event.event}" on ${eventDate} is `;
        reminderText += daysUntil === 0 ? 'today!' : daysUntil === 1 ? 'tomorrow!' : `in ${daysUntil} days!`;
        reminderText += `\n\n🎯 **Recommended Categories:**\n${outfitSuggestions.categories.map(cat => `• ${cat}`).join('\n')}`;
        reminderText += `\n\n👗 **Perfect Outfits for ${event.event}:**`;
        
        setMessages((prev) => [...prev, {
          text: reminderText,
          isUser: false,
          timestamp: new Date().toISOString(),
          products: products,
          type: 'event_reminder'
        }]);
      } else {
        // Show reminder without products if none found
        const eventDate = new Date(event.date).toLocaleDateString();
        const daysUntil = Math.ceil((new Date(event.date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
        
        let reminderText = `🔔 **Event Reminder**\n\n`;
        reminderText += `Your event "${event.event}" on ${eventDate} is `;
        reminderText += daysUntil === 0 ? 'today!' : daysUntil === 1 ? 'tomorrow!' : `in ${daysUntil} days!`;
        reminderText += `\n\n🎯 **Recommended Categories for this event:**\n${outfitSuggestions.categories.map(cat => `• ${cat}`).join('\n')}`;
        reminderText += `\n\n💡 Try searching for these categories in our store!`;
        
        setMessages((prev) => [...prev, {
          text: reminderText,
          isUser: false,
          timestamp: new Date().toISOString(),
          type: 'event_reminder'
        }]);
      }
    } catch (error) {
      console.error('Error getting event outfit suggestions:', error);
      setMessages((prev) => [...prev, {
        text: `🔔 **Event Reminder**\n\nYour event "${event.event}" on ${new Date(event.date).toLocaleDateString()} is approaching! I couldn't fetch outfit suggestions right now, but I'm sure you'll look amazing! 💫`,
        isUser: false,
        timestamp: new Date().toISOString(),
        type: 'event_reminder'
      }]);
    }
  };

  const handleCalendarClick = () => {
    setShowCalendar(true);
    setCalendarStep('gender');
    setCalendarData({});
  };

  // Generate outfit suggestions based on gender and event type
  const generateOutfitSuggestions = (gender: string, event: string) => {
    const eventLower = event.toLowerCase();
    
    if (gender === 'Women') {
      // 👩‍🦰 WOMEN LOGIC - Available Categories (ONLY THESE)
      if (eventLower.includes('job interview') || eventLower.includes('office') || 
          eventLower.includes('meeting') || eventLower.includes('conference') || 
          eventLower.includes('seminar')) {
        return {
          categories: ['Western Wear', 'Tops & Co-Ord Sets', 'Bottom Wear', 'Dresses'],
          style: 'formal'
        };
      }
      
      if (eventLower.includes('wedding') || eventLower.includes('engagement') || 
          eventLower.includes('reception')) {
        return {
          categories: ['Ethnic Wear', 'Dresses'],
          style: 'traditional/formal'
        };
      }
      
      if (eventLower.includes('birthday') || eventLower.includes('party') || 
          eventLower.includes('night out') || eventLower.includes('celebration')) {
        return {
          categories: ['Western Wear', 'Dresses', 'Tops & Co-Ord Sets', 'Bottom Wear'],
          style: 'party'
        };
      }
      
      if (eventLower.includes('college') || eventLower.includes('daily wear') || 
          eventLower.includes('casual')) {
        return {
          categories: ['Tops & Co-Ord Sets', 'Western Wear', 'Bottom Wear', 'Dresses'],
          style: 'casual'
        };
      }
      
      // Telugu Festivals
      if (eventLower.includes('ugadi') || eventLower.includes('sankranthi') || 
          eventLower.includes('bhogi') || eventLower.includes('kanuma') || 
          eventLower.includes('vinayaka chavithi') || eventLower.includes('dasara') || 
          eventLower.includes('diwali') || eventLower.includes('varalakshmi vratham') || 
          eventLower.includes('bathukamma') || eventLower.includes('bonalu') || 
          eventLower.includes('sri rama navami') || eventLower.includes('maha shivaratri') || 
          eventLower.includes('eid') || eventLower.includes('festival')) {
        return {
          categories: ['Ethnic Wear', 'Dresses'],
          style: 'traditional'
        };
      }
      
      if (eventLower.includes('family function') || eventLower.includes('temple')) {
        return {
          categories: ['Ethnic Wear', 'Dresses'],
          style: 'traditional'
        };
      }
      
      if (eventLower.includes('travel') || eventLower.includes('trip') || 
          eventLower.includes('photoshoot')) {
        return {
          categories: ['Western Wear', 'Dresses', 'Tops & Co-Ord Sets', 'Bottom Wear'],
          style: 'trendy'
        };
      }
      
      // Default for other/custom events
      return {
        categories: ['Western Wear', 'Dresses', 'Ethnic Wear'],
        style: 'balanced'
      };
      
    } else if (gender === 'Men') {
      // 👨 MEN LOGIC - Available Categories (ONLY THESE)
      if (eventLower.includes('job interview') || eventLower.includes('office') || 
          eventLower.includes('meeting') || eventLower.includes('conference') || 
          eventLower.includes('seminar')) {
        return {
          categories: ['Shirts', 'Bottom Wear'],
          style: 'formal'
        };
      }
      
      if (eventLower.includes('wedding') || eventLower.includes('engagement') || 
          eventLower.includes('reception')) {
        return {
          categories: ['Shirts', 'Bottom Wear'],
          style: 'premium/formal'
        };
      }
      
      if (eventLower.includes('party') || eventLower.includes('celebration') || 
          eventLower.includes('night out')) {
        return {
          categories: ['Shirts', 'T-Shirts', 'Bottom Wear'],
          style: 'stylish'
        };
      }
      
      if (eventLower.includes('college') || eventLower.includes('daily wear') || 
          eventLower.includes('casual')) {
        return {
          categories: ['T-Shirts', 'Shirts', 'Bottom Wear'],
          style: 'casual'
        };
      }
      
      // Telugu Festivals
      if (eventLower.includes('ugadi') || eventLower.includes('sankranthi') || 
          eventLower.includes('bhogi') || eventLower.includes('kanuma') || 
          eventLower.includes('vinayaka chavithi') || eventLower.includes('dasara') || 
          eventLower.includes('diwali') || eventLower.includes('bathukamma') || 
          eventLower.includes('bonalu') || eventLower.includes('sri rama navami') || 
          eventLower.includes('eid') || eventLower.includes('festival')) {
        return {
          categories: ['Shirts', 'Bottom Wear'],
          style: 'festive'
        };
      }
      
      if (eventLower.includes('travel') || eventLower.includes('trip') || 
          eventLower.includes('photoshoot')) {
        return {
          categories: ['Shirts', 'T-Shirts', 'Bottom Wear'],
          style: 'trendy'
        };
      }
      
      // Default for other/custom events
      return {
        categories: ['Shirts', 'T-Shirts', 'Bottom Wear'],
        style: 'balanced'
      };
    }
    
    // Fallback
    return {
      categories: ['Western Wear', 'Dresses'],
      style: 'general'
    };
  };

  const handleCalendarStep = async (selection: string) => {
    if (calendarStep === 'gender') {
      setCalendarData({ ...calendarData, gender: selection });
      setCalendarStep('date');
    } else if (calendarStep === 'date') {
      setCalendarData({ ...calendarData, date: selection });
      setCalendarStep('event');
    } else if (calendarStep === 'event') {
      if (selection === 'Others') {
        setShowCustomEventInput(true);
        return;
      }
      
      const eventData = {
        ...calendarData,
        event: selection,
        date: calendarData.date,
        user_email: localStorage.getItem('user_email') || 'guest@example.com'
      };
      
      // Save the event with enhanced logic
      const savedEvent = await saveUserEvent(eventData);
      
      if (!savedEvent) {
        setMessages((prev) => [...prev, {
          text: `❌ **Error**: Failed to save event. Please try again.`,
          isUser: false,
          timestamp: new Date().toISOString(),
          type: 'error'
        }]);
        return;
      }
      
      // Generate outfit suggestions based on gender + event type
      const outfitSuggestions = generateOutfitSuggestions(calendarData.gender || 'Women', selection);
      
      // Show confirmation message with outfit categories
      setMessages((prev) => [...prev, {
        text: `✅ **Event Saved Successfully!**\n\n📅 **${savedEvent.event}** on ${new Date(savedEvent.date).toLocaleDateString()}\n👤 Gender: ${savedEvent.gender}\n\n🎯 **Recommended Categories for this event:**\n${outfitSuggestions.categories.map(cat => `• ${cat}`).join('\n')}\n\n🔔 I'll remind you closer to the date with perfect outfit suggestions!`,
        isUser: false,
        timestamp: new Date().toISOString(),
        type: 'event_confirmation'
      }]);
      
      // Close calendar
      setShowCalendar(false);
      setCalendarStep('gender');
      setCalendarData({});
      setShowCustomEventInput(false);
      
      // Check for upcoming events and show suggestions if event is soon
      await checkUpcomingEvents();
      
      // If event is within 7 days, show immediate outfit suggestions with products
      const eventDate = new Date(savedEvent.date);
      const today = new Date();
      const daysUntil = Math.ceil((eventDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysUntil <= 7 && daysUntil >= 0) {
        setTimeout(() => {
          getEventOutfitSuggestions(savedEvent);
        }, 1000);
      }
    }
  };

  const handleCustomEventSave = async (customEvent: string) => {
    if (!customEvent.trim()) return;
    
    const eventData = {
      ...calendarData,
      event: customEvent.trim(),
      date: calendarData.date
    };
    
    // Save the event
    const savedEvent = await saveUserEvent(eventData);
    
    if (!savedEvent) {
      setMessages((prev) => [...prev, {
        text: `❌ **Error**: Failed to save custom event. Please try again.`,
        isUser: false,
        timestamp: new Date().toISOString(),
        type: 'error'
      }]);
      return;
    }
    
    // Show confirmation message
    setMessages((prev) => [...prev, {
      text: `✅ **Custom Event Saved Successfully!**\n\n📅 **${savedEvent.event}** on ${new Date(savedEvent.date).toLocaleDateString()}\n👤 Gender: ${savedEvent.gender}\n\n🔔 I'll remind you closer to the date with perfect outfit suggestions!`,
      isUser: false,
      timestamp: new Date().toISOString(),
      type: 'event_confirmation'
    }]);
    
    // Close calendar
    setShowCalendar(false);
    setCalendarStep('gender');
    setCalendarData({});
    setShowCustomEventInput(false);
    
    // Check for upcoming events
    await checkUpcomingEvents();
    
    // If event is within 7 days, show immediate outfit suggestions
    const eventDate = new Date(savedEvent.date);
    const today = new Date();
    const daysUntil = Math.ceil((eventDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysUntil <= 7 && daysUntil >= 0) {
      setTimeout(() => {
        getEventOutfitSuggestions(savedEvent);
      }, 1000);
    }
  };

  const handleDateSelection = (year: number, month: number, day: number) => {
    const selectedDate = new Date(year, month, day);
    const dateString = selectedDate.toISOString().split('T')[0];
    
    setCalendarData({ 
      ...calendarData, 
      date: dateString,
      selectedYear: year,
      selectedMonth: month,
      selectedDay: day
    });
    setCalendarStep('event');
  };

  // Also check for chat restoration on every render (in case useEffect misses it)
  useEffect(() => {
    const checkChatRestore = () => {
      const returnState = sessionStorage.getItem('fashionpulse_chat_return');
      if (returnState && !isOpen) {
        try {
          const { isOpen: wasOpen, messages: returnMessages, fromChat } = JSON.parse(returnState);
          if (fromChat && wasOpen && returnMessages) {
            setIsOpen(true);
            setMessages(returnMessages);
            sessionStorage.removeItem('fashionpulse_chat_return');
            console.log('Chat restored via secondary check');
          }
        } catch (error) {
          console.error('Error in secondary chat restore:', error);
        }
      }
    };

    // Check immediately and also set up interval
    checkChatRestore();
    const interval = setInterval(checkChatRestore, 500);
    
    return () => clearInterval(interval);
  }, [isOpen]);

  // Save chat to session storage during active session (not database)
  useEffect(() => {
    // 🟢 WHILE USER IS LOGGED IN: Save to session storage only (not database)
    if (userDataApi.auth.isLoggedIn() && messages.length > 1) {
      const currentUser = userDataApi.auth.getCurrentUser();
      sessionStorage.setItem('fashionpulse_active_chat', JSON.stringify({
        userEmail: currentUser?.email,
        messages: messages,
        timestamp: new Date().toISOString()
      }));
      console.log('💾 Chat saved to session storage (active session)');
    }
  }, [messages]);

  // Clear chat session (always starts fresh now)
  const clearChatSession = () => {
    setMessages([
      { 
        text: "Hi! I'm FashioPulse assistant. How can I help you?", 
        isUser: false,
        timestamp: new Date().toISOString(),
        options: ["1️⃣ Face Tone", "2️⃣ Body Fit"]
      },
    ]);
    
    // Clear session storage
    sessionStorage.removeItem('fashionpulse_active_chat');
    console.log('Chat session cleared - starting fresh');
  };

  // Save chat to database on logout
  const saveAndClearChatOnLogout = async () => {
    // 🔴 WHEN USER LOGS OUT (ONLY THEN): Save entire chat conversation
    if (userDataApi.auth.isLoggedIn() && messages.length > 1) {
      console.log('🔴 User logging out - saving chat history to database');
      await saveChatToDatabase();
    }
    clearChatSession();
  };

  // Expose chat functions globally for logout functionality
  useEffect(() => {
    (window as any).clearFashionPulseChat = clearChatSession;
    (window as any).saveAndClearFashionPulseChat = saveAndClearChatOnLogout;
    
    // Also listen for logout events
    const handleLogout = async () => {
      await saveAndClearChatOnLogout();
    };
    
    window.addEventListener('fashionpulse-logout', handleLogout);
    
    return () => {
      delete (window as any).clearFashionPulseChat;
      delete (window as any).saveAndClearFashionPulseChat;
      window.removeEventListener('fashionpulse-logout', handleLogout);
    };
  }, [messages]); // Include messages in dependency array

  const sendMessageToAgent = async (message: string): Promise<{text: string, products: Product[], type?: string, action?: string, options?: string[]}> => {
    try {
      // Check for policy-related queries first (these work for ALL users)
      
      // 1. Return Policy Queries
      if (isReturnPolicyQuery(message)) {
        return handleReturnPolicyQuery();
      }
      
      // 2. Payment Queries  
      if (isPaymentQuery(message)) {
        return handlePaymentQuery();
      }
      
      // 3. Refund Queries
      if (isRefundQuery(message)) {
        return handleRefundQuery();
      }
      
      // 4. Size Guide Queries
      if (isSizeGuideQuery(message)) {
        return handleSizeGuideQuery(message);
      }
      
      // 5. Cart Queries
      if (isCartQuery(message)) {
        return { text: '', products: [], type: 'cart_request' };
      }
      
      // 6. Wishlist Queries
      if (isWishlistQuery(message)) {
        return { text: '', products: [], type: 'wishlist_request' };
      }
      
      // 7. Order Queries (but not the detailed order handling)
      if (isOrdersListQuery(message)) {
        console.log('🔍 Order list query detected:', message);
        return { text: '', products: [], type: 'orders_request' };
      }
      
      // Check if this is a follow-up query (price modification)
      const isFollowUp = isFollowUpQuery(message);
      
      if (isFollowUp && lastSearchContext) {
        // Handle follow-up queries like "show under 1500", "above 2000", etc.
        const updatedFilters = updateFiltersFromFollowUp(message, lastSearchContext.filters);
        
        const response = await fetch('http://localhost:5000/api/products/search-natural', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ 
            query: lastSearchContext.query,
            override_filters: updatedFilters
          })
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        
        // Update search context
        setLastSearchContext({
          filters: updatedFilters,
          query: lastSearchContext.query,
          timestamp: new Date().toISOString()
        });
        
        const products = (data.products || []).map((p: any) => ({
          product_id: p.product_id,
          product_name: p.title,
          price: p.price,
          product_image: p.image_url,
          color: p.color || 'Mixed',
          gender: p.gender || 'Unisex',
          product_category: p.category || 'Fashion',
          stock: p.stock || 10,
          product_description: p.description || 'Premium quality clothing item'
        }));

        let responseText = generateFollowUpResponse(message, updatedFilters, products.length);
        
        if (products.length === 0) {
          responseText = "No products found with the updated criteria. Try adjusting your price range or other filters.";
        }

        return {
          text: responseText,
          products: products,
          type: 'product_search_followup'
        };
      }
      
      // Check if this is an order-related query (detailed order handling)
      const isOrderQuery = isOrderRelatedQuery(message);
      
      if (isOrderQuery) {
        // Handle order queries with user isolation
        return await handleOrderQuery(message);
      }
      
      // Check if this is a product-related query
      const isProductQuery = isProductRelatedQuery(message);
      
      if (isProductQuery) {
        // Use natural language product search
        const response = await fetch('http://localhost:5000/api/products/search-natural', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ query: message })
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        
        // Store search context for follow-up queries
        setLastSearchContext({
          filters: data.filters_applied || {},
          query: message,
          timestamp: new Date().toISOString()
        });
        
        // Transform the response to match expected format
        const products = (data.products || []).map((p: any) => ({
          product_id: p.product_id,
          product_name: p.title,
          price: p.price,
          product_image: p.image_url,
          color: p.color || 'Mixed',
          gender: p.gender || 'Unisex',
          product_category: p.category || 'Fashion',
          stock: p.stock || 10,
          product_description: p.description || 'Premium quality clothing item'
        }));

        // Generate intelligent response based on filters applied
        let responseText = generateProductSearchResponse(message, data.filters_applied, products.length);
        
        // Handle fallback scenarios
        if (data.fallback_used && products.length > 0) {
          responseText = data.message || "Showing closest matching results based on your request.";
        } else if (products.length === 0) {
          responseText = data.message || "No products found matching your request. Please try a different color, price, or category.";
        }

        return {
          text: responseText,
          products: products,
          type: 'product_search'
        };
      } else {
        // Clear search context for non-product queries
        setLastSearchContext(null);
        
        // Use existing general search for non-product queries
        const response = await fetch('http://localhost:5000/api/products/search?query=' + encodeURIComponent(message) + '&category=fashion', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        
        // Transform the response to match expected format
        const products = (data.products || []).map((p: any) => ({
          product_id: p.product_id,
          product_name: p.title,
          price: p.price,
          product_image: p.image_url,
          color: p.color || 'Mixed',
          gender: p.gender || 'Unisex',
          product_category: p.category || 'Fashion',
          stock: p.stock || 10,
          product_description: p.description || 'Premium quality clothing item'
        }));

        // Generate appropriate response based on the message
        let responseText = "Here are some great products I found for you:";
        
        if (message.toLowerCase().includes('red')) {
          responseText = "🔴 Perfect! Here are some beautiful red items:";
        } else if (message.toLowerCase().includes('blue')) {
          responseText = "🔵 Great choice! Here are lovely blue options:";
        } else if (message.toLowerCase().includes('black')) {
          responseText = "⚫ Elegant! Here are stylish black pieces:";
        } else if (message.toLowerCase().includes('white')) {
          responseText = "⚪ Classic! Here are pristine white items:";
        } else if (message.toLowerCase().includes('dress')) {
          responseText = "👗 Beautiful dresses just for you:";
        } else if (message.toLowerCase().includes('shirt')) {
          responseText = "👔 Stylish shirts that you'll love:";
        } else if (message.toLowerCase().includes('men')) {
          responseText = "👨 Great men's fashion finds:";
        } else if (message.toLowerCase().includes('women')) {
          responseText = "👩 Wonderful women's collection:";
        }

        return {
          text: responseText,
          products: products.slice(0, 10), // Limit to 10 products
          type: 'product_search'
        };
      }
    } catch (error) {
      console.error('Chat API error:', error);
      
      // Check if it's a network error (server not running)
      if (error instanceof TypeError && error.message === 'Failed to fetch') {
        return {
          text: `🔌 **Connection Issue**

I'm having trouble connecting to the product database. Please make sure:

1. **Backend Server** is running on port 5000
2. **Start it with**: \`python backend/app.py\`
3. **Check the terminal** for any error messages

💡 **Quick Fix**: The backend should be running automatically. Try refreshing the page!

Once connected, I'll be able to help you find products from our FashioPulse database! 🛍️`,
          products: []
        };
      }
      
      // Other errors
      return {
        text: `❌ **Error**: ${error instanceof Error ? error.message : 'Unknown error'}\n\nPlease try again or check if the backend server is running.`,
        products: [],
        type: 'error'
      };
    }
  };

  // Helper function to detect follow-up queries
  const isFollowUpQuery = (message: string): boolean => {
    const followUpPatterns = [
      /^(show|find|get)\s+(under|below|above|over)\s+(\d+)/i,
      /^(under|below|above|over)\s+(\d+)/i,
      /^(cheaper|expensive|costlier)/i,
      /^(less than|more than|greater than)\s+(\d+)/i
    ];
    
    return followUpPatterns.some(pattern => pattern.test(message.trim()));
  };

  // Helper function to update filters from follow-up queries
  const updateFiltersFromFollowUp = (message: string, previousFilters: any) => {
    const updatedFilters = { ...previousFilters };
    
    // Remove previous price filters
    delete updatedFilters.price_min;
    delete updatedFilters.price_max;
    
    // Extract new price constraints
    const underMatch = message.match(/(?:under|below|less than)\s*(?:rs\.?|₹)?\s*(\d+)/i);
    if (underMatch) {
      updatedFilters.price_max = parseInt(underMatch[1]);
    }
    
    const aboveMatch = message.match(/(?:above|over|more than|greater than)\s*(?:rs\.?|₹)?\s*(\d+)/i);
    if (aboveMatch) {
      updatedFilters.price_min = parseInt(aboveMatch[1]);
    }
    
    return updatedFilters;
  };

  // Helper function to generate follow-up response
  const generateFollowUpResponse = (query: string, filters: any, productCount: number): string => {
    let response = "🔄 Updated your search! ";
    
    if (filters.price_max && filters.price_min) {
      response += `Found ${productCount} products between ₹${filters.price_min} - ₹${filters.price_max}`;
    } else if (filters.price_max) {
      response += `Found ${productCount} products under ₹${filters.price_max}`;
    } else if (filters.price_min) {
      response += `Found ${productCount} products above ₹${filters.price_min}`;
    }
    
    if (filters.gender && filters.product_category) {
      response += ` for ${filters.gender.toLowerCase()}'s ${filters.product_category}`;
    }
    
    if (filters.color) {
      response += ` in ${filters.color}`;
    }
    
    response += ":\n\n💡 You can further refine by saying things like 'show under 1000' or 'above 2500'!";
    
    return response;
  };

  // Helper function to detect if a message is product-related
  const isProductRelatedQuery = (message: string): boolean => {
    const productKeywords = [
      // Categories
      'shirt', 'shirts', 't-shirt', 't-shirts', 'tshirt', 'dress', 'dresses',
      'ethnic', 'western', 'hoodie', 'hoodies', 'pants', 'jeans', 'trousers',
      'tops', 'coord', 'co-ord', 'bottomwear', 'bottom wear',
      
      // Colors
      'black', 'white', 'blue', 'red', 'green', 'pink', 'grey', 'gray', 'brown',
      'navy', 'maroon', 'olive', 'cream', 'beige',
      
      // Gender
      'men', 'women', 'man', 'woman', 'male', 'female', 'boys', 'girls',
      
      // Price indicators
      'under', 'below', 'above', 'over', 'price', 'cost', 'cheap', 'expensive',
      'budget', 'affordable', 'rs', '₹', 'rupees',
      
      // Size
      'size', 'xs', 's', 'm', 'l', 'xl', 'xxl',
      
      // General product terms
      'show', 'find', 'search', 'looking for', 'want', 'need', 'buy',
      'clothing', 'clothes', 'fashion', 'wear', 'outfit', 'style',
      
      // Occasion-based
      'party', 'formal', 'casual', 'office', 'work', 'wedding', 'festival'
    ];
    
    const messageLower = message.toLowerCase();
    return productKeywords.some(keyword => messageLower.includes(keyword));
  };

  // Helper function to detect if a message is order-related
  const isOrderRelatedQuery = (message: string): boolean => {
    const orderKeywords = [
      'order', 'orders', 'my order', 'my orders', 'order details', 'order status',
      'track order', 'track my order', 'what did i order', 'show my orders',
      'order history', 'purchase history', 'bought', 'purchased', 'delivery',
      'shipped', 'delivered', 'cancel order', 'return order'
    ];
    
    const messageLower = message.toLowerCase();
    return orderKeywords.some(keyword => messageLower.includes(keyword));
  };

  // Helper function to detect if a message is asking for orders list (not detailed order handling)
  const isOrdersListQuery = (message: string): boolean => {
    const ordersListKeywords = [
      'show orders', 'my orders', 'order list', 'orders list', 'recent orders',
      'order history', 'purchase history', 'what orders', 'orders summary',
      'order details', 'show my orders', 'view orders', 'check orders',
      'orders', 'order', 'my order history', 'purchase details'
    ];
    
    const messageLower = message.toLowerCase();
    return ordersListKeywords.some(keyword => messageLower.includes(keyword));
  };

  // Helper function to detect cart queries
  const isCartQuery = (message: string): boolean => {
    const cartKeywords = [
      'cart', 'my cart', 'show cart', 'cart items', 'what\'s in cart',
      'cart details', 'shopping cart', 'view cart', 'cart contents'
    ];
    
    const messageLower = message.toLowerCase();
    return cartKeywords.some(keyword => messageLower.includes(keyword));
  };

  // Helper function to detect wishlist queries
  const isWishlistQuery = (message: string): boolean => {
    const wishlistKeywords = [
      'wishlist', 'my wishlist', 'show wishlist', 'wishlist items', 'saved items',
      'favorites', 'my favorites', 'saved products', 'wish list', 'favourite'
    ];
    
    const messageLower = message.toLowerCase();
    return wishlistKeywords.some(keyword => messageLower.includes(keyword));
  };

  // Helper function to detect return policy queries
  const isReturnPolicyQuery = (message: string): boolean => {
    const returnKeywords = [
      'return policy', 'return', 'returns', 'can i return', 'how to return',
      'return period', 'return days', 'exchange', 'refund policy', 'return eligibility',
      'return condition', 'return process', 'how many days return', 'return available'
    ];
    
    const messageLower = message.toLowerCase();
    return returnKeywords.some(keyword => messageLower.includes(keyword));
  };

  // Helper function to detect payment queries
  const isPaymentQuery = (message: string): boolean => {
    const paymentKeywords = [
      'payment', 'payment methods', 'payment options', 'how to pay', 'pay',
      'online payment', 'cash on delivery', 'cod', 'upi', 'debit card', 'credit card',
      'net banking', 'payment gateway', 'secure payment', 'payment process'
    ];
    
    const messageLower = message.toLowerCase();
    return paymentKeywords.some(keyword => messageLower.includes(keyword));
  };

  // Helper function to detect refund queries
  const isRefundQuery = (message: string): boolean => {
    const refundKeywords = [
      'refund', 'refunds', 'refund process', 'refund time', 'refund status',
      'money back', 'refund amount', 'when will i get refund', 'refund policy',
      'refund confirmation', 'bank refund', 'refund days'
    ];
    
    const messageLower = message.toLowerCase();
    return refundKeywords.some(keyword => messageLower.includes(keyword));
  };

  // Helper function to detect size guide queries
  const isSizeGuideQuery = (message: string): boolean => {
    const sizeKeywords = [
      'size', 'size chart', 'size guide', 'sizing', 'what size', 'my size',
      'size measurement', 'size help', 'fit', 'fitting', 'measurements',
      'chest size', 'waist size', 'bust size', 'size xs', 'size s', 'size m', 'size l', 'size xl'
    ];
    
    const messageLower = message.toLowerCase();
    return sizeKeywords.some(keyword => messageLower.includes(keyword));
  };

  // Handle return policy queries
  const handleReturnPolicyQuery = (): {text: string, products: Product[], type?: string} => {
    const returnPolicyText = `📋 **Return Policy**

✅ **Return Period:** Products can be returned within the allowed return period (as per store policy)

📦 **Condition:** Products must be unused and in original condition

💰 **Refund Process:** Refund will be processed after return verification

🏷️ **Eligibility:** Return eligibility depends on product type

💡 For specific return requests, please contact our customer support team.`;

    return {
      text: returnPolicyText,
      products: [],
      type: 'return_policy'
    };
  };

  // Handle payment queries
  const handlePaymentQuery = (): {text: string, products: Product[], type?: string} => {
    const paymentOptionsText = `💳 **Payment Options**

💻 **Online Payments:**
• UPI (Google Pay, PhonePe, Paytm)
• Debit Card
• Credit Card  
• Net Banking

🚚 **Cash on Delivery:** Available (if applicable)

🔒 **Security:** Secure and safe payment processing with industry-standard encryption

💡 Choose the payment method that's most convenient for you at checkout!`;

    return {
      text: paymentOptionsText,
      products: [],
      type: 'payment_options'
    };
  };

  // Handle refund queries
  const handleRefundQuery = (): {text: string, products: Product[], type?: string} => {
    const refundText = `💰 **Refund Information**

⏰ **Processing Time:** If you paid online, the refund amount will be reflected in your bank within 3 to 5 working days

📧 **Confirmation:** You will receive a refund confirmation email once processed

🏦 **Bank Transfer:** Refunds are processed back to the original payment method

💡 For refund status inquiries, please check your email or contact customer support.`;

    return {
      text: refundText,
      products: [],
      type: 'refund_info'
    };
  };

  // Handle size guide queries with smart gender detection
  const handleSizeGuideQuery = (message: string): {text: string, products: Product[], type?: string, options?: string[]} => {
    const messageLower = message.toLowerCase();
    
    // Detect gender from message
    let detectedGender = '';
    if (messageLower.includes('women') || messageLower.includes('woman') || messageLower.includes('female') || messageLower.includes('ladies')) {
      detectedGender = 'women';
    } else if (messageLower.includes('men') || messageLower.includes('man') || messageLower.includes('male') || messageLower.includes('gents')) {
      detectedGender = 'men';
    }
    
    // Detect category from message
    let detectedCategory = '';
    if (messageLower.includes('bottom') || messageLower.includes('jeans') || messageLower.includes('pants') || messageLower.includes('trouser')) {
      detectedCategory = 'bottomwear';
    } else if (messageLower.includes('top') || messageLower.includes('shirt') || messageLower.includes('t-shirt') || messageLower.includes('dress') || messageLower.includes('blouse')) {
      detectedCategory = 'topwear';
    }
    
    // Generate appropriate size chart response
    if (detectedGender === 'women') {
      if (detectedCategory === 'bottomwear') {
        return {
          text: `📏 **Women's Bottomwear Size Chart**

**XS** – Waist 24–26 inches
**S** – Waist 26–28 inches  
**M** – Waist 28–30 inches
**L** – Waist 30–32 inches
**XL** – Waist 32–34 inches

💡 Measure around your natural waistline for the best fit!`,
          products: [],
          type: 'size_chart_women_bottom'
        };
      } else {
        return {
          text: `📏 **Women's Topwear Size Chart**

**XS** – Bust 30–32 inches
**S** – Bust 32–34 inches
**M** – Bust 34–36 inches  
**L** – Bust 36–38 inches
**XL** – Bust 38–40 inches

💡 Measure around the fullest part of your bust for accurate sizing!`,
          products: [],
          type: 'size_chart_women_top'
        };
      }
    } else if (detectedGender === 'men') {
      if (detectedCategory === 'bottomwear') {
        return {
          text: `📏 **Men's Bottomwear Size Chart**

**S** – Waist 28–30 inches
**M** – Waist 30–32 inches
**L** – Waist 32–34 inches
**XL** – Waist 34–36 inches

💡 Measure around your natural waistline for the perfect fit!`,
          products: [],
          type: 'size_chart_men_bottom'
        };
      } else {
        return {
          text: `📏 **Men's Topwear Size Chart**

**S** – Chest 36–38 inches
**M** – Chest 38–40 inches
**L** – Chest 40–42 inches
**XL** – Chest 42–44 inches

💡 Measure around the fullest part of your chest for accurate sizing!`,
          products: [],
          type: 'size_chart_men_top'
        };
      }
    } else {
      // Gender not specified, ask for clarification
      return {
        text: `📏 **Size Guide**

I'd be happy to show you our size chart! 

Are you looking for **Men** or **Women** size chart?

💡 You can also specify if you need sizing for topwear or bottomwear for more specific measurements.`,
        products: [],
        type: 'size_guide_gender_request',
        options: ['Men Size Chart', 'Women Size Chart']
      };
    }
  };

  // Handle order queries with user isolation
  const handleOrderQuery = async (message: string): Promise<{text: string, products: Product[], type?: string, orders?: any[]}> => {
    try {
      // Check if user is logged in
      if (!userDataApi.auth.isLoggedIn()) {
        return {
          text: "🔐 Please log in to view your orders. I can only show orders for authenticated users to protect your privacy.",
          products: [],
          type: 'auth_required'
        };
      }

      // Fetch user's orders with isolation
      const orders = await userDataApi.orders.getOrders();
      
      if (!orders || orders.length === 0) {
        return {
          text: "📦 You don't have any orders yet. Start shopping to see your orders here!",
          products: [],
          type: 'no_orders'
        };
      }

      // Generate response text
      let responseText = `📦 **Your Orders** (${orders.length} total)\n\n`;
      
      // Add order details
      orders.forEach((order, index) => {
        const orderDate = new Date(order.created_at).toLocaleDateString();
        const statusEmoji = getOrderStatusEmoji(order.order_status);
        
        responseText += `**Order #${order.order_id}**\n`;
        responseText += `${statusEmoji} Status: ${order.order_status}\n`;
        responseText += `📅 Date: ${orderDate}\n`;
        responseText += `💰 Total: ₹${order.total_amount}\n`;
        responseText += `\n`;
      });

      responseText += `💡 Click "Cancel Order" on any order to cancel it directly from chat!`;

      return {
        text: responseText,
        products: [],
        type: 'order_display',
        orders: orders
      };

    } catch (error) {
      console.error('Error fetching orders:', error);
      return {
        text: "❌ Sorry, I couldn't fetch your orders right now. Please try again later.",
        products: [],
        type: 'error'
      };
    }
  };

  // Get emoji for order status
  const getOrderStatusEmoji = (status: string): string => {
    switch (status.toLowerCase()) {
      case 'pending': return '⏳';
      case 'confirmed': return '✅';
      case 'processing': return '🔄';
      case 'shipped': return '🚚';
      case 'delivered': return '📦';
      case 'cancelled': return '❌';
      default: return '📋';
    }
  };

  // Handle order cancellation
  const handleOrderCancellation = async (orderId: string, reason: string = 'User requested cancellation') => {
    try {
      // Check if user is logged in
      if (!userDataApi.auth.isLoggedIn()) {
        setMessages(prev => [...prev, {
          text: "🔐 Please log in to cancel orders.",
          isUser: false,
          timestamp: new Date().toISOString(),
          type: 'auth_required'
        }]);
        return;
      }

      // Cancel the order with user isolation
      const success = await userDataApi.orders.cancelOrder(orderId, reason);
      
      if (success) {
        const currentUser = userDataApi.auth.getCurrentUser();
        
        // Show success message with refund information for online payments
        setMessages(prev => [...prev, {
          text: "✅ **Your order has been cancelled successfully.**\n\n💳 **Refund Confirmation:** If you paid online, the refund amount will be reflected in your bank within 3 to 5 working days.\n\n📧 You will receive a confirmation email shortly.",
          isUser: false,
          timestamp: new Date().toISOString(),
          type: 'order_cancelled'
        }]);
        
        // Emit order update event for cross-page sync
        if (typeof window !== 'undefined') {
          // Import orderSync dynamically to avoid SSR issues
          import('../utils/orderSync').then(({ orderSync }) => {
            orderSync.emitOrderUpdate(orderId, 'cancelled', currentUser?.email || '');
          });
        }
        
        // DON'T auto-refresh orders - just show success message
        // The user can ask "show my orders" again if they want to see updated list
        
      } else {
        setMessages(prev => [...prev, {
          text: "❌ Sorry, we couldn't cancel your order right now. Please contact customer support for assistance.",
          isUser: false,
          timestamp: new Date().toISOString(),
          type: 'error'
        }]);
      }
      
    } catch (error) {
      console.error('Error cancelling order:', error);
      setMessages(prev => [...prev, {
        text: "❌ An error occurred while cancelling your order. Please try again or contact support.",
        isUser: false,
        timestamp: new Date().toISOString(),
        type: 'error'
      }]);
    }
  };

  // Helper function to generate intelligent response based on filters
  const generateProductSearchResponse = (query: string, filters: any, productCount: number): string => {
    let response = "🛍️ ";
    
    // Add context based on filters applied
    if (filters.gender) {
      response += `Great! I found ${productCount} ${filters.gender.toLowerCase()}'s `;
    } else {
      response += `Perfect! I found ${productCount} `;
    }
    
    if (filters.color) {
      response += `${filters.color} `;
    }
    
    if (filters.product_category) {
      response += `${filters.product_category} `;
    } else if (filters.category_group) {
      response += `${filters.category_group.join(' and ')} `;
    } else {
      response += `products `;
    }
    
    if (filters.price_max && filters.price_min) {
      response += `between ₹${filters.price_min} - ₹${filters.price_max}`;
    } else if (filters.price_max) {
      response += `under ₹${filters.price_max}`;
    } else if (filters.price_min) {
      response += `above ₹${filters.price_min}`;
    }
    
    if (filters.size) {
      response += ` in size ${filters.size}`;
    }
    
    response += ":\n\n💡 Click any product to view details and add to cart!";
    
    return response;
  };

  const handleSend = async () => {
    if (!inputText.trim() || isLoading) return;

    const userMessage = inputText.trim();
    
    // Add user message
    const newUserMessage = { 
      text: userMessage, 
      isUser: true,
      timestamp: new Date().toISOString()
    };
    
    setMessages((prev) => [...prev, newUserMessage]);

    // Save user message to database if logged in
    if (userDataApi.auth.isLoggedIn()) {
      try {
        await userDataApi.chatHistory.saveChatMessage({
          session_id: sessionId,
          message_text: userMessage,
          is_user_message: true,
          message_type: 'text',
          message_data: {}
        });
      } catch (error) {
        console.error('Error saving user message:', error);
      }
    }

    setInputText("");
    setIsLoading(true);

    try {
      // Prepare message with flow context if in a flow
      let messageWithContext = userMessage;
      if (currentFlow !== 'none') {
        messageWithContext = JSON.stringify({
          message: userMessage,
          flow: currentFlow,
          flowData: flowData
        });
      }

      // Get response from chat agent
      const agentResponse = await sendMessageToAgent(messageWithContext);
      
      // Handle special response types
      if (agentResponse.type === 'cart_request') {
        await handleCartRequest();
        return;
      } else if (agentResponse.type === 'wishlist_request') {
        await handleWishlistRequest();
        return;
      } else if (agentResponse.type === 'orders_request') {
        console.log('🔍 Processing orders_request type');
        await handleOrdersRequest();
        return;
      }
      
      // Add agent response
      const newAgentMessage: Message = { 
        text: agentResponse.text, 
        isUser: false,
        timestamp: new Date().toISOString(),
        products: agentResponse.products,
        type: agentResponse.type,
        orders: (agentResponse as any).orders // Add orders data if present
      };
      
      setMessages((prev) => [...prev, newAgentMessage]);
      
      // Save agent message to database if logged in
      if (userDataApi.auth.isLoggedIn()) {
        try {
          await userDataApi.chatHistory.saveChatMessage({
            session_id: sessionId,
            message_text: agentResponse.text,
            is_user_message: false,
            message_type: agentResponse.type || 'text',
            message_data: {
              products: agentResponse.products || [],
              options: [],
              flowState: {}
            }
          });
        } catch (error) {
          console.error('Error saving agent message:', error);
        }
      }
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage = { 
        text: "Sorry, I encountered an error. Please try again.", 
        isUser: false,
        timestamp: new Date().toISOString()
      };
      
      setMessages((prev) => [...prev, errorMessage]);
      
      // Save error message to database if logged in
      if (userDataApi.auth.isLoggedIn()) {
        try {
          await userDataApi.chatHistory.saveChatMessage({
            session_id: sessionId,
            message_text: errorMessage.text,
            is_user_message: false,
            message_type: 'error',
            message_data: {}
          });
        } catch (saveError) {
          console.error('Error saving error message:', saveError);
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleOptionClick = async (option: string) => {
    setIsLoading(true);
    
    try {
      if (option === "1️⃣ Face Tone") {
        // Start Face Tone flow with face tone palette
        setCurrentFlow('face_tone');
        setFlowData({ step: 'tone_selection' });
        
        setMessages((prev) => [...prev, { 
          text: "Perfect! Let's find colors that match your skin tone.\n\nChoose the shade that best matches your skin tone:", 
          isUser: false,
          timestamp: new Date().toISOString(),
          options: ["Fair", "Wheatish", "Dusky", "Dark"]
        }]);
      } else if (option === "2️⃣ Body Fit") {
        // Start Body Fit flow - ask gender first
        setCurrentFlow('body_fit');
        setFlowData({ step: 'gender_selection' });
        
        setMessages((prev) => [...prev, { 
          text: "Great choice! Let's find the perfect fit for you.\n\nPlease select your gender:", 
          isUser: false,
          timestamp: new Date().toISOString(),
          options: ["Men", "Women"]
        }]);
      } else if (option === "Men Size Chart") {
        // Handle men's size chart request
        setMessages((prev) => [...prev, { 
          text: "📏 **Men's Size Charts**\n\nWhich type of clothing do you need sizing for?", 
          isUser: false,
          timestamp: new Date().toISOString(),
          options: ["Men's Topwear", "Men's Bottomwear"]
        }]);
      } else if (option === "Women Size Chart") {
        // Handle women's size chart request
        setMessages((prev) => [...prev, { 
          text: "📏 **Women's Size Charts**\n\nWhich type of clothing do you need sizing for?", 
          isUser: false,
          timestamp: new Date().toISOString(),
          options: ["Women's Topwear", "Women's Bottomwear"]
        }]);
      } else if (option === "Men's Topwear") {
        // Show men's topwear size chart
        setMessages((prev) => [...prev, { 
          text: "📏 **Men's Topwear Size Chart**\n\n**S** – Chest 36–38 inches\n**M** – Chest 38–40 inches\n**L** – Chest 40–42 inches\n**XL** – Chest 42–44 inches\n\n💡 Measure around the fullest part of your chest for accurate sizing!", 
          isUser: false,
          timestamp: new Date().toISOString(),
          type: 'size_chart_men_top'
        }]);
      } else if (option === "Men's Bottomwear") {
        // Show men's bottomwear size chart
        setMessages((prev) => [...prev, { 
          text: "📏 **Men's Bottomwear Size Chart**\n\n**S** – Waist 28–30 inches\n**M** – Waist 30–32 inches\n**L** – Waist 32–34 inches\n**XL** – Waist 34–36 inches\n\n💡 Measure around your natural waistline for the perfect fit!", 
          isUser: false,
          timestamp: new Date().toISOString(),
          type: 'size_chart_men_bottom'
        }]);
      } else if (option === "Women's Topwear") {
        // Show women's topwear size chart
        setMessages((prev) => [...prev, { 
          text: "📏 **Women's Topwear Size Chart**\n\n**XS** – Bust 30–32 inches\n**S** – Bust 32–34 inches\n**M** – Bust 34–36 inches\n**L** – Bust 36–38 inches\n**XL** – Bust 38–40 inches\n\n💡 Measure around the fullest part of your bust for accurate sizing!", 
          isUser: false,
          timestamp: new Date().toISOString(),
          type: 'size_chart_women_top'
        }]);
      } else if (option === "Women's Bottomwear") {
        // Show women's bottomwear size chart
        setMessages((prev) => [...prev, { 
          text: "📏 **Women's Bottomwear Size Chart**\n\n**XS** – Waist 24–26 inches\n**S** – Waist 26–28 inches\n**M** – Waist 28–30 inches\n**L** – Waist 30–32 inches\n**XL** – Waist 32–34 inches\n\n💡 Measure around your natural waistline for the best fit!", 
          isUser: false,
          timestamp: new Date().toISOString(),
          type: 'size_chart_women_bottom'
        }]);
      } else if (currentFlow === 'face_tone') {
        await handleFaceToneFlow(option);
      } else if (currentFlow === 'body_fit') {
        await handleBodyFitFlow(option);
      }
    } catch (error) {
      console.error('Error handling option click:', error);
      setMessages((prev) => [...prev, { 
        text: "Sorry, I encountered an error. Please try again.", 
        isUser: false,
        timestamp: new Date().toISOString()
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFaceToneFlow = async (option: string) => {
    const currentStep = flowData.step;
    
    if (currentStep === 'tone_selection') {
      // User selected face tone, suggest colors
      const colorSuggestions: { [key: string]: string[] } = {
        'Fair': ['Blue', 'Black'],
        'Wheatish': ['Red', 'Pink'], 
        'Dusky': ['White', 'Grey'],
        'Dark': ['Green', 'White']
      };
      
      const suggestedColors = colorSuggestions[option] || ['Blue', 'Black'];
      setFlowData({ ...flowData, selectedTone: option, step: 'color_selection' });
      
      setMessages((prev) => [...prev, { 
        text: `Excellent choice! For ${option} skin tone, these colors will look amazing on you:\n\n${suggestedColors.map((color: string) => `• ${color}`).join('\n')}\n\nPlease select one color:`, 
        isUser: false,
        timestamp: new Date().toISOString(),
        options: suggestedColors
      }]);
    } else if (currentStep === 'color_selection') {
      // User selected color, ask for gender
      setFlowData({ ...flowData, selectedColor: option, step: 'gender_selection' });
      
      setMessages((prev) => [...prev, { 
        text: `Thanks for selecting ${option}. Now please select your gender:`, 
        isUser: false,
        timestamp: new Date().toISOString(),
        options: ["Men", "Women"]
      }]);
    } else if (currentStep === 'gender_selection') {
      // User selected gender, show categories
      const categories = option === 'Men' 
        ? ['Shirts', 'T-shirts', 'Bottom Wear', 'Hoodies']
        : ['Western Wear', 'Dresses', 'Ethnic Wear', 'Tops and Co-ord Sets', "Women's Bottomwear"];
      
      setFlowData({ ...flowData, selectedGender: option, step: 'category_selection' });
      
      setMessages((prev) => [...prev, { 
        text: `Great! Now choose what type of ${option.toLowerCase()}'s clothing you're looking for:`, 
        isUser: false,
        timestamp: new Date().toISOString(),
        options: categories
      }]);
    } else if (currentStep === 'category_selection') {
      // User selected category, search products with proper filtering
      const { selectedColor, selectedGender } = flowData;
      
      try {
        // Use our existing backend to get all products first
        const response = await fetch(`http://localhost:5000/api/products/search?query=clothing&category=fashion`);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        // 🔒 STRICT FILTERING: ALL conditions must match EXACTLY
        const filteredProducts = (data.products || []).filter((p: any) => {
          // STRICT Gender matching (exact equality, NO unisex fallback)
          const matchesGender = p.gender?.toLowerCase() === selectedGender.toLowerCase();
          
          // STRICT Color matching (exact equality)
          const matchesColor = p.color?.toLowerCase() === selectedColor.toLowerCase();
          
          // STRICT Category matching (exact equality)
          let matchesCategory = false;
          const productCategory = p.category?.toLowerCase() || '';
          const selectedCategory = option.toLowerCase();
          
          // Map frontend categories to exact database categories
          if (selectedCategory === 'shirts') {
            matchesCategory = productCategory === 'shirts' || productCategory === 'shirt';
          } else if (selectedCategory === 't-shirts') {
            matchesCategory = productCategory === 't-shirts' || productCategory === 't-shirt' || productCategory === 'tshirts' || productCategory === 'tshirt';
          } else if (selectedCategory === 'bottom wear') {
            matchesCategory = productCategory === 'bottom wear' || productCategory === 'pants' || productCategory === 'jeans' || productCategory === 'trousers';
          } else if (selectedCategory === 'hoodies') {
            matchesCategory = productCategory === 'hoodies' || productCategory === 'hoodie' || productCategory === 'sweatshirts' || productCategory === 'sweatshirt';
          } else if (selectedCategory === 'western wear') {
            matchesCategory = productCategory === 'western wear' || productCategory === 'western';
          } else if (selectedCategory === 'dresses') {
            matchesCategory = productCategory === 'dresses' || productCategory === 'dress';
          } else if (selectedCategory === 'ethnic wear') {
            matchesCategory = productCategory === 'ethnic wear' || productCategory === 'ethnic' || productCategory === 'traditional';
          } else if (selectedCategory === 'tops and co-ord sets') {
            matchesCategory = productCategory === 'tops and co-ord sets' || productCategory === 'tops' || productCategory === 'coord sets';
          } else if (selectedCategory === "women's bottomwear") {
            matchesCategory = productCategory === "women's bottomwear" || productCategory === 'womens bottomwear';
          } else {
            // Exact match for any other category
            matchesCategory = productCategory === selectedCategory;
          }
          
          // 🔥 STRICT AND LOGIC: ALL three conditions must be true
          return matchesGender && matchesColor && matchesCategory;
        });
        
        // Transform filtered products to match expected format
        const products = filteredProducts.slice(0, 8).map((p: any) => ({
          product_id: p.product_id,
          product_name: p.title,
          price: p.price,
          product_image: p.image_url,
          color: p.color || selectedColor,
          gender: p.gender || selectedGender,
          product_category: p.category || option,
          stock: p.stock || 10,
          product_description: p.description || `Perfect ${selectedColor.toLowerCase()} ${option.toLowerCase()} for ${selectedGender.toLowerCase()}`
        }));
        
        if (products.length > 0) {
          setMessages((prev) => [...prev, { 
            text: `Perfect match! Here are ${selectedColor.toLowerCase()} ${option.toLowerCase()} for ${selectedGender.toLowerCase()} that will complement your ${flowData.selectedTone.toLowerCase()} skin tone:`, 
            isUser: false,
            timestamp: new Date().toISOString(),
            products: products
          }]);
        } else {
          // 🚫 NO FALLBACK - Show exact message as specified in global strict rule
          setMessages((prev) => [...prev, { 
            text: `Sorry, no products found for the selected color, gender, and category. Please try another option.`, 
            isUser: false,
            timestamp: new Date().toISOString(),
            products: []
          }]);
        }
        
        // Reset flow
        setCurrentFlow('none');
        setFlowData({});
      } catch (error) {
        console.error('Error fetching products:', error);
        setMessages((prev) => [...prev, { 
          text: "Sorry, I couldn't fetch products right now. Please try again later.", 
          isUser: false,
          timestamp: new Date().toISOString()
        }]);
      }
    }
  };

  const handleBodyFitFlow = async (option: string) => {
    const currentStep = flowData.step;
    
    if (currentStep === 'gender_selection') {
      // STEP 2: Ask Body Shape based on gender (NEW SPECIFICATIONS)
      const bodyShapes = option === 'Men' 
        ? ['Slim', 'Athletic', 'Muscular', 'Plus Size']
        : ['Pear Shape', 'Apple Shape', 'Hourglass Shape', 'Rectangle Shape'];
      
      setFlowData({ ...flowData, selectedGender: option, step: 'body_shape_selection' });
      
      setMessages((prev) => [...prev, { 
        text: `Great! Now please select your body shape:`, 
        isUser: false,
        timestamp: new Date().toISOString(),
        options: bodyShapes
      }]);
    } else if (currentStep === 'body_shape_selection') {
      // STEP 3: BODY SHAPE → CATEGORY ASSIGNMENT (STRICT)
      const { selectedGender } = flowData;
      let categories: string[] = [];
      
      if (selectedGender === 'Women') {
        // 👗 WOMEN – BODY SHAPE CATEGORY MAPPING
        if (option === 'Pear Shape') {
          categories = ['Western Wear', 'Dresses', 'Tops and Co-ord Sets'];
        } else if (option === 'Apple Shape') {
          categories = ['Dresses', 'Tops and Co-ord Sets', "Women's Bottomwear"];
        } else if (option === 'Hourglass Shape') {
          categories = ['Western Wear', 'Dresses', 'Ethnic Wear'];
        } else if (option === 'Rectangle Shape') {
          categories = ['Western Wear', 'Dresses', "Women's Bottomwear"];
        }
      } else if (selectedGender === 'Men') {
        // 👕 MEN – BODY SHAPE CATEGORY MAPPING
        if (option === 'Slim') {
          categories = ['Shirts', 'T-shirts'];
        } else if (option === 'Athletic') {
          categories = ['Shirts', 'T-shirts', 'Bottom Wear'];
        } else if (option === 'Muscular') {
          categories = ['T-shirts', 'Hoodies'];
        } else if (option === 'Plus Size') {
          categories = ['Shirts', 'Bottom Wear', 'Hoodies'];
        }
      }
      
      setFlowData({ ...flowData, selectedBodyShape: option, step: 'category_selection' });
      
      setMessages((prev) => [...prev, { 
        text: `Perfect! For your ${option.toLowerCase()} body shape, here are the recommended categories:`, 
        isUser: false,
        timestamp: new Date().toISOString(),
        options: categories
      }]);
    } else if (currentStep === 'category_selection') {
      // STEP 4: Color Selection
      const colors = ['Red', 'Pink', 'Black', 'White', 'Green', 'Grey', 'Blue'];
      
      setFlowData({ ...flowData, selectedCategory: option, step: 'color_selection' });
      
      setMessages((prev) => [...prev, { 
        text: `Great choice! Now please select ONE color:`, 
        isUser: false,
        timestamp: new Date().toISOString(),
        options: colors
      }]);
    } else if (currentStep === 'color_selection') {
      // STEP 5: PRODUCT FILTERING (BODY FIT FLOW) - STRICT
      const { selectedGender, selectedBodyShape, selectedCategory } = flowData;
      
      try {
        // Get all products first, then apply STRICT filtering
        const response = await fetch(`http://localhost:5000/api/products/search?query=clothing&category=fashion`);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        // 🔥 PRODUCT FILTERING (BODY FIT FLOW) - ALL CONDITIONS MUST MATCH
        const filteredProducts = (data.products || []).filter((p: any) => {
          // STRICT Gender matching (exact equality)
          const matchesGender = p.gender?.toLowerCase() === selectedGender.toLowerCase();
          
          // STRICT Color matching (exact equality)
          const matchesColor = p.color?.toLowerCase() === option.toLowerCase();
          
          // STRICT Category matching (exact equality)
          let matchesCategory = false;
          const productCategory = p.category?.toLowerCase() || '';
          const category = selectedCategory.toLowerCase();
          
          // Map frontend categories to exact database categories
          if (category === 'shirts') {
            matchesCategory = productCategory === 'shirts' || productCategory === 'shirt';
          } else if (category === 't-shirts') {
            matchesCategory = productCategory === 't-shirts' || productCategory === 't-shirt' || productCategory === 'tshirts' || productCategory === 'tshirt';
          } else if (category === 'bottom wear') {
            matchesCategory = productCategory === 'bottom wear' || productCategory === 'pants' || productCategory === 'jeans' || productCategory === 'trousers';
          } else if (category === 'hoodies') {
            matchesCategory = productCategory === 'hoodies' || productCategory === 'hoodie' || productCategory === 'sweatshirts' || productCategory === 'sweatshirt';
          } else if (category === 'western wear') {
            matchesCategory = productCategory === 'western wear' || productCategory === 'western';
          } else if (category === 'dresses') {
            matchesCategory = productCategory === 'dresses' || productCategory === 'dress';
          } else if (category === 'ethnic wear') {
            matchesCategory = productCategory === 'ethnic wear' || productCategory === 'ethnic' || productCategory === 'traditional';
          } else if (category === 'tops and co-ord sets') {
            matchesCategory = productCategory === 'tops and co-ord sets' || productCategory === 'tops' || productCategory === 'coord sets';
          } else if (category === "women's bottomwear") {
            matchesCategory = productCategory === "women's bottomwear" || productCategory === 'womens bottomwear';
          } else {
            // Exact match for any other category
            matchesCategory = productCategory === category;
          }
          
          // NOTE: Body shape matching would require body_shape field in database
          // For now, we'll filter by gender + category + color (3 conditions)
          // TODO: Add body_shape field to database for complete 4-condition filtering
          
          // 🔥 STRICT AND LOGIC: ALL conditions must be true
          return matchesGender && matchesColor && matchesCategory;
        });
        
        // Transform products to match expected format
        const products = filteredProducts.slice(0, 8).map((p: any) => ({
          product_id: p.product_id,
          product_name: p.title,
          price: p.price,
          product_image: p.image_url,
          color: p.color || option,
          gender: p.gender || selectedGender,
          product_category: p.category || selectedCategory,
          stock: p.stock || 10,
          product_description: p.description || `Perfect ${option.toLowerCase()} ${selectedCategory.toLowerCase()} for ${selectedBodyShape.toLowerCase()} ${selectedGender.toLowerCase()}`
        }));
        
        if (products.length > 0) {
          setMessages((prev) => [...prev, { 
            text: `Perfect match! Here are ${option.toLowerCase()} ${selectedCategory.toLowerCase()} for ${selectedGender.toLowerCase()} with ${selectedBodyShape.toLowerCase()} body shape:`, 
            isUser: false,
            timestamp: new Date().toISOString(),
            products: products
          }]);
        } else {
          // 🚫 NO FALLBACK - Show exact message as specified
          setMessages((prev) => [...prev, { 
            text: `Sorry, no products found matching your selected gender, category, color, and body shape. Please try another option.`, 
            isUser: false,
            timestamp: new Date().toISOString(),
            products: []
          }]);
        }
        
        // Reset flow
        setCurrentFlow('none');
        setFlowData({});
      } catch (error) {
        console.error('Error fetching products:', error);
        setMessages((prev) => [...prev, { 
          text: "Sorry, I couldn't fetch products right now. Please try again later.", 
          isUser: false,
          timestamp: new Date().toISOString()
        }]);
      }
    }
  };

  const handleCartRequest = async () => {
    // Check if user is logged in
    if (!userDataApi.auth.isLoggedIn()) {
      setMessages((prev) => [...prev, { 
        text: "🔐 Please log in to view your cart. I can only show cart items for authenticated users to protect your privacy.", 
        isUser: false,
        timestamp: new Date().toISOString(),
        type: 'auth_required'
      }]);
      return;
    }

    try {
      // Fetch user's cart with isolation
      const cartData = await userDataApi.cart.getCart();
      
      if (!cartData.items || cartData.items.length === 0) {
        setMessages((prev) => [...prev, { 
          text: "🛒 Your cart is empty! Start adding some amazing products to see them here.", 
          isUser: false,
          timestamp: new Date().toISOString(),
          type: 'cart_empty'
        }]);
        return;
      }

      // Transform cart items to Product format for display
      const cartProducts: Product[] = cartData.items.map((item: any) => ({
        product_id: item.product_id,
        product_name: item.product_name,
        price: item.product_price,
        product_image: item.product_image,
        color: 'Mixed',
        gender: 'Unisex',
        product_category: item.product_category || 'Fashion',
        stock: item.quantity,
        product_description: `Quantity: ${item.quantity} | Total: ₹${item.product_price * item.quantity}`
      }));

      setMessages((prev) => [...prev, { 
        text: `🛒 **Your Cart (${cartData.count} items)**\n\nTotal: ₹${cartData.total}\n\nClick any item to view details:`, 
        isUser: false,
        timestamp: new Date().toISOString(),
        products: cartProducts,
        type: 'cart_display'
      }]);

    } catch (error) {
      console.error('Error fetching cart:', error);
      setMessages((prev) => [...prev, { 
        text: "❌ Sorry, I couldn't fetch your cart right now. Please try again later.", 
        isUser: false,
        timestamp: new Date().toISOString(),
        type: 'error'
      }]);
    }
  };

  const handleWishlistRequest = async () => {
    // Check if user is logged in
    if (!userDataApi.auth.isLoggedIn()) {
      setMessages((prev) => [...prev, { 
        text: "🔐 Please log in to view your wishlist. I can only show wishlist items for authenticated users to protect your privacy.", 
        isUser: false,
        timestamp: new Date().toISOString(),
        type: 'auth_required'
      }]);
      return;
    }

    try {
      // Fetch user's wishlist with isolation
      const wishlistItems = await userDataApi.wishlist.getWishlist();
      
      if (!wishlistItems || wishlistItems.length === 0) {
        setMessages((prev) => [...prev, { 
          text: "❤️ Your wishlist is empty! Save some products you love to see them here.", 
          isUser: false,
          timestamp: new Date().toISOString(),
          type: 'wishlist_empty'
        }]);
        return;
      }

      // Transform wishlist items to Product format for display
      const wishlistProducts: Product[] = wishlistItems.map((item: any) => ({
        product_id: item.product_id,
        product_name: item.product_name,
        price: item.product_price,
        product_image: item.product_image,
        color: 'Mixed',
        gender: 'Unisex',
        product_category: item.product_category || 'Fashion',
        stock: 1,
        product_description: `Added to wishlist on ${new Date(item.added_at).toLocaleDateString()}`
      }));

      setMessages((prev) => [...prev, { 
        text: `❤️ **Your Wishlist (${wishlistItems.length} items)**\n\nYour saved favorites:\n\nClick any item to view details:`, 
        isUser: false,
        timestamp: new Date().toISOString(),
        products: wishlistProducts,
        type: 'wishlist_display'
      }]);

    } catch (error) {
      console.error('Error fetching wishlist:', error);
      setMessages((prev) => [...prev, { 
        text: "❌ Sorry, I couldn't fetch your wishlist right now. Please try again later.", 
        isUser: false,
        timestamp: new Date().toISOString(),
        type: 'error'
      }]);
    }
  };

  const handleOrdersRequest = async () => {
    console.log('🔍 handleOrdersRequest called');
    
    // Check if user is logged in
    if (!userDataApi.auth.isLoggedIn()) {
      console.log('❌ User not logged in');
      setMessages((prev) => [...prev, { 
        text: "🔐 Please log in to view your orders. I can only show orders for authenticated users to protect your privacy.", 
        isUser: false,
        timestamp: new Date().toISOString(),
        type: 'auth_required'
      }]);
      return;
    }

    console.log('✅ User is logged in, fetching orders...');

    try {
      // Fetch user's orders with isolation
      const orders = await userDataApi.orders.getOrders();
      console.log('📦 Orders fetched:', orders);
      
      if (!orders || orders.length === 0) {
        console.log('📦 No orders found');
        setMessages((prev) => [...prev, { 
          text: "📦 You haven't placed any orders yet! Start shopping to see your order history here.", 
          isUser: false,
          timestamp: new Date().toISOString(),
          type: 'orders_empty'
        }]);
        return;
      }

      console.log(`📦 Found ${orders.length} orders, processing...`);

      // Show recent orders (last 5)
      const recentOrders = orders.slice(-5);
      let orderText = `📦 **Your Recent Orders (${orders.length} total)**\n\n`;
      
      recentOrders.forEach((order: any, index: number) => {
        const orderDate = new Date(order.created_at).toLocaleDateString();
        const statusEmoji = getOrderStatusEmoji(order.order_status);
        
        orderText += `**Order #${order.order_id}**\n`;
        orderText += `${statusEmoji} Status: ${order.order_status || 'Processing'}\n`;
        orderText += `📅 Date: ${orderDate}\n`;
        orderText += `💰 Total: ₹${order.total_amount}\n`;
        
        // Parse order items if it's a JSON string
        let itemCount = 0;
        try {
          const items = typeof order.order_items === 'string' 
            ? JSON.parse(order.order_items) 
            : order.order_items;
          itemCount = Array.isArray(items) ? items.length : 0;
        } catch (error) {
          console.log('⚠️ Error parsing order items:', error);
          itemCount = 0;
        }
        
        orderText += `📦 ${itemCount} items\n\n`;
      });
      
      orderText += "💡 Go to 'My Orders' page for complete order management!";

      console.log('✅ Order text generated, adding to messages');

      setMessages((prev) => [...prev, { 
        text: orderText, 
        isUser: false,
        timestamp: new Date().toISOString(),
        type: 'orders_display'
      }]);

    } catch (error) {
      console.error('❌ Error fetching orders:', error);
      setMessages((prev) => [...prev, { 
        text: "❌ Sorry, I couldn't fetch your orders right now. Please try again later.", 
        isUser: false,
        timestamp: new Date().toISOString(),
        type: 'error'
      }]);
    }
  };

  const formatMessage = (text: string) => {
    // Convert markdown-style formatting to HTML
    let formatted = text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') // Bold
      .replace(/\n/g, '<br/>') // Line breaks
      .replace(/• /g, '• ') // Bullet points
      .replace(/(\d+)️⃣/g, '<span class="font-bold text-pink-600">$1️⃣</span>') // Numbered items
      .replace(/(💰|🎨|👤|📦|🏷️|🔍)/g, '<span class="inline-block mr-1">$1</span>'); // Emojis
    
    return formatted;
  };

  const handleProductClick = (product: Product) => {
    // Store chat state before navigation
    const chatState = {
      isOpen: true,
      messages,
      timestamp: new Date().toISOString(),
      fromChat: true
    };
    sessionStorage.setItem('fashionpulse_chat_return', JSON.stringify(chatState));
    
    // Navigate to product page (same tab, so back button works)
    window.location.href = `/products/${product.product_id}`;
  };

  const renderProductCard = (product: Product, index: number) => (
    <div 
      key={product.product_id} 
      className="bg-white rounded-xl border-2 border-pink-200 overflow-hidden shadow-lg hover:shadow-xl transition-all cursor-pointer transform hover:scale-102 hover:border-pink-400"
      onClick={() => handleProductClick(product)}
    >
      {/* Product Image */}
      <div className="aspect-square bg-gradient-to-br from-pink-50 to-purple-50 relative">
        <img
          src={product.product_image}
          alt={product.product_name}
          className="w-full h-full object-cover"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = `https://via.placeholder.com/300x300/ec4899/ffffff?text=${encodeURIComponent(product.product_name.substring(0, 15))}`;
          }}
        />
        <div className="absolute top-3 left-3 bg-pink-500 text-white text-sm px-3 py-1 rounded-full font-bold shadow-lg">
          #{index + 1}
        </div>
        <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm text-pink-600 text-xs px-2 py-1 rounded-full font-medium">
          🏷️ {product.product_category}
        </div>
      </div>
      
      {/* Product Details */}
      <div className="p-4">
        {/* Product Name */}
        <h4 className="font-bold text-base text-gray-900 mb-2 line-clamp-2 hover:text-pink-600 transition-colors leading-tight">
          {product.product_name}
        </h4>
        
        {/* Product Description */}
        <p className="text-sm text-gray-600 mb-3 line-clamp-2 leading-relaxed">
          {product.product_description || 'Premium quality clothing item crafted with attention to detail. Perfect for style-conscious individuals who value comfort and elegance.'}
        </p>
        
        {/* Color and Gender Row */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="flex items-center text-sm">
              <span 
                className="w-4 h-4 rounded-full border-2 border-gray-300 mr-2 shadow-sm" 
                style={{backgroundColor: 
                  product.color.toLowerCase() === 'red' ? '#ef4444' : 
                  product.color.toLowerCase() === 'blue' ? '#3b82f6' :
                  product.color.toLowerCase() === 'black' ? '#1f2937' :
                  product.color.toLowerCase() === 'white' ? '#f9fafb' :
                  product.color.toLowerCase() === 'green' ? '#10b981' :
                  product.color.toLowerCase() === 'yellow' ? '#f59e0b' :
                  product.color.toLowerCase() === 'pink' ? '#ec4899' :
                  product.color.toLowerCase() === 'purple' ? '#8b5cf6' :
                  product.color.toLowerCase() === 'brown' ? '#92400e' :
                  product.color.toLowerCase() === 'grey' || product.color.toLowerCase() === 'gray' ? '#6b7280' :
                  '#6b7280'
                }}
              ></span>
              <span className="text-gray-700 font-medium capitalize">{product.color}</span>
            </div>
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <span className="mr-1">
              {product.gender.toLowerCase() === 'men' ? '👨' : 
               product.gender.toLowerCase() === 'women' ? '👩' : 
               product.gender.toLowerCase().includes('kid') ? '👶' : '👤'}
            </span>
            <span className="font-medium capitalize">{product.gender}</span>
          </div>
        </div>
        
        {/* Price Row (removed stock) */}
        <div className="flex items-center justify-between mb-3">
          <div className="text-left">
            <span className="text-2xl font-bold text-pink-600">₹{product.price.toLocaleString()}</span>
          </div>
        </div>
        
        {/* Action Button */}
        <div className="mt-4 pt-3 border-t border-pink-100">
          <div className="flex items-center justify-center text-pink-600 font-semibold text-sm hover:text-pink-700 transition-colors">
            <span className="mr-2">👆</span>
            <span>Click to view full details</span>
            <span className="ml-2">🔗</span>
          </div>
        </div>
      </div>
    </div>
  );

  const renderMessage = (msg: Message, messageIndex: number) => {
    // Check if message has products to display
    const hasProducts = msg.products && msg.products.length > 0;
    
    // Handle order display type
    if (msg.type === 'order_display' && !msg.isUser && (msg as any).orders) {
      const orders = (msg as any).orders;
      
      return (
        <div className="space-y-3">
          <div 
            className="text-sm leading-relaxed"
            dangerouslySetInnerHTML={{ __html: formatMessage(msg.text) }}
          />
          
          {/* Orders Grid */}
          <div className="space-y-3 mt-4">
            {orders.map((order: any, index: number) => (
              <div 
                key={order.order_id} 
                className="bg-white rounded-xl border-2 border-pink-200 p-4 shadow-lg hover:shadow-xl transition-all"
              >
                {/* Order Header */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{getOrderStatusEmoji(order.order_status)}</span>
                    <div>
                      <h4 className="font-bold text-gray-900">Order #{order.order_id}</h4>
                      <p className="text-sm text-gray-600">
                        {new Date(order.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-pink-600">₹{order.total_amount}</p>
                    <p className="text-sm text-gray-600 capitalize">{order.order_status}</p>
                  </div>
                </div>
                
                {/* Order Items */}
                {order.order_items && (
                  <div className="mb-3">
                    {(() => {
                      // Parse order_items if it's a JSON string
                      let items;
                      try {
                        items = typeof order.order_items === 'string' 
                          ? JSON.parse(order.order_items) 
                          : order.order_items;
                      } catch (e) {
                        console.error('Error parsing order items:', e);
                        items = [];
                      }
                      
                      if (!Array.isArray(items) || items.length === 0) {
                        return null;
                      }
                      
                      return (
                        <>
                          <p className="text-sm text-gray-600 mb-2">Items ({items.length}):</p>
                          <div className="space-y-1">
                            {items.slice(0, 2).map((item: any, itemIndex: number) => (
                              <div key={itemIndex} className="flex items-center gap-2 text-sm">
                                <span className="w-2 h-2 bg-pink-400 rounded-full"></span>
                                <span>{item.product_name || item.name} (Qty: {item.quantity})</span>
                              </div>
                            ))}
                            {items.length > 2 && (
                              <div className="text-sm text-gray-500">
                                +{items.length - 2} more items
                              </div>
                            )}
                          </div>
                        </>
                      );
                    })()}
                  </div>
                )}
                
                {/* Cancel Order Button */}
                {order.order_status.toLowerCase() !== 'cancelled' && 
                 order.order_status.toLowerCase() !== 'delivered' && (
                  <div className="mt-3 pt-3 border-t border-pink-100">
                    <button
                      onClick={() => {
                        // Show confirmation dialog
                        const reason = prompt("Please provide a reason for cancellation (optional):");
                        if (reason !== null) { // User didn't cancel the prompt
                          handleOrderCancellation(order.order_id, reason || 'User requested cancellation');
                        }
                      }}
                      className="bg-red-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-600 transition-colors flex items-center gap-2"
                    >
                      <span>❌</span>
                      <span>Cancel Order</span>
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
          
          <div className={`text-xs opacity-70 text-gray-500`}>
            {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </div>
        </div>
      );
    }
    
    if (hasProducts && !msg.isUser) {
      const isExpanded = expandedMessages.has(messageIndex);
      const productsToShow = isExpanded ? msg.products! : msg.products!.slice(0, 2);
      const hasMoreProducts = msg.products!.length > 2;
      
      return (
        <div className="space-y-3">
          <div 
            className="text-sm leading-relaxed"
            dangerouslySetInnerHTML={{ __html: formatMessage(msg.text) }}
          />
          
          {/* Product Grid */}
          <div className="space-y-4 mt-4">
            {productsToShow.map((product, index) => renderProductCard(product, index))}
          </div>
          
          {/* View All / Show Less Button */}
          {hasMoreProducts && (
            <div className="text-center mt-4">
              {!isExpanded ? (
                <button
                  onClick={() => {
                    setExpandedMessages(prev => new Set([...prev, messageIndex]));
                  }}
                  className="bg-gradient-to-r from-pink-400 to-pink-500 text-white px-6 py-3 rounded-full hover:from-pink-500 hover:to-pink-600 transition-all shadow-lg hover:shadow-xl font-semibold text-sm flex items-center gap-2 mx-auto"
                >
                  <span>👀</span>
                  <span>View All {msg.products!.length} Products</span>
                  <span>📦</span>
                </button>
              ) : (
                <div className="space-y-3">
                  <div className="text-sm text-gray-600 text-center p-3 bg-green-50 rounded-lg border border-green-200">
                    <span className="font-medium">✅ Showing all {msg.products!.length} products</span>
                  </div>
                  <button
                    onClick={() => {
                      setExpandedMessages(prev => {
                        const newSet = new Set(prev);
                        newSet.delete(messageIndex);
                        return newSet;
                      });
                    }}
                    className="bg-gradient-to-r from-gray-400 to-gray-500 text-white px-6 py-2 rounded-full hover:from-gray-500 hover:to-gray-600 transition-all shadow-lg font-semibold text-sm flex items-center gap-2 mx-auto"
                  >
                    <span>🔼</span>
                    <span>Show Less</span>
                  </button>
                </div>
              )}
            </div>
          )}
          
          <div className={`text-xs opacity-70 text-gray-500`}>
            {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </div>
        </div>
      );
    }
    
    // Regular message formatting
    return (
      <div>
        <div 
          className="text-sm leading-relaxed"
          dangerouslySetInnerHTML={{ __html: formatMessage(msg.text) }}
        />
        
        {/* Option buttons */}
        {msg.options && msg.options.length > 0 && !msg.isUser && (
          <div className="mt-3 flex flex-wrap gap-2">
            {msg.options.map((option, index) => {
              // Check if this is a Face Tone selection (skin tone circles)
              const isFaceToneSelection = ['Fair', 'Wheatish', 'Dusky', 'Dark'].includes(option);
              
              // Check if this is a gender selection (add face emojis)
              const isGenderSelection = ['Men', 'Women'].includes(option);
              
              // Check if this is a color selection (any step that asks for color)
              const isColorSelection = ['Red', 'Pink', 'Black', 'White', 'Green', 'Grey', 'Blue'].includes(option);
              
              if (isFaceToneSelection) {
                // Skin tone colors for circles
                const skinToneColors: { [key: string]: string } = {
                  'Fair': '#fdbcb4',      // Light peachy pink
                  'Wheatish': '#deb887',  // Burlywood
                  'Dusky': '#cd853f',     // Peru brown
                  'Dark': '#8b4513'       // Saddle brown
                };
                
                return (
                  <button
                    key={index}
                    onClick={() => handleOptionClick(option)}
                    disabled={isLoading}
                    className="flex flex-col items-center gap-2 p-3 rounded-lg hover:bg-gray-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <div 
                      className="w-12 h-12 rounded-full border-3 border-gray-300 hover:border-pink-400 transition-colors shadow-md"
                      style={{ backgroundColor: skinToneColors[option] }}
                    ></div>
                    <span className="text-sm font-medium text-gray-700">{option}</span>
                  </button>
                );
              } else if (isGenderSelection) {
                // Gender selection with face emojis
                const genderEmojis: { [key: string]: string } = {
                  'Men': '👨',
                  'Women': '👩'
                };
                
                return (
                  <button
                    key={index}
                    onClick={() => handleOptionClick(option)}
                    disabled={isLoading}
                    className="bg-gradient-to-r from-pink-400 to-pink-500 text-white px-6 py-3 rounded-full hover:from-pink-500 hover:to-pink-600 transition-all shadow-md hover:shadow-lg font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    <span className="text-lg">{genderEmojis[option]}</span>
                    <span>{option}</span>
                  </button>
                );
              } else if (isColorSelection) {
                // Color selection buttons with actual colors
                const colorStyles: { [key: string]: { bg: string, text: string, border: string } } = {
                  'Red': { bg: '#ef4444', text: 'white', border: '#dc2626' },
                  'Pink': { bg: '#ec4899', text: 'white', border: '#db2777' },
                  'Black': { bg: '#1f2937', text: 'white', border: '#111827' },
                  'White': { bg: '#ffffff', text: '#1f2937', border: '#d1d5db' },
                  'Green': { bg: '#10b981', text: 'white', border: '#059669' },
                  'Grey': { bg: '#6b7280', text: 'white', border: '#4b5563' },
                  'Blue': { bg: '#3b82f6', text: 'white', border: '#1d4ed8' }
                };
                
                const colorStyle = colorStyles[option] || { bg: '#ec4899', text: 'white', border: '#db2777' };
                
                return (
                  <button
                    key={index}
                    onClick={() => handleOptionClick(option)}
                    disabled={isLoading}
                    className="px-6 py-3 rounded-full font-medium text-sm transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105"
                    style={{ 
                      backgroundColor: colorStyle.bg, 
                      color: colorStyle.text,
                      border: `2px solid ${colorStyle.border}`
                    }}
                  >
                    {option}
                  </button>
                );
              } else {
                // Default pink buttons for other options
                return (
                  <button
                    key={index}
                    onClick={() => handleOptionClick(option)}
                    disabled={isLoading}
                    className="bg-gradient-to-r from-pink-400 to-pink-500 text-white px-4 py-2 rounded-full hover:from-pink-500 hover:to-pink-600 transition-all shadow-md hover:shadow-lg font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {option}
                  </button>
                );
              }
            })}
          </div>
        )}
        
        <div className={`text-xs mt-1 opacity-70 ${msg.isUser ? 'text-white/70' : 'text-gray-500'}`}>
          {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>
    );
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {isOpen ? (
        <div className="bg-white rounded-2xl shadow-2xl w-96 sm:w-[500px] h-[650px] flex flex-col overflow-hidden border-2 border-pink-300">
          {/* Header */}
          <div className="bg-gradient-to-r from-pink-400 to-pink-500 p-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center">
                <svg className="w-9 h-9" viewBox="0 0 100 100" fill="none">
                  {/* Robot head */}
                  <rect x="25" y="35" width="50" height="45" rx="8" fill="#f5f1e8" stroke="#ec4899" strokeWidth="2"/>
                  {/* Antenna */}
                  <line x1="50" y1="35" x2="50" y2="25" stroke="#ec4899" strokeWidth="3" strokeLinecap="round"/>
                  <circle cx="50" cy="22" r="4" fill="#fcd705ff"/>
                  {/* Eyes */}
                  <circle cx="38" cy="50" r="5" fill="#ec4899"/>
                  <circle cx="62" cy="50" r="5" fill="#ec4899"/>
                  <circle cx="40" cy="48" r="2" fill="white"/>
                  <circle cx="64" cy="48" r="2" fill="white"/>
                  {/* Cute smile */}
                  <path d="M35 65 Q50 72 65 65" stroke="#ec4899" strokeWidth="3" strokeLinecap="round" fill="none"/>
                  {/* Rosy cheeks */}
                  <circle cx="28" cy="60" r="4" fill="#FFB6C1" opacity="0.6"/>
                  <circle cx="72" cy="60" r="4" fill="#FFB6C1" opacity="0.6"/>
                  {/* Ears */}
                  <rect x="18" y="45" width="6" height="15" rx="3" fill="#ec4899"/>
                  <rect x="76" y="45" width="6" height="15" rx="3" fill="#ec4899"/>
                </svg>
              </div>
              <div>
                <h3 className="text-white font-bold">Style Assistant</h3>
                <p className="text-white/80 text-xs">Connected to FashionPulse DB</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {/* Body Fit Icon */}
              <button
                onClick={() => {
                  resetChatToInitialState();
                  setTimeout(() => handleOptionClick("2️⃣ Body Fit"), 100);
                }}
                className="text-white/80 hover:text-white text-xl p-2 rounded-full hover:bg-white/10 transition-all transform hover:scale-110"
                title="Body Fit Flow"
              >
                👕
              </button>
              
              {/* Face Tone Icon */}
              <button
                onClick={() => {
                  resetChatToInitialState();
                  setTimeout(() => handleOptionClick("1️⃣ Face Tone"), 100);
                }}
                className="text-white/80 hover:text-white text-xl p-2 rounded-full hover:bg-white/10 transition-all transform hover:scale-110"
                title="Face Tone Flow"
              >
                🎨
              </button>
              
              {/* Three dots menu */}
              <div className="relative">
                <button
                  onClick={() => setShowDropdown(!showDropdown)}
                  className="text-white/80 hover:text-white text-xl p-1 rounded hover:bg-white/10 transition-colors"
                  title="Menu"
                >
                  ⋯
                </button>
                {showDropdown && (
                  <div className="absolute right-0 top-full mt-2 bg-white rounded-lg shadow-lg border border-gray-200 min-w-[150px] z-50">
                    <button
                      onClick={() => {
                        resetChatToInitialState();
                        setShowDropdown(false);
                      }}
                      className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-t-lg flex items-center gap-2"
                    >
                      💬 New Chat
                    </button>
                    <button
                      onClick={() => handleDropdownAction('history')}
                      className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                    >
                      📜 History
                    </button>
                    <button
                      onClick={() => handleDropdownAction('features')}
                      className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-b-lg flex items-center gap-2"
                    >
                      ⭐ Features
                    </button>
                  </div>
                )}
              </div>
              
              <button
                onClick={() => setIsOpen(false)}
                className="text-white hover:text-white/80 text-2xl font-bold"
              >
                ✕
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 p-4 space-y-3 overflow-y-auto max-h-[550px] bg-gray-50 scroll-smooth">
            {/* History Overlay - Full Screen */}
            {showHistory && (
              <div className="absolute inset-0 bg-white z-50 flex flex-col">
                {/* Header */}
                <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">📜</span>
                    <h3 className="text-xl font-bold text-white">Chat History</h3>
                  </div>
                  <button
                    onClick={() => setShowHistory(false)}
                    className="text-white hover:text-gray-200 text-2xl font-bold bg-white/20 rounded-full w-8 h-8 flex items-center justify-center"
                  >
                    ✕
                  </button>
                </div>
                
                {/* Content */}
                <div className="flex-1 p-4 overflow-y-auto">
                  {/* Read-Only Notice */}
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 mb-6 border-2 border-blue-200">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-2xl">👁️</span>
                      <h4 className="font-semibold text-blue-800">Read-Only History</h4>
                    </div>
                    <p className="text-sm text-blue-700">
                      📜 This is your saved chat history from previous sessions. These conversations are <strong>read-only</strong> and won't affect your current active chat.
                    </p>
                    <p className="text-xs text-blue-600 mt-2">
                      💡 Your current chat will be saved here when you log out.
                    </p>
                  </div>

                  {chatHistory.length === 0 ? (
                    <div className="text-center py-16">
                      <div className="text-6xl mb-4">📜</div>
                      <h4 className="text-xl font-semibold text-gray-700 mb-2">No Chat History Yet</h4>
                      <p className="text-gray-500 mb-6">Your chat conversations will appear here after you log out!</p>
                      <div className="bg-gradient-to-r from-pink-100 to-purple-100 rounded-lg p-4 max-w-md mx-auto">
                        <p className="text-sm text-gray-600">
                          💡 <strong>How it works:</strong> Chat normally while logged in. When you log out, your conversation is automatically saved to history.
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="bg-gradient-to-r from-pink-50 to-purple-50 rounded-lg p-4 mb-6">
                        <h4 className="font-semibold text-gray-800 mb-2">📊 Your Chat Statistics</h4>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div className="text-center">
                            <div className="text-2xl font-bold text-pink-600">{chatHistory.length}</div>
                            <div className="text-gray-600">Saved Sessions</div>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold text-purple-600">
                              {chatHistory.reduce((sum, chat) => sum + (chat.message_count || chat.messages?.length || 0), 0)}
                            </div>
                            <div className="text-gray-600">Total Messages</div>
                          </div>
                        </div>
                      </div>
                      
                      <h4 className="font-semibold text-gray-800 mb-3">📚 Previous Chat Sessions</h4>
                      <div className="grid gap-3">
                        {chatHistory.map((chat, index) => (
                          <div
                            key={`${chat.id}_${index}`}
                            className="bg-white rounded-xl p-4 border-2 border-gray-100 hover:border-blue-200 transition-all"
                          >
                            <div className="flex justify-between items-start mb-3">
                              <div className="flex items-center gap-2">
                                <span className="text-lg">💬</span>
                                <h5 className="font-semibold text-gray-800">
                                  {chat.title}
                                </h5>
                                <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                                  Read-Only
                                </span>
                              </div>
                              <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                                {new Date(chat.timestamp).toLocaleDateString()}
                              </span>
                            </div>
                            
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-4 text-sm text-gray-600">
                                <span className="flex items-center gap-1">
                                  <span>💭</span>
                                  {chat.message_count || chat.messages?.length || 0} messages
                                </span>
                                <span className="flex items-center gap-1">
                                  <span>⏰</span>
                                  {new Date(chat.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                              </div>
                              <div className="text-xs text-gray-500">
                                👁️ View Only
                              </div>
                            </div>
                            
                            {/* Show first few messages as preview */}
                            {chat.messages && chat.messages.length > 0 && (
                              <div className="mt-3 pt-3 border-t border-gray-100">
                                <div className="text-xs text-gray-600 mb-2">Preview:</div>
                                <div className="space-y-1">
                                  {chat.messages.slice(0, 2).map((msg: any, msgIndex: number) => (
                                    <div key={msgIndex} className="text-xs text-gray-500 truncate">
                                      <span className={msg.isUser ? "text-blue-600" : "text-gray-600"}>
                                        {msg.isUser ? "You" : "Assistant"}:
                                      </span> {msg.text.substring(0, 50)}...
                                    </div>
                                  ))}
                                  {chat.messages.length > 2 && (
                                    <div className="text-xs text-gray-400">
                                      +{chat.messages.length - 2} more messages
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Features Overlay - Full Screen */}
            {showFeatures && (
              <div className="absolute inset-0 bg-white z-50 flex flex-col">
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-500 to-purple-500 p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">⭐</span>
                    <h3 className="text-xl font-bold text-white">AI Features</h3>
                  </div>
                  <button
                    onClick={() => setShowFeatures(false)}
                    className="text-white hover:text-gray-200 text-2xl font-bold bg-white/20 rounded-full w-8 h-8 flex items-center justify-center"
                  >
                    ✕
                  </button>
                </div>
                
                {/* Content */}
                <div className="flex-1 p-4 overflow-y-auto">
                  <div className="max-w-2xl mx-auto">
                    {/* Introduction */}
                    <div className="text-center mb-8">
                      <div className="text-6xl mb-4">🤖</div>
                      <h4 className="text-2xl font-bold text-gray-800 mb-2">AI-Powered Fashion Assistant</h4>
                      <p className="text-gray-600">Discover personalized fashion recommendations with our intelligent features</p>
                    </div>

                    {/* Features Grid */}
                    <div className="space-y-6">
                      {/* Face Tone Feature */}
                      <div className="bg-gradient-to-br from-pink-50 to-rose-100 rounded-2xl p-6 border-2 border-pink-200 hover:border-pink-300 transition-colors">
                        <div className="flex items-start gap-4">
                          <div className="bg-pink-500 rounded-full p-3 text-white text-2xl">🎨</div>
                          <div className="flex-1">
                            <h4 className="text-xl font-bold text-pink-800 mb-2">Face Tone Analysis</h4>
                            <p className="text-pink-700 mb-4">
                              Get personalized color recommendations based on your unique skin tone. Our AI analyzes your complexion to suggest the most flattering colors.
                            </p>
                            
                            <div className="bg-white/60 rounded-lg p-4 mb-4">
                              <h5 className="font-semibold text-pink-800 mb-2">How it works:</h5>
                              <div className="space-y-2 text-sm text-pink-700">
                                <div className="flex items-center gap-2">
                                  <span className="bg-pink-200 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">1</span>
                                  Select your skin tone (Fair, Wheatish, Dusky, Dark)
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className="bg-pink-200 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">2</span>
                                  Choose from AI-suggested complementary colors
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className="bg-pink-200 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">3</span>
                                  Select your gender and preferred category
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className="bg-pink-200 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">4</span>
                                  Discover perfectly matched products
                                </div>
                              </div>
                            </div>
                            
                            <button
                              onClick={() => {
                                setShowFeatures(false);
                                handleOptionClick("🎨");
                              }}
                              className="bg-gradient-to-r from-pink-500 to-rose-500 text-white px-6 py-3 rounded-full font-semibold hover:from-pink-600 hover:to-rose-600 transition-all shadow-lg hover:shadow-xl"
                            >
                              ✨ Try Face Tone Analysis
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Body Fit Feature */}
                      <div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-2xl p-6 border-2 border-blue-200 hover:border-blue-300 transition-colors">
                        <div className="flex items-start gap-4">
                          <div className="bg-blue-500 rounded-full p-3 text-white text-2xl">👕</div>
                          <div className="flex-1">
                            <h4 className="text-xl font-bold text-blue-800 mb-2">Body Fit Recommendations</h4>
                            <p className="text-blue-700 mb-4">
                              Find clothes that perfectly complement your body shape. Our intelligent system recommends the most flattering styles for your unique physique.
                            </p>
                            
                            <div className="bg-white/60 rounded-lg p-4 mb-4">
                              <h5 className="font-semibold text-blue-800 mb-2">Smart recommendations for:</h5>
                              <div className="grid grid-cols-2 gap-3 text-sm text-blue-700">
                                <div>
                                  <strong>Women:</strong>
                                  <div className="text-xs mt-1 space-y-1">
                                    <div>⏳ Hourglass • 🍐 Pear</div>
                                    <div>🍎 Apple • 📐 Rectangle</div>
                                    <div>🔻 Inverted Triangle</div>
                                  </div>
                                </div>
                                <div>
                                  <strong>Men:</strong>
                                  <div className="text-xs mt-1 space-y-1">
                                    <div>📐 Rectangle • 🔺 Triangle</div>
                                    <div>🔻 Inverted Triangle</div>
                                    <div>⭕ Oval • 🏠 Trapezoid</div>
                                  </div>
                                </div>
                              </div>
                            </div>
                            
                            <div className="bg-white/60 rounded-lg p-4 mb-4">
                              <h5 className="font-semibold text-blue-800 mb-2">Process:</h5>
                              <div className="space-y-2 text-sm text-blue-700">
                                <div className="flex items-center gap-2">
                                  <span className="bg-blue-200 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">1</span>
                                  Select your gender and body shape
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className="bg-blue-200 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">2</span>
                                  Get intelligent category recommendations
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className="bg-blue-200 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">3</span>
                                  Choose your preferred color
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className="bg-blue-200 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">4</span>
                                  View perfectly fitted products
                                </div>
                              </div>
                            </div>
                            
                            <button
                              onClick={() => {
                                setShowFeatures(false);
                                handleOptionClick("👕");
                              }}
                              className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white px-6 py-3 rounded-full font-semibold hover:from-blue-600 hover:to-indigo-600 transition-all shadow-lg hover:shadow-xl"
                            >
                              👔 Try Body Fit Analysis
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Calendar Feature */}
                      <div className="bg-gradient-to-br from-green-50 to-emerald-100 rounded-2xl p-6 border-2 border-green-200 hover:border-green-300 transition-colors">
                        <div className="flex items-start gap-4">
                          <div className="bg-green-500 rounded-full p-3 text-white text-2xl">📅</div>
                          <div className="flex-1">
                            <h4 className="text-xl font-bold text-green-800 mb-2">Calendar Event Planner</h4>
                            <p className="text-green-700 mb-4">
                              Plan your outfits for upcoming events! Get personalized outfit recommendations based on your calendar events, weather, and occasion type.
                            </p>
                            
                            <div className="bg-white/60 rounded-lg p-4 mb-4">
                              <h5 className="font-semibold text-green-800 mb-2">Perfect for:</h5>
                              <div className="grid grid-cols-2 gap-3 text-sm text-green-700">
                                <div>
                                  <strong>Events:</strong>
                                  <div className="text-xs mt-1 space-y-1">
                                    <div>💼 Business Meetings</div>
                                    <div>🎉 Parties & Celebrations</div>
                                    <div>💒 Weddings & Ceremonies</div>
                                  </div>
                                </div>
                                <div>
                                  <strong>Occasions:</strong>
                                  <div className="text-xs mt-1 space-y-1">
                                    <div>🌅 Morning Events</div>
                                    <div>🌆 Evening Functions</div>
                                    <div>🎭 Special Occasions</div>
                                  </div>
                                </div>
                              </div>
                            </div>
                            
                            <div className="bg-white/60 rounded-lg p-4 mb-4">
                              <h5 className="font-semibold text-green-800 mb-2">How it works:</h5>
                              <div className="space-y-2 text-sm text-green-700">
                                <div className="flex items-center gap-2">
                                  <span className="bg-green-200 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">1</span>
                                  Select your gender and event date
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className="bg-green-200 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">2</span>
                                  Choose event type or add custom event
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className="bg-green-200 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">3</span>
                                  Get AI-powered outfit suggestions
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className="bg-green-200 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">4</span>
                                  Save events and get reminders
                                </div>
                              </div>
                            </div>
                            
                            <button
                              onClick={() => {
                                setShowFeatures(false);
                                handleOptionClick("📅");
                              }}
                              className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-6 py-3 rounded-full font-semibold hover:from-green-600 hover:to-emerald-600 transition-all shadow-lg hover:shadow-xl"
                            >
                              📅 Plan Your Outfits
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Additional Info */}
                      <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-4 border border-purple-200">
                        <div className="text-center">
                          <span className="text-2xl mb-2 block">💡</span>
                          <h5 className="font-semibold text-purple-800 mb-1">Pro Tip</h5>
                          <p className="text-sm text-purple-700">
                            Combine both features for the ultimate personalized shopping experience! Use Face Tone for colors and Body Fit for styles.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Regular Messages */}
            {!showHistory && !showFeatures && (
              <>
                {messages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`flex ${msg.isUser ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                        msg.isUser
                          ? "bg-gradient-to-r from-pink-400 to-pink-500 text-white rounded-br-none"
                          : "bg-white text-gray-800 shadow-md rounded-bl-none border border-gray-200"
                      }`}
                    >
                      {renderMessage(msg, idx)}
                    </div>
                  </div>
                ))}
                
                {/* Loading indicator */}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-white text-gray-800 shadow-md rounded-2xl rounded-bl-none px-4 py-3 border border-gray-200">
                      <div className="flex items-center gap-2">
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-pink-400 rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-pink-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                          <div className="w-2 h-2 bg-pink-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        </div>
                        <span className="text-xs text-gray-500">Searching products...</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Auto-scroll reference */}
                <div ref={messagesEndRef} />

                {/* Product opened notification */}
                {showNotification && (
                  <div className="flex justify-center mb-2">
                    <div className="bg-green-100 border border-green-300 text-green-800 px-4 py-2 rounded-lg shadow-sm animate-pulse">
                      <div className="flex items-center gap-2 text-sm">
                        <span>🔗</span>
                        <span>Product opened in new tab! Chat remains available.</span>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
          
          {/* Input */}
          <div className="p-4 bg-white border-t border-gray-200">
            <div className="flex gap-2">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                placeholder="Try: 'Show me red dresses under ₹2000'"
                disabled={isLoading}
                className="flex-1 px-4 py-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-pink-400 text-sm text-black placeholder-gray-500 bg-white disabled:opacity-50"
                style={{ color: '#000000' }}
              />
              
              {/* Calendar Icon */}
              <button
                onClick={handleCalendarClick}
                disabled={isLoading}
                className={`p-3 rounded-full transition-all shadow-lg hover:shadow-xl font-bold disabled:opacity-50 disabled:cursor-not-allowed ${
                  hasUpcomingEvents 
                    ? 'bg-gradient-to-r from-orange-400 to-red-500 text-white animate-pulse' 
                    : 'bg-gradient-to-r from-purple-400 to-purple-500 text-white hover:from-purple-500 hover:to-purple-600'
                }`}
                title={hasUpcomingEvents ? "You have upcoming events!" : "Add Calendar Event"}
              >
                📅
              </button>
              
              <button
                onClick={handleSend}
                disabled={isLoading || !inputText.trim()}
                className="bg-gradient-to-r from-pink-400 to-pink-500 text-white rounded-full px-5 py-3 hover:from-pink-500 hover:to-pink-600 transition-all shadow-lg hover:shadow-xl font-bold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? "..." : "➤"}
              </button>
            </div>
            
            {/* Calendar Popup */}
            {showCalendar && (
              <div className="absolute inset-0 bg-black/50 z-60 flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[80vh] overflow-y-auto">
                  {/* Header */}
                  <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-4 rounded-t-2xl">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {calendarStep !== 'gender' && (
                          <button
                            onClick={() => {
                              if (calendarStep === 'date') {
                                setCalendarStep('gender');
                              } else if (calendarStep === 'event') {
                                setCalendarStep('date');
                              }
                            }}
                            className="text-white hover:text-gray-200 text-xl font-bold bg-white/20 rounded-full w-8 h-8 flex items-center justify-center"
                            title="Back"
                          >
                            ←
                          </button>
                        )}
                        <span className="text-2xl">📅</span>
                        <h3 className="text-xl font-bold text-white">Add Event</h3>
                      </div>
                      <button
                        onClick={() => {
                          setShowCalendar(false);
                          setCalendarStep('gender');
                          setCalendarData({});
                        }}
                        className="text-white hover:text-gray-200 text-2xl font-bold bg-white/20 rounded-full w-8 h-8 flex items-center justify-center"
                      >
                        ✕
                      </button>
                    </div>
                    
                    {/* Progress Indicator */}
                    <div className="flex items-center justify-center mt-3 gap-2">
                      <div className={`w-3 h-3 rounded-full ${calendarStep === 'gender' ? 'bg-white' : 'bg-white/40'}`}></div>
                      <div className={`w-3 h-3 rounded-full ${calendarStep === 'date' ? 'bg-white' : 'bg-white/40'}`}></div>
                      <div className={`w-3 h-3 rounded-full ${calendarStep === 'event' ? 'bg-white' : 'bg-white/40'}`}></div>
                    </div>
                  </div>
                  
                  {/* Content */}
                  <div className="p-6">
                    {calendarStep === 'gender' && (
                      <div className="text-center">
                        <div className="text-4xl mb-4">👤</div>
                        <h4 className="text-xl font-bold text-gray-800 mb-2">Select Your Gender</h4>
                        <p className="text-gray-600 mb-6">This helps us suggest the perfect outfits for your event</p>
                        
                        <div className="space-y-3">
                          <button
                            onClick={() => handleCalendarStep('Women')}
                            className="w-full bg-gradient-to-r from-pink-100 to-rose-100 hover:from-pink-200 hover:to-rose-200 border-2 border-pink-300 rounded-xl p-4 transition-all"
                          >
                            <div className="flex items-center justify-center gap-3">
                              <span className="text-2xl">👩</span>
                              <span className="font-semibold text-pink-800">Women</span>
                            </div>
                          </button>
                          
                          <button
                            onClick={() => handleCalendarStep('Men')}
                            className="w-full bg-gradient-to-r from-blue-100 to-indigo-100 hover:from-blue-200 hover:to-indigo-200 border-2 border-blue-300 rounded-xl p-4 transition-all"
                          >
                            <div className="flex items-center justify-center gap-3">
                              <span className="text-2xl">👨</span>
                              <span className="font-semibold text-blue-800">Men</span>
                            </div>
                          </button>
                        </div>
                      </div>
                    )}
                    
                    {calendarStep === 'date' && (
                      <div className="text-center">
                        <div className="text-4xl mb-4">📅</div>
                        <h4 className="text-xl font-bold text-gray-800 mb-2">Select Event Date</h4>
                        <p className="text-gray-600 mb-6">Choose when your event is happening</p>
                        
                        {/* Custom Calendar Component */}
                        <div className="bg-gray-50 rounded-xl p-4 mb-4">
                          <CustomCalendar 
                            onDateSelect={handleDateSelection}
                            selectedDate={calendarData.date}
                          />
                        </div>
                        
                        {/* Selected Date Display */}
                        {calendarData.date && (
                          <div className="bg-white border-2 border-purple-300 rounded-xl p-4 mb-4">
                            <div className="text-sm text-gray-600 mb-1">Selected Date:</div>
                            <div className="text-lg font-bold text-black">
                              {new Date(calendarData.date).toLocaleDateString('en-US', {
                                weekday: 'long',
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                              })}
                            </div>
                            <button
                              onClick={() => setCalendarStep('event')}
                              className="mt-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-2 rounded-full font-semibold hover:from-purple-600 hover:to-pink-600 transition-all"
                            >
                              Next: Add Event →
                            </button>
                          </div>
                        )}
                        
                        {/* Quick Date Options */}
                        <div className="space-y-2">
                          <div className="grid grid-cols-2 gap-2">
                            {[
                              { label: 'Tomorrow', days: 1 },
                              { label: 'Next Week', days: 7 },
                              { label: 'Next Month', days: 30 },
                              { label: 'In 3 Months', days: 90 }
                            ].map((option) => {
                              const futureDate = new Date();
                              futureDate.setDate(futureDate.getDate() + option.days);
                              const dateString = futureDate.toISOString().split('T')[0];
                              
                              return (
                                <button
                                  key={option.label}
                                  onClick={() => {
                                    setCalendarData({ ...calendarData, date: dateString });
                                  }}
                                  className="bg-white border-2 border-purple-200 hover:border-purple-400 rounded-lg p-3 text-sm font-medium transition-all hover:bg-purple-50"
                                >
                                  {option.label}
                                  <div className="text-xs text-gray-500 mt-1">
                                    {futureDate.toLocaleDateString()}
                                  </div>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {calendarStep === 'event' && (
                      <div className="text-center">
                        <div className="text-4xl mb-4">🎉</div>
                        <h4 className="text-xl font-bold text-gray-800 mb-2">What's the Event?</h4>
                        <p className="text-gray-600 mb-6">Select or type your event type</p>
                        
                        {!showCustomEventInput ? (
                          <>
                            <div className="grid grid-cols-2 gap-3 mb-4">
                              {[
                                'Job Interview',
                                'Wedding',
                                'Birthday Party',
                                'Festival',
                                'Party',
                                'Travel',
                                'Conference',
                                'Seminar',
                                'Office Event',
                                'College',
                                'Meeting',
                                'Engagement',
                                'Reception',
                                'Night Out',
                                'Celebration',
                                'Daily Wear',
                                'Ugadi',
                                'Sankranthi',
                                'Diwali',
                                'Dasara',
                                'Bathukamma',
                                'Family Function',
                                'Temple',
                                'Photoshoot'
                              ].map((event) => (
                                <button
                                  key={event}
                                  onClick={() => handleCalendarStep(event)}
                                  className="bg-gradient-to-r from-purple-50 to-pink-50 hover:from-purple-100 hover:to-pink-100 border-2 border-purple-200 hover:border-purple-300 rounded-lg p-3 transition-all text-sm font-medium"
                                >
                                  {event}
                                </button>
                              ))}
                            </div>
                            
                            {/* Others Option */}
                            <button
                              onClick={() => setShowCustomEventInput(true)}
                              className="w-full bg-gradient-to-r from-gray-100 to-gray-200 hover:from-gray-200 hover:to-gray-300 border-2 border-gray-300 hover:border-gray-400 rounded-lg p-4 transition-all font-medium text-gray-700 mb-4"
                            >
                              Others (Custom Event)
                            </button>
                          </>
                        ) : (
                          <div className="space-y-4">
                            <div className="bg-gray-50 rounded-xl p-4">
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Enter your custom event:
                              </label>
                              <input
                                type="text"
                                placeholder="e.g., Date Night, Graduation, Conference..."
                                className="w-full p-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-purple-500 text-black font-medium"
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter' && (e.target as HTMLInputElement).value.trim()) {
                                    handleCustomEventSave((e.target as HTMLInputElement).value.trim());
                                  }
                                }}
                                autoFocus
                              />
                              <div className="text-xs text-gray-500 mt-2">
                                Press Enter to save or use the Save button below
                              </div>
                            </div>
                            
                            <div className="flex gap-3">
                              <button
                                onClick={() => {
                                  const input = document.querySelector('input[placeholder*="Date Night"]') as HTMLInputElement;
                                  if (input && input.value.trim()) {
                                    handleCustomEventSave(input.value.trim());
                                  }
                                }}
                                className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-3 rounded-full font-semibold hover:from-purple-600 hover:to-pink-600 transition-all"
                              >
                                Save Event
                              </button>
                              <button
                                onClick={() => setShowCustomEventInput(false)}
                                className="px-6 py-3 bg-gray-200 text-gray-700 rounded-full font-semibold hover:bg-gray-300 transition-all"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
            
            {/* Quick suggestions */}
            <div className="mt-3 flex flex-wrap gap-2">
              {/* Removed quick suggestions as requested */}
            </div>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setIsOpen(true)}
          className="bg-gradient-to-br from-pink-400 via-pink-450 to-pink-500 text-white rounded-full p-4 shadow-2xl hover:shadow-3xl transition-all transform hover:scale-110 active:scale-95 flex items-center gap-2 group relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer"></div>
          <svg className="w-12 h-12 relative z-10" viewBox="0 0 100 100" fill="none">
            {/* Robot head */}
            <rect x="25" y="35" width="50" height="45" rx="8" fill="white" stroke="white" strokeWidth="2"/>
            {/* Antenna */}
            <line x1="50" y1="35" x2="50" y2="25" stroke="white" strokeWidth="3" strokeLinecap="round"/>
            <circle cx="50" cy="22" r="4" fill="#FFD700"/>
            {/* Eyes */}
            <circle cx="38" cy="50" r="5" fill="#ec4899"/>
            <circle cx="62" cy="50" r="5" fill="#ec4899"/>
            <circle cx="40" cy="48" r="2" fill="white"/>
            <circle cx="64" cy="48" r="2" fill="white"/>
            {/* Cute smile */}
            <path d="M35 65 Q50 72 65 65" stroke="#ec4899" strokeWidth="3" strokeLinecap="round" fill="none"/>
            {/* Rosy cheeks */}
            <circle cx="28" cy="60" r="4" fill="#FFB6C1" opacity="0.6"/>
            <circle cx="72" cy="60" r="4" fill="#FFB6C1" opacity="0.6"/>
            {/* Ears/Side panels */}
            <rect x="18" y="45" width="6" height="15" rx="3" fill="white"/>
            <rect x="76" y="45" width="6" height="15" rx="3" fill="white"/>
            {/* Sparkles */}
            <path d="M15 25 L16 28 L19 29 L16 30 L15 33 L14 30 L11 29 L14 28 Z" fill="#FFD700"/>
            <path d="M82 28 L83 31 L86 32 L83 33 L82 36 L81 33 L78 32 L81 31 Z" fill="#FFD700"/>
          </svg>
          <span className="font-bold text-sm hidden group-hover:inline-block pr-2 relative z-10">Ask about products</span>
        </button>
      )}
    </div>
  );
}
