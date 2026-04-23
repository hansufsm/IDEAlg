"use client";

/**
 * IDEErrorPanel
 * Painel inteligente de diagnóstico de erros Portugol.
 * - Extrai linha/coluna do erro
 * - Mostra trecho do código com destaque
 * - Sugere correções automáticas para erros comuns
 * - Botão "Ir para linha"
 */

import { useMemo } from "react";
import { ConsoleLine } from "./IDEConsole";

interface IDEErrorPanelProps {
  lines: ConsoleLine[];
  code: string;
  onGoToLine?: (line: number) => void;
  onDismiss: () => void;
}

interface ParsedError {
  message: string;
  line?: number;
  column?: number;
  snippet?: string;
  suggestion?: string;
}

// Sugestões automáticas para erros comuns
const SUGGESTIONS: Array<{ pattern: RegExp; suggest: (m: RegExpMatchArray) => string }> = [
  { pattern: /fimalgoritmo/i, suggest: () => 'Verifique se o bloco termina com "fimalgoritmo"' },
  { pattern: /esperado.*"fim/i, suggest: () => 'Bloco não fechado — adicione o "fim" correspondente' },
  { pattern: /variável.*não.*declarada|variable.*not.*declared/i, suggest: (m) => `Declare a variável na seção "var" antes de "inicio"` },
  { pattern: /tipo.*incompatível|type.*mismatch/i, suggest: () => 'Verifique se os tipos são compatíveis (inteiro, real, caractere, logico)' },
  { pattern: /divisão.*por.*zero|division.*by.*zero/i, suggest: () => 'Certifique-se de que o divisor não é zero antes da operação' },
  { pattern: /índice.*fora|index.*out/i, suggest: () => 'O índice do vetor está fora dos limites declarados' },
  { pattern: /esperado.*":="|expected.*":="/i, suggest: () => 'Use ":=" para atribuição em Portugol, não "="' },
  { pattern: /esperado.*"entao"|expected.*"entao"/i, suggest: () => 'Após a condição do "se", adicione a palavra "entao"' },
  { pattern: /esperado.*"faca"|expected.*"faca"/i, suggest: () => 'Após a condição do laço, adicione a palavra "faca"' },
];

function parseError(lines: ConsoleLine[], code: string): ParsedError | null {
  const errorLine = [...lines].reverse().find((l) => l.type === "error");
  if (!errorLine) return null;

  const msg = errorLine.text;

  // Tentar extrair linha/coluna de formatos comuns
  const lineColMatch =
    msg.match(/linha\s+(\d+)(?:,?\s*coluna\s+(\d+))?/i) ||
    msg.match(/line\s+(\d+)(?:,?\s*col(?:umn)?\s+(\d+))?/i) ||
    msg.match(/\[(\d+):(\d+)\]/) ||
    msg.match(/:(\d+):(\d+)/);

  const lineNum = lineColMatch ? parseInt(lineColMatch[1]!, 10) : undefined;
  const colNum = lineColMatch && lineColMatch[2] ? parseInt(lineColMatch[2]!, 10) : undefined;

  // Extrair trecho do código
  let snippet: string | undefined;
  if (lineNum !== undefined) {
    const codeLines = code.split("\n");
    const start = Math.max(0, lineNum - 2);
    const end = Math.min(codeLines.length - 1, lineNum + 1);
    snippet = codeLines
      .slice(start, end + 1)
      .map((l, i) => `${start + i + 1 === lineNum ? "→" : " "} ${start + i + 1} │ ${l}`)
      .join("\n");
  }

  // Sugestão automática
  let suggestion: string | undefined;
  for (const s of SUGGESTIONS) {
    const m = msg.match(s.pattern);
    if (m) {
      suggestion = s.suggest(m);
      break;
    }
  }

  return { message: msg, line: lineNum, column: colNum, snippet, suggestion };
}

export function IDEErrorPanel({ lines, code, onGoToLine, onDismiss }: IDEErrorPanelProps) {
  const error = useMemo(() => parseError(lines, code), [lines, code]);

  if (!error) return null;

  return (
    <div
      className="flex-shrink-0 border-t slide-up"
      style={{
        background: "rgba(248,113,113,0.04)",
        borderColor: "rgba(248,113,113,0.25)",
        maxHeight: 200,
        overflow: "auto",
      }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-4 py-2 border-b sticky top-0"
        style={{
          background: "rgba(248,113,113,0.08)",
          borderColor: "rgba(248,113,113,0.2)",
        }}
      >
        <div className="flex items-center gap-2">
          <span style={{ color: "var(--error)", fontSize: 13, fontWeight: 600 }}>
            ✗ Erro de Execução
          </span>
          {error.line !== undefined && (
            <span
              className="text-xs px-2 py-0.5 rounded"
              style={{
                background: "rgba(248,113,113,0.15)",
                color: "var(--error)",
                fontFamily: "var(--font-mono)",
              }}
            >
              Linha {error.line}
              {error.column !== undefined ? `, Col ${error.column}` : ""}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {error.line !== undefined && onGoToLine && (
            <button
              onClick={() => onGoToLine(error.line!)}
              className="text-xs px-2 py-0.5 rounded transition-colors"
              style={{
                background: "rgba(248,113,113,0.15)",
                color: "var(--error)",
                border: "1px solid rgba(248,113,113,0.3)",
              }}
            >
              Ir para linha
            </button>
          )}
          <button
            onClick={onDismiss}
            className="text-xs"
            style={{ color: "var(--muted)" }}
          >
            ✕
          </button>
        </div>
      </div>

      {/* Error message */}
      <div className="px-4 py-2">
        <p
          className="text-xs mb-2"
          style={{
            color: "var(--error)",
            fontFamily: "var(--font-mono)",
            lineHeight: 1.6,
          }}
        >
          {error.message}
        </p>

        {/* Code snippet */}
        {error.snippet && (
          <pre
            className="text-xs rounded-lg p-3 mb-2 overflow-x-auto"
            style={{
              background: "rgba(9,9,15,0.8)",
              border: "1px solid rgba(248,113,113,0.15)",
              color: "#94a3b8",
              fontFamily: "var(--font-mono)",
              lineHeight: 1.7,
            }}
          >
            {error.snippet.split("\n").map((l, i) => (
              <div
                key={i}
                style={
                  l.startsWith("→")
                    ? {
                        color: "#fca5a5",
                        background: "rgba(248,113,113,0.1)",
                        borderLeft: "2px solid var(--error)",
                        paddingLeft: 4,
                        marginLeft: -4,
                      }
                    : {}
                }
              >
                {l}
              </div>
            ))}
          </pre>
        )}

        {/* Suggestion */}
        {error.suggestion && (
          <div
            className="flex items-start gap-2 text-xs px-3 py-2 rounded-lg"
            style={{
              background: "rgba(251,191,36,0.06)",
              border: "1px solid rgba(251,191,36,0.2)",
              color: "#fbbf24",
            }}
          >
            <span className="flex-shrink-0 mt-0.5">💡</span>
            <span>{error.suggestion}</span>
          </div>
        )}
      </div>
    </div>
  );
}
