// ============================================================
// AUSTRALIS – Portugol Parser (Descida Recursiva)
// Gramática compatível com VisualG 2.0
// ============================================================

import { Token, TokenType } from "../lexer/lexer";
import {
  ASTNode,
  ProgramNode,
  VarDeclNode,
  ConstDeclNode,
  TypeDeclNode,
  ProcedureNode,
  FunctionNode,
  StmtNode,
  AssignNode,
  WriteNode,
  ReadNode,
  IfNode,
  ForNode,
  WhileNode,
  RepeatNode,
  ChooseNode,
  ReturnNode,
  BreakNode,
  CallStmtNode,
  BlockNode,
  ExprNode,
  LiteralNode,
  IdentNode,
  BinaryNode,
  UnaryNode,
  IndexNode,
  FieldNode,
  CallExprNode,
  LValueNode,
  TypeAnnotation,
  BaseType,
  DimSpec,
  ParamDecl,
  CaseClause,
  BinaryOp,
} from "./ast";

export class ParseError extends Error {
  constructor(
    msg: string,
    public line: number,
    public column: number,
  ) {
    super(`Erro sintático [${line}:${column}]: ${msg}`);
    this.name = "ParseError";
  }
}

export class Parser {
  private pos = 0;

  constructor(private tokens: Token[]) {}

  // =============================================
  // Utilities
  // =============================================
  private current(): Token {
    return (
      this.tokens[this.pos] ?? { type: "EOF", value: "", line: 0, column: 0 }
    );
  }

  private peek(offset = 1): Token {
    return (
      this.tokens[this.pos + offset] ?? {
        type: "EOF",
        value: "",
        line: 0,
        column: 0,
      }
    );
  }

  private advance(): Token {
    const tok = this.current();
    this.pos++;
    return tok;
  }

  private check(...types: TokenType[]): boolean {
    return types.includes(this.current().type);
  }

  private match(...types: TokenType[]): Token | null {
    if (this.check(...types)) return this.advance();
    return null;
  }

  private expect(type: TokenType, msg?: string): Token {
    if (this.current().type === type) return this.advance();
    const tok = this.current();
    throw new ParseError(
      msg ?? `Esperado '${type}', encontrado '${tok.value || tok.type}'`,
      tok.line,
      tok.column,
    );
  }

  private expectIdent(msg?: string): Token {
    if (this.current().type === "IDENT") return this.advance();
    // Some keywords can be used as identifiers in certain contexts (procedure names, etc.)
    const tok = this.current();
    throw new ParseError(
      msg ?? `Esperado identificador, encontrado '${tok.value || tok.type}'`,
      tok.line,
      tok.column,
    );
  }

  // =============================================
  // Entry Point
  // =============================================
  parse(): ProgramNode {
    this.expect("ALGORITMO");
    const nameTok = this.current();
    let progName = "programa";
    if (this.check("STRING")) {
      progName = this.advance().value;
    } else if (this.check("IDENT")) {
      progName = this.advance().value;
    }

    const typeDecls: TypeDeclNode[] = [];
    const varDecls: VarDeclNode[] = [];
    const constDecls: ConstDeclNode[] = [];
    const procedures: ProcedureNode[] = [];
    const functions: FunctionNode[] = [];

    // Parse type declarations
    while (this.check("TIPO")) {
      typeDecls.push(...this.parseTypeDecls());
    }

    // Parse procedures/functions that appear BEFORE var/const
    while (this.check("PROCEDIMENTO") || this.check("FUNCAO")) {
      if (this.check("PROCEDIMENTO")) procedures.push(this.parseProcedure());
      else functions.push(this.parseFunction());
    }

    // Parse variable and constant declarations (var/const can appear in any order)
    while (this.check("VAR") || this.check("CONST")) {
      if (this.check("VAR")) {
        this.advance();
        while (
          !this.check("INICIO") &&
          !this.check("PROCEDIMENTO") &&
          !this.check("FUNCAO") &&
          !this.check("CONST") &&
          !this.check("EOF")
        ) {
          varDecls.push(...this.parseVarDeclLine());
        }
      } else {
        // CONST block
        this.advance();
        while (
          !this.check("INICIO") &&
          !this.check("PROCEDIMENTO") &&
          !this.check("FUNCAO") &&
          !this.check("VAR") &&
          !this.check("EOF")
        ) {
          constDecls.push(this.parseConstDeclLine());
        }
      }
    }

    // Parse procedures/functions that appear AFTER var/const
    while (this.check("PROCEDIMENTO") || this.check("FUNCAO")) {
      if (this.check("PROCEDIMENTO")) procedures.push(this.parseProcedure());
      else functions.push(this.parseFunction());
    }

    this.expect("INICIO");
    const body = this.parseStmtList("FIM_ALGORITMO");
    this.expect("FIM_ALGORITMO");

    return {
      kind: "Program",
      name: progName,
      typeDecls,
      varDecls,
      constDecls,
      procedures,
      functions,
      body,
      line: nameTok.line,
    };
  }

  // =============================================
  // Type Declarations
  // =============================================
  private parseTypeDecls(): TypeDeclNode[] {
    const decls: TypeDeclNode[] = [];
    this.expect("TIPO");
    while (
      !this.check("VAR") &&
      !this.check("INICIO") &&
      !this.check("PROCEDIMENTO") &&
      !this.check("FUNCAO") &&
      !this.check("EOF")
    ) {
      const line = this.current().line;
      const name = this.expectIdent("Esperado nome do tipo").value;
      this.expect("EQ");
      this.expect("REGISTRO");
      const fields: VarDeclNode[] = [];
      while (!this.check("FIM_REGISTRO") && !this.check("EOF")) {
        fields.push(...this.parseVarDeclLine());
      }
      this.expect("FIM_REGISTRO");
      decls.push({ kind: "TypeDecl", name, fields, line });
    }
    return decls;
  }

  // =============================================
  // Variable Declarations
  // =============================================
  private parseVarDeclLine(): VarDeclNode[] {
    const line = this.current().line;
    const names: string[] = [];

    // Read list of names
    names.push(this.expectIdent("Esperado nome de variável").value);
    while (this.match("COMMA")) {
      names.push(this.expectIdent("Esperado nome de variável").value);
    }

    this.expect("COLON");
    const varType = this.parseTypeAnnotation();

    return [{ kind: "VarDecl", names, varType, line }];
  }

  // =============================================
  // Constant Declarations
  // =============================================
  private parseConstDeclLine(): ConstDeclNode {
    const line = this.current().line;
    // nome = expressão
    const name = this.expectIdent("Esperado nome da constante").value;
    this.expect("EQ", "Esperado '=' após nome da constante");
    const value = this.parseExpr();
    return { kind: "ConstDecl", name, value, line };
  }

  private parseTypeAnnotation(): TypeAnnotation {
    if (this.check("INTEIRO")) {
      this.advance();
      return { tag: "inteiro" };
    }
    if (this.check("REAL_TYPE")) {
      this.advance();
      return { tag: "real" };
    }
    if (this.check("CARACTERE")) {
      this.advance();
      return { tag: "caractere" };
    }
    if (this.check("LOGICO")) {
      this.advance();
      return { tag: "logico" };
    }

    // vetor[low..high] de tipo
    if (this.check("VETOR")) {
      this.advance();
      this.expect("LBRACKET");
      const dims: DimSpec[] = [];
      dims.push(this.parseDimSpec());
      while (this.match("COMMA")) {
        dims.push(this.parseDimSpec());
      }
      this.expect("RBRACKET");
      this.expect("DE");
      const elementType = this.parseVectorElementType();
      return { tag: "vetor", dims, elementType };
    }

    // matriz[low..high, low..high] de tipo (VisualG)
    if (this.check("MATRIZ")) {
      this.advance();
      this.expect("LBRACKET");
      const dims: DimSpec[] = [];
      dims.push(this.parseDimSpec());
      while (this.match("COMMA")) {
        dims.push(this.parseDimSpec());
      }
      this.expect("RBRACKET");
      this.expect("DE");
      const elementType = this.parseVectorElementType();
      return { tag: "vetor", dims, elementType };
    }

    // custom type (registro)
    if (this.check("IDENT")) {
      const name = this.advance().value;
      return { tag: "custom", name };
    }

    const tok = this.current();
    throw new ParseError(
      `Tipo desconhecido: '${tok.value}'`,
      tok.line,
      tok.column,
    );
  }

  private parseDimSpec(): DimSpec {
    const low = this.parseExpr();
    this.expect("DOTDOT");
    const high = this.parseExpr();
    return { low, high };
  }

  private parseVectorElementType(): BaseType | { tag: "custom"; name: string } {
    if (this.check("IDENT")) {
      return { tag: "custom", name: this.advance().value };
    }
    return this.parseBaseType();
  }

  private parseBaseType(): BaseType {
    if (this.check("INTEIRO")) {
      this.advance();
      return "inteiro";
    }
    if (this.check("REAL_TYPE")) {
      this.advance();
      return "real";
    }
    if (this.check("CARACTERE")) {
      this.advance();
      return "caractere";
    }
    if (this.check("LOGICO")) {
      this.advance();
      return "logico";
    }
    const tok = this.current();
    throw new ParseError(
      `Tipo base esperado, encontrado '${tok.value}'`,
      tok.line,
      tok.column,
    );
  }

  // =============================================
  // Procedures & Functions
  // =============================================
  private parseParams(): ParamDecl[] {
    const params: ParamDecl[] = [];
    if (!this.check("LPAREN")) return params;
    this.advance();
    if (!this.check("RPAREN")) {
      params.push(...this.parseParamDecl());
      while (this.match("SEMICOLON")) {
        params.push(...this.parseParamDecl());
      }
    }
    this.expect("RPAREN");
    return params;
  }

  private parseParamDecl(): ParamDecl[] {
    const byRef = !!this.match("VAR");
    const names: string[] = [this.expectIdent().value];
    while (this.match("COMMA")) names.push(this.expectIdent().value);
    this.expect("COLON");
    const varType = this.parseTypeAnnotation();
    return [{ names, varType, byRef }];
  }

  private parseProcedure(): ProcedureNode {
    const line = this.current().line;
    this.expect("PROCEDIMENTO");
    const name = this.expectIdent("Esperado nome do procedimento").value;
    const params = this.parseParams();

    const varDecls: VarDeclNode[] = [];
    if (this.check("VAR")) {
      this.advance();
      while (!this.check("INICIO") && !this.check("EOF")) {
        varDecls.push(...this.parseVarDeclLine());
      }
    }

    this.expect("INICIO");
    const body = this.parseStmtList("FIM_PROCEDIMENTO");
    this.expect("FIM_PROCEDIMENTO");

    return { kind: "Procedure", name, params, varDecls, body, line };
  }

  private parseFunction(): FunctionNode {
    const line = this.current().line;
    this.expect("FUNCAO");
    const name = this.expectIdent("Esperado nome da função").value;
    const params = this.parseParams();
    this.expect("COLON");
    const returnType = this.parseTypeAnnotation();

    const varDecls: VarDeclNode[] = [];
    if (this.check("VAR")) {
      this.advance();
      while (!this.check("INICIO") && !this.check("EOF")) {
        varDecls.push(...this.parseVarDeclLine());
      }
    }

    this.expect("INICIO");
    const body = this.parseStmtList("FIM_FUNCAO");
    this.expect("FIM_FUNCAO");

    return { kind: "Function", name, params, returnType, varDecls, body, line };
  }

  // =============================================
  // Statement List
  // =============================================
  private parseStmtList(...terminators: TokenType[]): StmtNode[] {
    const stmts: StmtNode[] = [];
    while (!this.check(...terminators) && !this.check("EOF")) {
      const stmt = this.parseStmt();
      if (stmt) stmts.push(stmt);
    }
    return stmts;
  }

  // =============================================
  // Statements
  // =============================================
  private parseStmt(): StmtNode | null {
    const tok = this.current();

    switch (tok.type) {
      case "ESCREVA":
        return this.parseWrite(false);
      case "ESCREVAL":
        return this.parseWrite(true);
      case "LEIA":
        return this.parseRead();
      case "SE":
        return this.parseIf();
      case "PARA":
        return this.parseFor();
      case "ENQUANTO":
        return this.parseWhile();
      case "REPITA":
        return this.parseRepeat();
      case "ESCOLHA":
        return this.parseChoose();
      case "RETORNE":
        return this.parseReturn();
      case "INTERROMPA":
        this.advance();
        return { kind: "Break", line: tok.line };
      case "IDENT": {
        // Could be assignment or procedure call
        return this.parseIdentStmt();
      }
      default:
        // Skip unknown tokens gracefully
        this.advance();
        return null;
    }
  }

  private parseWrite(newline: boolean): WriteNode {
    const line = this.current().line;
    this.advance(); // escreva | escreval
    this.expect("LPAREN");
    const args: import("./ast").WriteArg[] = [];
    if (!this.check("RPAREN")) {
      args.push(this.parseWriteArg());
      while (this.match("COMMA")) {
        args.push(this.parseWriteArg());
      }
    }
    this.expect("RPAREN");
    return { kind: "Write", args, newline, line };
  }

  private parseWriteArg(): import("./ast").WriteArg {
    const expr = this.parseExpr();

    // Verificar se há formatação :width:decimals
    let width: number | undefined;
    let decimals: number | undefined;

    if (this.match("COLON")) {
      const widthTok = this.current();
      if (widthTok.type === "NUMBER") {
        width = parseInt(widthTok.value, 10);
        this.advance();

        if (this.match("COLON")) {
          const decTok = this.current();
          if (decTok.type === "NUMBER") {
            decimals = parseInt(decTok.value, 10);
            this.advance();
          }
        }
      }
    }

    return { expr, width, decimals };
  }

  private parseRead(): ReadNode {
    const line = this.current().line;
    this.advance(); // leia
    this.expect("LPAREN");
    const targets: LValueNode[] = [];
    targets.push(this.parseLValue());
    while (this.match("COMMA")) {
      targets.push(this.parseLValue());
    }
    this.expect("RPAREN");
    return { kind: "Read", targets, line };
  }

  private parseLValue(): LValueNode {
    const tok = this.expectIdent("Esperado variável");
    let lv: LValueNode = { kind: "LIdent", name: tok.value, line: tok.line };

    while (true) {
      if (this.check("LBRACKET")) {
        this.advance();
        const indices: ExprNode[] = [this.parseExpr()];
        while (this.match("COMMA")) indices.push(this.parseExpr());
        this.expect("RBRACKET");
        lv = { kind: "LIndex", base: lv, indices, line: tok.line };
      } else if (this.check("DOT")) {
        this.advance();
        const field = this.expectIdent("Esperado campo").value;
        lv = { kind: "LField", base: lv, field, line: tok.line };
      } else {
        break;
      }
    }
    return lv;
  }

  private parseIf(): IfNode {
    const line = this.current().line;
    this.expect("SE");
    const condition = this.parseExpr();
    this.expect("ENTAO");

    const then = this.parseStmtList("SENAO", "FIM_SE");
    let else_: StmtNode[] = [];

    if (this.match("SENAO")) {
      else_ = this.parseStmtList("FIM_SE");
    }
    this.expect("FIM_SE");

    return { kind: "If", condition, then, else_, line };
  }

  private parseFor(): ForNode {
    const line = this.current().line;
    this.expect("PARA");
    const variable = this.expectIdent("Esperado variável do laço").value;
    this.expect("DE");
    const from = this.parseExpr();
    this.expect("ATE");
    const to = this.parseExpr();

    let step: ExprNode | null = null;
    if (this.match("PASSO")) {
      step = this.parseExpr();
    }

    this.expect("FACA");
    const body = this.parseStmtList("FIM_PARA");
    this.expect("FIM_PARA");

    return { kind: "For", variable, from, to, step, body, line };
  }

  private parseWhile(): WhileNode {
    const line = this.current().line;
    this.expect("ENQUANTO");
    const condition = this.parseExpr();
    this.expect("FACA");
    const body = this.parseStmtList("FIM_ENQUANTO");
    this.expect("FIM_ENQUANTO");
    return { kind: "While", condition, body, line };
  }

  private parseRepeat(): RepeatNode {
    const line = this.current().line;
    this.expect("REPITA");
    const body = this.parseStmtList("ATE_QUE");
    this.expect("ATE_QUE");
    const condition = this.parseExpr();
    return { kind: "Repeat", body, condition, line };
  }

  private parseChoose(): ChooseNode {
    const line = this.current().line;
    this.expect("ESCOLHA");
    const expr = this.parseExpr();

    const cases: CaseClause[] = [];
    let otherwise: StmtNode[] = [];

    while (!this.check("FIM_ESCOLHA") && !this.check("EOF")) {
      if (this.check("OUTRA_OPCAO")) {
        this.advance();
        this.match("COLON");
        otherwise = this.parseStmtList("FIM_ESCOLHA");
        break;
      }
      if (this.check("CASO")) {
        this.advance();
        const values: ExprNode[] = [this.parseExpr()];
        while (this.match("COMMA")) values.push(this.parseExpr());
        this.match("COLON");
        const body = this.parseStmtList("CASO", "OUTRA_OPCAO", "FIM_ESCOLHA");
        cases.push({ values, body });
      } else {
        this.advance(); // skip unexpected
      }
    }
    this.expect("FIM_ESCOLHA");

    return { kind: "Choose", expr, cases, otherwise, line };
  }

  private parseReturn(): ReturnNode {
    const line = this.current().line;
    this.expect("RETORNE");
    // If next token starts an expression, parse it
    const starters: TokenType[] = [
      "NUMBER",
      "REAL",
      "STRING",
      "VERDADEIRO",
      "FALSO",
      "IDENT",
      "LPAREN",
      "MINUS",
      "NAO",
    ];
    if (this.check(...starters)) {
      return { kind: "Return", value: this.parseExpr(), line };
    }
    return { kind: "Return", value: null, line };
  }

  private parseIdentStmt(): StmtNode {
    const line = this.current().line;
    const name = this.current().value;
    const nextType = this.peek().type;

    // Bare procedure call (no parentheses): `saudacao`
    // Detect by absence of assignment-related tokens after IDENT
    if (
      nextType !== "LARROW" &&
      nextType !== "LPAREN" &&
      nextType !== "LBRACKET" &&
      nextType !== "DOT"
    ) {
      this.advance(); // consume IDENT
      return { kind: "CallStmt", name, args: [], line };
    }

    // Procedure call with parentheses: `dobro(21)`
    if (nextType === "LPAREN") {
      // Look past closing ) to detect if LARROW follows (would be assignment, not call)
      const saved = this.pos;
      this.advance(); // consume IDENT
      this.advance(); // consume (
      let depth = 1;
      while (this.pos < this.tokens.length && depth > 0) {
        if (this.current().type === "LPAREN") depth++;
        else if (this.current().type === "RPAREN") depth--;
        this.pos++;
      }
      const afterParen = this.current().type;
      this.pos = saved; // restore

      if (afterParen !== "LARROW") {
        const callName = this.advance().value;
        this.advance(); // (
        const args: ExprNode[] = [];
        if (!this.check("RPAREN")) {
          args.push(this.parseExpr());
          while (this.match("COMMA")) args.push(this.parseExpr());
        }
        this.expect("RPAREN");
        return { kind: "CallStmt", name: callName, args, line };
      }
    }

    // Assignment: lvalue <- expr
    const lv = this.parseLValue();
    this.expect("LARROW");
    const value = this.parseExpr();
    return { kind: "Assign", target: lv, value, line };
  }

  // =============================================
  // Expressions (Pratt-style precedence climbing)
  // =============================================
  parseExpr(): ExprNode {
    return this.parseOr();
  }

  private parseOr(): ExprNode {
    let left = this.parseAnd();
    while (this.check("OU") || this.check("XOU")) {
      const op = this.advance().value.toLowerCase() as BinaryOp;
      const right = this.parseAnd();
      left = { kind: "Binary", op, left, right, line: left.line };
    }
    return left;
  }

  private parseAnd(): ExprNode {
    let left = this.parseNot();
    while (this.check("E")) {
      const op = this.advance().value.toLowerCase() as BinaryOp;
      const right = this.parseNot();
      left = { kind: "Binary", op, left, right, line: left.line };
    }
    return left;
  }

  private parseNot(): ExprNode {
    if (this.check("NAO")) {
      const line = this.current().line;
      this.advance();
      return { kind: "Unary", op: "nao", expr: this.parseNot(), line };
    }
    return this.parseComparison();
  }

  private parseComparison(): ExprNode {
    let left = this.parseAddSub();
    const ops: TokenType[] = ["EQ", "NEQ", "LT", "LTE", "GT", "GTE"];
    while (this.check(...ops)) {
      const tok = this.advance();
      const opMap: Record<string, BinaryOp> = {
        EQ: "=",
        NEQ: "<>",
        LT: "<",
        LTE: "<=",
        GT: ">",
        GTE: ">=",
      };
      const op = opMap[tok.type] as BinaryOp;
      const right = this.parseAddSub();
      left = { kind: "Binary", op, left, right, line: left.line };
    }
    return left;
  }

  private parseAddSub(): ExprNode {
    let left = this.parseMulDiv();
    while (this.check("PLUS") || this.check("MINUS")) {
      const op = this.advance().value as BinaryOp;
      const right = this.parseMulDiv();
      left = { kind: "Binary", op, left, right, line: left.line };
    }
    return left;
  }

  private parseMulDiv(): ExprNode {
    let left = this.parseUnary();
    while (
      this.check("STAR") ||
      this.check("SLASH") ||
      this.check("MOD") ||
      this.check("DIV")
    ) {
      const tok = this.advance();
      let op: BinaryOp;
      if (tok.type === "STAR") op = "*";
      else if (tok.type === "SLASH") op = "/";
      else op = tok.value.toLowerCase() as BinaryOp;
      const right = this.parseUnary();
      left = { kind: "Binary", op, left, right, line: left.line };
    }
    return left;
  }

  private parseUnary(): ExprNode {
    if (this.check("MINUS")) {
      const line = this.current().line;
      this.advance();
      return { kind: "Unary", op: "-", expr: this.parsePow(), line };
    }
    if (this.check("PLUS")) {
      this.advance();
      return this.parsePow();
    }
    return this.parsePow();
  }

  private parsePow(): ExprNode {
    let base = this.parsePostfix();
    if (this.check("POW")) {
      const line = this.current().line;
      this.advance();
      const exp = this.parseUnary(); // right-associative
      return { kind: "Binary", op: "^", left: base, right: exp, line };
    }
    return base;
  }

  private parsePostfix(): ExprNode {
    let expr = this.parsePrimary();

    while (true) {
      if (this.check("LBRACKET")) {
        this.advance();
        const indices: ExprNode[] = [this.parseExpr()];
        while (this.match("COMMA")) indices.push(this.parseExpr());
        this.expect("RBRACKET");
        expr = { kind: "Index", base: expr, indices, line: expr.line };
      } else if (this.check("DOT")) {
        this.advance();
        const field = this.expectIdent("Esperado campo").value;
        expr = { kind: "Field", base: expr, field, line: expr.line };
      } else {
        break;
      }
    }
    return expr;
  }

  private parsePrimary(): ExprNode {
    const tok = this.current();

    if (tok.type === "NUMBER") {
      this.advance();
      return {
        kind: "Literal",
        value: parseInt(tok.value, 10),
        line: tok.line,
      };
    }
    if (tok.type === "REAL") {
      this.advance();
      return { kind: "Literal", value: parseFloat(tok.value), line: tok.line };
    }
    if (tok.type === "STRING") {
      this.advance();
      return { kind: "Literal", value: tok.value, line: tok.line };
    }
    if (tok.type === "VERDADEIRO") {
      this.advance();
      return { kind: "Literal", value: true, line: tok.line };
    }
    if (tok.type === "FALSO") {
      this.advance();
      return { kind: "Literal", value: false, line: tok.line };
    }
    if (tok.type === "LPAREN") {
      this.advance();
      const expr = this.parseExpr();
      this.expect("RPAREN");
      return expr;
    }
    if (tok.type === "IDENT") {
      this.advance();
      // Function call?
      if (this.check("LPAREN")) {
        this.advance();
        const args: ExprNode[] = [];
        if (!this.check("RPAREN")) {
          args.push(this.parseExpr());
          while (this.match("COMMA")) args.push(this.parseExpr());
        }
        this.expect("RPAREN");
        return { kind: "CallExpr", name: tok.value, args, line: tok.line };
      }
      return { kind: "Ident", name: tok.value, line: tok.line };
    }

    throw new ParseError(
      `Token inesperado: '${tok.value || tok.type}'`,
      tok.line,
      tok.column,
    );
  }
}
