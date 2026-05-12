import React, { useState, useRef, useEffect } from "react";
import { cn } from "@/src/lib/utils";
import { playSound } from "@/src/lib/sounds";

interface CommandResult {
  command: string;
  output: string | React.ReactNode;
}

export default function Terminal() {
  const [history, setHistory] = useState<CommandResult[]>([
    { command: "system", output: "ZenithOS v1.0.4 Kernel Loaded. Type 'help' for commands." }
  ]);
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [history]);

  const handleCommand = (e: React.KeyboardEvent) => {
    if (e.key !== "Enter") return;

    const cmd = input.trim().toLowerCase();
    let output: string | React.ReactNode = "";

    switch (cmd) {
      case "help":
        output = "Available commands: help, clear, system, whoami, date, echo [text], fetch, diagnostics";
        break;
      case "clear":
        setHistory([]);
        setInput("");
        return;
      case "whoami":
        output = "zenith_user_active_01 (Authorized)";
        break;
      case "date":
        output = new Date().toLocaleString();
        break;
      case "system":
        output = (
          <div className="space-y-1">
            <p>OS: ZenithOS x86_64</p>
            <p>Kernel: 5.15.0-OS-STABLE</p>
            <p>Shell: zsh-sim (v1.0)</p>
            <p>CPU: Virtual Quantus C1 (8 Cores)</p>
            <p>Memory: 16GB Virtualized LPDDR5</p>
          </div>
        );
        break;
      case "diagnostics":
        output = "Running health check... [OK] Memory, [OK] CPU, [OK] Network, [STABLE] Core Fluidity.";
        break;
      default:
        if (cmd.startsWith("echo ")) {
          output = cmd.slice(5);
        } else if (cmd.startsWith("fetch ")) {
          output = `Fetching resource from ${cmd.slice(6)}... Connection refused by proxy.`;
          playSound("alert");
        } else if (cmd === "") {
          output = "";
        } else {
          output = `command not found: ${cmd}`;
          playSound("alert");
        }
    }

    if (cmd !== "" && cmd !== "clear") {
       if (!cmd.startsWith("fetch ") && output !== `command not found: ${cmd}`) {
          playSound("launch");
       }
    }

    setHistory(prev => [...prev, { command: input, output }]);
    setInput("");
  };

  return (
    <div className="flex flex-col h-full bg-[#050505] font-mono text-sm leading-relaxed p-4 selection:bg-teal-500/30 selection:text-teal-200">
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto space-y-2 scrollbar-hide"
      >
        {history.map((item, i) => (
          <div key={i} className="animate-in fade-in slide-in-from-bottom-1 duration-300">
            {item.command !== "system" && (
              <div className="flex gap-2">
                <span className="text-teal-500">➜</span>
                <span className="text-purple-400">~</span>
                <span className="text-white">{item.command}</span>
              </div>
            )}
            <div className="text-white/60 pl-6 mb-2">
              {item.output}
            </div>
          </div>
        ))}
      </div>

      <div className="flex gap-2 mt-4">
        <span className="text-teal-500 shrink-0">➜</span>
        <span className="text-purple-400 shrink-0">~</span>
        <input 
          autoFocus
          type="text" 
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleCommand}
          className="flex-1 bg-transparent border-none outline-none text-white selection:bg-teal-500/30"
          spellCheck={false}
        />
      </div>
    </div>
  );
}
