
import React, { useState, useRef, useEffect } from 'react';
import { UserProfile, ChatMessage } from '../types';
import { sendChatMessage } from '../services/geminiService';
import { MessageCircle, X, Send, MapPin, Globe, Loader2, Bot } from 'lucide-react';

interface Props {
  user: UserProfile | null;
}

export const Chatbot: React.FC<Props> = ({ user }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: '1', role: 'model', text: 'Olá! Sou o EcoGuardian IA. Posso ajudar com dicas de cultivo, identificar problemas ou encontrar lojas de jardinagem próximas. Como posso ajudar hoje?' }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isOpen]);

  const isSafeUrl = (url: string) => {
    try {
      const parsed = new URL(url);
      return ['http:', 'https:'].includes(parsed.protocol);
    } catch {
      return false;
    }
  };

  const handleSend = async () => {
    if (!input.trim() || isTyping) return;

    const userMsg: ChatMessage = { id: Date.now().toString(), role: 'user', text: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    // Filter only last few messages for context to save tokens, but here we pass mostly the new one + context in service
    const response = await sendChatMessage(messages.slice(-5), userMsg.text, user);

    const botMsg: ChatMessage = {
      id: (Date.now() + 1).toString(),
      role: 'model',
      text: response.text,
      groundingChunks: response.groundingChunks
    };

    setMessages(prev => [...prev, botMsg]);
    setIsTyping(false);
  };

  return (
    <>
      {/* Floating Button */}
      {!isOpen && (
        <button 
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 w-14 h-14 bg-emerald-600 text-white rounded-full shadow-xl flex items-center justify-center hover:bg-emerald-700 hover:scale-105 transition-all z-40"
        >
          <MessageCircle size={28} />
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 w-[90vw] max-w-[360px] h-[500px] bg-white rounded-2xl shadow-2xl border border-slate-200 flex flex-col z-50 animate-[slideUp_0.3s_ease-out] overflow-hidden">
          
          {/* Header */}
          <div className="bg-emerald-600 p-4 text-white flex justify-between items-center">
            <div className="flex items-center gap-2">
              <div className="bg-white/20 p-1.5 rounded-lg">
                <Bot size={20} />
              </div>
              <div>
                <h3 className="font-bold text-sm">EcoGuardian Chat</h3>
                <p className="text-[10px] text-emerald-100 flex items-center gap-1">
                   <span className="w-1.5 h-1.5 bg-emerald-300 rounded-full animate-pulse"></span> Online (Gemini Flash)
                </p>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="hover:bg-white/20 p-1 rounded transition-colors">
              <X size={20} />
            </button>
          </div>

          {/* Messages Area */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
            {messages.map((msg) => {
              const isUser = msg.role === 'user';
              return (
                <div key={msg.id} className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
                  <div className={`max-w-[85%] p-3 rounded-2xl text-sm leading-relaxed ${isUser ? 'bg-emerald-600 text-white rounded-tr-none' : 'bg-white border border-slate-200 text-slate-700 rounded-tl-none shadow-sm'}`}>
                    {msg.text}
                  </div>
                  
                  {/* Grounding Sources (Search & Maps) */}
                  {msg.groundingChunks && msg.groundingChunks.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-2 max-w-[90%]">
                      {msg.groundingChunks.map((chunk, idx) => {
                        if (chunk.web && isSafeUrl(chunk.web.uri)) {
                          return (
                            <a key={idx} href={chunk.web.uri} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-[10px] bg-blue-50 text-blue-600 px-2 py-1 rounded-md border border-blue-100 hover:bg-blue-100 transition-colors">
                              <Globe size={10} />
                              <span className="truncate max-w-[120px]">{chunk.web.title}</span>
                            </a>
                          );
                        }
                        if (chunk.maps && isSafeUrl(chunk.maps.uri)) {
                          return (
                            <a key={idx} href={chunk.maps.uri} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-[10px] bg-orange-50 text-orange-600 px-2 py-1 rounded-md border border-orange-100 hover:bg-orange-100 transition-colors">
                              <MapPin size={10} />
                              <span className="truncate max-w-[120px]">{chunk.maps.title}</span>
                            </a>
                          );
                        }
                        return null;
                      })}
                    </div>
                  )}
                </div>
              );
            })}
            {isTyping && (
              <div className="flex items-center gap-2 text-slate-400 text-xs ml-2">
                <Loader2 size={12} className="animate-spin" /> Digitando...
              </div>
            )}
          </div>

          {/* Input Area */}
          <div className="p-3 bg-white border-t border-slate-100">
            <div className="flex gap-2">
              <input 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Pergunte sobre suas plantas..."
                className="flex-1 bg-slate-100 border-none rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
              />
              <button 
                onClick={handleSend}
                disabled={!input.trim() || isTyping}
                className="bg-emerald-600 text-white p-2 rounded-xl hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Send size={20} />
              </button>
            </div>
          </div>

        </div>
      )}
      <style>{`
        @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </>
  );
};
