import React, { useState, useRef, useEffect } from "react";
import { GoogleGenAI } from "@google/genai";
import { Send, Bot, User, Sparkles, Loader2 } from "lucide-react";
import { cn } from "@/src/lib/utils";
import { playSound } from "@/src/lib/sounds";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

interface Message {
  role: "user" | "bot";
  content: string;
}

export default function NexusAI() {
  const [messages, setMessages] = useState<Message[]>([
    { role: "bot", content: "Hello! I am Nexus, your ZenithOS assistant. How can I help you today?" }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input;
    setInput("");
    playSound("launch");
    setMessages(prev => [...prev, { role: "user", content: userMessage }]);
    setIsLoading(true);

    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: userMessage,
        config: {
          systemInstruction: "You are Nexus, the AI assistant of ZenithOS. You are helpful, concise, and have a high-tech vibe. Your personality is polite yet professional."
        }
      });

      const reply = response.text || "I'm sorry, I couldn't process that.";
      setMessages(prev => [...prev, { role: "bot", content: reply }]);
      playSound("notify");
    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, { role: "bot", content: "I encountered an error connecting to my neural core." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#0a0a0a]">
      {/* Header */}
      <div className="flex items-center gap-3 px-6 py-4 border-b border-white/5 bg-white/5">
        <div className="w-8 h-8 rounded-lg bg-teal-500/20 flex items-center justify-center border border-teal-500/30">
          <Sparkles className="text-teal-400" size={16} />
        </div>
        <div>
          <h2 className="text-sm font-semibold text-white">Nexus Intelligence</h2>
          <span className="text-[10px] text-teal-400 font-medium tracking-widest uppercase">System Core Activated</span>
        </div>
      </div>

      {/* Messages */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-hide"
      >
        {messages.map((msg, i) => (
          <div 
            key={i} 
            className={cn(
              "flex gap-4 max-w-[85%]",
              msg.role === "user" ? "ml-auto flex-row-reverse" : ""
            )}
          >
            <div className={cn(
              "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0",
              msg.role === "bot" ? "bg-teal-500/10 text-teal-400 border border-teal-500/20" : "bg-purple-500/10 text-purple-400 border border-purple-500/20"
            )}>
              {msg.role === "bot" ? <Bot size={16} /> : <User size={16} />}
            </div>
            <div className={cn(
              "px-4 py-3 rounded-2xl text-sm leading-relaxed",
              msg.role === "bot" ? "bg-white/5 text-white/90 border border-white/5" : "bg-teal-500/20 text-teal-50 border border-teal-500/30"
            )}>
              {msg.content}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex gap-4 max-w-[85%]">
             <div className="w-8 h-8 rounded-full bg-teal-500/10 text-teal-400 border border-teal-500/20 flex items-center justify-center">
              <Loader2 className="animate-spin" size={16} />
            </div>
            <div className="px-4 py-3 rounded-2xl bg-white/5 text-white/50 text-sm border border-white/5">
              Nexus is thinking...
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="p-4 border-t border-white/5">
        <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-4 py-2 focus-within:border-teal-500/50 transition-colors">
          <input 
            type="text" 
            placeholder="Ask Nexus anything..."
            className="flex-1 bg-transparent border-none outline-none text-white text-sm py-2"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
          />
          <button 
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="p-2 bg-teal-500/20 text-teal-400 rounded-lg hover:bg-teal-500/30 disabled:opacity-50 transition-all"
          >
            <Send size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
