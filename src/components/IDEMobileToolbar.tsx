"use client";

/**
 * IDEMobileToolbar
 * Toolbar compacta para mobile com:
 * - Botões ▶ Executar e ⏹ Parar sempre visíveis
 * - Status de execução inline
 * - Menu hambúrguer com: Salvar, Exemplos, Projetos, Depurar, Compartilhar
 */

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { EXAMPLE_CATEGORIES } from "portugol-interpreter";

interface IDEMobileToolbarProps {
  projectTitle: string;
  onProjectTitleChange: (v: string) => void;
  mode: string;
  currentProjectId: string | null;
  projects: any[];
  onRun: () => void;
  onStop: () => void;
  onDebug: () => void;
  onStepInto: () => void;
  onContinue: () => void;
  onSave: () => void;
  onNewProject: () => void;
  onLoadProject: (id: string) => void;
  onDeleteProject: (id: string, e: React.MouseEvent) => void;
  onDownload: (ext: "por" | "txt") => void;
  onCopy: () => void;
  onExampleSelect: (name: string) => void;
  onShare: () => void;
  debugState?: any;
}

export function IDEMobileToolbar({
  projectTitle,
  onProjectTitleChange,
  mode,
  currentProjectId,
  projects,
  onRun,
  onStop,
  onDebug,
  onStepInto,
  onContinue,
  onSave,
  onNewProject,
  onLoadProject,
  onDeleteProject,
  onDownload,
  onCopy,
  onExampleSelect,
  onShare,
  debugState,
}: IDEMobileToolbarProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [subMenu, setSubMenu] = useState<"examples" | "projects" | "save" | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const isRunning = mode === "running";
  const isDebug = mode === "debug" || mode === "paused";

  // Close on outside tap
  useEffect(() => {
    if (!menuOpen) return;
    const handler = (e: MouseEvent | TouchEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
        setSubMenu(null);
      }
    };
    document.addEventListener("mousedown", handler);
    document.addEventListener("touchstart", handler);
    return () => {
      document.removeEventListener("mousedown", handler);
      document.removeEventListener("touchstart", handler);
    };
  }, [menuOpen]);

  const statusColor =
    mode === "running" ? "var(--accent)" :
    mode === "error"   ? "var(--error)" :
    mode === "finished"? "var(--success)" :
    mode === "paused"  ? "var(--warning)" :
    "var(--muted)";

  const statusLabel =
    mode === "running"  ? "Executando…" :
    mode === "error"    ? "Erro" :
    mode === "finished" ? "Concluído" :
    mode === "paused"   ? `Pausado L${debugState?.currentLine ?? ""}` :
    mode === "debug"    ? "Depurando…" :
    "";

  return (
    <header
      className="flex items-center gap-2 px-3 py-2 border-b flex-shrink-0"
      style={{
        borderColor: "var(--border)",
        background: "var(--surface)",
        minHeight: 52,
      }}
    >
      {/* Logo */}
      <Link
        href="/"
        className="font-mono font-bold text-sm flex-shrink-0"
        style={{ color: "var(--accent)" }}
      >
        ✦
      </Link>

      {/* Project title (compact) */}
      <input
        value={projectTitle}
        onChange={(e) => onProjectTitleChange(e.target.value)}
        className="text-sm bg-transparent border-b outline-none px-1 py-0.5 min-w-0 flex-1"
        style={{ borderColor: "var(--border)", color: "var(--text-dim)", maxWidth: 120 }}
        placeholder="Projeto"
      />
      {currentProjectId && (
        <span className="text-xs flex-shrink-0" style={{ color: "var(--success)" }}>●</span>
      )}

      {/* Status inline */}
      {statusLabel && (
        <span
          className="text-xs flex-shrink-0 font-mono"
          style={{ color: statusColor }}
        >
          {statusLabel}
        </span>
      )}

      <div className="flex-1" />

      {/* Debug step controls (when paused) */}
      {mode === "paused" && (
        <>
          <button
            onClick={onStepInto}
            className="ide-btn ide-btn-ghost text-xs px-2"
            title="Próximo passo"
          >
            ⤵
          </button>
          <button
            onClick={onContinue}
            className="ide-btn ide-btn-success text-xs px-2"
            title="Continuar"
          >
            ▶▶
          </button>
        </>
      )}

      {/* Stop button (when running/debug) */}
      {(isRunning || isDebug) && (
        <button
          onClick={onStop}
          className="ide-btn ide-btn-danger text-sm px-3 py-1.5"
          style={{ minHeight: 36 }}
        >
          ⏹
        </button>
      )}

      {/* Run button */}
      {!isRunning && !isDebug && (
        <button
          onClick={onRun}
          className="ide-btn ide-btn-primary text-sm px-4 py-1.5 font-semibold"
          style={{ minHeight: 36 }}
        >
          ▶ Executar
        </button>
      )}

      {/* Hamburger menu */}
      <div className="relative" ref={menuRef}>
        <button
          onClick={() => { setMenuOpen(!menuOpen); setSubMenu(null); }}
          className="ide-btn ide-btn-ghost text-lg px-2 py-1"
          style={{ minHeight: 36, lineHeight: 1 }}
          aria-label="Menu"
        >
          ☰
        </button>

        {menuOpen && (
          <div
            className="absolute right-0 top-full mt-1 z-50 rounded-xl border shadow-2xl py-1 w-56"
            style={{
              background: "var(--surface)",
              borderColor: "var(--border)",
            }}
          >
            {/* Main menu items */}
            {subMenu === null && (
              <>
                <button
                  onClick={() => { onSave(); setMenuOpen(false); }}
                  className="w-full text-left px-4 py-3 text-sm flex items-center gap-3"
                  style={{ color: "var(--text)" }}
                >
                  <span>💾</span> Salvar Projeto
                </button>
                <button
                  onClick={() => setSubMenu("save")}
                  className="w-full text-left px-4 py-3 text-sm flex items-center gap-3"
                  style={{ color: "var(--text)" }}
                >
                  <span>📥</span> Baixar / Copiar ›
                </button>
                <div className="border-t my-1" style={{ borderColor: "var(--border)" }} />
                <button
                  onClick={() => setSubMenu("examples")}
                  className="w-full text-left px-4 py-3 text-sm flex items-center gap-3"
                  style={{ color: "var(--text)" }}
                >
                  <span>📚</span> Exemplos ›
                </button>
                <button
                  onClick={() => setSubMenu("projects")}
                  className="w-full text-left px-4 py-3 text-sm flex items-center gap-3"
                  style={{ color: "var(--text)" }}
                >
                  <span>📁</span> Projetos ({projects.length}) ›
                </button>
                <div className="border-t my-1" style={{ borderColor: "var(--border)" }} />
                <button
                  onClick={() => { onDebug(); setMenuOpen(false); }}
                  disabled={isRunning || isDebug}
                  className="w-full text-left px-4 py-3 text-sm flex items-center gap-3 disabled:opacity-40"
                  style={{ color: "var(--text)" }}
                >
                  <span>🐞</span> Depurar
                </button>
                <button
                  onClick={() => { onShare(); setMenuOpen(false); }}
                  className="w-full text-left px-4 py-3 text-sm flex items-center gap-3"
                  style={{ color: "var(--text)" }}
                >
                  <span>🔗</span> Compartilhar
                </button>
              </>
            )}

            {/* Save submenu */}
            {subMenu === "save" && (
              <>
                <button
                  onClick={() => setSubMenu(null)}
                  className="w-full text-left px-4 py-2 text-xs flex items-center gap-2"
                  style={{ color: "var(--muted)" }}
                >
                  ‹ Voltar
                </button>
                <div className="border-t my-1" style={{ borderColor: "var(--border)" }} />
                <button onClick={() => { onDownload("por"); setMenuOpen(false); }}
                  className="w-full text-left px-4 py-3 text-sm flex items-center gap-3"
                  style={{ color: "var(--text)" }}>
                  <span>📥</span> Baixar .por
                </button>
                <button onClick={() => { onDownload("txt"); setMenuOpen(false); }}
                  className="w-full text-left px-4 py-3 text-sm flex items-center gap-3"
                  style={{ color: "var(--text)" }}>
                  <span>📥</span> Baixar .txt
                </button>
                <button onClick={() => { onCopy(); setMenuOpen(false); }}
                  className="w-full text-left px-4 py-3 text-sm flex items-center gap-3"
                  style={{ color: "var(--text)" }}>
                  <span>📋</span> Copiar Código
                </button>
              </>
            )}

            {/* Examples submenu */}
            {subMenu === "examples" && (
              <>
                <button
                  onClick={() => setSubMenu(null)}
                  className="w-full text-left px-4 py-2 text-xs flex items-center gap-2"
                  style={{ color: "var(--muted)" }}
                >
                  ‹ Voltar
                </button>
                <div
                  className="border-t my-1 max-h-72 overflow-auto"
                  style={{ borderColor: "var(--border)" }}
                >
                  {EXAMPLE_CATEGORIES.map((cat) => (
                    <div key={cat.id}>
                      <div
                        className="px-4 py-1.5 text-xs font-medium flex items-center gap-2"
                        style={{ color: "var(--accent)" }}
                      >
                        <span>{cat.icon}</span> {cat.name}
                      </div>
                      {cat.examples.map((ex) => (
                        <button
                          key={ex.title}
                          onClick={() => { onExampleSelect(ex.title); setMenuOpen(false); setSubMenu(null); }}
                          className="w-full text-left px-6 py-2 text-xs"
                          style={{ color: "var(--text)" }}
                        >
                          {ex.title}
                        </button>
                      ))}
                    </div>
                  ))}
                </div>
              </>
            )}

            {/* Projects submenu */}
            {subMenu === "projects" && (
              <>
                <button
                  onClick={() => setSubMenu(null)}
                  className="w-full text-left px-4 py-2 text-xs flex items-center gap-2"
                  style={{ color: "var(--muted)" }}
                >
                  ‹ Voltar
                </button>
                <button
                  onClick={() => { onNewProject(); setMenuOpen(false); setSubMenu(null); }}
                  className="w-full text-left px-4 py-3 text-sm flex items-center gap-2 font-medium"
                  style={{ color: "var(--accent)" }}
                >
                  + Novo Projeto
                </button>
                <div className="border-t my-1 max-h-60 overflow-auto" style={{ borderColor: "var(--border)" }}>
                  {projects.length === 0 ? (
                    <div className="px-4 py-3 text-xs" style={{ color: "var(--muted)" }}>
                      Nenhum projeto salvo
                    </div>
                  ) : (
                    projects.map((p) => (
                      <div
                        key={p.id}
                        className="flex items-center justify-between px-4 py-2.5"
                      >
                        <button
                          onClick={() => { onLoadProject(p.id); setMenuOpen(false); setSubMenu(null); }}
                          className="flex-1 text-left"
                        >
                          <div className="text-sm" style={{ color: "var(--text)" }}>{p.title}</div>
                          <div className="text-xs" style={{ color: "var(--muted)" }}>
                            {new Date(p.updatedAt).toLocaleDateString("pt-BR")}
                          </div>
                        </button>
                        <button
                          onClick={(e) => { onDeleteProject(p.id, e); }}
                          className="text-xs px-2 py-1 rounded"
                          style={{ color: "var(--error)" }}
                        >
                          ✕
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
