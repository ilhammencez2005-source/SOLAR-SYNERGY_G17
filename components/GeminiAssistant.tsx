import React, { useState, useEffect, useRef } from 'react';
import { Sparkles, Send } from 'lucide-react';
import { Message, ContextData } from '../types';
import { generateGeminiResponse } from '../services/geminiService';

interface GeminiAssistantProps {
  onClose: () => void;
  contextData: ContextData;
}

export const GeminiAssistant: React.FC<GeminiAssistantProps> = ({ onClose, contextData }) => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    { role: 'model', text: 'Hi! I\'m your Solar Synergy guide. Ask me about charging stations, sustainability tips, or how to save money on your rides! ✨' }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: Message = { role: 'user', text: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    const aiText = await generateGeminiResponse(userMessage.text, contextData);
    
    setMessages(prev => [...prev, { role: 'model', text: aiText }]);
    setIsLoading(false);
  };

  return (
    <div className="flex flex-col h-full bg-gray-50 animate-slide-up max-w-4xl mx-auto w-full border-x border-gray-200 shadow-sm bg-white">
      <div className="bg-gradient-to-r from-emerald-600 to-teal-600 p-4 text-white flex items-center justify-between shadow-md shrink-0">
        <div className="flex items-center gap-3">
          <div className="bg-white/20 p-2.5 rounded-full backdrop-blur-sm">
            <Sparkles size={22} className="text-yellow-300" />
          </div>
          <div>
            <h2 className="font-bold text-lg leading-tight">Eco-Companion</h2>
            <p className="text-xs text-emerald-100 font-medium opacity-90">Powered by Gemini AI</p>
          </div>
        </div>
        <button 
          onClick={onClose} 
          className="bg-white/10 hover:bg-white/20 text-white px-3 py-1 rounded-lg text-sm font-medium transition-colors backdrop-blur-sm"
        >
          Close
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 bg-gray-50/50">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] sm:max-w-[70%] p-4 rounded-2xl shadow-sm text-sm sm:text-base leading-relaxed ${
              msg.role === 'user' 
                ? 'bg-emerald-600 text-white rounded-br-none shadow-emerald-100' 
                : 'bg-white text-gray-800 border border-gray-100 rounded-bl-none'
            }`}>
              {msg.text}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white p-4 rounded-2xl rounded-bl-none border border-gray-100 shadow-sm flex gap-1.5 items-center">
              <span className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce"></span>
              <span className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce delay-75"></span>
              <span className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce delay-150"></span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 bg-white border-t border-gray-100 shrink-0">
        <div className="flex gap-3 max-w-3xl mx-auto">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask about stations, savings..."
            className="flex-1 bg-gray-100 border-0 rounded-xl px-5 py-3.5 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none focus:bg-white transition-colors"
          />
          <button 
            onClick={handleSend}
            disabled={isLoading || !input.trim()}
            className="bg-emerald-600 text-white p-3.5 rounded-xl disabled:opacity-50 hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-100 active:scale-95"
          >
            <Send size={22} />
          </button>
        </div>
      </div>
    </div>
  );
};