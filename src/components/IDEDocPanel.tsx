"use client";

/**
 * IDEDocPanel
 * Painel de documentação inline das funções built-in do Portugol.
 * - Mostra doc da função sob o cursor
 * - Lista todas as funções com exemplos
 * - Referência rápida de sintaxe
 */

import { useState } from "react";

interface DocEntry {
  name: string;
  signature: string;
  returns: string;
  description: string;
  example: string;
  category: string;
}

const DOCS: DocEntry[] = [
  // Matemáticas
  { name: "abs", signature: "abs(x: real): real", returns: "real", description: "Retorna o valor absoluto de x.", example: "abs(-5) → 5", category: "Matemática" },
  { name: "arccos", signature: "arccos(x: real): real", returns: "real", description: "Arco cosseno de x (em radianos).", example: "arccos(1) → 0", category: "Matemática" },
  { name: "arcsen", signature: "arcsen(x: real): real", returns: "real", description: "Arco seno de x (em radianos).", example: "arcsen(0) → 0", category: "Matemática" },
  { name: "arctan", signature: "arctan(x: real): real", returns: "real", description: "Arco tangente de x (em radianos).", example: "arctan(1) → 0.785...", category: "Matemática" },
  { name: "cos", signature: "cos(x: real): real", returns: "real", description: "Cosseno de x (em radianos).", example: "cos(0) → 1", category: "Matemática" },
  { name: "cotan", signature: "cotan(x: real): real", returns: "real", description: "Cotangente de x.", example: "cotan(1) → 0.642...", category: "Matemática" },
  { name: "exp", signature: "exp(x: real): real", returns: "real", description: "Exponencial e^x.", example: "exp(1) → 2.718...", category: "Matemática" },
  { name: "int", signature: "int(x: real): inteiro", returns: "inteiro", description: "Trunca x para inteiro.", example: "int(3.9) → 3", category: "Matemática" },
  { name: "log", signature: "log(x: real): real", returns: "real", description: "Logaritmo natural de x.", example: "log(1) → 0", category: "Matemática" },
  { name: "logn", signature: "logn(x: real, b: real): real", returns: "real", description: "Logaritmo de x na base b.", example: "logn(100, 10) → 2", category: "Matemática" },
  { name: "pi", signature: "pi(): real", returns: "real", description: "Retorna o valor de π (3.14159...).", example: "pi() → 3.14159...", category: "Matemática" },
  { name: "potencia", signature: "potencia(b: real, e: real): real", returns: "real", description: "Retorna b elevado a e.", example: "potencia(2, 10) → 1024", category: "Matemática" },
  { name: "quad", signature: "quad(x: real): real", returns: "real", description: "Retorna x².", example: "quad(4) → 16", category: "Matemática" },
  { name: "raizq", signature: "raizq(x: real): real", returns: "real", description: "Raiz quadrada de x.", example: "raizq(9) → 3", category: "Matemática" },
  { name: "sen", signature: "sen(x: real): real", returns: "real", description: "Seno de x (em radianos).", example: "sen(0) → 0", category: "Matemática" },
  { name: "tan", signature: "tan(x: real): real", returns: "real", description: "Tangente de x (em radianos).", example: "tan(0) → 0", category: "Matemática" },
  // Strings
  { name: "compr", signature: "compr(s: caractere): inteiro", returns: "inteiro", description: "Retorna o comprimento da string s.", example: 'compr("abc") → 3', category: "Texto" },
  { name: "copia", signature: "copia(s: caractere, i: inteiro, n: inteiro): caractere", returns: "caractere", description: "Retorna n caracteres de s a partir da posição i.", example: 'copia("abcde", 2, 3) → "bcd"', category: "Texto" },
  { name: "maiusc", signature: "maiusc(s: caractere): caractere", returns: "caractere", description: "Converte s para maiúsculas.", example: 'maiusc("abc") → "ABC"', category: "Texto" },
  { name: "minusc", signature: "minusc(s: caractere): caractere", returns: "caractere", description: "Converte s para minúsculas.", example: 'minusc("ABC") → "abc"', category: "Texto" },
  { name: "numpcarac", signature: "numpcarac(n: real): caractere", returns: "caractere", description: "Converte número para string.", example: 'numpcarac(42) → "42"', category: "Texto" },
  { name: "caracpnum", signature: "caracpnum(s: caractere): real", returns: "real", description: "Converte string para número.", example: 'caracpnum("3.14") → 3.14', category: "Texto" },
  { name: "pos", signature: "pos(sub: caractere, s: caractere): inteiro", returns: "inteiro", description: "Retorna a posição de sub em s (0 se não encontrado).", example: 'pos("bc", "abcd") → 2', category: "Texto" },
  { name: "concat", signature: "concat(a: caractere, b: caractere): caractere", returns: "caractere", description: "Concatena as strings a e b.", example: 'concat("Olá", " Mundo") → "Olá Mundo"', category: "Texto" },
  // Aleatoriedade
  { name: "aleatorio", signature: "aleatorio(a: inteiro, b: inteiro): inteiro", returns: "inteiro", description: "Retorna um inteiro aleatório entre a e b (inclusive).", example: "aleatorio(1, 6) → 4", category: "Aleatoriedade" },
  { name: "aleatorio", signature: "aleatorio(): real", returns: "real", description: "Retorna um real aleatório entre 0 e 1.", example: "aleatorio() → 0.732...", category: "Aleatoriedade" },
  // Tipos
  { name: "real_para_inteiro", signature: "real_para_inteiro(x: real): inteiro", returns: "inteiro", description: "Converte real para inteiro (trunca).", example: "real_para_inteiro(3.7) → 3", category: "Conversão" },
  { name: "inteiro_para_real", signature: "inteiro_para_real(x: inteiro): real", returns: "real", description: "Converte inteiro para real.", example: "inteiro_para_real(5) → 5.0", category: "Conversão" },
];

const SYNTAX_REF = [
  { label: "Estrutura básica", code: `algoritmo "Nome"\nvar\n  x: inteiro\ninicio\n  escreval("Olá!")\nfimalgoritmo` },
  { label: "Se/Senão", code: `se x > 0 entao\n  escreval("positivo")\nsenao\n  escreval("não positivo")\nfimse` },
  { label: "Para", code: `para i de 1 ate 10 faca\n  escreval(i)\nfimpara` },
  { label: "Enquanto", code: `enquanto x > 0 faca\n  x := x - 1\nfimenquanto` },
  { label: "Repita", code: `repita\n  leia(x)\nate x > 0` },
  { label: "Procedimento", code: `procedimento saudacao(nome: caractere)\ninicio\n  escreval("Olá, ", nome)\nfimprocedimento` },
  { label: "Função", code: `funcao dobro(x: inteiro): inteiro\ninicio\n  retorne x * 2\nfimfuncao` },
  { label: "Vetor", code: `var\n  v: vetor[1..10] de inteiro\ninicio\n  v[1] := 42` },
];

const CATEGORIES = [...new Set(DOCS.map((d) => d.category))];

export function IDEDocPanel() {
  const [tab, setTab] = useState<"functions" | "syntax">("functions");
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("Todos");
  const [expanded, setExpanded] = useState<string | null>(null);

  const filtered = DOCS.filter((d) => {
    const matchSearch =
      !search ||
      d.name.toLowerCase().includes(search.toLowerCase()) ||
      d.description.toLowerCase().includes(search.toLowerCase());
    const matchCat = selectedCategory === "Todos" || d.category === selectedCategory;
    return matchSearch && matchCat;
  });

  // Deduplicate by name+category
  const seen = new Set<string>();
  const unique = filtered.filter((d) => {
    const key = `${d.name}-${d.category}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  return (
    <div
      className="h-full flex flex-col"
      style={{ background: "var(--bg-panel)", color: "var(--text-main)", fontFamily: "var(--font-mono)" }}
    >
      {/* Header */}
      <div
        className="px-3 py-2 border-b flex-shrink-0"
        style={{ borderColor: "var(--border-color)" }}
      >
        <span
          className="text-xs font-bold"
          style={{ color: "var(--accent-primary)", letterSpacing: "0.05em" }}
        >
          📖 DOCUMENTAÇÃO
        </span>
      </div>

      {/* Tabs */}
      <div
        className="flex border-b flex-shrink-0"
        style={{ borderColor: "var(--border-color)" }}
      >
        {(["functions", "syntax"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className="flex-1 py-1.5 text-xs transition-colors"
            style={{
              color: tab === t ? "var(--accent-primary)" : "var(--muted)",
              borderBottom: tab === t ? "2px solid var(--accent-primary)" : "2px solid transparent",
              background: "transparent",
            }}
          >
            {t === "functions" ? "Funções" : "Sintaxe"}
          </button>
        ))}
      </div>

      {tab === "functions" ? (
        <>
          {/* Search */}
          <div className="px-2 py-1.5 border-b flex-shrink-0" style={{ borderColor: "var(--border-color)" }}>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar função…"
              className="w-full text-xs rounded px-2 py-1 outline-none"
              style={{
                background: "var(--bg-input)",
                border: "1px solid var(--border-color)",
                color: "var(--text-main)",
                fontFamily: "var(--font-mono)",
              }}
            />
          </div>

          {/* Category filter */}
          <div className="flex gap-1 px-2 py-1 overflow-x-auto flex-shrink-0" style={{ borderBottom: "1px solid var(--border-color)" }}>
            {["Todos", ...CATEGORIES].map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className="text-xs px-2 py-0.5 rounded flex-shrink-0 transition-colors"
                style={{
                  background:
                    selectedCategory === cat
                      ? "var(--accent-faded)"
                      : "transparent",
                  color:
                    selectedCategory === cat ? "var(--accent-primary)" : "var(--muted)",
                  border:
                    selectedCategory === cat
                      ? "1px solid var(--accent-border)"
                      : "1px solid transparent",
                }}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Functions list */}
          <div className="flex-1 overflow-y-auto p-2 space-y-1" style={{ minHeight: 0 }}>
            {unique.map((doc) => (
              <div
                key={`${doc.name}-${doc.signature}`}
                className="rounded-lg overflow-hidden"
                style={{
                  border: "1px solid var(--border-color)",
                  background: "var(--bg-card)",
                }}
              >
                <button
                  className="w-full flex items-center justify-between px-3 py-2 text-left"
                  onClick={() =>
                    setExpanded((prev) =>
                      prev === doc.signature ? null : doc.signature,
                    )
                  }
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span
                      className="text-xs font-bold flex-shrink-0"
                      style={{ color: "var(--accent-primary)" }}
                    >
                      {doc.name}
                    </span>
                    <span
                      className="text-xs truncate"
                      style={{ color: "var(--muted)", fontSize: 10 }}
                    >
                      {doc.signature.replace(doc.name, "")}
                    </span>
                  </div>
                  <span
                    className="text-xs flex-shrink-0 ml-1"
                    style={{ color: "var(--muted)" }}
                  >
                    {expanded === doc.signature ? "▲" : "▼"}
                  </span>
                </button>
                {expanded === doc.signature && (
                  <div
                    className="px-3 pb-3 space-y-2"
                    style={{ borderTop: "1px solid var(--border-color)" }}
                  >
                    <p
                      className="text-xs mt-2"
                      style={{ color: "var(--muted)", lineHeight: 1.6 }}
                    >
                      {doc.description}
                    </p>
                    <div
                      className="rounded px-2 py-1.5"
                      style={{
                        background: "var(--bg-code-block)",
                        border: "1px solid var(--border-color)",
                      }}
                    >
                      <div
                        className="text-xs"
                        style={{ color: "#86efac", fontFamily: "var(--font-mono)" }}
                      >
                        {doc.example}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </>
      ) : (
        /* Syntax reference */
        <div className="flex-1 overflow-y-auto p-2 space-y-2" style={{ minHeight: 0 }}>
          {SYNTAX_REF.map((item) => (
            <div
              key={item.label}
              className="rounded-lg overflow-hidden"
              style={{
                border: "1px solid var(--border)",
                background: "rgba(9,9,15,0.4)",
              }}
            >
              <div
                className="px-3 py-1.5 text-xs font-bold"
                style={{
                  color: "var(--accent)",
                  borderBottom: "1px solid var(--border)",
                  background: "rgba(167,139,250,0.04)",
                }}
              >
                {item.label}
              </div>
              <pre
                className="px-3 py-2 text-xs overflow-x-auto"
                style={{
                  color: "#94a3b8",
                  fontFamily: "var(--font-mono)",
                  lineHeight: 1.7,
                  margin: 0,
                }}
              >
                {item.code}
              </pre>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
