import React, { useState, useEffect } from "react";
import { LayoutDashboard, FileText, StickyNote, Users, ArrowUpRight, Loader2, Sparkles } from "lucide-react";
import { collection, query, onSnapshot, limit, orderBy } from "firebase/firestore";
import { db } from "@/src/lib/firebase";
import { useAuth } from "@/src/lib/AuthContext";
import { cn } from "@/src/lib/utils";
import { motion } from "motion/react";

export default function Dashboard({ onOpenApp }: { onOpenApp: (id: string) => void }) {
  const { user } = useAuth();
  const [stats, setStats] = useState({ files: 0, notes: 0, members: 0 });
  const [recentNotes, setRecentNotes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const base = `users/${user.uid}`;
    
    const unsubFiles = onSnapshot(collection(db, `${base}/files`), snap => {
      setStats(prev => ({ ...prev, files: snap.size }));
    });

    const unsubNotes = onSnapshot(query(collection(db, `${base}/notes`), orderBy('updatedAt', 'desc'), limit(3)), snap => {
      setStats(prev => ({ ...prev, notes: snap.size }));
      setRecentNotes(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });

    const unsubTeams = onSnapshot(collection(db, `${base}/teamMembers`), snap => {
      setStats(prev => ({ ...prev, members: snap.size }));
      setLoading(false);
    });

    return () => {
      unsubFiles();
      unsubNotes();
      unsubTeams();
    };
  }, [user]);

  return (
    <div className="h-full flex flex-col bg-[#fdfdfd] text-slate-900 p-10 overflow-y-auto custom-scrollbar">
      {/* Welcome Header */}
      <div className="mb-14 flex items-center justify-between">
        <div>
          <h1 className="text-5xl font-black mb-3 flex items-center gap-5 tracking-tight text-slate-950">
            Welcome back, {user?.displayName?.split(' ')[0] || 'Agent'} 
            <motion.span 
              animate={{ rotate: [0, 20, 0] }} 
              transition={{ repeat: Infinity, duration: 2 }}
              className="inline-block origin-bottom-right"
            >
              👋
            </motion.span>
          </h1>
          <p className="text-slate-400 text-[11px] font-black uppercase tracking-[0.2em]">Quantum Security Status: <span className="text-emerald-500">Active</span></p>
        </div>
        <div className="flex -space-x-4">
            {[1,2,3].map(i => (
                <div key={i} className="w-14 h-14 rounded-full border-4 border-[#fdfdfd] bg-slate-50 flex items-center justify-center shadow-sm">
                    <Users size={18} className="text-slate-300" />
                </div>
            ))}
            <div className="w-14 h-14 rounded-full border-4 border-[#fdfdfd] bg-emerald-50 flex items-center justify-center text-emerald-600 font-black text-xs shadow-sm shadow-emerald-500/10">
                +{stats.members}
            </div>
        </div>
      </div>

      {/* Grid Sections */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-14">
        {/* Section: My Files */}
        <button 
          onClick={() => onOpenApp('files')}
          className="group relative bg-white border border-slate-100 rounded-[3rem] p-10 text-left hover:bg-slate-50/50 hover:border-emerald-200 transition-all overflow-hidden shadow-sm hover:shadow-xl hover:shadow-emerald-500/5"
        >
          <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
            <FileText size={100} />
          </div>
          <div className="w-14 h-14 rounded-[1.25rem] bg-blue-50 flex items-center justify-center text-blue-500 mb-8 border border-blue-100 shadow-sm shadow-blue-500/10">
            <FileText size={24} />
          </div>
          <h3 className="text-2xl font-black mb-3 text-slate-900">Secure Vault</h3>
          <p className="text-sm text-slate-400 font-medium leading-relaxed mb-8">Manage your encrypted documents and sensitive media assets.</p>
          <div className="flex items-center justify-between pt-8 border-t border-slate-50">
            <span className="text-3xl font-black text-slate-900">{stats.files}</span>
            <div className="flex items-center gap-3 px-4 py-2 rounded-xl bg-slate-50 text-slate-400 group-hover:bg-blue-600 group-hover:text-white transition-all text-[10px] font-black uppercase tracking-widest pointer-events-none">
                Open Files <ArrowUpRight size={14} />
            </div>
          </div>
        </button>

        {/* Section: My Notes */}
        <button 
          onClick={() => onOpenApp('editor')}
          className="group relative bg-white border border-slate-100 rounded-[3rem] p-10 text-left hover:bg-slate-50/50 hover:border-emerald-200 transition-all overflow-hidden shadow-sm hover:shadow-xl hover:shadow-emerald-500/5"
        >
           <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
            <StickyNote size={100} />
          </div>
          <div className="w-14 h-14 rounded-[1.25rem] bg-amber-50 flex items-center justify-center text-amber-500 mb-8 border border-amber-100 shadow-sm shadow-amber-500/10">
            <StickyNote size={24} />
          </div>
          <h3 className="text-2xl font-black mb-3 text-slate-900">Intel Logs</h3>
          <p className="text-sm text-slate-400 font-medium leading-relaxed mb-8">Capture briefings, session logs, and operation summaries.</p>
          <div className="flex items-center justify-between pt-8 border-t border-slate-50">
            <span className="text-3xl font-black text-slate-900">{stats.notes}</span>
            <div className="flex items-center gap-3 px-4 py-2 rounded-xl bg-slate-50 text-slate-400 group-hover:bg-amber-500 group-hover:text-white transition-all text-[10px] font-black uppercase tracking-widest pointer-events-none">
                Open Logs <ArrowUpRight size={14} />
            </div>
          </div>
        </button>

        {/* Section: Team Members */}
        <button 
          onClick={() => onOpenApp('teams')}
          className="group relative bg-white border border-slate-100 rounded-[3rem] p-10 text-left hover:bg-slate-50/50 hover:border-emerald-200 transition-all overflow-hidden shadow-sm hover:shadow-xl hover:shadow-emerald-500/5"
        >
           <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
            <Users size={100} />
          </div>
          <div className="w-14 h-14 rounded-[1.25rem] bg-purple-50 flex items-center justify-center text-purple-600 mb-8 border border-purple-100 shadow-sm shadow-purple-500/10">
            <Users size={24} />
          </div>
          <h3 className="text-2xl font-black mb-3 text-slate-900">Collaborators</h3>
          <p className="text-sm text-slate-400 font-medium leading-relaxed mb-8">Administrate access rights for your trusted workspace agents.</p>
          <div className="flex items-center justify-between pt-8 border-t border-slate-50">
            <span className="text-3xl font-black text-slate-900">{stats.members}</span>
            <div className="flex items-center gap-3 px-4 py-2 rounded-xl bg-slate-50 text-slate-400 group-hover:bg-purple-600 group-hover:text-white transition-all text-[10px] font-black uppercase tracking-widest pointer-events-none">
                Manage Team <ArrowUpRight size={14} />
            </div>
          </div>
        </button>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        <div className="bg-white rounded-[3rem] p-10 border border-slate-100 shadow-sm">
            <div className="flex items-center justify-between mb-10">
               <h4 className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">Incoming Intelligence</h4>
               <Sparkles size={18} className="text-emerald-500" />
            </div>
            <div className="space-y-4">
                {recentNotes.length === 0 ? (
                    <div className="px-10 py-16 rounded-[2rem] border-2 border-dashed border-slate-50 flex flex-col items-center justify-center text-slate-300 gap-4">
                        <FileText size={40} className="opacity-10" />
                        <p className="text-[10px] font-black uppercase tracking-widest">Awaiting first briefing...</p>
                    </div>
                ) : recentNotes.map(note => (
                    <button 
                        key={note.id} 
                        onClick={() => onOpenApp('editor')}
                        className="w-full flex items-center justify-between p-5 rounded-2xl bg-white border border-slate-100 hover:border-emerald-200 transition-all group/item"
                    >
                        <div className="flex items-center gap-5">
                            <div className="w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover/item:bg-emerald-50 group-hover/item:text-emerald-500 transition-colors">
                                <FileText size={18} />
                            </div>
                            <div className="text-left">
                                <h5 className="text-sm font-black text-slate-900">{note.title}</h5>
                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Status: Encrypted • 1m ago</p>
                            </div>
                        </div>
                        <ArrowUpRight size={18} className="text-slate-200 group-hover/item:text-emerald-500 transition-colors" />
                    </button>
                ))}
            </div>
        </div>

        <div className="bg-slate-900 rounded-[3rem] p-12 relative overflow-hidden group shadow-2xl shadow-black/20">
            <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/20 blur-[100px] -mr-32 -mt-32 transition-transform duration-1000 group-hover:scale-150" />
            <h4 className="text-3xl font-black mb-6 relative z-10 text-white tracking-tight">Security Audit Complete</h4>
            <p className="text-slate-400 text-base leading-relaxed mb-10 relative z-10 font-medium">Your nexus workspace is now running on light-speed infrastructure. All data packets are fragmented across 12 distributed nodes for maximum persistence.</p>
            <button className="bg-emerald-500 text-white px-8 py-4 rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] relative z-10 hover:bg-emerald-400 transition-all shadow-xl shadow-emerald-500/20 active:scale-95">
                Verify Integrity
            </button>
        </div>
      </div>
    </div>
  );
}
