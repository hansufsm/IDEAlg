"use client";

/**
 * PortugolEditorMobile
 * Editor leve baseado em CodeMirror 6 para dispositivos touch.
 * Substitui o Monaco (que não suporta teclado virtual mobile) em telas < 768px.
 */

import { useEffect, useRef } from "react";
import { EditorView, keymap, lineNumbers, highlightActiveLine } from "@codemirror/view";
import { EditorState } from "@codemirror/state";
import { defaultKeymap, historyKeymap, history, indentWithTab } from "@codemirror/commands";
import { HighlightStyle, syntaxHighlighting, StreamLanguage } from "@codemirror/language";
import { tags } from "@lezer/highlight";

// ─── Portugol StreamLanguage ─────────────────────────────────────────────────

const KEYWORDS = new Set([
  "algoritmo","fimalgoritmo","var","inicio","fimse","se","entao","senao",
  "para","ate","faca","fimpara","enquanto","fimenquanto","repita","ate",
  "procedimento","fimprocedimento","funcao","fimfuncao","retorne",
  "escreva","escreval","leia","verdadeiro","falso","nao","e","ou","xou",
  "inteiro","real","caractere","logico","vetor","matriz","registro","fimregistro",
  "tipo","de","caso","fimcaso","seja","outrocaso","interrompa","mod","div",
]);

const BUILTINS = new Set([
  "abs","arccos","arcsen","arctan","compr","copia","cos","exp","grauprad",
  "int","log","logn","maiusc","minusc","numpcarac","pos","potencia",
  "quadrado","radpgrau","raizq","rand","randi","sen","tan","xou",
]);

const portugolStreamLang = StreamLanguage.define({
  name: "portugol",
  token(stream) {
    if (stream.eatSpace()) return null;

    // Line comment
    if (stream.match("//")) {
      stream.skipToEnd();
      return "comment";
    }

    // Block comment
    if (stream.match("{")) {
      while (!stream.eol()) {
        if (stream.next() === "}") break;
      }
      return "comment";
    }

    // String
    if (stream.match('"')) {
      while (!stream.eol()) {
        const ch = stream.next();
        if (ch === '"') break;
      }
      return "string";
    }

    // Number
    if (stream.match(/^-?[0-9]+(\.[0-9]+)?/)) return "number";

    // Operator / punctuation
    if (stream.match(/^(:=|<-|<=|>=|<>|[+\-*/<>=,;:()\[\]])/)) return "operator";

    // Identifier / keyword
    if (stream.match(/^[a-zA-ZÀ-ú_][a-zA-ZÀ-ú0-9_]*/)) {
      const word = stream.current().toLowerCase();
      if (KEYWORDS.has(word)) return "keyword";
      if (BUILTINS.has(word)) return "builtin";
      return "variableName";
    }

    stream.next();
    return null;
  },
});

// ─── Theme ───────────────────────────────────────────────────────────────────

const australisDark = EditorView.theme(
  {
    "&": {
      color: "#e2e8f0",
      backgroundColor: "#09090f",
      height: "100%",
      fontSize: "14px",
      fontFamily: "'JetBrains Mono', 'Fira Code', 'Cascadia Code', monospace",
    },
    ".cm-content": { caretColor: "#a78bfa", padding: "8px 0" },
    ".cm-cursor": { borderLeftColor: "#a78bfa", borderLeftWidth: "2px" },
    ".cm-selectionBackground, ::selection": {
      backgroundColor: "rgba(167,139,250,0.25) !important",
    },
    ".cm-activeLine": { backgroundColor: "rgba(167,139,250,0.07)" },
    ".cm-gutters": {
      backgroundColor: "#09090f",
      color: "#475569",
      border: "none",
      borderRight: "1px solid rgba(255,255,255,0.06)",
      minWidth: "40px",
    },
    ".cm-lineNumbers .cm-gutterElement": { paddingRight: "12px" },
    ".cm-scroller": { overflow: "auto", WebkitOverflowScrolling: "touch" },
    // Touch: larger tap targets
    ".cm-line": { lineHeight: "1.7" },
  },
  { dark: true },
);

const australisHighlight = HighlightStyle.define([
  { tag: tags.keyword,         color: "#a78bfa", fontWeight: "bold" },
  { tag: tags.function(tags.variableName), color: "#38bdf8" },
  { tag: tags.string,          color: "#86efac" },
  { tag: tags.number,          color: "#fb923c" },
  { tag: tags.comment,         color: "#475569", fontStyle: "italic" },
  { tag: tags.operator,        color: "#f472b6" },
  { tag: tags.variableName,    color: "#e2e8f0" },
]);

// ─── Component ───────────────────────────────────────────────────────────────

interface Props {
  value: string;
  onChange: (value: string) => void;
  currentLine?: number;
  readOnly?: boolean;
}

export function PortugolEditorMobile({ value, onChange, currentLine, readOnly = false }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<EditorView | null>(null);

  // Create editor once
  useEffect(() => {
    if (!containerRef.current) return;

    const startState = EditorState.create({
      doc: value,
      extensions: [
        history(),
        lineNumbers(),
        highlightActiveLine(),
        keymap.of([...defaultKeymap, ...historyKeymap, indentWithTab]),
        portugolStreamLang,
        syntaxHighlighting(australisHighlight),
        australisDark,
        EditorView.lineWrapping,
        EditorState.readOnly.of(readOnly),
        EditorView.updateListener.of((update) => {
          if (update.docChanged) {
            onChange(update.state.doc.toString());
          }
        }),
      ],
    });

    const view = new EditorView({ state: startState, parent: containerRef.current });
    viewRef.current = view;

    return () => {
      view.destroy();
      viewRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sync external value changes (e.g. loading an example)
  useEffect(() => {
    const view = viewRef.current;
    if (!view) return;
    const current = view.state.doc.toString();
    if (current !== value) {
      view.dispatch({
        changes: { from: 0, to: current.length, insert: value },
      });
    }
  }, [value]);

  // Highlight current debug line
  useEffect(() => {
    const view = viewRef.current;
    if (!view || !currentLine) return;
    const line = view.state.doc.line(Math.min(currentLine, view.state.doc.lines));
    view.dispatch({ selection: { anchor: line.from } });
    view.scrollDOM.scrollTop =
      view.lineBlockAt(line.from).top - view.scrollDOM.clientHeight / 2;
  }, [currentLine]);

  return (
    <div
      ref={containerRef}
      style={{
        height: "100%",
        overflow: "hidden",
        background: "#09090f",
      }}
    />
  );
}
