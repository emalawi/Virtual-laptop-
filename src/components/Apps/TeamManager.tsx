import React, { useState, useEffect } from "react";
import { Users, UserPlus, Trash2, Mail, Shield, Loader2, Search } from "lucide-react";
import { collection, query, onSnapshot, addDoc, deleteDoc, doc, serverTimestamp, orderBy } from "firebase/firestore";
import { db } from "@/src/lib/firebase";
import { useAuth } from "@/src/lib/AuthContext";
import { cn } from "@/src/lib/utils";

interface TeamMember {
  id?: string;
  name: string;
  email: string;
  role: string;
  ownerId: string;
  createdAt: any;
}

export default function TeamManager() {
  const { user } = useAuth();
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newRole, setNewRole] = useState("Member");

  useEffect(() => {
    if (!user) return;

    const teamPath = `users/${user.uid}/teamMembers`;
    const q = query(collection(db, teamPath), orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedMembers: TeamMember[] = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as TeamMember));
      setMembers(fetchedMembers);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const addMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newName || !newEmail) return;

    try {
      const teamPath = `users/${user.uid}/teamMembers`;
      await addDoc(collection(db, teamPath), {
        name: newName,
        email: newEmail,
        role: newRole,
        ownerId: user.uid,
        createdAt: serverTimestamp()
      });
      setNewName("");
      setNewEmail("");
      setIsAdding(false);
    } catch (err) {
      console.error("Error adding member:", err);
    }
  };

  const removeMember = async (id: string) => {
    if (!user) return;
    try {
      const memberRef = doc(db, `users/${user.uid}/teamMembers`, id);
      await deleteDoc(memberRef);
    } catch (err) {
      console.error("Error removing member:", err);
    }
  };

  return (
    <div className="h-full flex flex-col bg-white text-slate-900">
      {/* Header */}
      <div className="px-8 py-6 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black flex items-center gap-3">
            <Users size={24} className="text-emerald-500" />
            Team Management
          </h2>
          <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Manage your secure workspace collaborators</p>
        </div>
        <button 
          onClick={() => setIsAdding(!isAdding)}
          className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all active:scale-95 shadow-lg shadow-emerald-500/10"
        >
          <UserPlus size={16} />
          {isAdding ? "Cancel" : "Add Member"}
        </button>
      </div>

      <div className="flex-1 overflow-hidden flex flex-col p-8">
        {isAdding && (
          <form onSubmit={addMember} className="bg-slate-50 border border-slate-100 rounded-[2rem] p-8 mb-8 animate-in fade-in slide-in-from-top-4 duration-300">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Full Name</label>
                <input 
                  type="text"
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full bg-white border border-slate-100 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-emerald-500 transition-all font-medium"
                  placeholder="Collaborator Name"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Email Address</label>
                <input 
                  type="email"
                  required
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  className="w-full bg-white border border-slate-100 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-emerald-500 transition-all font-medium"
                  placeholder="collab@company.com"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Role</label>
                <select 
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value)}
                  className="w-full bg-white border border-slate-100 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-emerald-500 transition-all appearance-none font-medium"
                >
                  <option value="Admin">Admin</option>
                  <option value="Member">Member</option>
                  <option value="Viewer">Viewer</option>
                </select>
              </div>
            </div>
            <div className="mt-8 flex justify-end">
              <button 
                type="submit"
                className="bg-slate-900 hover:bg-black text-white px-8 py-3 rounded-xl text-sm font-black transition-all active:scale-95 shadow-xl shadow-black/10"
              >
                Create Member
              </button>
            </div>
          </form>
        )}

        <div className="flex-1 bg-white border border-slate-100 rounded-[2.5rem] overflow-hidden flex flex-col shadow-sm">
          <div className="px-8 py-6 border-b border-slate-100 bg-slate-50/20 flex items-center justify-between">
            <div className="relative flex-1 max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" size={14} />
              <input 
                type="text" 
                placeholder="Search members..."
                className="w-full bg-white border border-slate-100 rounded-xl py-2.5 pl-10 pr-4 text-xs focus:outline-none focus:border-emerald-500/50 transition-all font-medium"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center h-full">
                <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
              </div>
            ) : members.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-slate-300 gap-6">
                <div className="w-20 h-20 rounded-full bg-slate-50 flex items-center justify-center">
                    <Users size={32} className="opacity-20" />
                </div>
                <p className="text-sm font-black uppercase tracking-widest">No team members added yet</p>
              </div>
            ) : (
              <table className="w-full border-collapse">
                <thead>
                  <tr className="text-left border-b border-slate-100 bg-slate-50/30">
                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Member</th>
                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Role</th>
                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Email</th>
                    <th className="px-8 py-5 text-right"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {members.map(member => (
                    <tr key={member.id} className="group hover:bg-slate-50 transition-colors">
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 font-black border border-emerald-100 shadow-sm shadow-emerald-500/5">
                            {member.name[0]}
                          </div>
                          <span className="text-sm font-black text-slate-900">{member.name}</span>
                        </div>
                      </td>
                      <td className="px-8 py-5">
                        <span className={cn(
                          "px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest",
                          member.role === 'Admin' ? "bg-purple-50 text-purple-600" : "bg-blue-50 text-blue-600"
                        )}>
                          {member.role}
                        </span>
                      </td>
                      <td className="px-8 py-5 text-sm text-slate-400 font-mono font-medium">
                        {member.email}
                      </td>
                      <td className="px-8 py-5 text-right">
                        <button 
                          onClick={() => { if (member.id) removeMember(member.id); }}
                          className="p-3 text-slate-200 hover:text-red-500 hover:bg-red-50 rounded-2xl transition-all opacity-0 group-hover:opacity-100"
                        >
                          <Trash2 size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
