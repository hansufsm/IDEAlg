"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import {
  execute,
  parse,
  PortugolDebugger,
  PortugolValue,
  IOInterface,
} from "portugol-interpreter";
import { ConsoleLine } from "@/components/IDEConsole";

export type RunMode =
  | "idle"
  | "running"
  | "paused"
  | "debug"
  | "finished"
  | "error";

export interface DebugState {
  currentLine: number;
  variables: Record<string, PortugolValue>;
}

export interface Project {
  id: string;
  title: string;
  code: string;
  createdAt: number;
  updatedAt: number;
}

export interface InputPrompt {
  id: number;
  prompt: string;
  value: string;
}

const STORAGE_KEY = "australis_projects";
const AUTOSAVE_INTERVAL = 30000; // 30 seconds

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
}

function loadProjects(): Project[] {
  if (typeof window === "undefined") return [];
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function saveProjects(projects: Project[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
  } catch (e) {
    console.error("Failed to save projects:", e);
  }
}

export function usePortugolRunner(initialCode: string = "") {
  const [mode, setMode] = useState<RunMode>("idle");
  const [consoleLines, setConsoleLines] = useState<ConsoleLine[]>([]);
  const [executionTimeMs, setExecutionTimeMs] = useState<number | undefined>();
  const [debugState, setDebugState] = useState<DebugState | null>(null);
  const [breakpoints, setBreakpoints] = useState<Set<number>>(new Set());
  const [pendingInput, setPendingInput] = useState<InputPrompt | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [currentProjectId, setCurrentProjectId] = useState<string | null>(null);

  const debuggerRef = useRef<PortugolDebugger | null>(null);
  const inputResolveRef = useRef<((value: string) => void) | null>(null);
  const lastSavedCodeRef = useRef<string>("");

  // Load projects from localStorage on mount
  useEffect(() => {
    setProjects(loadProjects());
  }, []);

  const appendLine = useCallback((line: ConsoleLine) => {
    setConsoleLines((prev) => [...prev, line]);
  }, []);

  const submitInput = useCallback((value: string) => {
    if (inputResolveRef.current) {
      inputResolveRef.current(value);
      inputResolveRef.current = null;
    }
    setPendingInput(null);
  }, []);

  // Build IOInterface with async input support
  const buildIO = useCallback(
    (): IOInterface => ({
      write: (text: string) => {
        const lines = text.split("\n");
        lines.forEach((chunk, i) => {
          if (chunk || i < lines.length - 1) {
            appendLine({ type: "output", text: chunk });
          }
        });
      },
      read: (prompt: string): string => {
        return new Promise<string>((resolve) => {
          setPendingInput({
            id: Date.now(),
            prompt,
            value: "",
          });
          inputResolveRef.current = resolve;
        }) as unknown as string;
      },
    }),
    [appendLine],
  );

  // Run (normal execution)
  const run = useCallback(
    async (code: string) => {
      setConsoleLines([]);
      setExecutionTimeMs(undefined);
      setDebugState(null);
      setPendingInput(null);
      setMode("running");

      const io = buildIO();
      const start = Date.now();

      try {
        const result = await execute(code, io);
        const elapsed = Date.now() - start;
        setExecutionTimeMs(elapsed);

        if (result.error) {
          appendLine({ type: "error", text: result.error });
          setMode("error");
        } else {
          appendLine({
            type: "info",
            text: `\n✓ Execução concluída em ${elapsed}ms`,
          });
          setMode("finished");
        }
      } catch (err) {
        appendLine({ type: "error", text: (err as Error).message });
        setMode("error");
      }
    },
    [buildIO, appendLine],
  );

  // Debug (step-by-step)
  const startDebug = useCallback(
    async (code: string) => {
      setConsoleLines([]);
      setExecutionTimeMs(undefined);
      setDebugState(null);
      setMode("debug");

      const io = buildIO();
      const dbg = new PortugolDebugger(io);
      debuggerRef.current = dbg;

      for (const bp of breakpoints) dbg.addBreakpoint(bp);

      dbg.on((event) => {
        if (event.type === "step" || event.type === "breakpoint") {
          setDebugState({
            currentLine: event.line ?? 0,
            variables: event.variables ?? {},
          });
          setMode("paused");
        }
        if (event.type === "finished") {
          appendLine({ type: "info", text: "\n✓ Depuração concluída" });
          setMode("finished");
          setDebugState(null);
          debuggerRef.current = null;
        }
        if (event.type === "error") {
          appendLine({
            type: "error",
            text: event.error ?? "Erro desconhecido",
          });
          setMode("error");
          debuggerRef.current = null;
        }
      });

      try {
        const program = parse(code);
        dbg.start(program);
      } catch (err) {
        appendLine({ type: "error", text: (err as Error).message });
        setMode("error");
      }
    },
    [buildIO, appendLine, breakpoints],
  );

  const stepInto = useCallback(() => {
    debuggerRef.current?.stepInto();
  }, []);

  const stepOver = useCallback(() => {
    debuggerRef.current?.stepOver();
    setMode("debug");
  }, []);

  const continueRun = useCallback(() => {
    debuggerRef.current?.continue();
    setMode("debug");
  }, []);

  const stopDebug = useCallback(() => {
    debuggerRef.current?.stop();
    debuggerRef.current = null;
    setMode("idle");
    setDebugState(null);
  }, []);

  const toggleBreakpoint = useCallback((line: number) => {
    setBreakpoints((prev) => {
      const next = new Set(prev);
      if (next.has(line)) {
        next.delete(line);
        debuggerRef.current?.removeBreakpoint(line);
      } else {
        next.add(line);
        debuggerRef.current?.addBreakpoint(line);
      }
      return next;
    });
  }, []);

  const clearConsole = useCallback(() => {
    setConsoleLines([]);
    setExecutionTimeMs(undefined);
  }, []);

  const resetMode = useCallback(() => {
    setMode("idle");
    setDebugState(null);
  }, []);

  // =============================================
  // Project Management
  // =============================================

  const createProject = useCallback(
    (title: string, code: string): string => {
      const id = generateId();
      const now = Date.now();
      const newProject: Project = {
        id,
        title,
        code,
        createdAt: now,
        updatedAt: now,
      };
      const updated = [newProject, ...projects];
      setProjects(updated);
      saveProjects(updated);
      setCurrentProjectId(id);
      lastSavedCodeRef.current = code;
      return id;
    },
    [projects],
  );

  const updateProject = useCallback(
    (id: string, code: string, title?: string) => {
      const updated = projects.map((p) =>
        p.id === id
          ? { ...p, code, title: title ?? p.title, updatedAt: Date.now() }
          : p,
      );
      setProjects(updated);
      saveProjects(updated);
      lastSavedCodeRef.current = code;
    },
    [projects],
  );

  const deleteProject = useCallback(
    (id: string) => {
      const updated = projects.filter((p) => p.id !== id);
      setProjects(updated);
      saveProjects(updated);
      if (currentProjectId === id) {
        setCurrentProjectId(null);
      }
    },
    [projects, currentProjectId],
  );

  const loadProject = useCallback(
    (id: string) => {
      const project = projects.find((p) => p.id === id);
      if (project) {
        setCurrentProjectId(id);
        lastSavedCodeRef.current = project.code;
      }
      return project;
    },
    [projects],
  );

  // =============================================
  // Download Functions
  // =============================================

  const downloadCode = useCallback(
    (code: string, filename: string, extension: string) => {
      const blob = new Blob([code], { type: "text/plain;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${filename}.${extension}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    },
    [],
  );

  const copyToClipboard = useCallback(async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      return true;
    } catch {
      return false;
    }
  }, []);

  // =============================================
  // Auto-save
  // =============================================

  const autoSave = useCallback(
    (code: string, title: string) => {
      if (code === lastSavedCodeRef.current) return;

      if (currentProjectId) {
        updateProject(currentProjectId, code, title);
      }
    },
    [currentProjectId, updateProject],
  );

  return {
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
    stepOver,
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
  };
}
