"use client";

import dynamicImport from "next/dynamic";
import Link from "next/link";
import { use } from "react";
import { IDEConsole } from "@/components/IDEConsole";
import { usePortugolRunner } from "@/lib/usePortugolRunner";

const PortugolEditor = dynamicImport(
  () => import("@/components/PortugolEditor").then((m) => m.PortugolEditor),
  { ssr: false }
);

export default function SharedProjectPage({
  params,
}: { params: Promise<{ shareSlug: string }> }) {
  const { shareSlug } = use(params);
  // Mock data for Convex removal
  const project: any = null;
  const { mode, consoleLines, executionTimeMs, run, clearConsole, resetMode } =
    usePortugolRunner();

  if (project === undefined) {
    return (
      <div className="h-screen flex items-center justify-center" style={{ background: "var(--bg)" }}>
        <div className="w-7 h-7 border-2 rounded-full animate-spin"
          style={{ borderColor: "var(--accent)", borderTopColor: "transparent" }} />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="h-screen flex items-center justify-center" style={{ background: "var(--bg)" }}>
        <div className="text-center">
          <div className="text-5xl mb-4">🔍</div>
          <p style={{ color: "var(--muted)" }}>Projeto não encontrado ou link inválido.</p>
          <Link href="/ide" className="inline-block mt-4 ide-btn ide-btn-primary">
            Ir para a IDE
          </Link>
        </div>
      </div>
    );
  }

  const handleRun = () => {
    resetMode();
    run(project.code);
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden" style={{ background: "var(--bg)" }}>
      {/* Toolbar */}
      <header className="flex items-center gap-3 px-4 py-2 border-b flex-shrink-0"
        style={{ borderColor: "var(--border)", background: "var(--surface)" }}>
        <Link href="/ide" className="font-mono font-bold text-sm mr-2" style={{ color: "var(--accent)" }}>
          ✦ AUSTRALIS IDE
        </Link>

        <div className="w-px h-5" style={{ background: "var(--border)" }} />

        <span className="text-sm font-medium">{project.title}</span>
        <span className="text-xs px-2 py-0.5 rounded" style={{ background: "rgba(255,107,53,0.15)", color: "var(--accent2)" }}>
          somente leitura
        </span>

        <div className="flex-1" />

        <button onClick={handleRun} disabled={mode === "running"}
          className="ide-btn ide-btn-primary">
          ▶ Executar
        </button>

        <Link href="/ide" className="ide-btn ide-btn-ghost text-xs">
          Abrir IDE
        </Link>
      </header>

      {/* Main */}
      <div className="flex flex-1 overflow-hidden">
        <div className="flex flex-col" style={{ width: "60%", borderRight: "1px solid var(--border)" }}>
          <PortugolEditor
            value={project.code}
            onChange={() => {}}
            readOnly={true}
          />
        </div>

        <div className="flex flex-col" style={{ width: "40%" }}>
          <IDEConsole
            lines={consoleLines}
            onClear={clearConsole}
            executionTimeMs={executionTimeMs}
          />
        </div>
      </div>
    </div>
  );
}
