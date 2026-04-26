"use client";
import { useTheme } from "@/contexts/ThemeContext";

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="flex items-center gap-1 bg-white/5 dark:bg-white/5 p-1 rounded-lg border border-white/10">
      <button
        onClick={() => {
          if (theme.mode !== "light") toggleTheme();
        }}
        className={`px-2 py-1 rounded text-xs font-medium transition-all flex items-center gap-1 ${
          theme.mode === "light"
            ? "bg-white/20 text-slate-900 dark:text-white"
            : "text-slate-500 hover:text-slate-400"
        }`}
        title="Tema claro"
      >
        ☀️
      </button>
      <button
        onClick={() => {
          if (theme.mode !== "dark") toggleTheme();
        }}
        className={`px-2 py-1 rounded text-xs font-medium transition-all flex items-center gap-1 ${
          theme.mode === "dark"
            ? "bg-white/20 text-white"
            : "text-slate-500 hover:text-slate-400"
        }`}
        title="Tema escuro"
      >
        🌙
      </button>
    </div>
  );
}