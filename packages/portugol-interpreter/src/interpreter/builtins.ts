// ============================================================
// AUSTRALIS – Portugol Funções Pré-definidas (stdlib)
// Compatível com VisualG 2.0
// ============================================================

import { PortugolValue, RuntimeError, toNumber, toString } from "./environment";

export type BuiltinFn = (args: PortugolValue[], line?: number) => PortugolValue;

export const BUILTINS: Record<string, BuiltinFn> = {
  // ---- Matemáticas ----
  abs: ([x], line) => Math.abs(toNumber(x ?? null, line)),
  arccos: ([x], line) => Math.acos(toNumber(x ?? null, line)),
  arcsen: ([x], line) => Math.asin(toNumber(x ?? null, line)),
  arctan: ([x], line) => Math.atan(toNumber(x ?? null, line)),
  cos: ([x], line) => Math.cos(toNumber(x ?? null, line)),
  cotan: ([x], line) => 1 / Math.tan(toNumber(x ?? null, line)),
  exp: ([x], line) => Math.exp(toNumber(x ?? null, line)),
  grauprad: ([x], line) => toNumber(x ?? null, line) * (Math.PI / 180),
  radpgrau: ([x], line) => toNumber(x ?? null, line) * (180 / Math.PI),
  int: ([x], line) => Math.trunc(toNumber(x ?? null, line)),
  log: ([x], line) => {
    const n = toNumber(x ?? null, line);
    if (n <= 0) throw new RuntimeError("log de número não positivo", line);
    return Math.log10(n);
  },
  logn: ([x], line) => {
    const n = toNumber(x ?? null, line);
    if (n <= 0) throw new RuntimeError("logn de número não positivo", line);
    return Math.log(n);
  },
  pi: () => Math.PI,
  quad: ([x], line) => {
    const n = toNumber(x ?? null, line);
    return n * n;
  },
  raizq: ([x], line) => {
    const n = toNumber(x ?? null, line);
    if (n < 0) throw new RuntimeError("raizq de número negativo", line);
    return Math.sqrt(n);
  },
  sen: ([x], line) => Math.sin(toNumber(x ?? null, line)),
  tan: ([x], line) => Math.tan(toNumber(x ?? null, line)),
  truncar: ([x, decimais], line) => {
    const n = toNumber(x ?? null, line);
    const d = decimais !== undefined ? toNumber(decimais, line) : 0;
    const factor = Math.pow(10, d);
    return Math.trunc(n * factor) / factor;
  },
  arredonda: ([x, decimais], line) => {
    const n = toNumber(x ?? null, line);
    const d = decimais !== undefined ? toNumber(decimais, line) : 0;
    return parseFloat(n.toFixed(d));
  },
  potência: ([base, exp], line) => Math.pow(toNumber(base ?? null, line), toNumber(exp ?? null, line)),
  potencia: ([base, exp], line) => Math.pow(toNumber(base ?? null, line), toNumber(exp ?? null, line)),
  max: ([a, b], line) => Math.max(toNumber(a ?? null, line), toNumber(b ?? null, line)),
  min: ([a, b], line) => Math.min(toNumber(a ?? null, line), toNumber(b ?? null, line)),
  aleatorio: (args, line) => {
    if (args.length >= 2) {
      const low = Math.ceil(toNumber(args[0] ?? null, line));
      const high = Math.floor(toNumber(args[1] ?? null, line));
      return Math.floor(Math.random() * (high - low + 1)) + low;
    }
    return Math.random();
  },
  geraaleatorio: () => null,

  // ---- String ----
  compr: ([s]) => (typeof s === "string" ? s.length : 0),
  comprimento: ([s]) => (typeof s === "string" ? s.length : 0),
  copia: ([s, inicio, tam], line) => {
    const str = toString(s ?? null);
    const i = Math.max(0, toNumber(inicio ?? null, line) - 1);
    const t = toNumber(tam ?? null, line);
    return str.substr(i, t);
  },
  copiastr: ([s, inicio, tam], line) => {
    const str = toString(s ?? null);
    const i = Math.max(0, toNumber(inicio ?? null, line) - 1);
    const t = toNumber(tam ?? null, line);
    return str.substr(i, t);
  },
  maiusc: ([s]) => toString(s ?? null).toUpperCase(),
  minusc: ([s]) => toString(s ?? null).toLowerCase(),
  pos: ([sub, str]) => {
    const s = toString(str ?? null);
    const p = toString(sub ?? null);
    const idx = s.indexOf(p);
    return idx === -1 ? 0 : idx + 1;
  },
  posstr: ([sub, str]) => {
    const s = toString(str ?? null);
    const p = toString(sub ?? null);
    const idx = s.indexOf(p);
    return idx === -1 ? 0 : idx + 1;
  },
  insere: ([sub, str, pos], line) => {
    const s = toString(str ?? null);
    const p = toString(sub ?? null);
    const i = Math.max(0, toNumber(pos ?? null, line) - 1);
    return s.slice(0, i) + p + s.slice(i);
  },
  apaga: ([str, pos, n], line) => {
    const s = toString(str ?? null);
    const i = Math.max(0, toNumber(pos ?? null, line) - 1);
    const len = toNumber(n ?? null, line);
    return s.slice(0, i) + s.slice(i + len);
  },
  // ---- Type conversion ----
  real: ([x], line) => toNumber(x ?? null, line),
  inteiro: ([x], line) => Math.trunc(toNumber(x ?? null, line)),
  carascii: ([x], line) => String.fromCharCode(toNumber(x ?? null, line)),
  ascii: ([s]) => {
    const str = toString(s ?? null);
    return str.charCodeAt(0) || 0;
  },
  carac: ([x], line) => String.fromCharCode(toNumber(x ?? null, line)),
  numpcarac: ([x], line) => String.fromCharCode(toNumber(x ?? null, line)),
  caracpnum: ([s]) => (toString(s ?? null).charCodeAt(0) || 0),
  numtostr: ([x], line) => toString(toNumber(x ?? null, line)),
  strtonum: ([s]) => parseFloat(toString(s ?? null)) || 0,
  // ---- Boolean ----
  verdadeiro: () => true,
  falso: () => false,
};

export function callBuiltin(name: string, args: PortugolValue[], line?: number): PortugolValue | undefined {
  const lower = name.toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
  const fn = BUILTINS[lower];
  if (!fn) return undefined; // not a builtin
  return fn(args, line);
}
