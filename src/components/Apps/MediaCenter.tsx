import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Play, Image as ImageIcon, Film, Music, Heart, Share2, SkipBack, SkipForward, Volume2 } from "lucide-react";
import { cn } from "@/src/lib/utils";

const MEDIA_LIBRARY = [
  { id: 1, type: 'image', title: 'Mountain Peak', url: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=2670&auto=format&fit=crop', category: 'Nature' },
  { id: 2, type: 'image', title: 'Cyber City', url: 'https://images.unsplash.com/photo-1519608487953-e999c86e7455?q=80&w=2670&auto=format&fit=crop', category: 'Sci-Fi' },
  { id: 3, type: 'video', title: 'Cinematic Particles', url: 'https://assets.mixkit.co/videos/preview/mixkit-abstract-glowing-particles-in-slow-motion-1203-0.mp4', category: 'Abstract', thumbnail: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=2670&auto=format&fit=crop' },
  { id: 4, type: 'audio', title: 'Zenith Echoes', url: 'https://assets.mixkit.co/music/preview/mixkit-tech-house-vibes-130.mp3', category: 'Ambient', thumbnail: 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?q=80&w=2670&auto=format&fit=crop' },
  { id: 5, type: 'image', title: 'Ocean Waves', url: 'https://images.unsplash.com/photo-1505118380757-91f5f5632de0?q=80&w=2652&auto=format&fit=crop', category: 'Nature' },
];

export default function MediaCenter() {
  const [selectedMedia, setSelectedMedia] = useState(MEDIA_LIBRARY[0]);
  const [isPlaying, setIsPlaying] = useState(false);

  return (
    <div className="h-full flex flex-col bg-[#050505]">
      {/* Player Area */}
      <div className="flex-1 relative overflow-hidden group flex items-center justify-center p-12">
        {selectedMedia.type === 'image' ? (
          <img 
            src={selectedMedia.url} 
            className="w-full h-full object-contain transition-transform duration-700" 
            alt={selectedMedia.title}
          />
        ) : selectedMedia.type === 'video' ? (
          <video 
            src={selectedMedia.url} 
            className="w-full h-full object-contain" 
            controls 
            autoPlay 
            muted 
            loop 
          />
        ) : (
          <div className="flex flex-col items-center gap-8 w-full max-w-md">
             <motion.div 
               animate={{ 
                 scale: isPlaying ? [1, 1.05, 1] : 1,
                 rotate: isPlaying ? 360 : 0
               }}
               transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
               className="w-64 h-64 rounded-full overflow-hidden border-8 border-white/5 shadow-2xl relative"
             >
                <img src={selectedMedia.thumbnail} className="w-full h-full object-cover" alt="Album Art" />
                <div className="absolute inset-0 flex items-center justify-center">
                   <div className="w-12 h-12 bg-black rounded-full border-4 border-white/20" />
                </div>
             </motion.div>
             
             <div className="text-center">
                <h2 className="text-2xl font-bold tracking-tight text-white">{selectedMedia.title}</h2>
                <p className="text-teal-400 text-xs font-bold uppercase tracking-widest mt-1">{selectedMedia.category}</p>
             </div>

             <div className="w-full flex flex-col gap-4">
                <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                   <motion.div 
                     animate={{ width: isPlaying ? "100%" : "30%" }}
                     transition={{ duration: 180, ease: "linear" }}
                     className="h-full bg-teal-500" 
                   />
                </div>
                <div className="flex items-center justify-center gap-8 text-white/40">
                   <SkipBack size={24} className="hover:text-white cursor-pointer transition-colors" />
                   <button 
                     onClick={() => setIsPlaying(!isPlaying)}
                     className="w-16 h-16 rounded-full bg-white text-black flex items-center justify-center hover:scale-110 transition-transform"
                   >
                     {isPlaying ? <div className="w-5 h-5 flex justify-between"><div className="w-1.5 h-full bg-black rounded-full"/><div className="w-1.5 h-full bg-black rounded-full"/></div> : <Play fill="currentColor" className="ml-1" size={24} />}
                   </button>
                   <SkipForward size={24} className="hover:text-white cursor-pointer transition-colors" />
                </div>
             </div>
          </div>
        )}
        
        <div className="absolute top-6 right-6 flex items-center gap-3">
           <div className="p-2 glass-dark rounded-full text-white/40">
              <Volume2 size={16} />
           </div>
           <button className="p-2 glass-dark rounded-full text-white/40 hover:text-white transition-colors">
              <Heart size={16} />
           </button>
        </div>
      </div>

      {/* Library Sidebar/Bottom Bar */}
      <div className="h-44 border-t border-white/5 bg-black/40 backdrop-blur-md overflow-x-auto shrink-0 flex items-center gap-4 px-6 scrollbar-hide py-4">
        {MEDIA_LIBRARY.map((item) => (
          <button
            key={item.id}
            onClick={() => { setSelectedMedia(item); setIsPlaying(item.type === 'audio'); }}
            className={cn(
              "relative min-w-[200px] h-32 rounded-xl overflow-hidden border-2 transition-all p-1 group",
              selectedMedia.id === item.id ? "border-teal-500 ring-4 ring-teal-500/10" : "border-transparent"
            )}
          >
            <img 
              src={item.type === 'video' || item.type === 'audio' ? item.thumbnail : item.url} 
              className="w-full h-full object-cover rounded-lg group-hover:scale-105 transition-transform duration-500" 
              alt={item.title}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-3 pointer-events-none">
              <div className="flex items-center gap-2">
                {item.type === 'video' ? <Film size={12} className="text-teal-400" /> : item.type === 'audio' ? <Music size={12} className="text-teal-400" /> : <ImageIcon size={12} className="text-white/60" />}
                <span className="text-[10px] font-semibold text-white truncate">{item.title}</span>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
