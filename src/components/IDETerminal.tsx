"use client";

import { useRef, useEffect } from "react";
import { ConsoleLine } from "./IDEConsole";

interface IDETerminalProps {
  lines: ConsoleLine[];
  pendingInput: { id: number; prompt: string; value: string } | null;
  inputValue: string;
  onInputChange: (value: string) => void;
  onInputSubmit: (value: string) => void;
  onClear: () => void;
  executionTimeMs?: number;
  /** Modo touch-friendly: botão Enviar grande, fonte maior, padding generoso */
  mobileFriendly?: boolean;
}

export function IDETerminal({
  lines,
  pendingInput,
  inputValue,
  onInputChange,
  onInputSubmit,
  onClear,
  executionTimeMs,
  mobileFriendly = false,
}: IDETerminalProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [lines, pendingInput]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      onInputSubmit(inputValue);
    }
  };

  const fontSize = mobileFriendly ? "15px" : "13px";
  const lineHeight = mobileFriendly ? "1.8" : "1.6";

  return (
    <div
      className="flex flex-col h-full"
      style={{ background: "var(--bg)", fontFamily: "var(--font-mono)" }}
    >
      {/* Terminal Header */}
      <div
        className="flex items-center justify-between px-4 py-2 border-b flex-shrink-0"
        style={{
          background: "var(--surface)",
          borderColor: "var(--border)",
        }}
      >
        <div className="flex items-center gap-2">
          <span
            className="text-xs font-medium"
            style={{ color: "var(--text-dim)" }}
          >
            TERMINAL
          </span>
          {executionTimeMs !== undefined && executionTimeMs > 0 && (
            <span className="text-xs" style={{ color: "var(--muted)" }}>
              • {executionTimeMs}ms
            </span>
          )}
        </div>
        <button
          onClick={onClear}
          className="text-xs px-2 py-1 rounded transition-colors"
          style={{ color: "var(--muted)", minHeight: mobileFriendly ? 36 : undefined }}
          onMouseEnter={(e) => (e.currentTarget.style.color = "var(--text)")}
          onMouseLeave={(e) => (e.currentTarget.style.color = "var(--muted)")}
        >
          Limpar
        </button>
      </div>

      {/* Terminal Output */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto"
        style={{
          minHeight: 0,
          padding: mobileFriendly ? "16px" : "16px",
          WebkitOverflowScrolling: "touch",
        }}
      >
        {lines.length === 0 ? (
          <div
            className="text-xs"
            style={{ color: "var(--muted)", lineHeight }}
          >
            Saída do programa aparecerá aqui...
          </div>
        ) : (
          lines.map((line, i) => (
            <div
              key={i}
              className="console-line"
              style={{
                color: getLineColor(line.type),
                fontSize,
                lineHeight,
                wordBreak: "break-word",
              }}
            >
              {line.type === "output" && <span>&gt; </span>}
              {line.text}
            </div>
          ))
        )}
      </div>

      {/* Input area — touch-friendly when mobileFriendly=true */}
      {pendingInput && (
        <div
          className="flex-shrink-0 border-t"
          style={{
            borderColor: "var(--border)",
            background: "var(--surface)",
            padding: mobileFriendly ? "12px 16px" : "8px 16px",
          }}
        >
          <div
            className="text-xs mb-1.5"
            style={{ color: "var(--accent3)" }}
          >
            {pendingInput.prompt || "Entrada:"}
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              inputMode="text"
              value={inputValue}
              onChange={(e) => onInputChange(e.target.value)}
              onKeyDown={handleKeyDown}
              autoFocus
              className="flex-1 rounded-lg px-3 outline-none"
              style={{
                background: "var(--bg)",
                border: "1px solid var(--accent3)",
                color: "var(--text)",
                fontSize: mobileFriendly ? "16px" : "13px", // 16px evita zoom no iOS
                height: mobileFriendly ? 44 : 32,
                fontFamily: "var(--font-mono)",
              }}
              placeholder="Digite aqui…"
            />
            <button
              onClick={() => onInputSubmit(inputValue)}
              className="rounded-lg font-semibold flex-shrink-0"
              style={{
                background: "var(--accent3)",
                color: "#000",
                fontSize: mobileFriendly ? "15px" : "13px",
                height: mobileFriendly ? 44 : 32,
                minWidth: mobileFriendly ? 80 : 60,
                padding: "0 12px",
              }}
            >
              Enviar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function getLineColor(type: ConsoleLine["type"]): string {
  switch (type) {
    case "output":
      return "#86efac";
    case "error":
      return "var(--error)";
    case "input":
      return "var(--accent3)";
    case "info":
      return "var(--muted)";
    default:
      return "var(--text-dim)";
  }
}
