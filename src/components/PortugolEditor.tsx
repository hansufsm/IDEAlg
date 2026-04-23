"use client";

import { useEffect, useRef, useState } from "react";
import Editor, { Monaco, OnMount } from "@monaco-editor/react";
import {
  PORTUGOL_KEYWORDS,
  PORTUGOL_BUILTIN_FUNCTIONS,
  PORTUGOL_MONARCH_LANGUAGE,
} from "portugol-interpreter";

interface PortugolEditorProps {
  value: string;
  onChange: (value: string) => void;
  breakpoints?: Set<number>;
  onBreakpointToggle?: (line: number) => void;
  currentLine?: number;
  readOnly?: boolean;
}

const THEME_NAME = "australis-dark";
const LANG_ID = "portugol";

export function PortugolEditor({
  value,
  onChange,
  breakpoints = new Set(),
  onBreakpointToggle,
  currentLine,
  readOnly = false,
}: PortugolEditorProps) {
  const monacoRef = useRef<Monaco | null>(null);
  const editorRef = useRef<any>(null);
  const decorationsRef = useRef<string[]>([]);
  const [cursorPosition, setCursorPosition] = useState({ line: 1, column: 1 });

  const handleMount: OnMount = (editor, monaco) => {
    editorRef.current = editor;
    monacoRef.current = monaco;

    // Register language
    if (!monaco.languages.getLanguages().find((l) => l.id === LANG_ID)) {
      monaco.languages.register({
        id: LANG_ID,
        extensions: [".por", ".portugol"],
      });
      monaco.languages.setMonarchTokensProvider(
        LANG_ID,
        PORTUGOL_MONARCH_LANGUAGE as any,
      );

      // Auto-complete
      monaco.languages.registerCompletionItemProvider(LANG_ID, {
        provideCompletionItems: (model, position) => {
          const word = model.getWordUntilPosition(position);
          const range = {
            startLineNumber: position.lineNumber,
            endLineNumber: position.lineNumber,
            startColumn: word.startColumn,
            endColumn: word.endColumn,
          };
          const suggestions = [
            ...PORTUGOL_KEYWORDS.map((kw) => ({
              label: kw,
              kind: monaco.languages.CompletionItemKind.Keyword,
              insertText: kw,
              range,
            })),
            ...PORTUGOL_BUILTIN_FUNCTIONS.map((fn) => ({
              label: fn,
              kind: monaco.languages.CompletionItemKind.Function,
              insertText: `${fn}($0)`,
              insertTextRules:
                monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
              range,
            })),
            // Snippets
            {
              label: "algoritmo",
              kind: monaco.languages.CompletionItemKind.Snippet,
              insertText:
                'algoritmo "${1:nome}"\nvar\n\t${2}\ninicio\n\t${3}\nfimalgoritmo',
              insertTextRules:
                monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
              documentation: "Estrutura básica de algoritmo",
              range,
            },
            {
              label: "se",
              kind: monaco.languages.CompletionItemKind.Snippet,
              insertText: "se ${1:condicao} entao\n\t${2}\nfimse",
              insertTextRules:
                monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
              range,
            },
            {
              label: "para",
              kind: monaco.languages.CompletionItemKind.Snippet,
              insertText:
                "para ${1:i} de ${2:1} ate ${3:10} faca\n\t${4}\nfimpara",
              insertTextRules:
                monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
              range,
            },
            {
              label: "enquanto",
              kind: monaco.languages.CompletionItemKind.Snippet,
              insertText: "enquanto ${1:condicao} faca\n\t${2}\nfimenquanto",
              insertTextRules:
                monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
              range,
            },
            {
              label: "procedimento",
              kind: monaco.languages.CompletionItemKind.Snippet,
              insertText:
                "procedimento ${1:nome}(${2})\ninicio\n\t${3}\nfimprocedimento",
              insertTextRules:
                monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
              range,
            },
            {
              label: "funcao",
              kind: monaco.languages.CompletionItemKind.Snippet,
              insertText:
                "funcao ${1:nome}(${2}): ${3:inteiro}\ninicio\n\tretorne ${4}\nfimfuncao",
              insertTextRules:
                monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
              range,
            },
          ];
          return { suggestions };
        },
      });
    }

    // Register theme – Antigravity palette
    monaco.editor.defineTheme(THEME_NAME, {
      base: "vs-dark",
      inherit: true,
      rules: [
        { token: "keyword", foreground: "a78bfa", fontStyle: "bold" },
        {
          token: "support.function",
          foreground: "38bdf8",
          fontStyle: "italic",
        },
        { token: "string", foreground: "86efac" },
        { token: "number", foreground: "fbbf24" },
        { token: "number.float", foreground: "fbbf24" },
        { token: "comment", foreground: "4b5563", fontStyle: "italic" },
        { token: "operator", foreground: "f472b6" },
        { token: "delimiter", foreground: "94a3b8" },
        { token: "identifier", foreground: "e2e8f0" },
      ],
      colors: {
        "editor.background": "#09090f",
        "editor.foreground": "#e2e8f0",
        "editorLineNumber.foreground": "#2a2a45",
        "editorLineNumber.activeForeground": "#a78bfa",
        "editor.lineHighlightBackground": "#11111d",
        "editor.selectionBackground": "#60a5fa55",
        "editor.inactiveSelectionBackground": "#60a5fa33",
        "editor.selectionHighlightBackground": "#60a5fa22",
        "editorCursor.foreground": "#a78bfa",
        "editor.findMatchBackground": "#f472b630",
        "editor.findMatchHighlightBackground": "#f472b618",
        "editorGutter.background": "#09090f",
        "editorWidget.background": "#11111d",
        "editorWidget.border": "#2a2a45",
        "input.background": "#09090f",
        "input.border": "#2a2a45",
        "scrollbarSlider.background": "#2a2a4540",
        "scrollbarSlider.hoverBackground": "#a78bfa40",
        "scrollbarSlider.activeBackground": "#a78bfa60",
      },
    });
    monaco.editor.setTheme(THEME_NAME);

    // Breakpoint toggle on gutter click
    editor.onMouseDown((e: any) => {
      if (
        e.target.type === monaco.editor.MouseTargetType.GUTTER_GLYPH_MARGIN ||
        e.target.type === monaco.editor.MouseTargetType.GUTTER_LINE_NUMBERS
      ) {
        const line = e.target.position?.lineNumber;
        if (line && onBreakpointToggle) onBreakpointToggle(line);
      }
    });

    // Cursor position tracking
    editor.onDidChangeCursorPosition((e: any) => {
      setCursorPosition({
        line: e.position.lineNumber,
        column: e.position.column,
      });
    });
  };

  // Update decorations for breakpoints and current debug line
  useEffect(() => {
    const editor = editorRef.current;
    const monaco = monacoRef.current;
    if (!editor || !monaco) return;

    const newDecorations: any[] = [];

    for (const bp of breakpoints) {
      newDecorations.push({
        range: new monaco.Range(bp, 1, bp, 1),
        options: {
          isWholeLine: true,
          className: "breakpoint-line",
          glyphMarginClassName: "breakpoint-glyph",
          glyphMarginHoverMessage: { value: "Breakpoint" },
        },
      });
    }

    if (currentLine !== undefined && currentLine > 0) {
      newDecorations.push({
        range: new monaco.Range(currentLine, 1, currentLine, 1),
        options: {
          isWholeLine: true,
          className: "debug-current-line",
          glyphMarginClassName: "debug-arrow",
        },
      });
      editor.revealLineInCenter(currentLine);
    }

    decorationsRef.current = editor.deltaDecorations(
      decorationsRef.current,
      newDecorations,
    );
  }, [breakpoints, currentLine]);

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="flex-1 overflow-hidden">
        <Editor
          height="100%"
          language={LANG_ID}
          value={value}
          theme={THEME_NAME}
          onChange={(v) => onChange(v ?? "")}
          onMount={handleMount}
          options={{
            fontSize: 13.5,
            fontFamily:
              "'JetBrains Mono', 'Fira Code', 'Cascadia Code', monospace",
            fontLigatures: true,
            lineNumbers: "on",
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            wordWrap: "on",
            tabSize: 3,
            insertSpaces: true,
            automaticLayout: true,
            glyphMargin: true,
            folding: true,
            lineDecorationsWidth: 8,
            renderLineHighlight: "line",
            readOnly,
            padding: { top: 12, bottom: 12 },
            suggest: { showKeywords: true, showFunctions: true },
            quickSuggestions: true,
            bracketPairColorization: { enabled: true },
          }}
        />
      </div>
      <div
        className="flex items-center justify-end gap-4 px-4 py-1 border-t flex-shrink-0 text-xs"
        style={{
          background: "var(--surface)",
          borderColor: "var(--border)",
          color: "var(--muted)",
        }}
      >
        <span>
          Ln {cursorPosition.line}, Col {cursorPosition.column}
        </span>
      </div>
    </div>
  );
}
