"use client";

import { ReactNode } from "react";
import { ThemeProvider } from "./ThemeContext";

/**
 * AppProvider
 * Wrapper central para todos os contextos da aplicação.
 */
export function AppProvider({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
      {children}
    </ThemeProvider>
  );
}