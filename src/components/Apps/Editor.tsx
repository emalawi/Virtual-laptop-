import React, { useState, useEffect } from "react";
import { Loader2, Save, Trash2, Plus, StickyNote } from "lucide-react";
import { collection, query, onSnapshot, addDoc, updateDoc, deleteDoc, doc, serverTimestamp, orderBy } from "firebase/firestore";
import { db } from "@/src/lib/firebase";
import { useAuth } from "@/src/lib/AuthContext";
import { cn } from "@/src/lib/utils";

interface Note {
  id?: string;
  title: string;
  content: string;
  ownerId: string;
  createdAt: any;
  updatedAt: any;
}

export default function Editor() {
  const { user } = useAuth();
  const [notes, setNotes] = useState<Note[]>([]);
  const [activeNote, setActiveNote] = useState<Note | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) return;

    const notesPath = `users/${user.uid}/notes`;
    const q = query(collection(db, notesPath), orderBy('updatedAt', 'desc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedNotes: Note[] = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Note));
      setNotes(fetchedNotes);
      setLoading(false);

      // If we have an activeNote that was just created locally, find its real version with the real ID
      if (activeNote && !activeNote.id) {
         // This shouldn't happen with the new addDoc logic below, but good to have
      }
    });

    return () => unsubscribe();
  }, [user, activeNote]);

  // Local state for debounced updates
  const [localContent, setLocalContent] = useState("");
  const [localTitle, setLocalTitle] = useState("");

  useEffect(() => {
    if (activeNote) {
      setLocalContent(activeNote.content);
      setLocalTitle(activeNote.title);
    }
  }, [activeNote?.id]);

  const createNote = async () => {
    if (!user) return;
    const title = `New Note ${notes.length + 1}`;
    const notesPath = `users/${user.uid}/notes`;
    
    try {
      const docRef = await addDoc(collection(db, notesPath), {
        title,
        content: "",
        ownerId: user.uid,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      
      const newNote = {
        id: docRef.id,
        title,
        content: "",
        ownerId: user.uid,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      setActiveNote(newNote);
    } catch (err) {
      console.error("Error creating note:", err);
      if (err instanceof Error && err.message.includes("permissions")) {
        alert("Security rule error: Please check if email is verified or rules are correct.");
      }
    }
  };

  const updateNote = async (updates: Partial<Note>) => {
    if (!user || !activeNote?.id) return;
    setSaving(true);
    
    try {
      const noteRef = doc(db, `users/${user.uid}/notes`, activeNote.id);
      await updateDoc(noteRef, {
        ...updates,
        updatedAt: serverTimestamp()
      });
    } catch (err) {
      console.error("Error updating note:", err);
    } finally {
      setSaving(false);
    }
  };

  // Debounce logic
  useEffect(() => {
    if (!activeNote || !user) return;
    
    const timeoutId = setTimeout(() => {
      if (localContent !== activeNote.content || localTitle !== activeNote.title) {
        updateNote({ content: localContent, title: localTitle });
      }
    }, 1000);

    return () => clearTimeout(timeoutId);
  }, [localContent, localTitle]);

  const deleteNote = async (id: string) => {
    if (!user) return;
    try {
      const noteRef = doc(db, `users/${user.uid}/notes`, id);
      await deleteDoc(noteRef);
      if (activeNote?.id === id) setActiveNote(null);
    } catch (err) {
      console.error("Error deleting note:", err);
    }
  };

  return (
    <div className="h-full flex bg-white text-slate-900">
      {/* Sidebar */}
      <div className="w-72 border-r border-slate-100 flex flex-col bg-slate-50/30">
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
          <span className="text-[10px] uppercase tracking-widest text-slate-400 font-black">Intel Log</span>
          <button 
            onClick={createNote}
            className="p-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl transition-all shadow-lg shadow-emerald-600/10 active:scale-95"
          >
            <Plus size={16} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {loading ? (
            <div className="flex justify-center p-8">
              <Loader2 className="w-6 h-6 animate-spin text-emerald-500" />
            </div>
          ) : notes.length === 0 ? (
            <div className="text-center p-12 text-slate-300">
                <StickyNote size={32} className="mx-auto mb-4 opacity-20" />
                <p className="text-xs font-bold uppercase tracking-widest leading-loose">No entries recorded</p>
            </div>
          ) : (
            notes.map(note => (
              <button
                key={note.id}
                onClick={() => setActiveNote(note)}
                className={cn(
                  "w-full text-left p-4 rounded-2xl transition-all group relative border",
                  activeNote?.id === note.id 
                    ? "bg-white border-slate-200 shadow-sm ring-1 ring-emerald-500/10" 
                    : "hover:bg-white/60 border-transparent text-slate-500"
                )}
              >
                <div className="flex items-center gap-3 mb-1">
                   {activeNote?.id === note.id && <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />}
                   <h4 className={cn("text-sm font-black truncate pr-6", activeNote?.id === note.id ? "text-slate-900" : "text-slate-600")}>
                    {note.title || 'Untitled Entry'}
                   </h4>
                </div>
                <p className="text-[10px] text-slate-400 truncate font-medium">{note.content || 'Decrypting content...'}</p>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    if (note.id) deleteNote(note.id);
                  }}
                  className="absolute right-3 top-4 opacity-0 group-hover:opacity-100 text-slate-300 hover:text-red-500 transition-all p-1"
                >
                  <Trash2 size={14} />
                </button>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Editor Content */}
      <div className="flex-1 flex flex-col min-w-0 bg-white">
        {activeNote ? (
          <>
            <div className="flex items-center justify-between px-10 py-6 border-b border-slate-100">
              <div className="flex items-center gap-6 flex-1">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
                    <StickyNote size={20} />
                </div>
                <input 
                  type="text"
                  className="bg-transparent border-none outline-none font-black text-2xl flex-1 text-slate-900 placeholder:text-slate-200"
                  value={localTitle}
                  onChange={(e) => setLocalTitle(e.target.value)}
                  placeholder="Intel Heading"
                />
              </div>
              <div className="flex items-center gap-6 ml-6">
                {saving && (
                    <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-emerald-500">
                        <Loader2 size={12} className="animate-spin" />
                        Syncing
                    </div>
                )}
                <Save size={20} className="text-slate-200" />
              </div>
            </div>
            <textarea 
              className="flex-1 w-full bg-transparent p-12 outline-none border-none text-slate-700 font-mono text-sm resize-none scrollbar-hide selection:bg-emerald-100 leading-[1.8] placeholder:text-slate-200"
              value={localContent}
              onChange={(e) => setLocalContent(e.target.value)}
              spellCheck={false}
              placeholder="Record your observations here..."
            />
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-200 gap-8">
            <div className="w-32 h-32 rounded-[3rem] bg-slate-50 flex items-center justify-center animate-pulse">
                <StickyNote size={64} className="opacity-10" />
            </div>
            <div className="text-center">
                <p className="text-sm font-black text-slate-400">Secure entry selector required</p>
                <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest mt-2">Initialize a new note or select an existing record</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
