import React, { useState } from "react";
import { cn } from "@/src/lib/utils";
import { playSound } from "@/src/lib/sounds";

export default function Calculator() {
  const [display, setDisplay] = useState("0");
  const [equation, setEquation] = useState("");

  const handleAction = (val: string) => {
    playSound("launch");
    if (val === "C") {
      setDisplay("0");
      setEquation("");
      return;
    }
    if (val === "=") {
      try {
        const result = eval(display.replace('×', '*').replace('÷', '/'));
        setEquation(display + " =");
        setDisplay(String(result));
      } catch (e) {
        setDisplay("Error");
      }
      return;
    }
    if (display === "0" && !['+','-','×','÷'].includes(val)) {
      setDisplay(val);
    } else {
      setDisplay(display + val);
    }
  };

  const buttons = [
    ["C", "÷", '×', 'DEL'],
    ["7", "8", "9", "-"],
    ["4", "5", "6", "+"],
    ["1", "2", "3", "="],
    ["0", ".", "±", "%"]
  ];

  return (
    <div className="h-full flex flex-col bg-[#0a0a0a] p-6 lg:p-8">
      <div className="flex-1 flex flex-col justify-end gap-2 mb-8">
        <div className="text-right text-white/30 text-xs font-medium h-4">{equation}</div>
        <div className="text-right text-4xl font-light text-white tracking-tighter truncate">{display}</div>
      </div>

      <div className="grid grid-cols-4 gap-3">
        {buttons.flat().map((btn) => (
          <button
            key={btn}
            onPointerDown={() => handleAction(btn)}
            className={cn(
              "aspect-square rounded-2xl flex items-center justify-center text-sm font-medium transition-all",
              btn === "=" ? "bg-teal-500 text-white hover:bg-teal-400" :
              ['÷', '×', '-', '+', 'C'].includes(btn) ? "bg-white/10 text-teal-400 hover:bg-white/20" :
              "bg-white/5 text-white/80 hover:bg-white/10"
            )}
          >
            {btn}
          </button>
        ))}
      </div>
    </div>
  );
}
