// ============================================================
// AUSTRALIS – Portugol Interpreter (Tree-walker)
// Executa AST produzida pelo Parser – sem eval/Function
// ============================================================

import {
  ProgramNode,
  StmtNode,
  ExprNode,
  VarDeclNode,
  ConstDeclNode,
  TypeDeclNode,
  ProcedureNode,
  FunctionNode,
  LValueNode,
  AssignNode,
  WriteNode,
  WriteArg,
  ReadNode,
  IfNode,
  ForNode,
  WhileNode,
  RepeatNode,
  ChooseNode,
  ReturnNode,
  CallStmtNode,
  TypeAnnotation,
} from "../parser/ast";
import {
  Environment,
  PortugolValue,
  PortugolArray,
  PortugolRecord,
  RuntimeError,
  ReturnSignal,
  BreakSignal,
  createArray,
  arrayGet,
  arraySet,
  toNumber,
  toBoolean,
  toString,
} from "./environment";

// Re-export so debugger and index can import from here
export type { PortugolValue } from "./environment";
import { callBuiltin } from "./builtins";

// =============================================
// I/O interface (allows custom I/O in browser)
// =============================================
export interface IOInterface {
  write(text: string): void;
  read(prompt: string): string | null | Promise<string | null>;
}

// =============================================
// Execution result
// =============================================
export interface ExecutionResult {
  output: string;
  error?: string;
  executionTimeMs: number;
}

// =============================================
// Step information (for debugger)
// =============================================
export interface StepInfo {
  line: number;
  variables: Record<string, PortugolValue>;
  output: string;
}

// =============================================
// Interpreter class
// =============================================
export class Interpreter {
  private globalEnv: Environment = new Environment();
  private procedures: Map<string, ProcedureNode> = new Map();
  private functions: Map<string, FunctionNode> = new Map();
  private typeRegistry: Map<string, TypeDeclNode> = new Map();
  private constants: Set<string> = new Set(); // nomes de constantes (imutáveis)
  private output: string[] = [];
  private io: IOInterface;
  private maxIterations = 1_000_000;
  private iterationCount = 0;

  // Debugger support
  public onStep?: (info: StepInfo) => void | Promise<void>;
  public breakpoints: Set<number> = new Set();
  public paused = false;
  private currentLine = 0;

  constructor(io: IOInterface) {
    this.io = io;
  }

  // =============================================
  // Public API
  // =============================================
  async execute(program: ProgramNode): Promise<void> {
    this.globalEnv = new Environment();
    this.procedures.clear();
    this.functions.clear();
    this.typeRegistry.clear();
    this.constants.clear();
    this.output = [];
    this.iterationCount = 0;

    // Register type declarations
    for (const td of program.typeDecls) {
      this.typeRegistry.set(td.name.toLowerCase(), td);
    }

    // Register procedures and functions
    for (const proc of program.procedures) {
      this.procedures.set(proc.name.toLowerCase(), proc);
    }
    for (const func of program.functions) {
      this.functions.set(func.name.toLowerCase(), func);
    }

    // Declare global variables
    await this.declareVars(program.varDecls, this.globalEnv);

    // Declare constants (evaluated once, immutable)
    await this.declareConsts(program.constDecls ?? [], this.globalEnv);

    // Execute main body
    await this.execStmts(program.body, this.globalEnv);
  }

  getOutput(): string {
    return this.output.join("");
  }

  // =============================================
  // Constant Declaration
  // =============================================
  private async declareConsts(
    decls: ConstDeclNode[],
    env: Environment,
  ): Promise<void> {
    for (const decl of decls) {
      const val = await this.evalExpr(decl.value, env);
      env.define(decl.name, val);
      this.constants.add(decl.name.toLowerCase());
    }
  }

  // =============================================
  // Variable Declaration
  // =============================================
  private async declareVars(
    decls: VarDeclNode[],
    env: Environment,
  ): Promise<void> {
    for (const decl of decls) {
      for (const name of decl.names) {
        const val = await this.defaultForType(decl.varType, env);
        env.define(name, val);
      }
    }
  }

  private async defaultForType(
    type: TypeAnnotation,
    env: Environment,
  ): Promise<PortugolValue> {
    switch (type.tag) {
      case "inteiro":
        return 0;
      case "real":
        return 0.0;
      case "caractere":
        return "";
      case "logico":
        return false;
      case "vetor": {
        const dims: Array<{ low: number; high: number }> = [];
        for (const dim of type.dims) {
          const low = toNumber(await this.evalExpr(dim.low, env), dim.low.line);
          const high = toNumber(
            await this.evalExpr(dim.high, env),
            dim.high.line,
          );
          dims.push({ low, high });
        }
        const primitiveElementType =
          typeof type.elementType === "string" ? type.elementType : "custom";
        const arr = createArray(dims, primitiveElementType);

        // Vetor de registro: inicializa cada posição com uma instância do tipo custom.
        if (typeof type.elementType !== "string") {
          for (let i = 0; i < arr.data.length; i++) {
            arr.data[i] = await this.defaultForType(
              { tag: "custom", name: type.elementType.name },
              env,
            );
          }
        }

        return arr;
      }
      case "custom": {
        const td = this.typeRegistry.get(type.name.toLowerCase());
        if (!td) throw new RuntimeError(`Tipo '${type.name}' não definido`);
        const fields: Record<string, PortugolValue> = {};
        for (const field of td.fields) {
          for (const fname of field.names) {
            fields[fname.toLowerCase()] = await this.defaultForType(
              field.varType,
              env,
            );
          }
        }
        return { __type: "record", typeName: type.name, fields };
      }
    }
  }

  // =============================================
  // Statement Execution
  // =============================================
  private async execStmts(stmts: StmtNode[], env: Environment): Promise<void> {
    for (const stmt of stmts) {
      await this.execStmt(stmt, env);
    }
  }

  private async execStmt(stmt: StmtNode, env: Environment): Promise<void> {
    this.currentLine = stmt.line ?? this.currentLine;
    await this.checkStep(env);

    switch (stmt.kind) {
      case "Assign":
        return this.execAssign(stmt, env);
      case "Write":
        return this.execWrite(stmt, env);
      case "Read":
        return this.execRead(stmt, env);
      case "If":
        return this.execIf(stmt, env);
      case "For":
        return this.execFor(stmt, env);
      case "While":
        return this.execWhile(stmt, env);
      case "Repeat":
        return this.execRepeat(stmt, env);
      case "Choose":
        return this.execChoose(stmt, env);
      case "Return":
        return this.execReturn(stmt, env);
      case "Break":
        throw new BreakSignal();
      case "CallStmt":
        return this.execCallStmt(stmt, env);
      case "Block":
        return this.execStmts(stmt.stmts, env);
      default:
        return;
    }
  }

  private async checkStep(env: Environment): Promise<void> {
    if (
      this.onStep &&
      (this.breakpoints.has(this.currentLine) || this.paused)
    ) {
      const info: StepInfo = {
        line: this.currentLine,
        variables: env.snapshot(),
        output: this.output.join(""),
      };
      await this.onStep(info);
    }
  }

  // ---- Assign ----
  private async execAssign(stmt: AssignNode, env: Environment): Promise<void> {
    // Protege constantes contra reatribuição
    if (stmt.target.kind === "LIdent" && this.constants.has(stmt.target.name.toLowerCase())) {
      throw new RuntimeError(
        `Não é possível atribuir valor à constante '${stmt.target.name}'`,
        stmt.line,
      );
    }
    const value = await this.evalExpr(stmt.value, env);
    await this.setLValue(stmt.target, value, env);
  }

  private async setLValue(
    lv: LValueNode,
    value: PortugolValue,
    env: Environment,
  ): Promise<void> {
    switch (lv.kind) {
      case "LIdent": {
        env.set(lv.name, value);
        break;
      }
      case "LIndex": {
        const base = await this.getLValueBase(lv.base, env);
        if (!base || (base as PortugolArray).__type !== "array") {
          throw new RuntimeError(
            `'${this.lvalName(lv.base)}' não é um vetor`,
            lv.line,
          );
        }
        const arr = base as PortugolArray;
        const indices = await Promise.all(
          lv.indices.map((i) => this.evalExpr(i, env)),
        );
        arraySet(
          arr,
          indices.map((i) => toNumber(i, lv.line)),
          value,
        );
        break;
      }
      case "LField": {
        const base = await this.getLValueBase(lv.base, env);
        if (!base || (base as PortugolRecord).__type !== "record") {
          throw new RuntimeError(
            `'${this.lvalName(lv.base)}' não é um registro`,
            lv.line,
          );
        }
        (base as PortugolRecord).fields[lv.field.toLowerCase()] = value;
        break;
      }
    }
  }

  private async getLValueBase(
    lv: LValueNode,
    env: Environment,
  ): Promise<PortugolValue> {
    if (lv.kind === "LIdent") return env.get(lv.name);
    if (lv.kind === "LIndex") {
      const base = await this.getLValueBase(lv.base, env);
      const arr = base as PortugolArray;
      const indices = await Promise.all(
        lv.indices.map((i) => this.evalExpr(i, env)),
      );
      return arrayGet(
        arr,
        indices.map((i) => toNumber(i, lv.line)),
      );
    }
    if (lv.kind === "LField") {
      const base = await this.getLValueBase(lv.base, env);
      return (base as PortugolRecord).fields[lv.field.toLowerCase()] ?? null;
    }
    return null;
  }

  private lvalName(lv: LValueNode): string {
    if (lv.kind === "LIdent") return lv.name;
    if (lv.kind === "LField") return `${this.lvalName(lv.base)}.${lv.field}`;
    return "variável";
  }

  // ---- Write ----
  private async execWrite(stmt: WriteNode, env: Environment): Promise<void> {
    const parts: string[] = [];
    for (const arg of stmt.args) {
      const val = await this.evalExpr(arg.expr, env);
      let str = toString(val);

      // Formatação :width:decimals (VisualG style)
      if (arg.width !== undefined && typeof val === "number") {
        const decimals = arg.decimals ?? 2;
        str = val.toFixed(decimals);
        // Alinha à direita dentro da largura especificada
        const totalWidth = arg.width;
        if (str.length < totalWidth) {
          str = " ".repeat(totalWidth - str.length) + str;
        }
      }

      parts.push(str);
    }
    const text = parts.join("") + (stmt.newline ? "\n" : "");
    this.output.push(text);
    this.io.write(text);
  }

  // ---- Read ----
  private async execRead(stmt: ReadNode, env: Environment): Promise<void> {
    for (const target of stmt.targets) {
      const prompt = `${this.lvalName(target)}: `;
      const raw = await this.io.read(prompt);
      if (raw === null) throw new RuntimeError("Leitura cancelada");

      // Try to infer type from current variable value
      const current = await this.getLValueBase(target, env).catch(() => null);
      let parsed: PortugolValue;

      if (
        typeof current === "boolean" ||
        raw.toLowerCase() === "verdadeiro" ||
        raw.toLowerCase() === "falso"
      ) {
        parsed =
          raw.toLowerCase() === "verdadeiro" ||
          raw === "1" ||
          raw.toLowerCase() === "true";
      } else if (typeof current === "number") {
        const n = parseFloat(raw.replace(",", "."));
        parsed = isNaN(n) ? 0 : n;
      } else {
        // Try number first, then string
        const n = parseFloat(raw.replace(",", "."));
        parsed = isNaN(n) ? raw : n;
      }

      await this.setLValue(target, parsed, env);
    }
  }

  // ---- If ----
  private async execIf(stmt: IfNode, env: Environment): Promise<void> {
    const cond = await this.evalExpr(stmt.condition, env);
    if (toBoolean(cond)) {
      await this.execStmts(stmt.then, env);
    } else {
      await this.execStmts(stmt.else_, env);
    }
  }

  // ---- For ----
  private async execFor(stmt: ForNode, env: Environment): Promise<void> {
    const from = toNumber(await this.evalExpr(stmt.from, env), stmt.line);
    const to = toNumber(await this.evalExpr(stmt.to, env), stmt.line);
    const step = stmt.step
      ? toNumber(await this.evalExpr(stmt.step, env), stmt.line)
      : from <= to
        ? 1
        : -1;

    env.set(stmt.variable, from);

    const shouldContinue = (v: number) => (step > 0 ? v <= to : v >= to);

    while (shouldContinue(toNumber(env.get(stmt.variable), stmt.line))) {
      this.checkIterations(stmt.line);
      try {
        await this.execStmts(stmt.body, env);
      } catch (e) {
        if (e instanceof BreakSignal) break;
        throw e;
      }
      const cur = toNumber(env.get(stmt.variable), stmt.line);
      env.set(stmt.variable, cur + step);
    }
  }

  // ---- While ----
  private async execWhile(stmt: WhileNode, env: Environment): Promise<void> {
    while (toBoolean(await this.evalExpr(stmt.condition, env))) {
      this.checkIterations(stmt.line);
      try {
        await this.execStmts(stmt.body, env);
      } catch (e) {
        if (e instanceof BreakSignal) break;
        throw e;
      }
    }
  }

  // ---- Repeat ----
  private async execRepeat(stmt: RepeatNode, env: Environment): Promise<void> {
    do {
      this.checkIterations(stmt.line);
      try {
        await this.execStmts(stmt.body, env);
      } catch (e) {
        if (e instanceof BreakSignal) break;
        throw e;
      }
    } while (!toBoolean(await this.evalExpr(stmt.condition, env)));
  }

  // ---- Choose ----
  private async execChoose(stmt: ChooseNode, env: Environment): Promise<void> {
    const val = await this.evalExpr(stmt.expr, env);
    let matched = false;

    for (const clause of stmt.cases) {
      for (const caseVal of clause.values) {
        const cv = await this.evalExpr(caseVal, env);
        if (this.valuesEqual(val, cv)) {
          await this.execStmts(clause.body, env);
          matched = true;
          break;
        }
      }
      if (matched) break;
    }

    if (!matched) {
      await this.execStmts(stmt.otherwise, env);
    }
  }

  // ---- Return ----
  private async execReturn(stmt: ReturnNode, env: Environment): Promise<void> {
    const val = stmt.value ? await this.evalExpr(stmt.value, env) : null;
    throw new ReturnSignal(val);
  }

  // ---- Call Statement ----
  private async execCallStmt(
    stmt: CallStmtNode,
    env: Environment,
  ): Promise<void> {
    await this.callProcedureOrFunction(stmt.name, stmt.args, env, stmt.line);
  }

  // =============================================
  // Expression Evaluation
  // =============================================
  async evalExpr(expr: ExprNode, env: Environment): Promise<PortugolValue> {
    switch (expr.kind) {
      case "Literal":
        return expr.value;

      case "Ident": {
        try {
          return env.get(expr.name);
        } catch {
          throw new RuntimeError(
            `Variável '${expr.name}' não declarada`,
            expr.line,
          );
        }
      }

      case "Index": {
        const base = await this.evalExpr(expr.base, env);
        if (!base || (base as PortugolArray).__type !== "array") {
          throw new RuntimeError(
            `Tentativa de indexar algo que não é vetor`,
            expr.line,
          );
        }
        const indices = await Promise.all(
          expr.indices.map((i) => this.evalExpr(i, env)),
        );
        return arrayGet(
          base as PortugolArray,
          indices.map((i) => toNumber(i, expr.line)),
        );
      }

      case "Field": {
        const base = await this.evalExpr(expr.base, env);
        if (!base || (base as PortugolRecord).__type !== "record") {
          throw new RuntimeError(
            `Tentativa de acessar campo de não-registro`,
            expr.line,
          );
        }
        return (
          (base as PortugolRecord).fields[expr.field.toLowerCase()] ?? null
        );
      }

      case "Unary": {
        const val = await this.evalExpr(expr.expr, env);
        if (expr.op === "nao") return !toBoolean(val);
        if (expr.op === "-") return -toNumber(val, expr.line);
        return toNumber(val, expr.line);
      }

      case "Binary":
        return this.evalBinary(expr.op, expr.left, expr.right, env, expr.line);

      case "CallExpr": {
        return (
          (await this.callProcedureOrFunction(
            expr.name,
            expr.args,
            env,
            expr.line,
          )) ?? null
        );
      }
    }
  }

  private async evalBinary(
    op: string,
    leftNode: ExprNode,
    rightNode: ExprNode,
    env: Environment,
    line: number,
  ): Promise<PortugolValue> {
    // Short-circuit for logical
    if (op === "e") {
      const l = toBoolean(await this.evalExpr(leftNode, env));
      if (!l) return false;
      return toBoolean(await this.evalExpr(rightNode, env));
    }
    if (op === "ou") {
      const l = toBoolean(await this.evalExpr(leftNode, env));
      if (l) return true;
      return toBoolean(await this.evalExpr(rightNode, env));
    }

    const left = await this.evalExpr(leftNode, env);
    const right = await this.evalExpr(rightNode, env);

    switch (op) {
      case "+": {
        if (typeof left === "string" || typeof right === "string") {
          return toString(left) + toString(right);
        }
        return toNumber(left, line) + toNumber(right, line);
      }
      case "-":
        return toNumber(left, line) - toNumber(right, line);
      case "*":
        return toNumber(left, line) * toNumber(right, line);
      case "/": {
        const r = toNumber(right, line);
        if (r === 0) throw new RuntimeError("Divisão por zero", line);
        return toNumber(left, line) / r;
      }
      case "div": {
        const r = toNumber(right, line);
        if (r === 0) throw new RuntimeError("Divisão inteira por zero", line);
        return Math.trunc(toNumber(left, line) / r);
      }
      case "mod": {
        const r = toNumber(right, line);
        if (r === 0) throw new RuntimeError("Módulo por zero", line);
        return toNumber(left, line) % r;
      }
      case "^":
        return Math.pow(toNumber(left, line), toNumber(right, line));
      case "=":
        return this.valuesEqual(left, right);
      case "<>":
        return !this.valuesEqual(left, right);
      case "<":
        return toNumber(left, line) < toNumber(right, line);
      case "<=":
        return toNumber(left, line) <= toNumber(right, line);
      case ">":
        return toNumber(left, line) > toNumber(right, line);
      case ">=":
        return toNumber(left, line) >= toNumber(right, line);
      case "xou":
        return toBoolean(left) !== toBoolean(right);
      default:
        throw new RuntimeError(`Operador desconhecido: '${op}'`, line);
    }
  }

  private valuesEqual(a: PortugolValue, b: PortugolValue): boolean {
    if (typeof a === "string" && typeof b === "string") return a === b;
    if (typeof a === "boolean" || typeof b === "boolean")
      return Boolean(a) === Boolean(b);
    if (typeof a === "number" && typeof b === "number") return a === b;
    return a === b;
  }

  // =============================================
  // Procedure / Function Calls
  // =============================================
  private async callProcedureOrFunction(
    name: string,
    argExprs: ExprNode[],
    env: Environment,
    line?: number,
  ): Promise<PortugolValue | undefined> {
    const lower = name.toLowerCase();

    // Built-in functions
    const argVals = await Promise.all(
      argExprs.map((a) => this.evalExpr(a, env)),
    );
    const builtinResult = callBuiltin(lower, argVals, line);
    if (builtinResult !== undefined) return builtinResult;

    // User-defined procedure
    const proc = this.procedures.get(lower);
    if (proc) {
      await this.callProcedure(proc, argExprs, env, line);
      return undefined;
    }

    // User-defined function
    const func = this.functions.get(lower);
    if (func) {
      return await this.callFunction(func, argExprs, env, line);
    }

    throw new RuntimeError(
      `Procedimento/função '${name}' não definido(a)`,
      line,
    );
  }

  private async callProcedure(
    proc: ProcedureNode,
    argExprs: ExprNode[],
    callerEnv: Environment,
    line?: number,
  ): Promise<void> {
    const localEnv = new Environment(this.globalEnv);

    // Bind parameters
    let argIdx = 0;
    for (const param of proc.params) {
      for (const pname of param.names) {
        const argExpr = argExprs[argIdx++];
        if (param.byRef && argExpr) {
          // Pass by reference
          if (argExpr.kind === "Ident") {
            localEnv.defineRef(
              pname,
              callerEnv.getEnvFor(argExpr.name),
              argExpr.name,
            );
          } else {
            const val = argExpr
              ? await this.evalExpr(argExpr, callerEnv)
              : await this.defaultForType(param.varType, localEnv);
            localEnv.define(pname, val);
          }
        } else {
          const val = argExpr
            ? await this.evalExpr(argExpr, callerEnv)
            : await this.defaultForType(param.varType, localEnv);
          localEnv.define(pname, val);
        }
      }
    }

    // Declare local vars
    await this.declareVars(proc.varDecls, localEnv);

    try {
      await this.execStmts(proc.body, localEnv);
    } catch (e) {
      if (e instanceof ReturnSignal) return;
      throw e;
    }
  }

  private async callFunction(
    func: FunctionNode,
    argExprs: ExprNode[],
    callerEnv: Environment,
    line?: number,
  ): Promise<PortugolValue> {
    const localEnv = new Environment(this.globalEnv);

    // Bind parameters
    let argIdx = 0;
    for (const param of func.params) {
      for (const pname of param.names) {
        const argExpr = argExprs[argIdx++];
        const val = argExpr
          ? await this.evalExpr(argExpr, callerEnv)
          : await this.defaultForType(param.varType, localEnv);
        localEnv.define(pname, val);
      }
    }

    // Declare local vars
    await this.declareVars(func.varDecls, localEnv);

    // Initialize return variable (same name as function)
    localEnv.define(
      func.name,
      await this.defaultForType(func.returnType, localEnv),
    );

    try {
      await this.execStmts(func.body, localEnv);
    } catch (e) {
      if (e instanceof ReturnSignal) {
        return e.value ?? localEnv.get(func.name);
      }
      throw e;
    }

    return localEnv.get(func.name);
  }

  // =============================================
  // Helpers
  // =============================================
  private checkIterations(line?: number): void {
    this.iterationCount++;
    if (this.iterationCount > this.maxIterations) {
      throw new RuntimeError(
        "Limite de iterações excedido (possível laço infinito)",
        line,
      );
    }
  }
}
