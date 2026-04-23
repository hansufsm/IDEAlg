"use client";

/**
 * IDEMobileLayout
 * Layout mobile da IDE com:
 * - Abas deslizantes: Editor | Terminal | Variáveis
 * - Barra de atalhos Portugol acima do teclado virtual
 * - Terminal touch-friendly com botão Enviar grande
 */

import { useState, useRef } from "react";
import dynamicImport from "next/dynamic";
import { IDETerminal } from "@/components/IDETerminal";
import { VariableInspector } from "@/components/VariableInspector";
import type { InputPrompt } from "@/lib/usePortugolRunner";

const PortugolEditorMobile = dynamicImport(
  () =>
    import("@/components/PortugolEditorMobile").then(
      (m) => m.PortugolEditorMobile,
    ),
  {
    ssr: false,
    loading: () => (
      <div
        className="flex-1 flex items-center justify-center text-xs"
        style={{ background: "#09090f", color: "var(--muted)" }}
      >
        Carregando editor…
      </div>
    ),
  },
);

// ─── Atalhos Portugol ─────────────────────────────────────────────────────────

const SHORTCUT_ROWS = [
  [
    { label: "algoritmo", insert: 'algoritmo ""\nvar\ninicio\n   \nfimalgoritmo' },
    { label: "se", insert: "se  entao\n   \nfimse" },
    { label: "para", insert: "para  de 1 ate 10 faca\n   \nfimpara" },
    { label: "enquanto", insert: "enquanto  faca\n   \nfimenquanto" },
  ],
  [
    { label: "escreval()", insert: 'escreval("")' },
    { label: "leia()", insert: "leia()" },
    { label: ":=", insert: " := " },
    { label: "verdadeiro", insert: "verdadeiro" },
    { label: "falso", insert: "falso" },
  ],
  [
    { label: "(", insert: "(" },
    { label: ")", insert: ")" },
    { label: '"', insert: '""' },
    { label: "[", insert: "[" },
    { label: "]", insert: "]" },
    { label: "<-", insert: " <- " },
    { label: "<>", insert: " <> " },
  ],
];

interface ShortcutBarProps {
  onInsert: (text: string) => void;
}

function ShortcutBar({ onInsert }: ShortcutBarProps) {
  const [row, setRow] = useState(0);
  const shortcuts = SHORTCUT_ROWS[row] ?? SHORTCUT_ROWS[0]!;

  return (
    <div
      style={{
        background: "var(--surface)",
        borderTop: "1px solid var(--border)",
        flexShrink: 0,
      }}
    >
      {/* Row selector */}
      <div
        className="flex gap-1 px-2 pt-1"
        style={{ borderBottom: "1px solid var(--border)" }}
      >
        {["Estruturas", "I/O", "Operadores"].map((label, i) => (
          <button
            key={label}
            onClick={() => setRow(i)}
            className="text-xs px-2 py-0.5 rounded-t"
            style={{
              background: row === i ? "rgba(167,139,250,0.2)" : "transparent",
              color: row === i ? "var(--accent)" : "var(--muted)",
              borderBottom: row === i ? "2px solid var(--accent)" : "2px solid transparent",
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Shortcut buttons */}
      <div className="flex gap-1.5 px-2 py-1.5 overflow-x-auto">
        {shortcuts.map((s) => (
          <button
            key={s.label}
            onPointerDown={(e) => {
              e.preventDefault(); // prevent keyboard dismissal
              onInsert(s.insert);
            }}
            className="flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-mono font-medium active:scale-95 transition-transform"
            style={{
              background: "rgba(167,139,250,0.12)",
              color: "var(--accent)",
              border: "1px solid rgba(167,139,250,0.25)",
              minHeight: 36,
            }}
          >
            {s.label}
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── Tab bar ─────────────────────────────────────────────────────────────────

type Tab = "editor" | "terminal" | "variables";

interface TabBarProps {
  active: Tab;
  onChange: (tab: Tab) => void;
  hasOutput: boolean;
  mode: string;
}

function TabBar({ active, onChange, hasOutput, mode }: TabBarProps) {
  const tabs: { id: Tab; label: string; icon: string }[] = [
    { id: "editor", label: "Editor", icon: "✏️" },
    { id: "terminal", label: "Terminal", icon: "▶" },
    { id: "variables", label: "Variáveis", icon: "🔍" },
  ];

  return (
    <div
      className="flex border-b flex-shrink-0"
      style={{
        background: "var(--surface)",
        borderColor: "var(--border)",
      }}
    >
      {tabs.map((tab) => {
        const isActive = active === tab.id;
        const hasBadge =
          tab.id === "terminal" &&
          hasOutput &&
          active !== "terminal" &&
          (mode === "finished" || mode === "error");

        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-sm font-medium relative"
            style={{
              color: isActive ? "var(--accent)" : "var(--muted)",
              borderBottom: isActive
                ? "2px solid var(--accent)"
                : "2px solid transparent",
              background: isActive ? "rgba(167,139,250,0.07)" : "transparent",
            }}
          >
            <span>{tab.icon}</span>
            <span>{tab.label}</span>
            {hasBadge && (
              <span
                className="absolute top-1.5 right-3 w-2 h-2 rounded-full"
                style={{
                  background:
                    mode === "error" ? "var(--error)" : "var(--success)",
                }}
              />
            )}
          </button>
        );
      })}
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

interface IDEMobileLayoutProps {
  code: string;
  onCodeChange: (v: string) => void;
  currentLine?: number;
  mode: string;
  consoleLines: any[];
  pendingInput: InputPrompt | null;
  inputValue: string;
  onInputChange: (v: string) => void;
  onInputSubmit: (v: string) => void;
  onClearConsole: () => void;
  executionTimeMs?: number;
  debugState?: any;
  onInsertSnippet: (text: string) => void;
}

export function IDEMobileLayout({
  code,
  onCodeChange,
  currentLine,
  mode,
  consoleLines,
  pendingInput,
  inputValue,
  onInputChange,
  onInputSubmit,
  onClearConsole,
  executionTimeMs,
  debugState,
  onInsertSnippet,
}: IDEMobileLayoutProps) {
  const [activeTab, setActiveTab] = useState<Tab>("editor");
  const hasOutput = consoleLines.length > 0;

  // Auto-switch to terminal when execution finishes
  const prevMode = useRef(mode);
  if (prevMode.current !== mode) {
    prevMode.current = mode;
    if (
      (mode === "finished" || mode === "error" || mode === "running") &&
      activeTab === "editor"
    ) {
      setActiveTab("terminal");
    }
  }

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      <TabBar
        active={activeTab}
        onChange={setActiveTab}
        hasOutput={hasOutput}
        mode={mode}
      />

      {/* ── Editor tab ── */}
      <div
        className="flex flex-col flex-1 overflow-hidden"
        style={{ display: activeTab === "editor" ? "flex" : "none" }}
      >
        <div className="flex-1 overflow-hidden">
          <PortugolEditorMobile
            value={code}
            onChange={onCodeChange}
            currentLine={currentLine}
          />
        </div>
        <ShortcutBar onInsert={onInsertSnippet} />
      </div>

      {/* ── Terminal tab ── */}
      <div
        className="flex flex-col flex-1 overflow-hidden"
        style={{ display: activeTab === "terminal" ? "flex" : "none" }}
      >
        <div className="flex-1 overflow-hidden">
          <IDETerminal
            lines={consoleLines}
            pendingInput={pendingInput}
            inputValue={inputValue}
            onInputChange={onInputChange}
            onInputSubmit={onInputSubmit}
            onClear={onClearConsole}
            executionTimeMs={executionTimeMs}
            mobileFriendly
          />
        </div>
      </div>

      {/* ── Variables tab ── */}
      <div
        className="flex flex-col flex-1 overflow-auto p-3"
        style={{
          display: activeTab === "variables" ? "flex" : "none",
          background: "var(--surface)",
        }}
      >
        <p
          className="text-xs mb-3 font-medium"
          style={{ color: "var(--text-dim)" }}
        >
          INSPETOR DE VARIÁVEIS
        </p>
        <VariableInspector
          variables={debugState?.variables ?? {}}
          currentLine={debugState?.currentLine ?? 0}
        />
        {Object.keys(debugState?.variables ?? {}).length === 0 && (
          <p className="text-xs" style={{ color: "var(--muted)" }}>
            Inicie a depuração para inspecionar variáveis.
          </p>
        )}
      </div>
    </div>
  );
}
