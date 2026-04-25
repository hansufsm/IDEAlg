"use client";
import { useState, useEffect } from "react";

export function ThemeToggle() {
  const [theme, setTheme] = useState<"light" | "dark">("dark");

  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
      root.style.setProperty("--accent-primary", "#F6821F");
    } else {
      root.classList.remove("dark");
      root.style.setProperty("--accent-primary", "#0051AD"); // Azul Cloudflare para modo claro
    }
  }, [theme]);

  return (
    <div className="flex bg-slate-100 dark:bg-[#262626] p-1 rounded-full border border-slate-200 dark:border-[#3D3D3D] shadow-sm">
      <button
        onClick={() => setTheme("light")}
        className={`px-4 py-1 rounded-full text-xs font-semibold transition-all ${
          theme === "light"
            ? "bg-white text-blue-600 shadow-sm"
            : "text-slate-500 hover:text-slate-700 dark:text-slate-400"
        }`}
      >
        CLARO
      </button>
      <button
        onClick={() => setTheme("dark")}
        className={`px-4 py-1 rounded-full text-xs font-semibold transition-all ${
          theme === "dark"
            ? "bg-[#F6821F] text-white shadow-sm"
            : "text-slate-500 hover:text-slate-700 dark:text-slate-400"
        }`}
      >
        ESCURO
      </button>
    </div>
  );
}