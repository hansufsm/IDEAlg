"use client";

import { useEffect, useRef } from "react";

export interface ConsoleLine {
  type: "output" | "error" | "info" | "input";
  text: string;
  timestamp?: number;
}

interface ConsoleProps {
  lines: ConsoleLine[];
  onClear: () => void;
  executionTimeMs?: number;
}

export function IDEConsole({ lines, onClear, executionTimeMs }: ConsoleProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [lines]);

  return (
    <div className="flex flex-col h-full" style={{ background: "#09090f" }}>
      {/* Console header */}
      <div className="flex items-center justify-between px-4 py-2 border-b"
        style={{ borderColor: "var(--border)", background: "var(--surface)" }}>
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono font-bold" style={{ color: "var(--accent)" }}>
            ▶ SAÍDA
          </span>
          {executionTimeMs !== undefined && (
            <span className="text-xs" style={{ color: "var(--muted)" }}>
              {executionTimeMs}ms
            </span>
          )}
        </div>
        <button onClick={onClear}
          className="text-xs px-2 py-0.5 rounded transition-colors hover:text-cyan-400"
          style={{ color: "var(--muted)" }}>
          Limpar
        </button>
      </div>

      {/* Console output */}
      <div className="flex-1 overflow-y-auto p-4 space-y-0.5">
        {lines.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full opacity-30">
            <span className="text-4xl mb-3">⬛</span>
            <span className="text-xs mono" style={{ color: "var(--muted)" }}>
              Execute o programa para ver a saída
            </span>
          </div>
        ) : (
          lines.map((line, i) => (
            <div key={i} className={`console-line ${line.type}`}>
              {line.type === "error" && (
                <span className="text-red-500 mr-2">✗</span>
              )}
              {line.type === "input" && (
                <span style={{ color: "var(--muted)" }} className="mr-2">▶</span>
              )}
              {line.type === "info" && (
                <span style={{ color: "var(--accent)" }} className="mr-2">ℹ</span>
              )}
              <span style={{ whiteSpace: "pre-wrap" }}>{line.text}</span>
            </div>
          ))
        )}
        <div ref={bottomRef} />
      </div>
    </div>
  );
}
