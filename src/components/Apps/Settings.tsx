import React from "react";
import { Monitor, Shield, Zap, Globe, Palette } from "lucide-react";
import { cn } from "@/src/lib/utils";

interface SettingsProps {
  onWallpaperChange: (url: string) => void;
  currentWallpaper: string;
}

const wallpapers = [
  "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2664&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1635776062127-d379bfcba9f8?q=80&w=2832&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?q=80&w=2670&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?q=80&w=2670&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1614850523296-d8c1af93d400?q=80&w=2670&auto=format&fit=crop"
];

export default function Settings({ onWallpaperChange, currentWallpaper }: SettingsProps) {
  return (
    <div className="h-full flex flex-col bg-[#0f0f0f] text-white">
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <div className="w-48 border-r border-white/5 p-4 space-y-1">
          <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg bg-teal-500/10 text-teal-400 text-xs font-medium">
            <Palette size={14} /> Personalization
          </button>
          <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white/5 text-white/60 text-xs font-medium transition-colors">
            <Monitor size={14} /> System
          </button>
           <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white/5 text-white/60 text-xs font-medium transition-colors">
            <Shield size={14} /> Privacy
          </button>
           <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white/5 text-white/60 text-xs font-medium transition-colors">
            <Zap size={14} /> Performance
          </button>
           <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white/5 text-white/60 text-xs font-medium transition-colors">
            <Globe size={14} /> Connectivity
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 p-8 overflow-y-auto">
          <h2 className="text-xl font-semibold mb-6">Personalization</h2>
          
          <section className="space-y-4">
            <h3 className="text-xs font-semibold text-white/40 uppercase tracking-widest">Desktop Background</h3>
            <div className="grid grid-cols-2 gap-4">
              {wallpapers.map((url, i) => (
                <button 
                  key={i}
                  onPointerDown={() => onWallpaperChange(url)}
                  className={cn(
                    "aspect-[16/9] rounded-xl overflow-hidden border-2 transition-all relative group",
                    currentWallpaper === url ? "border-teal-500 ring-4 ring-teal-500/10" : "border-white/5 hover:border-white/20"
                  )}
                >
                  <img src={url} className="w-full h-full object-cover transition-transform group-hover:scale-105 duration-500" alt="Wallpaper option" />
                </button>
              ))}
            </div>
          </section>

          <section className="mt-12 space-y-4">
            <h3 className="text-xs font-semibold text-white/40 uppercase tracking-widest">System UI</h3>
            <div className="bg-white/5 rounded-xl p-4 border border-white/5 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Transparency Effects</p>
                <p className="text-[10px] text-white/40">Enable glassmorphism and background blur</p>
              </div>
              <div className="w-10 h-5 bg-teal-500 rounded-full relative">
                <div className="absolute right-0.5 top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full shadow-lg" />
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
