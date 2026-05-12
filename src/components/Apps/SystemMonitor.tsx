import React, { useState, useEffect } from "react";
import { Cpu, Zap, Database, Activity, Thermometer } from "lucide-react";
import { motion } from "motion/react";
import { cn } from "@/src/lib/utils";

export default function SystemMonitor() {
  const [stats, setStats] = useState({
    cpu: [20, 25, 22, 30, 28, 35, 32],
    memory: 42,
    disk: 65,
    temp: 38
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setStats(prev => ({
        ...prev,
        cpu: [...prev.cpu.slice(1), Math.floor(Math.random() * 40) + 10],
        memory: Math.min(100, Math.max(0, prev.memory + (Math.random() * 2 - 1))),
        temp: 35 + (Math.random() * 5)
      }));
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="h-full flex flex-col bg-[#050505] text-white p-8 overflow-y-auto scrollbar-hide">
      <div className="flex items-center justify-between mb-8">
         <div className="flex items-center gap-3">
            <div className="p-3 bg-teal-500/10 rounded-2xl text-teal-400">
               <Activity size={24} />
            </div>
            <h2 className="text-xl font-semibold tracking-tight">System Resources</h2>
         </div>
         <div className="text-[10px] text-teal-400 font-bold uppercase tracking-widest bg-teal-500/5 px-3 py-1 rounded-full border border-teal-500/20">
            Real-time Telemetry
         </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* CPU Usage Graph */}
        <div className="col-span-2 glass p-6 rounded-2xl space-y-4">
           <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-white/60">
                 <Cpu size={16} />
                 <span className="text-xs font-medium">CPU Load History</span>
              </div>
              <span className="text-xs font-bold text-teal-400">{stats.cpu[stats.cpu.length - 1]}%</span>
           </div>
           <div className="h-32 flex items-end gap-1 px-2">
              {stats.cpu.map((val, i) => (
                <motion.div 
                  key={i}
                  animate={{ height: `${val}%` }}
                  className="flex-1 bg-gradient-to-t from-teal-500/80 to-teal-400/20 rounded-t-sm"
                />
              ))}
           </div>
        </div>

        {/* Memory Usage */}
        <div className="glass p-6 rounded-2xl space-y-4">
           <div className="flex items-center justify-between text-white/60">
              <div className="flex items-center gap-2">
                 <Zap size={16} />
                 <span className="text-xs font-medium">Memory Usage</span>
              </div>
           </div>
           <div className="text-3xl font-light tracking-tighter">{stats.memory.toFixed(1)} GB</div>
           <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
              <motion.div 
                animate={{ width: `${(stats.memory / 16) * 100}%` }}
                className="h-full bg-blue-500"
              />
           </div>
        </div>

        {/* Disk Space */}
        <div className="glass p-6 rounded-2xl space-y-4">
           <div className="flex items-center justify-between text-white/60">
              <div className="flex items-center gap-2">
                 <Database size={16} />
                 <span className="text-xs font-medium">Disk Allocation</span>
              </div>
           </div>
           <div className="text-3xl font-light tracking-tighter">1.2 TB Free</div>
           <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
              <motion.div 
                animate={{ width: `${stats.disk}%` }}
                className="h-full bg-purple-500"
              />
           </div>
        </div>

        {/* Temperature */}
        <div className="col-span-2 glass p-4 px-6 rounded-2xl flex items-center justify-between">
           <div className="flex items-center gap-3">
              <Thermometer size={16} className="text-amber-500" />
              <span className="text-xs font-medium text-white/60">Core Temperature</span>
           </div>
           <span className="text-lg font-semibold tracking-tighter">{stats.temp.toFixed(1)}°C</span>
        </div>
      </div>
    </div>
  );
}
