"use client";

/**
 * IDETerminalEnhanced
 * Terminal aprimorado com:
 * - Timestamps opcionais por linha
 * - Histórico de entradas (seta ↑/↓)
 * - Colorização semântica melhorada
 * - Contador de linhas no header
 * - Botão de copiar saída
 */

import { useRef, useEffect, useState, useCallback } from "react";
import { ConsoleLine } from "./IDEConsole";

interface IDETerminalEnhancedProps {
  lines: ConsoleLine[];
  pendingInput: { id: number; prompt: string; value: string } | null;
  inputValue: string;
  onInputChange: (value: string) => void;
  onInputSubmit: (value: string) => void;
  onClear: () => void;
  executionTimeMs?: number;
}

function formatTime(ts: number): string {
  const d = new Date(ts);
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}:${String(d.getSeconds()).padStart(2, "0")}.${String(d.getMilliseconds()).padStart(3, "0")}`;
}

function LineContent({ line }: { line: ConsoleLine }) {
  const text = line.text;

  // Colorização semântica: números, strings, booleanos
  const parts: React.ReactNode[] = [];
  const tokenRegex = /("(?:[^"\\]|\\.)*")|(\b\d+(?:\.\d+)?\b)|(VERDADEIRO|FALSO|verdadeiro|falso)/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = tokenRegex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(<span key={lastIndex}>{text.slice(lastIndex, match.index)}</span>);
    }
    if (match[1]) {
      // String
      parts.push(<span key={match.index} style={{ color: "#86efac" }}>{match[1]}</span>);
    } else if (match[2]) {
      // Number
      parts.push(<span key={match.index} style={{ color: "#fbbf24" }}>{match[2]}</span>);
    } else if (match[3]) {
      // Boolean
      parts.push(<span key={match.index} style={{ color: "#a78bfa" }}>{match[3]}</span>);
    }
    lastIndex = match.index + match[0].length;
  }
  if (lastIndex < text.length) {
    parts.push(<span key={lastIndex}>{text.slice(lastIndex)}</span>);
  }

  const color =
    line.type === "error"
      ? "var(--error)"
      : line.type === "info"
        ? "var(--muted)"
        : line.type === "input"
          ? "var(--accent3)"
          : "#e2e8f0";

  return (
    <span style={{ color, whiteSpace: "pre-wrap" }}>
      {line.type === "error" && <span style={{ color: "var(--error)", marginRight: 6 }}>✗</span>}
      {line.type === "input" && <span style={{ color: "var(--muted)", marginRight: 6 }}>▶</span>}
      {line.type === "info" && <span style={{ color: "var(--accent)", marginRight: 6 }}>ℹ</span>}
      {line.type === "output" ? parts : text}
    </span>
  );
}

export function IDETerminalEnhanced({
  lines,
  pendingInput,
  inputValue,
  onInputChange,
  onInputSubmit,
  onClear,
  executionTimeMs,
}: IDETerminalEnhancedProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [showTimestamps, setShowTimestamps] = useState(false);
  const [inputHistory, setInputHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [copied, setCopied] = useState(false);

  // Auto-scroll
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [lines, pendingInput]);

  // Focus input when pendingInput appears
  useEffect(() => {
    if (pendingInput) {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [pendingInput]);

  const handleSubmit = useCallback(() => {
    if (!inputValue.trim() && !pendingInput) return;
    setInputHistory((prev) => [inputValue, ...prev.slice(0, 49)]);
    setHistoryIndex(-1);
    onInputSubmit(inputValue);
  }, [inputValue, pendingInput, onInputSubmit]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") {
        e.preventDefault();
        handleSubmit();
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        const next = Math.min(historyIndex + 1, inputHistory.length - 1);
        setHistoryIndex(next);
        onInputChange(inputHistory[next] ?? "");
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        const next = Math.max(historyIndex - 1, -1);
        setHistoryIndex(next);
        onInputChange(next === -1 ? "" : (inputHistory[next] ?? ""));
      }
    },
    [handleSubmit, historyIndex, inputHistory, onInputChange],
  );

  const handleCopyOutput = useCallback(async () => {
    const text = lines.map((l) => l.text).join("\n");
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }, [lines]);

  const outputCount = lines.filter((l) => l.type === "output").length;

  return (
    <div
      className="flex flex-col h-full"
      style={{ background: "var(--bg)", fontFamily: "var(--font-mono)" }}
    >
      {/* ── Header ── */}
      <div
        className="flex items-center justify-between px-3 py-1.5 border-b flex-shrink-0"
        style={{ background: "var(--surface)", borderColor: "var(--border)" }}
      >
        <div className="flex items-center gap-2">
          <span
            className="text-xs font-bold"
            style={{ color: "var(--accent)", letterSpacing: "0.05em" }}
          >
            ▶ SAÍDA
          </span>
          {lines.length > 0 && (
            <span
              className="text-xs px-1.5 py-0.5 rounded"
              style={{
                background: "rgba(167,139,250,0.1)",
                color: "var(--muted)",
                fontSize: 10,
              }}
            >
              {outputCount} linha{outputCount !== 1 ? "s" : ""}
            </span>
          )}
          {executionTimeMs !== undefined && executionTimeMs > 0 && (
            <span
              className="text-xs px-1.5 py-0.5 rounded"
              style={{
                background: "rgba(52,211,153,0.08)",
                color: "var(--success)",
                fontSize: 10,
              }}
            >
              {executionTimeMs}ms
            </span>
          )}
        </div>
        <div className="flex items-center gap-1">
          {/* Timestamps toggle */}
          <button
            onClick={() => setShowTimestamps((v) => !v)}
            title="Mostrar timestamps"
            className="text-xs px-2 py-0.5 rounded transition-colors"
            style={{
              color: showTimestamps ? "var(--accent)" : "var(--muted)",
              background: showTimestamps ? "rgba(167,139,250,0.1)" : "transparent",
            }}
          >
            ⏱
          </button>
          {/* Copy output */}
          {lines.length > 0 && (
            <button
              onClick={handleCopyOutput}
              title="Copiar saída"
              className="text-xs px-2 py-0.5 rounded transition-colors"
              style={{ color: copied ? "var(--success)" : "var(--muted)" }}
            >
              {copied ? "✓" : "⎘"}
            </button>
          )}
          {/* Clear */}
          {lines.length > 0 && (
            <button
              onClick={onClear}
              className="text-xs px-2 py-0.5 rounded transition-colors hover:text-red-400"
              style={{ color: "var(--muted)" }}
            >
              Limpar
            </button>
          )}
        </div>
      </div>

      {/* ── Output area ── */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-3"
        style={{ minHeight: 0 }}
      >
        {lines.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full opacity-25">
            <span style={{ fontSize: 32, marginBottom: 8 }}>⬛</span>
            <span className="text-xs" style={{ color: "var(--muted)" }}>
              Execute o programa para ver a saída
            </span>
          </div>
        ) : (
          <div className="space-y-0">
            {lines.map((line, i) => (
              <div
                key={i}
                className="flex items-baseline gap-2"
                style={{
                  fontSize: 13,
                  lineHeight: 1.65,
                  padding: "1px 0",
                  background:
                    line.type === "error"
                      ? "rgba(248,113,113,0.04)"
                      : "transparent",
                  borderLeft:
                    line.type === "error"
                      ? "2px solid rgba(248,113,113,0.4)"
                      : "2px solid transparent",
                  paddingLeft: 4,
                }}
              >
                {showTimestamps && line.timestamp && (
                  <span
                    className="flex-shrink-0 select-none"
                    style={{
                      color: "var(--muted)",
                      fontSize: 10,
                      opacity: 0.5,
                      minWidth: 90,
                    }}
                  >
                    {formatTime(line.timestamp)}
                  </span>
                )}
                <LineContent line={line} />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Input area ── */}
      {pendingInput && (
        <div
          className="flex-shrink-0 border-t px-3 py-2"
          style={{
            background: "rgba(167,139,250,0.04)",
            borderColor: "rgba(167,139,250,0.2)",
          }}
        >
          <div
            className="text-xs mb-1.5"
            style={{ color: "var(--accent)", fontFamily: "var(--font-mono)" }}
          >
            ⏳ {pendingInput.prompt || "Entrada:"}
          </div>
          <div className="flex gap-2">
            <input
              ref={inputRef}
              value={inputValue}
              onChange={(e) => onInputChange(e.target.value)}
              onKeyDown={handleKeyDown}
              className="flex-1 rounded-lg px-3 py-1.5 text-sm outline-none"
              style={{
                background: "var(--bg)",
                border: "1px solid rgba(167,139,250,0.3)",
                color: "var(--text)",
                fontFamily: "var(--font-mono)",
                fontSize: 13,
              }}
              placeholder="Digite e pressione Enter (↑↓ para histórico)"
              autoComplete="off"
              spellCheck={false}
            />
            <button
              onClick={handleSubmit}
              className="px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
              style={{
                background: "rgba(167,139,250,0.15)",
                color: "var(--accent)",
                border: "1px solid rgba(167,139,250,0.3)",
              }}
            >
              Enviar
            </button>
          </div>
          {inputHistory.length > 0 && (
            <div
              className="text-xs mt-1"
              style={{ color: "var(--muted)", opacity: 0.6 }}
            >
              ↑↓ para navegar no histórico ({inputHistory.length} entradas)
            </div>
          )}
        </div>
      )}
    </div>
  );
}
