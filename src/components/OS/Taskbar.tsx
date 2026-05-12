import React from "react";
import { motion } from "motion/react";
import { cn } from "@/src/lib/utils";
import { AppDefinition, WindowState, AppId } from "@/src/types/os";

interface TaskbarProps {
  apps: AppDefinition[];
  windows: WindowState[];
  activeAppId: AppId | null;
  onAppClick: (id: AppId) => void;
}

export default function Taskbar({ apps, windows, activeAppId, onAppClick }: TaskbarProps) {
  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50">
      <div className="glass px-2 py-2 rounded-2xl flex items-end gap-2 shadow-2xl">
        {apps.map((app) => {
          const window = windows.find(w => w.id === app.id);
          const isOpen = window?.isOpen;
          const isActive = activeAppId === app.id;

          return (
            <motion.button
              key={app.id}
              whileHover={{ y: -4, scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => onAppClick(app.id)}
              className={cn(
                "relative p-3 rounded-xl transition-all duration-300 group",
                isActive ? "bg-white/10" : "hover:bg-white/5"
              )}
            >
              <div className="text-white/90 group-hover:text-white">
                {app.icon}
              </div>
              
              {/* Active Indicator */}
              {isOpen && (
                <div className={cn(
                  "absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-white transition-all",
                  isActive ? "w-4 opacity-100" : "w-1 opacity-50"
                )} />
              )}

              {/* Tooltip */}
              <div className="absolute -top-10 left-1/2 -translate-x-1/2 px-2 py-1 bg-black/80 backdrop-blur-md border border-white/10 rounded text-[10px] font-medium opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap">
                {app.name}
              </div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
