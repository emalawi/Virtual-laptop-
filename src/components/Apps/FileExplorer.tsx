import React, { useState, useEffect } from "react";
import { Folder, File, ChevronRight, ChevronDown, HardDrive, Plus, Trash2, Globe, Loader2 } from "lucide-react";
import { cn } from "@/src/lib/utils";
import { collection, query, onSnapshot, addDoc, deleteDoc, doc, serverTimestamp, orderBy } from "firebase/firestore";
import { db, auth } from "@/src/lib/firebase";
import { useAuth } from "@/src/lib/AuthContext";

interface FileEntry {
  id?: string;
  name: string;
  type: 'file' | 'folder';
  children?: FileEntry[];
  content?: string;
  path: string;
  ownerId: string;
  createdAt: any;
}

export default function FileExplorer() {
  const { user } = useAuth();
  const [fileSystem, setFileSystem] = useState<FileEntry[]>([]);
  const [selectedFile, setSelectedFile] = useState<FileEntry | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const filesPath = `users/${user.uid}/files`;
    const q = query(collection(db, filesPath), orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const files: FileEntry[] = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as FileEntry));
      setFileSystem(files);
      setLoading(false);
    }, (error) => {
      console.error("Firestore error:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const createNewFile = async () => {
    if (!user) return;
    const name = `New Document ${fileSystem.length + 1}.txt`;
    const filesPath = `users/${user.uid}/files`;
    const fileData = {
      name,
      type: 'file' as const,
      path: `/${name}`,
      content: 'Edit this file content in the vault.',
      ownerId: user.uid,
      createdAt: serverTimestamp()
    };

    try {
      const docRef = await addDoc(collection(db, filesPath), fileData);
      setSelectedFile({ id: docRef.id, ...fileData, createdAt: new Date() });
    } catch (err) {
      console.error("Error creating file:", err);
      // Surface error for developer tools if needed
      if (err instanceof Error && err.message.includes("permissions")) {
        alert("Security rule error: Please check if email is verified or rules are correct.");
      }
    }
  };

  const deleteFile = async (file: FileEntry) => {
    if (!user || !file.id) return;
    const path = `users/${user.uid}/files/${file.id}`;
    try {
      const fileRef = doc(db, `users/${user.uid}/files`, file.id);
      await deleteDoc(fileRef);
      if (selectedFile?.id === file.id) setSelectedFile(null);
    } catch (err) {
      console.error("Error deleting file:", err);
    }
  };

  const renderList = (entries: FileEntry[]) => {
    if (entries.length === 0) {
      return <div className="px-3 py-2 text-[10px] text-slate-400 italic">No files found</div>;
    }

    return (
      <div className="flex flex-col gap-1">
        {entries.map((entry) => {
          const isSelected = selectedFile?.id === entry.id;

          return (
            <button
              key={entry.id}
              onClick={() => setSelectedFile(entry)}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2.5 text-left text-xs transition-all rounded-xl group",
                isSelected ? "bg-emerald-50 text-emerald-700 shadow-sm shadow-emerald-500/5" : "hover:bg-slate-100/50 text-slate-600"
              )}
            >
              <div className={cn(
                "p-2 rounded-lg transition-colors",
                isSelected ? "bg-emerald-100 text-emerald-600" : (entry.type === 'folder' ? "bg-blue-50 text-blue-500" : "bg-amber-50 text-amber-500")
              )}>
                {entry.type === 'folder' ? <Folder size={14} /> : <File size={14} />}
              </div>
              <span className={cn("truncate flex-1 font-medium", isSelected && "font-bold")}>{entry.name}</span>
            </button>
          );
        })}
      </div>
    );
  };

  return (
    <div className="h-full flex flex-col bg-white text-slate-900">
      {/* Search/Address Bar */}
      <div className="h-14 flex items-center px-6 border-b border-slate-100 bg-slate-50/30 gap-4">
        <div className="flex items-center gap-2 text-slate-400">
           <HardDrive size={16} />
           <span className="text-[10px] uppercase font-black tracking-widest">Vault</span>
        </div>
        <div className="flex-1 bg-white border border-slate-100 rounded-xl px-4 py-1.5 text-xs text-slate-400 font-medium">
          {selectedFile ? `vault / ${selectedFile.name}` : "vault / root"}
        </div>
        <button 
          onClick={createNewFile}
          className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-lg shadow-emerald-600/10 active:scale-95"
        >
          <Plus size={14} /> New File
        </button>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar Tree */}
        <div className="w-64 border-r border-slate-100 p-6 overflow-y-auto bg-slate-50/30 flex flex-col gap-8">
          <section>
            <h3 className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-4 px-3">Storage Unit</h3>
            {loading ? (
              <div className="flex justify-center p-4">
                <Loader2 className="w-5 h-5 animate-spin text-emerald-500" />
              </div>
            ) : (
              renderList(fileSystem)
            )}
          </section>
        </div>

        {/* Content View */}
        <div className="flex-1 flex flex-col overflow-hidden bg-white">
          {selectedFile ? (
            <div className="flex-1 flex flex-col">
              <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-500 shadow-sm shadow-amber-500/10">
                    <File size={20} />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-slate-900">{selectedFile.name}</h3>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">Encrypted Content</p>
                  </div>
                </div>
                <button 
                  onClick={() => deleteFile(selectedFile)}
                  className="p-3 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-2xl transition-all"
                >
                  <Trash2 size={20} />
                </button>
              </div>
              <div className="flex-1 p-10 overflow-y-auto font-mono text-sm leading-relaxed text-slate-600 bg-slate-50/20">
                <pre className="whitespace-pre-wrap">{selectedFile.content}</pre>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-200 gap-6">
              <div className="w-24 h-24 rounded-[2.5rem] bg-slate-50 flex items-center justify-center">
                <Folder size={48} className="opacity-20" />
              </div>
              <div className="text-center">
                <p className="text-sm font-black text-slate-400">Vault selection required</p>
                <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest mt-2">Select a file to decrypt and view</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

