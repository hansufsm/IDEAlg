"use client";

export const dynamic = "force-dynamic";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { useState, useEffect } from "react"; 
import { useTheme } from "@/contexts/ThemeContext"; // Ajuste de importação

interface Project {
  _id: string;
  title: string;
  description?: string;
  code: string;
  updatedAt: number;
  isPublic: boolean;
}

function timeAgo(ts: number): string {
  const diff = Date.now() - ts;
  const min = Math.floor(diff / 60000);
  const h = Math.floor(diff / 3600000);
  const d = Math.floor(diff / 86400000);
  if (d > 0) return `${d}d atrás`;
  if (h > 0) return `${h}h atrás`;
  if (min > 0) return `${min}min atrás`;
  return "agora";
}

export default function ProjectsPage() {
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();
  
  const [projects, setProjects] = useState<Project[] | undefined>(undefined);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [shareLinks, setShareLinks] = useState<Record<string, string>>({});

  // Simulação de busca de dados (Substituir pela API real futuramente)
  useEffect(() => {
    const timer = setTimeout(() => setProjects([]), 800);
    return () => clearTimeout(timer);
  }, []);

  const deleteProject = async ({ projectId }: { projectId: string }) => {};
  const shareProject = async ({ projectId }: { projectId: string }) => "mock-slug";

  const ideUrl = typeof window !== "undefined" ? window.location.origin : "";

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir este projeto?")) return;
    setDeletingId(id);
    try {
      await deleteProject({ projectId: id });
    } finally {
      setDeletingId(null);
    }
  };

  const handleShare = async (id: string) => {
    const slug = await shareProject({ projectId: id });
    setShareLinks((prev) => ({ ...prev, [id]: slug }));
  };

  return (
    <div className="min-h-screen" style={{ background: "var(--bg)" }}>
      <header className="border-b px-6 py-3 flex items-center justify-between"
        style={{ borderColor: "var(--border)", background: "var(--surface)" }}>
        <Link href="/ide" className="font-mono font-bold text-lg" style={{ color: "var(--accent)" }}>
          ✦ IDEALG
        </Link>
        <div className="flex items-center gap-3">
          <button
            onClick={toggleTheme}
            className="ide-btn ide-btn-ghost p-2"
            title="Alternar Tema"
          >
            {theme.mode === "dark" ? "☀️" : "🌙"}
          </button>
          <Link href="/ide" className="ide-btn ide-btn-primary text-xs">
            + Novo Projeto
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8">
        <h1 className="text-2xl font-mono font-bold mb-6">📁 Meus Projetos</h1>

        {projects === undefined ? (
          <div className="flex justify-center py-16">
            <div className="w-7 h-7 border-2 rounded-full animate-spin"
              style={{ borderColor: "var(--accent)", borderTopColor: "transparent" }} />
          </div>
        ) : projects.length === 0 ? (
          <div className="text-center py-16 rounded-xl border"
            style={{ borderColor: "var(--border)", background: "var(--surface)" }}>
            <div className="text-5xl mb-4">💻</div>
            <p className="mb-6" style={{ color: "var(--muted)" }}>Você ainda não salvou nenhum projeto.</p>
            <Link href="/ide" className="ide-btn ide-btn-primary">
              Criar Primeiro Projeto
            </Link>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {projects.map((p) => (
              <div key={p._id} className="rounded-xl border p-5 flex flex-col gap-3"
                style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold mb-0.5">{p.title}</h3>
                    <p className="text-xs" style={{ color: "var(--muted)" }}>
                      {p.description ?? "Sem descrição"} · {timeAgo(p.updatedAt)}
                    </p>
                  </div>
                  <span className="text-xs px-2 py-0.5 rounded"
                    style={{
                      background: p.isPublic ? "rgba(34,197,94,0.15)" : "rgba(74,96,128,0.2)",
                      color: p.isPublic ? "var(--success)" : "var(--muted)",
                    }}>
                    {p.isPublic ? "Público" : "Privado"}
                  </span>
                </div>

                {/* Code preview */}
                <pre className="text-xs rounded p-3 overflow-hidden" style={{
                  background: "#020817", border: "1px solid var(--border)",
                  color: "var(--text-dim)", maxHeight: 80,
                }}>
                  {p.code.slice(0, 200)}
                </pre>

                {/* Share link shown inline */}
                {shareLinks[p._id] && (
                  <div className="flex items-center gap-2 text-xs">
                    <span style={{ color: "var(--muted)" }}>Link:</span>
                    <code className="flex-1 px-2 py-1 rounded truncate"
                      style={{ background: "var(--bg)", color: "var(--accent)" }}>
                      {ideUrl}/ide/shared/{shareLinks[p._id]}
                    </code>
                    <button onClick={() => navigator.clipboard.writeText(`${ideUrl}/ide/shared/${shareLinks[p._id]}`)}
                      style={{ color: "var(--accent)" }}>
                      📋
                    </button>
                  </div>
                )}

                <div className="flex gap-2 mt-auto">
                  <button
                    onClick={() => router.push(`/ide?project=${p._id}`)}
                    className="ide-btn ide-btn-primary flex-1 text-xs justify-center">
                    ✏️ Abrir
                  </button>
                  <button onClick={() => handleShare(p._id)} className="ide-btn ide-btn-ghost text-xs">
                    🔗
                  </button>
                  <button onClick={() => handleDelete(p._id)} disabled={deletingId === p._id}
                    className="ide-btn ide-btn-danger text-xs">
                    {deletingId === p._id ? "…" : "🗑"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
