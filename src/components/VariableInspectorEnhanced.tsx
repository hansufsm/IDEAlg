"use client";

/**
 * VariableInspectorEnhanced
 * Inspetor de variáveis aprimorado com:
 * - Seção Watch (expressões monitoradas)
 * - Histórico de valores: anterior → atual
 * - Destaque de mudança (flash amarelo por 1s)
 * - Filtro de busca
 */

import { useState, useEffect, useRef } from "react";
import { PortugolValue, PortugolArray, PortugolRecord } from "portugol-interpreter";

interface VariableInspectorEnhancedProps {
  variables: Record<string, PortugolValue>;
  currentLine: number;
}

function formatValue(v: PortugolValue): { display: string; type: string; color: string } {
  if (v === null) return { display: "nulo", type: "nulo", color: "var(--muted)" };
  if (typeof v === "boolean")
    return { display: v ? "VERDADEIRO" : "FALSO", type: "logico", color: "#a78bfa" };
  if (typeof v === "number") {
    const isInt = Number.isInteger(v);
    return {
      display: isInt ? String(v) : v.toFixed(6).replace(/\.?0+$/, ""),
      type: isInt ? "inteiro" : "real",
      color: "#fbbf24",
    };
  }
  if (typeof v === "string")
    return { display: `"${v}"`, type: "caractere", color: "#86efac" };
  if ((v as PortugolArray).__type === "array") {
    const arr = v as PortugolArray;
    return {
      display: `[${arr.data.slice(0, 6).map((x) => formatValue(x).display).join(", ")}${arr.data.length > 6 ? "…" : ""}]`,
      type: `vetor[${arr.dims.join("×")}]`,
      color: "#38bdf8",
    };
  }
  if ((v as PortugolRecord).__type === "record") {
    const rec = v as PortugolRecord;
    return {
      display: `{${Object.keys(rec.fields).slice(0, 3).join(", ")}}`,
      type: rec.typeName,
      color: "#f472b6",
    };
  }
  return { display: String(v), type: "?", color: "var(--text)" };
}

function valueToString(v: PortugolValue): string {
  return formatValue(v).display;
}

export function VariableInspectorEnhanced({
  variables,
  currentLine,
}: VariableInspectorEnhancedProps) {
  const [filter, setFilter] = useState("");
  const [watchExpressions, setWatchExpressions] = useState<string[]>([]);
  const [watchInput, setWatchInput] = useState("");
  const [changedVars, setChangedVars] = useState<Set<string>>(new Set());
  const prevVarsRef = useRef<Record<string, string>>({});

  // Detect changed variables and flash them
  useEffect(() => {
    const changed = new Set<string>();
    for (const [name, val] of Object.entries(variables)) {
      const strVal = valueToString(val);
      if (prevVarsRef.current[name] !== undefined && prevVarsRef.current[name] !== strVal) {
        changed.add(name);
      }
    }
    // Update prev
    const next: Record<string, string> = {};
    for (const [name, val] of Object.entries(variables)) {
      next[name] = valueToString(val);
    }
    prevVarsRef.current = next;
    if (changed.size > 0) {
      setChangedVars(changed);
      const t = setTimeout(() => setChangedVars(new Set()), 1000);
      return () => clearTimeout(t);
    }
    return undefined;
  }, [variables]);

  const entries = Object.entries(variables).filter(([name]) =>
    filter ? name.toLowerCase().includes(filter.toLowerCase()) : true,
  );

  const addWatch = () => {
    const expr = watchInput.trim();
    if (expr && !watchExpressions.includes(expr)) {
      setWatchExpressions((prev) => [...prev, expr]);
    }
    setWatchInput("");
  };

  const removeWatch = (expr: string) => {
    setWatchExpressions((prev) => prev.filter((e) => e !== expr));
  };

  // Evaluate watch expression (simple variable lookup)
  const evalWatch = (expr: string): string => {
    const val = variables[expr];
    if (val !== undefined) return formatValue(val).display;
    // Try simple arithmetic with known vars (best-effort)
    try {
      const replaced = expr.replace(/[a-zA-Z_]\w*/g, (name) => {
        const v = variables[name];
        if (typeof v === "number") return String(v);
        if (typeof v === "boolean") return v ? "1" : "0";
        return "NaN";
      });
      // eslint-disable-next-line no-eval
      const result = Function(`"use strict"; return (${replaced})`)();
      return String(result);
    } catch {
      return "—";
    }
  };

  return (
    <div className="h-full flex flex-col" style={{ background: "var(--surface)", fontFamily: "var(--font-mono)" }}>
      {/* Header */}
      <div
        className="px-3 py-2 border-b flex items-center justify-between flex-shrink-0"
        style={{ borderColor: "var(--border)" }}
      >
        <span className="text-xs font-bold" style={{ color: "var(--accent)", letterSpacing: "0.05em" }}>
          🔍 VARIÁVEIS
        </span>
        <span className="text-xs" style={{ color: "var(--muted)" }}>
          Ln {currentLine || "—"}
        </span>
      </div>

      {/* Filter */}
      {Object.keys(variables).length > 4 && (
        <div className="px-3 py-1.5 border-b flex-shrink-0" style={{ borderColor: "var(--border)" }}>
          <input
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            placeholder="Filtrar variáveis…"
            className="w-full text-xs rounded px-2 py-1 outline-none"
            style={{
              background: "var(--bg)",
              border: "1px solid var(--border)",
              color: "var(--text)",
              fontFamily: "var(--font-mono)",
            }}
          />
        </div>
      )}

      {/* Variables list */}
      <div className="flex-1 overflow-y-auto" style={{ minHeight: 0 }}>
        {entries.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full opacity-30 py-8">
            <span style={{ fontSize: 24, marginBottom: 6 }}>🔍</span>
            <span className="text-xs" style={{ color: "var(--muted)" }}>
              {Object.keys(variables).length === 0
                ? "Nenhuma variável declarada"
                : "Nenhuma variável encontrada"}
            </span>
          </div>
        ) : (
          <div className="p-2 space-y-0.5">
            {entries.map(([name, val]) => {
              const { display, type, color } = formatValue(val);
              const isChanged = changedVars.has(name);
              const prevDisplay = prevVarsRef.current[name];
              const hasPrev = prevDisplay !== undefined && prevDisplay !== display;

              return (
                <div
                  key={name}
                  className="flex items-baseline gap-2 px-2 py-1 rounded transition-all"
                  style={{
                    background: isChanged
                      ? "rgba(251,191,36,0.08)"
                      : "transparent",
                    border: isChanged
                      ? "1px solid rgba(251,191,36,0.2)"
                      : "1px solid transparent",
                    transition: "background 0.3s, border 0.3s",
                  }}
                >
                  {/* Changed indicator */}
                  <span
                    style={{
                      width: 6,
                      height: 6,
                      borderRadius: "50%",
                      background: isChanged ? "#fbbf24" : "transparent",
                      flexShrink: 0,
                      transition: "background 0.3s",
                    }}
                  />
                  {/* Name */}
                  <span
                    className="text-xs flex-shrink-0"
                    style={{ color: "var(--accent)", minWidth: 80 }}
                  >
                    {name}
                  </span>
                  {/* Type badge */}
                  <span
                    className="text-xs flex-shrink-0"
                    style={{
                      color: "var(--muted)",
                      fontSize: 9,
                      background: "rgba(42,42,69,0.6)",
                      padding: "1px 4px",
                      borderRadius: 3,
                    }}
                  >
                    {type}
                  </span>
                  {/* Value */}
                  <div className="flex items-center gap-1 min-w-0">
                    {hasPrev && (
                      <>
                        <span className="text-xs truncate" style={{ color: "var(--muted)", opacity: 0.5, textDecoration: "line-through", maxWidth: 60 }}>
                          {prevDisplay}
                        </span>
                        <span style={{ color: "var(--muted)", fontSize: 10 }}>→</span>
                      </>
                    )}
                    <span className="text-xs truncate font-medium" style={{ color }}>
                      {display}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Watch section */}
        <div className="border-t mt-1" style={{ borderColor: "var(--border)" }}>
          <div className="px-3 py-1.5 flex items-center gap-1">
            <span className="text-xs font-bold" style={{ color: "var(--accent3)", letterSpacing: "0.05em" }}>
              👁 WATCH
            </span>
          </div>
          {/* Watch expressions */}
          {watchExpressions.length > 0 && (
            <div className="px-2 pb-1 space-y-0.5">
              {watchExpressions.map((expr) => (
                <div key={expr} className="flex items-center gap-2 px-2 py-1 rounded" style={{ background: "rgba(56,189,248,0.04)" }}>
                  <span className="text-xs flex-1" style={{ color: "#38bdf8", fontFamily: "var(--font-mono)" }}>
                    {expr}
                  </span>
                  <span className="text-xs" style={{ color: "#fbbf24" }}>
                    = {evalWatch(expr)}
                  </span>
                  <button
                    onClick={() => removeWatch(expr)}
                    className="text-xs"
                    style={{ color: "var(--muted)" }}
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}
          {/* Add watch */}
          <div className="px-2 pb-2 flex gap-1">
            <input
              value={watchInput}
              onChange={(e) => setWatchInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addWatch()}
              placeholder="+ Adicionar expressão"
              className="flex-1 text-xs rounded px-2 py-1 outline-none"
              style={{
                background: "var(--bg)",
                border: "1px solid var(--border)",
                color: "var(--text)",
                fontFamily: "var(--font-mono)",
                fontSize: 11,
              }}
            />
            <button
              onClick={addWatch}
              className="text-xs px-2 py-1 rounded"
              style={{
                background: "rgba(56,189,248,0.1)",
                color: "#38bdf8",
                border: "1px solid rgba(56,189,248,0.2)",
              }}
            >
              +
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
