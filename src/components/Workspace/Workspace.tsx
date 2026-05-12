import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Terminal as TerminalIcon, 
  Sparkles, 
  FileEdit, 
  Settings as SettingsIcon,
  Folder,
  Globe,
  PlaySquare,
  Calculator as CalcIcon,
  Cpu,
  Fingerprint,
  Power,
  RotateCcw,
  LogOut,
  AppWindow,
  Activity,
  User as UserIcon,
  Shield,
  LayoutDashboard,
  Users
} from "lucide-react";
import confetti from "canvas-confetti";

import OSWindow from "@/src/components/OS/OSWindow";
import Taskbar from "@/src/components/OS/Taskbar";
import Terminal from "@/src/components/Apps/Terminal";
import Editor from "@/src/components/Apps/Editor";
import NexusAI from "@/src/components/Apps/NexusAI";
import Settings from "@/src/components/Apps/Settings";
import FileExplorer from "@/src/components/Apps/FileExplorer";
import Browser from "@/src/components/Apps/Browser";
import MediaCenter from "@/src/components/Apps/MediaCenter";
import Calculator from "@/src/components/Apps/Calculator";
import SystemMonitor from "@/src/components/Apps/SystemMonitor";
import Camera from "@/src/components/Apps/Camera";
import TeamManager from "@/src/components/Apps/TeamManager";
import Dashboard from "@/src/components/Apps/Dashboard";
import { AppDefinition, WindowState, AppId } from "@/src/types/os";
import { cn } from "@/src/lib/utils";
import { useAuth } from "../../lib/AuthContext";
import { signOut } from "firebase/auth";
import { auth } from "../../lib/firebase";

interface WorkspaceProps {
  onBackToLanding: () => void;
}

export default function Workspace({ onBackToLanding }: WorkspaceProps) {
  const [showStartMenu, setShowStartMenu] = useState(false);
  const [wallpaper, setWallpaper] = useState("https://images.unsplash.com/photo-1497215728101-856f4ea42174?q=80&w=2670&auto=format&fit=crop");
  const [windows, setWindows] = useState<WindowState[]>([]);
  const [activeAppId, setActiveAppId] = useState<AppId | null>(null);
  const [maxZIndex, setMaxZIndex] = useState(10);
  const { user } = useAuth();

  // App Definitions
  const apps: AppDefinition[] = [
    { 
      id: "dashboard", 
      name: "Global Ops", 
      icon: <LayoutDashboard className="w-6 h-6 text-emerald-500" />, 
      component: () => <Dashboard onOpenApp={(id) => openApp(id as AppId)} />,
      defaultSize: { width: 900, height: 700 }
    },
    { 
      id: "nexus", 
      name: "Nexus AI", 
      icon: <Sparkles className="w-6 h-6 text-emerald-500" />, 
      component: () => <NexusAI />,
      defaultSize: { width: 450, height: 700 }
    },
    { 
      id: "browser", 
      name: "Vault Search", 
      icon: <Globe className="w-6 h-6 text-blue-500" />, 
      component: () => <Browser />,
      defaultSize: { width: 900, height: 650 }
    },
    { 
      id: "media", 
      name: "Asset Media", 
      icon: <PlaySquare className="w-6 h-6 text-purple-600" />, 
      component: () => <MediaCenter />,
      defaultSize: { width: 850, height: 600 }
    },
    { 
      id: "files", 
      name: "My Files", 
      icon: <Folder className="w-6 h-6 text-amber-500" />, 
      component: () => <FileExplorer />,
      defaultSize: { width: 800, height: 500 }
    },
    { 
      id: "teams", 
      name: "Team Intel", 
      icon: <Users className="w-6 h-6 text-indigo-500" />, 
      component: () => <TeamManager />,
      defaultSize: { width: 900, height: 650 }
    },
    { 
      id: "monitor", 
      name: "System Health", 
      icon: <Activity className="w-6 h-6 text-rose-500" />, 
      component: () => <SystemMonitor />,
      defaultSize: { width: 550, height: 650 }
    },
    { 
      id: "camera", 
      name: "Secure Cam", 
      icon: <img src="https://cdn-icons-png.flaticon.com/512/1042/1042339.png" className="w-10 h-10 object-contain p-1" alt="Camera" />, 
      component: () => <Camera />,
      defaultSize: { width: 800, height: 750 }
    },
    { 
      id: "calc", 
      name: "Security Calc", 
      icon: <CalcIcon className="w-6 h-6 text-slate-500" />, 
      component: () => <Calculator />,
      defaultSize: { width: 320, height: 500 }
    },
    { 
      id: "terminal", 
      name: "Secure Shell", 
      icon: <TerminalIcon className="w-6 h-6 text-emerald-600" />, 
      component: () => <Terminal />,
      defaultSize: { width: 800, height: 600 }
    },
    { 
      id: "editor", 
      name: "My Notes", 
      icon: <FileEdit className="w-6 h-6 text-pink-600" />, 
      component: () => <Editor />,
      defaultSize: { width: 900, height: 650 }
    },
    { 
      id: "settings", 
      name: "Preferences", 
      icon: <SettingsIcon className="w-6 h-6 text-slate-600" />, 
      component: () => <Settings onWallpaperChange={setWallpaper} currentWallpaper={wallpaper} />,
      defaultSize: { width: 950, height: 650 }
    }
  ];

  // Auto-open dashboard on mount if no windows open
  useEffect(() => {
    if (windows.length === 0) {
      openApp("dashboard");
    }
  }, []);

  const openApp = (id: AppId) => {
    setWindows(prev => {
      const existing = prev.find(w => w.id === id);
      if (existing) {
        if (existing.isMinimized) {
          return prev.map(w => w.id === id ? { ...w, isMinimized: false, zIndex: maxZIndex + 1 } : w);
        }
        return prev.map(w => w.id === id ? { ...w, zIndex: maxZIndex + 1 } : w);
      }
      return [...prev, { id, isOpen: true, isMinimized: false, isMaximized: false, zIndex: maxZIndex + 1 }];
    });
    setActiveAppId(id);
    setMaxZIndex(prev => prev + 1);
    setShowStartMenu(false);
  };

  const closeApp = (id: AppId) => {
    setWindows(prev => prev.filter(w => w.id !== id));
    if (activeAppId === id) setActiveAppId(null);
  };

  const toggleMinimize = (id: AppId) => {
    setWindows(prev => prev.map(w => w.id === id ? { ...w, isMinimized: !w.isMinimized } : w));
    if (activeAppId === id) setActiveAppId(null);
  };

  const toggleMaximize = (id: AppId) => {
    setWindows(prev => prev.map(w => w.id === id ? { ...w, isMaximized: !w.isMaximized } : w));
  };

  const focusApp = (id: AppId) => {
    setWindows(prev => prev.map(w => w.id === id ? { ...w, zIndex: maxZIndex + 1 } : w));
    setActiveAppId(id);
    setMaxZIndex(prev => prev + 1);
  };

  const handleLogout = async () => {
    await signOut(auth);
    onBackToLanding();
  };

  return (
    <div 
      className="fixed inset-0 bg-cover bg-center transition-all duration-1000 select-none overflow-hidden h-full w-full"
      style={{ backgroundImage: `url(${wallpaper})` }}
    >
      <div className="absolute inset-0 bg-slate-50/20" />

      {/* Desktop Content */}
      <div className="absolute inset-0 z-0" onClick={() => { setActiveAppId(null); setShowStartMenu(false); }} />

      <main className="relative z-10 w-full h-[calc(100vh-64px)] p-8 lg:p-12 overflow-hidden">
        <AnimatePresence>
          {windows.map((wState: WindowState) => {
            const app = apps.find(a => a.id === wState.id);
            if (!app) return null;
            return (
              <OSWindow
                key={wState.id}
                id={wState.id}
                title={app.name}
                isOpen={wState.isOpen}
                isMinimized={wState.isMinimized}
                isMaximized={wState.isMaximized}
                zIndex={wState.zIndex}
                onClose={() => closeApp(app.id)}
                onMinimize={() => toggleMinimize(app.id)}
                onMaximize={() => toggleMaximize(app.id)}
                onFocus={() => focusApp(app.id)}
                defaultSize={app.defaultSize}
              >
                {app.component()}
              </OSWindow>
            );
          })}
        </AnimatePresence>

        {/* Desktop Grid Layout */}
        <div className="grid grid-flow-col grid-rows-6 gap-x-12 gap-y-12 auto-cols-min">
          {apps.map(app => (
            <motion.button
              key={app.id}
              whileHover={{ y: -2, scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => openApp(app.id)}
              className="w-24 group relative flex flex-col items-center gap-3"
            >
              <div className="w-16 h-16 rounded-[1.5rem] bg-white/60 backdrop-blur-xl border border-slate-200 flex items-center justify-center text-slate-700 group-hover:bg-white group-hover:border-emerald-200 transition-all shadow-xl shadow-slate-500/10">
                {app.icon}
              </div>
              <span className="text-[10px] font-black text-slate-800 tracking-widest uppercase drop-shadow-sm">{app.name}</span>
            </motion.button>
          ))}
        </div>
      </main>

      {/* System Start Menu */}
      <AnimatePresence>
        {showStartMenu && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-24 left-6 w-80 bg-white/90 backdrop-blur-2xl border border-slate-200 rounded-3xl p-8 z-[60] shadow-2xl shadow-slate-500/20 origin-bottom-left"
          >
            <div className="flex items-center gap-5 mb-10">
              <div className="w-14 h-14 rounded-2xl overflow-hidden border border-slate-100 bg-emerald-50 flex items-center justify-center shadow-sm">
                {user?.photoURL ? (
                  <img src={user.photoURL} className="w-full h-full object-cover" alt="User" />
                ) : (
                  <UserIcon className="text-emerald-600" size={24} />
                )}
              </div>
              <div>
                <p className="text-base font-black text-slate-900 tracking-tight">{user?.displayName || 'Agent User'}</p>
                <p className="text-[10px] text-emerald-500 font-black uppercase tracking-widest">Quantum Verified</p>
              </div>
            </div>

            <div className="space-y-2">
               <button 
                 onClick={onBackToLanding}
                 className="w-full flex items-center justify-between px-5 py-4 rounded-2xl hover:bg-slate-50 text-slate-600 transition-all group"
               >
                  <span className="text-xs font-black uppercase tracking-widest">Back to Landing</span>
                  <Globe size={16} className="text-slate-300 group-hover:text-emerald-500 transition-colors" />
               </button>
               <button className="w-full flex items-center justify-between px-5 py-4 rounded-2xl hover:bg-slate-50 text-slate-600 transition-all group" title="Updates">
                  <span className="text-xs font-black uppercase tracking-widest">System Update</span>
                  <RotateCcw size={16} className="text-slate-300 group-hover:text-emerald-500 transition-colors" />
               </button>
               <div className="h-px bg-slate-100 my-4" />
               <button 
                 onClick={handleLogout}
                 className="w-full flex items-center justify-between px-5 py-4 rounded-2xl hover:bg-red-50 text-red-500 transition-all group"
               >
                  <span className="text-xs font-black uppercase tracking-widest">Terminate Session</span>
                  <Power size={16} />
               </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Taskbar Integration */}
      <div className="fixed bottom-6 left-6 z-[65]">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowStartMenu(!showStartMenu)}
          className={cn(
            "p-4 rounded-[1.25rem] bg-white/80 backdrop-blur-xl border border-slate-200 transition-all shadow-xl shadow-slate-500/10",
            showStartMenu ? "bg-emerald-500 border-emerald-400 ring-4 ring-emerald-500/20" : "hover:bg-white"
          )}
        >
          <Shield size={28} className={showStartMenu ? "text-white" : "text-emerald-600"} />
        </motion.button>
      </div>

      <Taskbar 
        apps={apps}
        windows={windows}
        activeAppId={activeAppId}
        onAppClick={(id) => {
          const w = windows.find(w => w.id === id);
          if (w?.isMinimized) {
            toggleMinimize(id);
            focusApp(id);
          } else if (w?.isOpen) {
            if (activeAppId === id) toggleMinimize(id);
            else focusApp(id);
          } else {
            openApp(id);
          }
        }}
      />
    </div>
  );
}
