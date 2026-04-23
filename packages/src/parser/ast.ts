// ============================================================
// AUSTRALIS – Portugol AST (Abstract Syntax Tree)
// Todos os nós da gramática VisualG 2.0
// ============================================================

export type ASTNode =
  | ProgramNode
  | VarDeclNode
  | ConstDeclNode
  | TypeDeclNode
  | ProcedureNode
  | FunctionNode
  | BlockNode
  | AssignNode
  | WriteNode
  | ReadNode
  | IfNode
  | ForNode
  | WhileNode
  | RepeatNode
  | ChooseNode
  | ReturnNode
  | BreakNode
  | CallStmtNode
  | ExprNode;

// =============================================
// Program
// =============================================
export interface ProgramNode {
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

// =============================================
// Declarations
// =============================================
export interface VarDeclNode {
  kind: "VarDecl";
  names: string[];
  varType: TypeAnnotation;
  line: number;
}

export interface ConstDeclNode {
  kind: "ConstDecl";
  name: string;
  value: ExprNode;
  line: number;
}

export interface TypeDeclNode {
  kind: "TypeDecl";
  name: string;
  fields: VarDeclNode[];
  line: number;
}

export type TypeAnnotation =
  | { tag: "inteiro" }
  | { tag: "real" }
  | { tag: "caractere" }
  | { tag: "logico" }
  | { tag: "vetor"; dims: DimSpec[]; elementType: BaseType | { tag: "custom"; name: string } }
  | { tag: "custom"; name: string };

export type BaseType = "inteiro" | "real" | "caractere" | "logico";

export interface DimSpec {
  low: ExprNode;
  high: ExprNode;
}

// =============================================
// Subprograms
// =============================================
export interface ParamDecl {
  names: string[];
  varType: TypeAnnotation;
  byRef: boolean;
}

export interface ProcedureNode {
  kind: "Procedure";
  name: string;
  params: ParamDecl[];
  varDecls: VarDeclNode[];
  body: StmtNode[];
  line: number;
}

export interface FunctionNode {
  kind: "Function";
  name: string;
  params: ParamDecl[];
  returnType: TypeAnnotation;
  varDecls: VarDeclNode[];
  body: StmtNode[];
  line: number;
}

// =============================================
// Statements
// =============================================
export type StmtNode =
  | AssignNode
  | WriteNode
  | ReadNode
  | IfNode
  | ForNode
  | WhileNode
  | RepeatNode
  | ChooseNode
  | ReturnNode
  | BreakNode
  | CallStmtNode
  | BlockNode;

export interface BlockNode {
  kind: "Block";
  stmts: StmtNode[];
  line: number;
}

export interface AssignNode {
  kind: "Assign";
  target: LValueNode;
  value: ExprNode;
  line: number;
}

export interface WriteArg {
  expr: ExprNode;
  width?: number; // largura total (ex: :6)
  decimals?: number; // casas decimais (ex: :2)
}

export interface WriteNode {
  kind: "Write";
  args: WriteArg[];
  newline: boolean; // escreval = true, escreva = false
  line: number;
}

export interface ReadNode {
  kind: "Read";
  targets: LValueNode[];
  line: number;
}

export interface IfNode {
  kind: "If";
  condition: ExprNode;
  then: StmtNode[];
  else_: StmtNode[];
  line: number;
}

export interface ForNode {
  kind: "For";
  variable: string;
  from: ExprNode;
  to: ExprNode;
  step: ExprNode | null;
  body: StmtNode[];
  line: number;
}

export interface WhileNode {
  kind: "While";
  condition: ExprNode;
  body: StmtNode[];
  line: number;
}

export interface RepeatNode {
  kind: "Repeat";
  body: StmtNode[];
  condition: ExprNode;
  line: number;
}

export interface CaseClause {
  values: ExprNode[];
  body: StmtNode[];
}

export interface ChooseNode {
  kind: "Choose";
  expr: ExprNode;
  cases: CaseClause[];
  otherwise: StmtNode[];
  line: number;
}

export interface ReturnNode {
  kind: "Return";
  value: ExprNode | null;
  line: number;
}

export interface BreakNode {
  kind: "Break";
  line: number;
}

export interface CallStmtNode {
  kind: "CallStmt";
  name: string;
  args: ExprNode[];
  line: number;
}

// =============================================
// L-Values (assignable locations)
// =============================================
export type LValueNode =
  | { kind: "LIdent"; name: string; line: number }
  | { kind: "LIndex"; base: LValueNode; indices: ExprNode[]; line: number }
  | { kind: "LField"; base: LValueNode; field: string; line: number };

// =============================================
// Expressions
// =============================================
export type ExprNode =
  | LiteralNode
  | IdentNode
  | BinaryNode
  | UnaryNode
  | IndexNode
  | FieldNode
  | CallExprNode;

export interface LiteralNode {
  kind: "Literal";
  value: number | string | boolean;
  line: number;
}

export interface IdentNode {
  kind: "Ident";
  name: string;
  line: number;
}

export interface BinaryNode {
  kind: "Binary";
  op: BinaryOp;
  left: ExprNode;
  right: ExprNode;
  line: number;
}

export type BinaryOp =
  | "+"
  | "-"
  | "*"
  | "/"
  | "div"
  | "mod"
  | "^"
  | "="
  | "<>"
  | "<"
  | "<="
  | ">"
  | ">="
  | "e"
  | "ou"
  | "xou";

export interface UnaryNode {
  kind: "Unary";
  op: "nao" | "-" | "+";
  expr: ExprNode;
  line: number;
}

export interface IndexNode {
  kind: "Index";
  base: ExprNode;
  indices: ExprNode[];
  line: number;
}

export interface FieldNode {
  kind: "Field";
  base: ExprNode;
  field: string;
  line: number;
}

export interface CallExprNode {
  kind: "CallExpr";
  name: string;
  args: ExprNode[];
  line: number;
}
