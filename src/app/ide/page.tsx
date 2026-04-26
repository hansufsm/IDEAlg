"use client";

import dynamicImport from "next/dynamic";
import { useState, useCallback, useEffect, useRef } from "react";
import Link from "next/link";
import { ThemeToggle } from "@/components/ThemeToggle";
import { IDETerminalEnhanced } from "@/components/IDETerminalEnhanced";
import { VariableInspectorEnhanced } from "@/components/VariableInspectorEnhanced";
import { IDEErrorPanel } from "@/components/IDEErrorPanel";
import { IDEDocPanel } from "@/components/IDEDocPanel";
import { usePortugolRunner } from "@/lib/usePortugolRunner";
import { useIsMobile } from "@/lib/useIsMobile";
import { useDragResize } from "@/lib/useDragResize";
import {
  EXAMPLE_PROGRAMS,
  EXAMPLE_CATEGORIES,
} from "portugol-interpreter";

// ─── Dynamic imports ──────────────────────────────────────────────────────────
const PortugolEditor = dynamicImport(
  () => import("@/components/PortugolEditor").then((m) => m.PortugolEditor),
  { ssr: false, loading: () => <EditorSkeleton /> },
);
const IDEMobileLayout = dynamicImport(
  () => import("@/components/IDEMobileLayout").then((m) => m.IDEMobileLayout),
  { ssr: false, loading: () => <EditorSkeleton /> },
);
const IDEMobileToolbar = dynamicImport(
  () => import("@/components/IDEMobileToolbar").then((m) => m.IDEMobileToolbar),
  { ssr: false },
);

// ─── Defaults ────────────────────────────────────────────────────────────────
const DEFAULT_CODE =
  EXAMPLE_PROGRAMS["Calculadora Simples"] ??
  `algoritmo "Olá Mundo"
var
inicio
   escreval("Olá, Mundo!")
fimalgoritmo`;

function EditorSkeleton() {
  return (
    <div className="flex-1 flex items-center justify-center" style={{ background: "#09090f" }}>
      <div className="text-xs" style={{ color: "var(--muted)", fontFamily: "var(--font-mono)" }}>
        Carregando editor…
      </div>
    </div>
  );
}

type RightTab = "terminal" | "variables" | "docs";

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function IDEPage() {
  const isMobile = useIsMobile();
  const [mounted, setMounted] = useState(false);
  const [code, setCode] = useState(DEFAULT_CODE);
  const [projectTitle, setProjectTitle] = useState("Sem título");
  const [showExamples, setShowExamples] = useState(false);
  const [showSaveMenu, setShowSaveMenu] = useState(false);
  const [showProjects, setShowProjects] = useState(false);
  const [shareSlug, setShareSlug] = useState<string | null>(null);
  const [rightTab, setRightTab] = useState<RightTab>("terminal");
  const [showRightPanel, setShowRightPanel] = useState(true);
  const [inputValue, setInputValue] = useState("");
  const [notification, setNotification] = useState<string | null>(null);
  const [showErrorPanel, setShowErrorPanel] = useState(false);
  const saveMenuRef = useRef<HTMLDivElement>(null);
  const mobileEditorInsertRef = useRef<((text: string) => void) | null>(null);

  const { leftWidth, containerRef, onDragHandleMouseDown } = useDragResize({
    initial: 62,
    min: 35,
    max: 78,
  });

  const {
    mode,
    consoleLines,
    executionTimeMs,
    debugState,
    breakpoints,
    pendingInput,
    projects,
    currentProjectId,
    run,
    startDebug,
    stepInto,
    continueRun,
    stopDebug,
    toggleBreakpoint,
    clearConsole,
    resetMode,
    submitInput,
    createProject,
    updateProject,
    deleteProject,
    loadProject,
    setCurrentProjectId,
    downloadCode,
    copyToClipboard,
    autoSave,
  } = usePortugolRunner();

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 40);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    const encoded = params.get('code');
    if (encoded) {
      try {
        const decoded = decodeURIComponent(escape(atob(encoded)));
        setCode(decoded);
        setProjectTitle('Código compartilhado');
      } catch (e) {
        // Ignora código inválido
      }
    }
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      if (code && currentProjectId) autoSave(code, projectTitle);
    }, 30000);
    return () => clearInterval(interval);
  }, [code, currentProjectId, projectTitle, autoSave]);

  useEffect(() => {
    if (mode === "error") {
      setShowErrorPanel(true);
      setRightTab("terminal");
    } else {
      setShowErrorPanel(false);
    }
  }, [mode]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (saveMenuRef.current && !saveMenuRef.current.contains(e.target as Node)) {
        setShowSaveMenu(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const showNotification = useCallback((msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 2500);
  }, []);

  const handleRun = useCallback(() => {
    if (mode === "running" || mode === "debug") return;
    resetMode();
    setShowErrorPanel(false);
    run(code);
    setRightTab("terminal");
  }, [code, mode, run, resetMode]);

  const handleDebug = useCallback(() => {
    if (mode === "running" || mode === "debug") return;
    resetMode();
    setShowErrorPanel(false);
    startDebug(code);
    setRightTab("variables");
  }, [code, mode, startDebug, resetMode]);

  const handleStop = useCallback(() => {
    stopDebug();
  }, [stopDebug]);

  const handleInputSubmit = useCallback(
    (value: string) => {
      submitInput(value);
      setInputValue("");
    },
    [submitInput],
  );

  const handleSaveProject = useCallback(() => {
    if (!code.trim()) return;
    if (currentProjectId) {
      updateProject(currentProjectId, code, projectTitle);
      showNotification("✓ Projeto atualizado");
    } else {
      const id = createProject(projectTitle || "Sem título", code);
      setCurrentProjectId(id);
      showNotification("✓ Projeto salvo");
    }
    setShowSaveMenu(false);
  }, [code, currentProjectId, projectTitle, createProject, updateProject, setCurrentProjectId, showNotification]);

  const handleDownload = useCallback(
    (ext: "por" | "txt") => {
      const filename = projectTitle.replace(/[^a-zA-Z0-9]/g, "_") || "codigo";
      downloadCode(code, filename, ext);
      showNotification(`✓ Baixado como ${filename}.${ext}`);
      setShowSaveMenu(false);
    },
    [code, projectTitle, downloadCode, showNotification],
  );

  const handleCopy = useCallback(async () => {
    const success = await copyToClipboard(code);
    showNotification(success ? "✓ Código copiado" : "✗ Erro ao copiar");
    setShowSaveMenu(false);
  }, [code, copyToClipboard, showNotification]);

  const handleLoadProject = useCallback(
    (id: string) => {
      const project = loadProject(id);
      if (project) {
        setCode(project.code);
        setProjectTitle(project.title);
        showNotification(`✓ Carregado: ${project.title}`);
      }
      setShowProjects(false);
    },
    [loadProject, showNotification],
  );

  const handleNewProject = useCallback(() => {
    setCode(DEFAULT_CODE);
    setProjectTitle("Sem título");
    setCurrentProjectId(null);
    resetMode();
    clearConsole();
    showNotification("✓ Novo projeto");
    setShowProjects(false);
  }, [setCurrentProjectId, resetMode, clearConsole, showNotification]);

  const handleDeleteProject = useCallback(
    (id: string, e: React.MouseEvent) => {
      e.stopPropagation();
      deleteProject(id);
      showNotification("✓ Projeto removido");
    },
    [deleteProject, showNotification],
  );

  const handleExampleSelect = useCallback(
    (name: string) => {
      let foundCode = "";
      for (const cat of EXAMPLE_CATEGORIES) {
        const ex = cat.examples.find((e: any) => e.title === name);
        if (ex) { foundCode = ex.code; break; }
      }
      if (!foundCode && EXAMPLE_PROGRAMS[name]) foundCode = EXAMPLE_PROGRAMS[name];
      if (foundCode) {
        setCode(foundCode);
        setProjectTitle(name);
        setCurrentProjectId(null);
        setShowExamples(false);
        resetMode();
        clearConsole();
        showNotification(`✓ ${name}`);
      }
    },
    [setCurrentProjectId, resetMode, clearConsole, showNotification],
  );

  const ideUrl = typeof window !== "undefined" ? window.location.origin : "";

  const handleShare = useCallback(async () => {
    const encoded = btoa(unescape(encodeURIComponent(code)));
    const shareUrl = `${ideUrl}/ide?code=${encoded}`;
    setShareSlug(shareUrl);
  }, [code, ideUrl]);

  const handleInsertSnippet = useCallback((text: string) => {
    setCode((prev) => prev + "\n" + text);
  }, []);

  const handleGoToLine = useCallback((_line: number) => {
    // Monaco goToLine via ref — future enhancement
  }, []);

  // Status config
  const statusConfig: Record<string, { label: string; color: string; dot: string; pulse?: boolean }> = {
    idle: { label: "Pronto", color: "var(--muted)", dot: "#4b5563" },
    running: { label: "Executando…", color: "var(--accent)", dot: "#a78bfa", pulse: true },
    debug: { label: "Depurando…", color: "#38bdf8", dot: "#38bdf8" },
    paused: { label: `Pausado • Ln ${debugState?.currentLine ?? "—"}`, color: "#fbbf24", dot: "#fbbf24" },
    finished: { label: `Concluído${executionTimeMs ? ` • ${executionTimeMs}ms` : ""}`, color: "var(--success)", dot: "#34d399" },
    error: { label: "Erro de execução", color: "var(--error)", dot: "#f87171" },
  };
  const status = statusConfig[mode] ?? statusConfig.idle;

  return (
    <div
      className="flex flex-col h-screen overflow-hidden"
      style={{
        background: "var(--bg)",
        opacity: mounted ? 1 : 0,
        transform: mounted ? "translateY(0)" : "translateY(6px)",
        transition: "opacity 0.28s ease, transform 0.28s ease",
      }}
    >
      {/* Toast */}
      {notification && (
        <div
          className="fixed top-4 right-4 z-50 px-4 py-2 rounded-lg text-sm shadow-lg slide-up"
          style={{ background: "var(--surface)", border: "1px solid var(--border)", color: "var(--text)" }}
        >
          {notification}
        </div>
      )}

      {/* ═══════════════════════ MOBILE ═══════════════════════ */}
      {isMobile ? (
        <>
          <IDEMobileToolbar
            projectTitle={projectTitle}
            onProjectTitleChange={setProjectTitle}
            mode={mode}
            currentProjectId={currentProjectId}
            projects={projects}
            onRun={handleRun}
            onStop={handleStop}
            onDebug={handleDebug}
            onStepInto={stepInto}
            onContinue={continueRun}
            onSave={handleSaveProject}
            onNewProject={handleNewProject}
            onLoadProject={handleLoadProject}
            onDeleteProject={handleDeleteProject}
            onDownload={handleDownload}
            onCopy={handleCopy}
            onExampleSelect={handleExampleSelect}
            onShare={handleShare}
            debugState={debugState}
          />
          <IDEMobileLayout
            code={code}
            onCodeChange={setCode}
            currentLine={debugState?.currentLine}
            mode={mode}
            consoleLines={consoleLines}
            pendingInput={pendingInput}
            inputValue={inputValue}
            onInputChange={setInputValue}
            onInputSubmit={handleInputSubmit}
            onClearConsole={clearConsole}
            executionTimeMs={executionTimeMs}
            debugState={debugState}
            onInsertSnippet={handleInsertSnippet}
          />
        </>
      ) : (
        /* ═══════════════════════ DESKTOP ═══════════════════════ */
        <>
          {/* ── TOOLBAR ── */}
          <header
            className="flex items-center gap-1 px-3 py-1.5 border-b flex-shrink-0"
            style={{ borderColor: "var(--border)", background: "var(--surface)", minHeight: 48 }}
          >
            {/* Brand */}
            <Link
              href="/"
              className="font-mono font-bold text-sm mr-3 flex-shrink-0 hover:opacity-80 transition-opacity"
              style={{ color: "var(--accent)" }}
            >
              ✦ IDEALG
            </Link>

            <div className="w-px h-5 mx-1 flex-shrink-0" style={{ background: "var(--border)" }} />

            {/* Project title */}
            <div className="flex items-center gap-1.5 mr-2">
              <input
                value={projectTitle}
                onChange={(e) => setProjectTitle(e.target.value)}
                className="text-sm bg-transparent border-b outline-none px-1 py-0.5 w-44 transition-colors"
                style={{ borderColor: "var(--border)", color: "var(--text-dim)" }}
                placeholder="Nome do projeto"
              />
              {currentProjectId && (
                <span className="text-xs" style={{ color: "var(--success)" }} title="Projeto salvo">●</span>
              )}
            </div>

            <div className="w-px h-5 mx-1 flex-shrink-0" style={{ background: "var(--border)" }} />

            {/* Run group */}
            <div className="flex items-center gap-1">
              <button
                onClick={handleRun}
                disabled={mode === "running" || mode === "debug" || mode === "paused"}
                className="ide-btn ide-btn-primary"
                title="Executar (F5)"
              >
                ▶ Executar
              </button>

              {mode === "running" && (
                <button onClick={handleStop} className="ide-btn ide-btn-danger" title="Parar">
                  ⏹ Parar
                </button>
              )}

              {(mode === "idle" || mode === "finished" || mode === "error") && (
                <button
                  onClick={handleDebug}
                  className="ide-btn ide-btn-ghost"
                  title="Depurar (F9)"
                >
                  🐞 Depurar
                </button>
              )}

              {(mode === "debug" || mode === "paused") && (
                <>
                  <button onClick={stepInto} disabled={mode !== "paused"} className="ide-btn ide-btn-ghost" title="Passo a passo (F10)">
                    ⤵ Passo
                  </button>
                  <button onClick={continueRun} disabled={mode !== "paused"} className="ide-btn ide-btn-success" title="Continuar (F8)">
                    ▶▶ Continuar
                  </button>
                  <button onClick={handleStop} className="ide-btn ide-btn-danger" title="Parar">⏹</button>
                </>
              )}
            </div>

            {/* Status inline */}
            <div className="flex items-center gap-1.5 ml-2">
              <span
                className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                style={{
                  background: status.dot,
                  animation: status.pulse ? "pulse 1s infinite" : "none",
                }}
              />
              <span className="text-xs" style={{ color: status.color }}>{status.label}</span>
            </div>

            <div className="w-px h-5 mx-2 flex-shrink-0" style={{ background: "var(--border)" }} />

            {/* File group */}
            <div className="flex items-center gap-1" ref={saveMenuRef}>
              <button onClick={handleSaveProject} className="ide-btn ide-btn-ghost" title="Salvar">
                💾 Salvar
              </button>
              <div className="relative">
                <button onClick={() => setShowProjects((v) => !v)} className="ide-btn ide-btn-ghost" title="Projetos">
                  📁 Projetos {projects.length > 0 && <span className="ml-1 text-xs" style={{ color: "var(--muted)" }}>({projects.length})</span>}
                </button>
                {showProjects && (
                  <div
                    className="absolute top-full left-0 mt-1 rounded-xl shadow-2xl z-50 min-w-56 slide-up"
                    style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
                  >
                    <div className="p-2 border-b" style={{ borderColor: "var(--border)" }}>
                      <button
                        onClick={handleNewProject}
                        className="w-full text-left text-xs px-3 py-2 rounded-lg hover:bg-white/5 transition-colors"
                        style={{ color: "var(--accent)" }}
                      >
                        + Novo projeto
                      </button>
                    </div>
                    <div className="p-2 max-h-48 overflow-y-auto">
                      {projects.length === 0 ? (
                        <p className="text-xs text-center py-4" style={{ color: "var(--muted)" }}>Nenhum projeto salvo</p>
                      ) : (
                        projects.map((p) => (
                          <div key={p.id} className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-white/5 transition-colors group">
                            <button
                              onClick={() => handleLoadProject(p.id)}
                              className="flex-1 text-left text-xs"
                              style={{ color: p.id === currentProjectId ? "var(--accent)" : "var(--text-dim)" }}
                            >
                              <div>{p.title}</div>
                              <div className="text-xs" style={{ color: "var(--muted)" }}>
                                {new Date(p.updatedAt).toLocaleDateString("pt-BR")}
                              </div>
                            </button>
                            <button
                              onClick={(e) => handleDeleteProject(p.id, e)}
                              className="text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                              style={{ color: "var(--error)" }}
                            >
                              ✕
                            </button>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="w-px h-5 mx-2 flex-shrink-0" style={{ background: "var(--border)" }} />

            {/* Examples */}
            <div className="relative">
              <button onClick={() => setShowExamples((v) => !v)} className="ide-btn ide-btn-ghost">
                📚 Exemplos
              </button>
              {showExamples && (
                <div
                  className="absolute top-full left-0 mt-1 rounded-xl shadow-2xl z-50 w-72 slide-up"
                  style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
                >
                  <div className="p-2 max-h-80 overflow-y-auto">
                    {EXAMPLE_CATEGORIES.map((cat: any) => (
                      <div key={cat.id ?? cat.name} className="mb-2">
                        <div
                          className="flex items-center gap-2 px-3 py-1 text-xs font-bold uppercase tracking-wider"
                          style={{ color: "var(--accent)", fontSize: 10 }}
                        >
                          {cat.icon && <span>{cat.icon}</span>}
                          <span>{cat.name}</span>
                          <span style={{ color: "var(--muted)" }}>({cat.examples.length})</span>
                        </div>
                        {cat.examples.map((ex: any) => (
                          <button
                            key={ex.title ?? ex}
                            onClick={() => handleExampleSelect(ex.title ?? ex)}
                            className="w-full text-left text-xs px-4 py-1.5 rounded-lg hover:bg-white/5 transition-colors flex items-center justify-between"
                            style={{ color: "var(--text-dim)" }}
                          >
                            <span>{ex.title ?? ex}</span>
                            {ex.difficulty && (
                              <span
                                className="text-xs"
                                style={{
                                  color: ex.difficulty === "iniciante" ? "var(--success)"
                                    : ex.difficulty === "intermediário" ? "var(--warning)"
                                    : "var(--error)",
                                }}
                              >
                                {ex.difficulty === "iniciante" ? "●" : ex.difficulty === "intermediário" ? "◆" : "★"}
                              </span>
                            )}
                          </button>
                        ))}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Spacer */}
            <div className="flex-1" />

            {/* Utilities */}
            <div className="flex items-center gap-1">
              <ThemeToggle />
              <button onClick={() => handleDownload("por")} className="ide-btn ide-btn-ghost" title="Baixar .por">⬇ .por</button>
              <button onClick={handleCopy} className="ide-btn ide-btn-ghost" title="Copiar código">⎘ Copiar</button>
              <button onClick={handleShare} className="ide-btn ide-btn-ghost" title="Compartilhar">🔗</button>
            </div>

            <div className="w-px h-5 mx-2 flex-shrink-0" style={{ background: "var(--border)" }} />

            {/* Panel toggle */}
            <button
              onClick={() => setShowRightPanel((v) => !v)}
              className="ide-btn ide-btn-ghost"
              title="Mostrar/ocultar painel direito"
              style={{ color: showRightPanel ? "var(--accent)" : "var(--muted)" }}
            >
              ⊟
            </button>
          </header>

          {/* ── MAIN AREA ── */}
          <div ref={containerRef} className="flex flex-1 overflow-hidden" style={{ minHeight: 0 }}>
            {/* Editor panel */}
            <div
              className="flex flex-col overflow-hidden"
              style={{ width: showRightPanel ? `${leftWidth}%` : "100%", transition: showRightPanel ? "none" : "width 0.2s ease" }}
            >
              <PortugolEditor
                value={code}
                onChange={setCode}
                breakpoints={breakpoints}
                onBreakpointToggle={toggleBreakpoint}
                currentLine={debugState?.currentLine}
              />
              {showErrorPanel && mode === "error" && (
                <IDEErrorPanel
                  lines={consoleLines}
                  code={code}
                  onGoToLine={handleGoToLine}
                  onDismiss={() => setShowErrorPanel(false)}
                />
              )}
            </div>

            {/* Drag handle */}
            {showRightPanel && (
              <div
                onMouseDown={onDragHandleMouseDown}
                className="flex-shrink-0 flex items-center justify-center cursor-col-resize group"
                style={{ width: 6, background: "var(--border)" }}
                title="Arraste para redimensionar"
              >
                <div
                  className="w-0.5 h-8 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  style={{ background: "var(--accent)" }}
                />
              </div>
            )}

            {/* Right panel */}
            {showRightPanel && (
              <div className="flex flex-col overflow-hidden" style={{ flex: 1, minWidth: 280 }}>
                {/* Tabs */}
                <div className="flex border-b flex-shrink-0" style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
                  {(
                    [
                      { id: "terminal" as RightTab, label: "▶ Saída", alert: mode === "error" },
                      { id: "variables" as RightTab, label: "🔍 Variáveis", alert: mode === "paused" },
                      { id: "docs" as RightTab, label: "📖 Docs", alert: false },
                    ] as const
                  ).map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setRightTab(tab.id)}
                      className="relative px-4 py-2 text-xs transition-colors"
                      style={{
                        color: rightTab === tab.id ? "var(--accent)" : "var(--muted)",
                        borderBottom: rightTab === tab.id ? "2px solid var(--accent)" : "2px solid transparent",
                        background: "transparent",
                      }}
                    >
                      {tab.label}
                      {tab.alert && (
                        <span
                          className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full"
                          style={{ background: mode === "error" ? "var(--error)" : "var(--accent)" }}
                        />
                      )}
                    </button>
                  ))}
                </div>

                {/* Tab content */}
                <div className="flex-1 overflow-hidden" style={{ minHeight: 0 }}>
                  {rightTab === "terminal" && (
                    <IDETerminalEnhanced
                      lines={consoleLines}
                      pendingInput={pendingInput}
                      inputValue={inputValue}
                      onInputChange={setInputValue}
                      onInputSubmit={handleInputSubmit}
                      onClear={clearConsole}
                      executionTimeMs={executionTimeMs}
                    />
                  )}
                  {rightTab === "variables" && (
                    <VariableInspectorEnhanced
                      variables={debugState?.variables ?? {}}
                      currentLine={debugState?.currentLine ?? 0}
                    />
                  )}
                  {rightTab === "docs" && <IDEDocPanel />}
                </div>
              </div>
            )}
          </div>

          {/* ── STATUS BAR ── */}
          <footer
            className="flex items-center justify-between px-4 py-1 border-t flex-shrink-0 text-xs"
            style={{ borderColor: "var(--border)", background: "var(--surface)", color: "var(--muted)", minHeight: 24 }}
          >
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5">
                <span
                  className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                  style={{ background: status.dot, animation: status.pulse ? "pulse 1s infinite" : "none" }}
                />
                <span style={{ color: status.color }}>{status.label}</span>
              </div>
              {pendingInput && <span style={{ color: "var(--accent3)" }}>⏳ Aguardando entrada</span>}
              {currentProjectId && <span style={{ color: "var(--success)" }}>● Salvo</span>}
            </div>
            <div className="flex items-center gap-4">
              <span>Portugol</span>
              {debugState?.currentLine ? <span>Ln {debugState.currentLine}</span> : null}
              {executionTimeMs !== undefined && executionTimeMs > 0 && <span>{executionTimeMs}ms</span>}
            </div>
          </footer>
        </>
      )}

      {/* ── SHARE DIALOG ── */}
      {shareSlug && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
          <div
            className="rounded-xl p-6 w-full max-w-sm shadow-2xl slide-up"
            style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
          >
            <h3 className="font-semibold mb-2">🔗 Compartilhar</h3>
            <p className="text-xs mb-4" style={{ color: "var(--muted)" }}>
              Copie o link para compartilhar seu código.
            </p>
            <div className="flex gap-2 mb-4">
              <input
                readOnly
                value={shareSlug}
                className="flex-1 rounded-lg px-3 py-2 text-xs outline-none overflow-x-auto"
                style={{ background: "var(--bg)", border: "1px solid var(--border)", color: "var(--accent)", fontSize: 12 }}
              />
              <button
                onClick={() => navigator.clipboard.writeText(shareSlug)}
                className="px-3 py-2 rounded-lg text-xs flex-shrink-0"
                style={{ background: "rgba(0,212,255,0.15)", color: "var(--accent)" }}
              >
                Copiar
              </button>
            </div>
            <button
              onClick={() => setShareSlug(null)}
              className="w-full py-2.5 rounded-lg text-sm border"
              style={{ borderColor: "var(--border)", color: "var(--text-dim)" }}
            >
              Fechar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
