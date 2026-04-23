interface ProgramNode {
    kind: "Program";
    name: string;
    typeDecls: TypeDeclNode[];
    varDecls: VarDeclNode[];
    constDecls: ConstDeclNode[];
    procedures: ProcedureNode[];
    functions: FunctionNode[];
    body: StmtNode[];
    line: number;
}
interface VarDeclNode {
    kind: "VarDecl";
    names: string[];
    varType: TypeAnnotation;
    line: number;
}
interface ConstDeclNode {
    kind: "ConstDecl";
    name: string;
    value: ExprNode;
    line: number;
}
interface TypeDeclNode {
    kind: "TypeDecl";
    name: string;
    fields: VarDeclNode[];
    line: number;
}
type TypeAnnotation = {
    tag: "inteiro";
} | {
    tag: "real";
} | {
    tag: "caractere";
} | {
    tag: "logico";
} | {
    tag: "vetor";
    dims: DimSpec[];
    elementType: BaseType | {
        tag: "custom";
        name: string;
    };
} | {
    tag: "custom";
    name: string;
};
type BaseType = "inteiro" | "real" | "caractere" | "logico";
interface DimSpec {
    low: ExprNode;
    high: ExprNode;
}
interface ParamDecl {
    names: string[];
    varType: TypeAnnotation;
    byRef: boolean;
}
interface ProcedureNode {
    kind: "Procedure";
    name: string;
    params: ParamDecl[];
    varDecls: VarDeclNode[];
    body: StmtNode[];
    line: number;
}
interface FunctionNode {
    kind: "Function";
    name: string;
    params: ParamDecl[];
    returnType: TypeAnnotation;
    varDecls: VarDeclNode[];
    body: StmtNode[];
    line: number;
}
type StmtNode = AssignNode | WriteNode | ReadNode | IfNode | ForNode | WhileNode | RepeatNode | ChooseNode | ReturnNode | BreakNode | CallStmtNode | BlockNode;
interface BlockNode {
    kind: "Block";
    stmts: StmtNode[];
    line: number;
}
interface AssignNode {
    kind: "Assign";
    target: LValueNode;
    value: ExprNode;
    line: number;
}
interface WriteArg {
    expr: ExprNode;
    width?: number;
    decimals?: number;
}
interface WriteNode {
    kind: "Write";
    args: WriteArg[];
    newline: boolean;
    line: number;
}
interface ReadNode {
    kind: "Read";
    targets: LValueNode[];
    line: number;
}
interface IfNode {
    kind: "If";
    condition: ExprNode;
    then: StmtNode[];
    else_: StmtNode[];
    line: number;
}
interface ForNode {
    kind: "For";
    variable: string;
    from: ExprNode;
    to: ExprNode;
    step: ExprNode | null;
    body: StmtNode[];
    line: number;
}
interface WhileNode {
    kind: "While";
    condition: ExprNode;
    body: StmtNode[];
    line: number;
}
interface RepeatNode {
    kind: "Repeat";
    body: StmtNode[];
    condition: ExprNode;
    line: number;
}
interface CaseClause {
    values: ExprNode[];
    body: StmtNode[];
}
interface ChooseNode {
    kind: "Choose";
    expr: ExprNode;
    cases: CaseClause[];
    otherwise: StmtNode[];
    line: number;
}
interface ReturnNode {
    kind: "Return";
    value: ExprNode | null;
    line: number;
}
interface BreakNode {
    kind: "Break";
    line: number;
}
interface CallStmtNode {
    kind: "CallStmt";
    name: string;
    args: ExprNode[];
    line: number;
}
type LValueNode = {
    kind: "LIdent";
    name: string;
    line: number;
} | {
    kind: "LIndex";
    base: LValueNode;
    indices: ExprNode[];
    line: number;
} | {
    kind: "LField";
    base: LValueNode;
    field: string;
    line: number;
};
type ExprNode = LiteralNode | IdentNode | BinaryNode | UnaryNode | IndexNode | FieldNode | CallExprNode;
interface LiteralNode {
    kind: "Literal";
    value: number | string | boolean;
    line: number;
}
interface IdentNode {
    kind: "Ident";
    name: string;
    line: number;
}
interface BinaryNode {
    kind: "Binary";
    op: BinaryOp;
    left: ExprNode;
    right: ExprNode;
    line: number;
}
type BinaryOp = "+" | "-" | "*" | "/" | "div" | "mod" | "^" | "=" | "<>" | "<" | "<=" | ">" | ">=" | "e" | "ou" | "xou";
interface UnaryNode {
    kind: "Unary";
    op: "nao" | "-" | "+";
    expr: ExprNode;
    line: number;
}
interface IndexNode {
    kind: "Index";
    base: ExprNode;
    indices: ExprNode[];
    line: number;
}
interface FieldNode {
    kind: "Field";
    base: ExprNode;
    field: string;
    line: number;
}
interface CallExprNode {
    kind: "CallExpr";
    name: string;
    args: ExprNode[];
    line: number;
}

type PortugolValue = number | string | boolean | PortugolArray | PortugolRecord | null;
interface PortugolArray {
    __type: "array";
    dims: number[];
    low: number[];
    data: PortugolValue[];
    elementType: string;
}
interface PortugolRecord {
    __type: "record";
    typeName: string;
    fields: Record<string, PortugolValue>;
}
declare class RuntimeError extends Error {
    line?: number | undefined;
    constructor(msg: string, line?: number | undefined);
}

interface IOInterface {
    write(text: string): void;
    read(prompt: string): string | null | Promise<string | null>;
}
interface ExecutionResult {
    output: string;
    error?: string;
    executionTimeMs: number;
}
interface StepInfo {
    line: number;
    variables: Record<string, PortugolValue>;
    output: string;
}

declare class LexerError extends Error {
    line: number;
    column: number;
    constructor(msg: string, line: number, column: number);
}

declare class ParseError extends Error {
    line: number;
    column: number;
    constructor(msg: string, line: number, column: number);
}

type DebuggerState = "idle" | "running" | "paused" | "finished" | "error";
interface DebuggerEvent {
    type: "step" | "breakpoint" | "finished" | "error" | "output";
    line?: number;
    variables?: Record<string, PortugolValue>;
    output?: string;
    error?: string;
}
declare class PortugolDebugger {
    private io;
    private interpreter;
    private state;
    private stepResolve?;
    private stepQueue;
    private output;
    private eventListeners;
    breakpoints: Set<number>;
    constructor(io: IOInterface);
    on(listener: (event: DebuggerEvent) => void): void;
    private emit;
    addBreakpoint(line: number): void;
    removeBreakpoint(line: number): void;
    clearBreakpoints(): void;
    start(program: ProgramNode): Promise<void>;
    stepInto(): void;
    stepOver(): void;
    continue(): void;
    pause(): void;
    stop(): void;
    getState(): DebuggerState;
    private resolveStep;
    private waitForResume;
}

declare function parse(source: string): ProgramNode;
declare function execute(source: string, io?: Partial<IOInterface>): Promise<ExecutionResult>;
declare const PORTUGOL_LANGUAGE_ID = "portugol";
declare const PORTUGOL_KEYWORDS: string[];
declare const PORTUGOL_BUILTIN_FUNCTIONS: string[];
declare const PORTUGOL_MONARCH_LANGUAGE: {
    keywords: string[];
    builtins: string[];
    tokenizer: {
        root: ((string | RegExp)[] | (RegExp | {
            cases: {
                "@keywords": string;
                "@builtins": string;
                "@default": string;
            };
        })[])[];
    };
    ignoreCase: boolean;
};
interface ExampleProgram {
    title: string;
    code: string;
    description: string;
    difficulty: "iniciante" | "intermediário" | "avançado";
    hasInput: boolean;
}
interface ExampleCategory {
    id: string;
    name: string;
    icon: string;
    examples: ExampleProgram[];
}
declare const EXAMPLE_PROGRAMS: Record<string, string>;
declare const EXAMPLE_CATEGORIES: ExampleCategory[];

export { type DebuggerEvent, type DebuggerState, EXAMPLE_CATEGORIES, EXAMPLE_PROGRAMS, type ExampleCategory, type ExampleProgram, type ExecutionResult, type IOInterface, LexerError, PORTUGOL_BUILTIN_FUNCTIONS, PORTUGOL_KEYWORDS, PORTUGOL_LANGUAGE_ID, PORTUGOL_MONARCH_LANGUAGE, ParseError, type PortugolArray, PortugolDebugger, type PortugolRecord, type PortugolValue, type ProgramNode, RuntimeError, type StepInfo, execute, parse };
