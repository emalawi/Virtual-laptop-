import React, { useRef, useState, useEffect } from "react";
import { motion, useDragControls, AnimatePresence } from "motion/react";
import { X, Minus, Square, Maximize2 } from "lucide-react";
import { cn } from "@/src/lib/utils";
import { AppId } from "@/src/types/os";

interface WindowProps {
  id: AppId;
  title: string;
  isOpen: boolean;
  isMinimized: boolean;
  isMaximized: boolean;
  zIndex: number;
  onClose: () => void;
  onMinimize: () => void;
  onMaximize: () => void;
  onFocus: () => void;
  children: React.ReactNode;
  defaultSize?: { width: number; height: number };
}

const OSWindow: React.FC<WindowProps> = ({
  id,
  title,
  isOpen,
  isMinimized,
  isMaximized,
  zIndex,
  onClose,
  onMinimize,
  onMaximize,
  onFocus,
  children,
  defaultSize = { width: 800, height: 600 },
}) => {
  const dragControls = useDragControls();
  const constraintsRef = useRef<HTMLDivElement>(null);
  const [isMounted, setIsMounted] = useState(false);
  const [initialPos, setInitialPos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    setIsMounted(true);
    // Center the window initially
    const x = (window.innerWidth - defaultSize.width) / 2;
    const y = (window.innerHeight - defaultSize.height) / 2 - 20;
    setInitialPos({ x, y });
  }, []);

  if (!isOpen || isMinimized || !isMounted) return null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, x: (window.innerWidth - defaultSize.width) / 2, y: (window.innerHeight - defaultSize.height) / 2 + 20 }}
      animate={{ 
        opacity: 1, 
        scale: 1, 
        x: isMaximized ? 0 : initialPos.x,
        y: isMaximized ? 0 : initialPos.y,
        zIndex,
        ...(isMaximized ? {
          width: "100%",
          height: "calc(100% - 64px)",
        } : {
          width: defaultSize.width,
          height: defaultSize.height,
        })
      }}
      exit={{ opacity: 0, scale: 0.95, y: 20 }}
      transition={{ type: "spring", damping: 25, stiffness: 300 }}
      drag={!isMaximized}
      dragControls={dragControls}
      dragListener={false}
      dragMomentum={false}
      onClick={onFocus}
      className={cn(
        "fixed bg-white/80 backdrop-blur-2xl border border-slate-200 rounded-2xl overflow-hidden shadow-2xl shadow-slate-500/10 flex flex-col transition-all duration-300",
        isMaximized ? "rounded-none" : "resize"
      )}
      style={{
        display: isMinimized ? "none" : "flex",
      }}
    >
      {/* Title Bar */}
      <div 
        className="h-12 flex items-center justify-between px-6 bg-slate-50/50 border-b border-slate-100 cursor-default select-none"
        onPointerDown={(e) => dragControls.start(e)}
      >
        <div className="flex items-center gap-3">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-sm shadow-emerald-500/20" />
          <span className="text-[10px] uppercase font-black text-slate-800 tracking-widest">{title}</span>
        </div>
        
        <div className="flex items-center gap-2">
          <button 
            onClick={(e) => { e.stopPropagation(); onMinimize(); }}
            className="p-2 hover:bg-slate-200/50 rounded-xl transition-all text-slate-400 hover:text-slate-600"
          >
            <Minus size={14} />
          </button>
          <button 
            onClick={(e) => { e.stopPropagation(); onMaximize(); }}
            className="p-2 hover:bg-slate-200/50 rounded-xl transition-all text-slate-400 hover:text-slate-600"
          >
           {isMaximized ? <Square size={12} /> : <Maximize2 size={12} />}
          </button>
          <button 
            onClick={(e) => { e.stopPropagation(); onClose(); }}
            className="p-2 hover:bg-red-50 text-slate-400 hover:text-red-500 rounded-xl transition-all"
          >
            <X size={14} />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto relative">
        {children}
      </div>
    </motion.div>
  );
};

export default OSWindow;
