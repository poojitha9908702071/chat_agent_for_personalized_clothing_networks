"use client";

import { useState } from "react";

export default function AIChatBox() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{ text: string; isUser: boolean }[]>([
    { text: "Hi! How can I help you today?", isUser: false },
  ]);
  const [inputText, setInputText] = useState("");

  const handleSend = () => {
    if (!inputText.trim()) return;

    // Add user message
    setMessages((prev) => [...prev, { text: inputText, isUser: true }]);

    // Simulate AI response
    setTimeout(() => {
      const responses = [
        "I can help you find the perfect product!",
        "Would you like to see our top deals?",
        "Let me know if you need any assistance with your order.",
        "I'm here to help! What are you looking for?",
      ];
      const randomResponse = responses[Math.floor(Math.random() * responses.length)];
      setMessages((prev) => [...prev, { text: randomResponse, isUser: false }]);
    }, 1000);

    setInputText("");
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {isOpen ? (
        <div className="bg-white rounded-2xl shadow-2xl w-80 sm:w-96 flex flex-col overflow-hidden border-2 border-pink-300">
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
                <p className="text-white/80 text-xs">Ready to help!</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white hover:text-white/80 text-2xl font-bold"
            >
              ✕
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 p-4 space-y-3 overflow-y-auto max-h-96 bg-gray-50">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${msg.isUser ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[75%] rounded-2xl px-4 py-2 ${
                    msg.isUser
                      ? "bg-gradient-to-r from-pink-400 to-pink-500 text-white rounded-br-none"
                      : "bg-white text-gray-800 shadow-md rounded-bl-none"
                  }`}
                >
                  <p className="text-sm">{msg.text}</p>
                </div>
              </div>
            ))}
          </div>
          

          {/* Input */}
          <div className="p-4 bg-white border-t border-gray-200">
            <div className="flex gap-2">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                placeholder="Type your message..."
                className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-pink-400 text-sm"
              />
              <button
                onClick={handleSend}
                className="bg-gradient-to-r from-pink-400 to-pink-500 text-white rounded-full px-5 py-2 hover:from-pink-500 hover:to-pink-600 transition-all shadow-lg hover:shadow-xl font-bold"
              >
                ➤
              </button>
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
          <span className="font-bold text-sm hidden group-hover:inline-block pr-2 relative z-10">Chat with AI</span>
        </button>
      )}
    </div>
  );
}
