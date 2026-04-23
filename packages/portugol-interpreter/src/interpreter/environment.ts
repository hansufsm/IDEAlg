// ============================================================
// AUSTRALIS – Portugol Runtime Environment
// Gerenciamento de escopo, variáveis e valores
// ============================================================

export type PortugolValue =
  | number      // inteiro ou real
  | string      // caractere
  | boolean     // logico
  | PortugolArray
  | PortugolRecord
  | null;

export interface PortugolArray {
  __type: "array";
  dims: number[];      // dimension sizes
  low: number[];       // lower bounds per dim
  data: PortugolValue[];
  elementType: string;
}

export interface PortugolRecord {
  __type: "record";
  typeName: string;
  fields: Record<string, PortugolValue>;
}

export class RuntimeError extends Error {
  constructor(msg: string, public line?: number) {
    super(line ? `Erro em tempo de execução [linha ${line}]: ${msg}` : `Erro em tempo de execução: ${msg}`);
    this.name = "RuntimeError";
  }
}

export class ReturnSignal {
  constructor(public value: PortugolValue) {}
}

export class BreakSignal {}

// =============================================
// Environment (scope chain)
// =============================================
export class Environment {
  private store: Map<string, PortugolValue> = new Map();
  private refStore: Map<string, { env: Environment; name: string }> = new Map();

  constructor(private parent: Environment | null = null) {}

  get(name: string): PortugolValue {
    const lower = name.toLowerCase();
    // Check ref first
    if (this.refStore.has(lower)) {
      const ref = this.refStore.get(lower)!;
      return ref.env.get(ref.name);
    }
    if (this.store.has(lower)) return this.store.get(lower)!;
    if (this.parent) return this.parent.get(name);
    throw new RuntimeError(`Variável '${name}' não declarada`);
  }

  set(name: string, value: PortugolValue): void {
    const lower = name.toLowerCase();
    // Check ref
    if (this.refStore.has(lower)) {
      const ref = this.refStore.get(lower)!;
      ref.env.set(ref.name, value);
      return;
    }
    if (this.store.has(lower)) {
      this.store.set(lower, value);
      return;
    }
    if (this.parent && this.parent.has(name)) {
      this.parent.set(name, value);
      return;
    }
    // Define locally
    this.store.set(lower, value);
  }

  define(name: string, value: PortugolValue): void {
    this.store.set(name.toLowerCase(), value);
  }

  defineRef(name: string, targetEnv: Environment, targetName: string): void {
    this.refStore.set(name.toLowerCase(), { env: targetEnv, name: targetName });
  }

  has(name: string): boolean {
    const lower = name.toLowerCase();
    if (this.refStore.has(lower) || this.store.has(lower)) return true;
    return this.parent?.has(name) ?? false;
  }

  getEnvFor(name: string): Environment {
    const lower = name.toLowerCase();
    if (this.refStore.has(lower)) {
      const ref = this.refStore.get(lower)!;
      return ref.env.getEnvFor(ref.name);
    }
    if (this.store.has(lower)) return this;
    if (this.parent) return this.parent.getEnvFor(name);
    throw new RuntimeError(`Variável '${name}' não encontrada`);
  }

  snapshot(): Record<string, PortugolValue> {
    const result: Record<string, PortugolValue> = {};
    if (this.parent) {
      Object.assign(result, this.parent.snapshot());
    }
    for (const [k, v] of this.store.entries()) {
      result[k] = v;
    }
    return result;
  }
}

// =============================================
// Array helpers
// =============================================
export function createArray(dims: Array<{ low: number; high: number }>, elementType: string): PortugolArray {
  const sizes = dims.map((d) => d.high - d.low + 1);
  const totalSize = sizes.reduce((a, b) => a * b, 1);
  const defaultVal = (): PortugolValue => {
    switch (elementType) {
      case "inteiro": return 0;
      case "real": return 0.0;
      case "caractere": return "";
      case "logico": return false;
      default: return null;
    }
  };
  return {
    __type: "array",
    dims: sizes,
    low: dims.map((d) => d.low),
    data: Array.from({ length: totalSize }, defaultVal),
    elementType,
  };
}

export function arrayGet(arr: PortugolArray, indices: number[]): PortugolValue {
  const idx = flatIndex(arr, indices);
  return arr.data[idx] ?? null;
}

export function arraySet(arr: PortugolArray, indices: number[], value: PortugolValue): void {
  const idx = flatIndex(arr, indices);
  arr.data[idx] = value;
}

function flatIndex(arr: PortugolArray, indices: number[]): number {
  if (indices.length !== arr.dims.length) {
    throw new RuntimeError(`Número de índices incorreto: esperado ${arr.dims.length}, recebido ${indices.length}`);
  }
  let idx = 0;
  let stride = 1;
  for (let i = arr.dims.length - 1; i >= 0; i--) {
    const adjusted = indices[i]! - arr.low[i]!;
    if (adjusted < 0 || adjusted >= arr.dims[i]!) {
      throw new RuntimeError(
        `Índice ${indices[i]} fora dos limites [${arr.low[i]}..${arr.low[i]! + arr.dims[i]! - 1}]`
      );
    }
    idx += adjusted * stride;
    stride *= arr.dims[i]!;
  }
  return idx;
}

// =============================================
// Default values
// =============================================
export function defaultValue(typeTag: string): PortugolValue {
  switch (typeTag) {
    case "inteiro": return 0;
    case "real": return 0.0;
    case "caractere": return "";
    case "logico": return false;
    default: return null;
  }
}

// =============================================
// Value coercion
// =============================================
export function toNumber(v: PortugolValue, line?: number): number {
  if (typeof v === "number") return v;
  if (typeof v === "string") {
    const n = parseFloat(v);
    if (!isNaN(n)) return n;
  }
  throw new RuntimeError(`Não é possível converter '${String(v)}' para número`, line);
}

export function toBoolean(v: PortugolValue): boolean {
  if (typeof v === "boolean") return v;
  if (typeof v === "number") return v !== 0;
  return false;
}

export function toString(v: PortugolValue): string {
  if (v === null) return "";
  if (typeof v === "boolean") return v ? "VERDADEIRO" : "FALSO";
  if (typeof v === "number") {
    if (Number.isInteger(v)) return String(v);
    return v.toFixed(6).replace(/\.?0+$/, "");
  }
  if (typeof v === "string") return v;
  if ((v as PortugolArray).__type === "array") return "[vetor]";
  if ((v as PortugolRecord).__type === "record") return "[registro]";
  return String(v);
}
