"use client";

import { PortugolValue, PortugolArray, PortugolRecord } from "portugol-interpreter";

interface VariableInspectorProps {
  variables: Record<string, PortugolValue>;
  currentLine: number;
}

function formatValue(v: PortugolValue): { display: string; type: string } {
  if (v === null) return { display: "nulo", type: "nulo" };
  if (typeof v === "boolean") return { display: v ? "VERDADEIRO" : "FALSO", type: "logico" };
  if (typeof v === "number") {
    return {
      display: Number.isInteger(v) ? String(v) : v.toFixed(6).replace(/\.?0+$/, ""),
      type: Number.isInteger(v) ? "inteiro" : "real",
    };
  }
  if (typeof v === "string") return { display: `"${v}"`, type: "caractere" };
  if ((v as PortugolArray).__type === "array") {
    const arr = v as PortugolArray;
    return { display: `[${arr.data.slice(0, 8).map(x => formatValue(x).display).join(", ")}${arr.data.length > 8 ? "…" : ""}]`, type: `vetor[${arr.dims.join("×")}]` };
  }
  if ((v as PortugolRecord).__type === "record") {
    const rec = v as PortugolRecord;
    return { display: `{${Object.keys(rec.fields).slice(0, 3).join(", ")}}`, type: rec.typeName };
  }
  return { display: String(v), type: "?" };
}

export function VariableInspector({ variables, currentLine }: VariableInspectorProps) {
  const entries = Object.entries(variables);

  return (
    <div className="h-full flex flex-col" style={{ background: "var(--surface)" }}>
      <div className="px-4 py-2 border-b flex items-center justify-between"
        style={{ borderColor: "var(--border)" }}>
        <span className="text-xs font-mono font-bold" style={{ color: "var(--accent)" }}>
          🔍 VARIÁVEIS
        </span>
        <span className="text-xs mono px-2 py-0.5 rounded"
          style={{ background: "rgba(0,212,255,0.1)", color: "var(--accent)" }}>
          linha {currentLine}
        </span>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {entries.length === 0 ? (
          <p className="text-xs" style={{ color: "var(--muted)" }}>Nenhuma variável no escopo.</p>
        ) : (
          <div className="space-y-1">
            {entries.map(([name, value]) => {
              const { display, type } = formatValue(value);
              const isArray = value !== null && typeof value === "object" && (value as PortugolArray).__type === "array";
              const isRecord = value !== null && typeof value === "object" && (value as PortugolRecord).__type === "record";

              return (
                <div key={name}>
                  <div className="var-row">
                    <span className="var-name">{name}</span>
                    <span className="var-type">{type}</span>
                    <span className="var-value">{isArray || isRecord ? "" : display}</span>
                  </div>

                  {/* Expand arrays */}
                  {isArray && (
                    <div className="pl-4 mt-1 mb-2">
                      {(value as PortugolArray).data.slice(0, 20).map((item, idx) => (
                        <div key={idx} className="var-row" style={{ fontSize: 11 }}>
                          <span style={{ color: "var(--muted)", fontFamily: "monospace", minWidth: 60 }}>
                            [{idx + (value as PortugolArray).low[0]!}]
                          </span>
                          <span className="var-value">{formatValue(item).display}</span>
                        </div>
                      ))}
                      {(value as PortugolArray).data.length > 20 && (
                        <div className="text-xs" style={{ color: "var(--muted)" }}>
                          … {(value as PortugolArray).data.length - 20} mais
                        </div>
                      )}
                    </div>
                  )}

                  {/* Expand records */}
                  {isRecord && (
                    <div className="pl-4 mt-1 mb-2">
                      {Object.entries((value as PortugolRecord).fields).map(([fname, fval]) => (
                        <div key={fname} className="var-row" style={{ fontSize: 11 }}>
                          <span style={{ color: "#7ab8ff", fontFamily: "monospace", minWidth: 80 }}>
                            .{fname}
                          </span>
                          <span className="var-value">{formatValue(fval).display}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
