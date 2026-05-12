import React, { useState } from "react";
import { Globe, ArrowLeft, ArrowRight, RotateCw, Search, Shield } from "lucide-react";
import { cn } from "@/src/lib/utils";

export default function Browser() {
  const [url, setUrl] = useState("https://en.m.wikipedia.org");
  const [history, setHistory] = useState(["https://en.m.wikipedia.org"]);
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleNavigate = (newUrl: string) => {
    const formattedUrl = newUrl.startsWith('http') ? newUrl : `https://${newUrl}`;
    setHistory([...history.slice(0, currentIndex + 1), formattedUrl]);
    setCurrentIndex(currentIndex + 1);
    setUrl(formattedUrl);
  };

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Toolbar */}
      <div className="h-12 flex items-center px-4 gap-4 bg-gray-100 border-b border-gray-300 shrink-0">
        <div className="flex items-center gap-2">
          <button 
            disabled={currentIndex === 0}
            onClick={() => {
              const prev = currentIndex - 1;
              setCurrentIndex(prev);
              setUrl(history[prev]);
            }}
            className="p-1.5 hover:bg-gray-200 rounded-md disabled:opacity-30 text-gray-600 transition-colors"
          >
            <ArrowLeft size={16} />
          </button>
          <button 
            disabled={currentIndex === history.length - 1}
            onClick={() => {
              const next = currentIndex + 1;
              setCurrentIndex(next);
              setUrl(history[next]);
            }}
            className="p-1.5 hover:bg-gray-200 rounded-md disabled:opacity-30 text-gray-600 transition-colors"
          >
            <ArrowRight size={16} />
          </button>
          <button 
            onClick={() => {
              const current = url;
              setUrl("");
              setTimeout(() => setUrl(current), 10);
            }}
            className="p-1.5 hover:bg-gray-200 rounded-md text-gray-600 transition-colors"
          >
            <RotateCw size={16} />
          </button>
        </div>

        <div className="flex-1 flex items-center gap-2 bg-white border border-gray-300 rounded-full px-4 py-1.5 focus-within:ring-2 ring-blue-500/20 transition-all">
          <Globe size={14} className="text-gray-400" />
          <input 
            type="text" 
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleNavigate(url)}
            className="flex-1 bg-transparent border-none outline-none text-sm text-gray-800"
          />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 bg-white overflow-hidden relative">
        {url && (
          <iframe 
            src={url}
            className="w-full h-full border-none"
            title="Browser Content"
            sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
          />
        )}
        
        <div className="absolute bottom-4 right-4 z-50">
          <div className="glass-dark px-4 py-2 rounded-2xl text-[10px] text-white/60 flex items-center gap-3 border border-white/10 shadow-2xl">
            <Shield size={12} className="text-teal-400" />
            <span>Compatibility Shield Active</span>
            <button 
              onClick={() => window.open(url, '_blank')}
              className="px-2 py-1 bg-white/5 hover:bg-white/10 rounded-md text-teal-400 font-bold uppercase transition-colors"
            >
              Open Externally
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
