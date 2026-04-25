"use client";

import { useEffect } from "react";
import * as monaco from "monaco-editor";
import { ParsedError } from "@/components/IDEErrorPanel";

/**
 * useEditorMarkers
 * Hook para sincronizar os erros do interpretador com a interface do Monaco Editor.
 */
export function useEditorMarkers(
  editor: monaco.editor.IStandaloneCodeEditor | null,
  error: ParsedError | null
) {
  useEffect(() => {
    if (!editor) return;
    const model = editor.getModel();
    if (!model) return;

    const markers: monaco.editor.IMarkerData[] = [];

    if (error && error.line !== undefined) {
      markers.push({
        startLineNumber: error.line,
        startColumn: error.column || 1,
        endLineNumber: error.line,
        endColumn: model.getLineMaxColumn(error.line),
        message: error.message,
        severity: monaco.MarkerSeverity.Error,
      });
    }

    // Aplica os marcadores ao modelo atual do editor
    monaco.editor.setModelMarkers(model, "portugol", markers);
  }, [editor, error]);
}