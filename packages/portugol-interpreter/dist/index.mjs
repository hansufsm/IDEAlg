// src/lexer/lexer.ts
var KEYWORDS = {
  algoritmo: "ALGORITMO",
  fimalgoritmo: "FIM_ALGORITMO",
  var: "VAR",
  const: "CONST",
  inicio: "INICIO",
  inteiro: "INTEIRO",
  real: "REAL_TYPE",
  caractere: "CARACTERE",
  logico: "LOGICO",
  escreva: "ESCREVA",
  escreval: "ESCREVAL",
  leia: "LEIA",
  se: "SE",
  entao: "ENTAO",
  senao: "SENAO",
  fimse: "FIM_SE",
  para: "PARA",
  de: "DE",
  ate: "ATE",
  passo: "PASSO",
  faca: "FACA",
  fimpara: "FIM_PARA",
  enquanto: "ENQUANTO",
  fimenquanto: "FIM_ENQUANTO",
  repita: "REPITA",
  atequ\u00E9: "ATE_QUE",
  ateque: "ATE_QUE",
  escolha: "ESCOLHA",
  caso: "CASO",
  outrocaso: "OUTRA_OPCAO",
  fimescolha: "FIM_ESCOLHA",
  procedimento: "PROCEDIMENTO",
  fimprocedimento: "FIM_PROCEDIMENTO",
  funcao: "FUNCAO",
  fimfuncao: "FIM_FUNCAO",
  retorne: "RETORNE",
  tipo: "TIPO",
  fimtipo: "FIM_TIPO",
  registro: "REGISTRO",
  fimregistro: "FIM_REGISTRO",
  vetor: "VETOR",
  matriz: "MATRIZ",
  interrompa: "INTERROMPA",
  e: "E",
  ou: "OU",
  nao: "NAO",
  xou: "XOU",
  verdadeiro: "VERDADEIRO",
  falso: "FALSO",
  div: "DIV",
  mod: "MOD"
};
var LexerError = class extends Error {
  constructor(msg, line, column) {
    super(`Erro l\xE9xico [${line}:${column}]: ${msg}`);
    this.line = line;
    this.column = column;
    this.name = "LexerError";
  }
};
var Lexer = class {
  constructor(source) {
    this.source = source;
    this.pos = 0;
    this.line = 1;
    this.column = 1;
    this.tokens = [];
  }
  tokenize() {
    while (this.pos < this.source.length) {
      this.skipWhitespaceAndComments();
      if (this.pos >= this.source.length) break;
      const ch = this.current();
      if (ch === "\n") {
        this.advance();
        continue;
      }
      if (this.isDigit(ch) || ch === "." && this.isDigit(this.peek(1))) {
        this.readNumber();
      } else if (ch === '"' || ch === "'") {
        this.readString(ch);
      } else if (this.isAlpha(ch) || ch === "_") {
        this.readIdent();
      } else {
        this.readSymbol();
      }
    }
    this.tokens.push({
      type: "EOF",
      value: "",
      line: this.line,
      column: this.column
    });
    return this.tokens;
  }
  skipWhitespaceAndComments() {
    while (this.pos < this.source.length) {
      const ch = this.current();
      if (ch === " " || ch === "	" || ch === "\r") {
        this.advance();
      } else if (ch === "/" && this.peek(1) === "/") {
        while (this.pos < this.source.length && this.current() !== "\n")
          this.advance();
      } else if (ch === "{") {
        while (this.pos < this.source.length && this.current() !== "}")
          this.advance();
        if (this.pos < this.source.length) this.advance();
      } else {
        break;
      }
    }
  }
  readNumber() {
    const start = this.pos;
    const startLine = this.line;
    const startCol = this.column;
    let isReal = false;
    while (this.pos < this.source.length && this.isDigit(this.current()))
      this.advance();
    if (this.pos < this.source.length && this.current() === "." && this.peek(1) !== ".") {
      isReal = true;
      this.advance();
      while (this.pos < this.source.length && this.isDigit(this.current()))
        this.advance();
    }
    if (this.pos < this.source.length && (this.current() === "e" || this.current() === "E")) {
      isReal = true;
      this.advance();
      if (this.current() === "+" || this.current() === "-") this.advance();
      while (this.pos < this.source.length && this.isDigit(this.current()))
        this.advance();
    }
    const value = this.source.slice(start, this.pos);
    this.tokens.push({
      type: isReal ? "REAL" : "NUMBER",
      value,
      line: startLine,
      column: startCol
    });
  }
  readString(quote) {
    const startLine = this.line;
    const startCol = this.column;
    this.advance();
    let value = "";
    while (this.pos < this.source.length && this.current() !== quote) {
      if (this.current() === "\n") break;
      value += this.current();
      this.advance();
    }
    if (this.pos < this.source.length) this.advance();
    this.tokens.push({
      type: "STRING",
      value,
      line: startLine,
      column: startCol
    });
  }
  readIdent() {
    const startLine = this.line;
    const startCol = this.column;
    let value = "";
    while (this.pos < this.source.length && (this.isAlphaNum(this.current()) || this.current() === "_")) {
      value += this.current();
      this.advance();
    }
    const lower = value.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    const kwType = KEYWORDS[lower];
    this.tokens.push({
      type: kwType ?? "IDENT",
      value,
      line: startLine,
      column: startCol
    });
  }
  readSymbol() {
    const startLine = this.line;
    const startCol = this.column;
    const ch = this.current();
    const twoChar = ch + (this.peek(1) ?? "");
    if (twoChar === "<-" || ch === "\u2190") {
      this.tokens.push({
        type: "LARROW",
        value: "<-",
        line: startLine,
        column: startCol
      });
      this.advance();
      if (ch !== "\u2190") this.advance();
      return;
    }
    if (twoChar === "<>") {
      this.tokens.push({
        type: "NEQ",
        value: twoChar,
        line: startLine,
        column: startCol
      });
      this.advance();
      this.advance();
      return;
    }
    if (twoChar === "<=") {
      this.tokens.push({
        type: "LTE",
        value: twoChar,
        line: startLine,
        column: startCol
      });
      this.advance();
      this.advance();
      return;
    }
    if (twoChar === ">=") {
      this.tokens.push({
        type: "GTE",
        value: twoChar,
        line: startLine,
        column: startCol
      });
      this.advance();
      this.advance();
      return;
    }
    if (twoChar === "..") {
      this.tokens.push({
        type: "DOTDOT",
        value: twoChar,
        line: startLine,
        column: startCol
      });
      this.advance();
      this.advance();
      return;
    }
    const map = {
      "+": "PLUS",
      "-": "MINUS",
      "*": "STAR",
      "/": "SLASH",
      "%": "MOD",
      "^": "POW",
      "=": "EQ",
      "<": "LT",
      ">": "GT",
      ":": "COLON",
      ",": "COMMA",
      ";": "SEMICOLON",
      "(": "LPAREN",
      ")": "RPAREN",
      "[": "LBRACKET",
      "]": "RBRACKET",
      ".": "DOT"
    };
    if (map[ch]) {
      this.tokens.push({
        type: map[ch],
        value: ch,
        line: startLine,
        column: startCol
      });
      this.advance();
    } else {
      throw new LexerError(
        `Caractere inesperado: '${ch}'`,
        startLine,
        startCol
      );
    }
  }
  current() {
    return this.source[this.pos] ?? "";
  }
  peek(offset) {
    return this.source[this.pos + offset] ?? "";
  }
  advance() {
    if (this.source[this.pos] === "\n") {
      this.line++;
      this.column = 1;
    } else {
      this.column++;
    }
    this.pos++;
  }
  isDigit(ch) {
    return ch >= "0" && ch <= "9";
  }
  isAlpha(ch) {
    return /[a-zA-ZÀ-ÿ]/.test(ch);
  }
  isAlphaNum(ch) {
    return this.isAlpha(ch) || this.isDigit(ch);
  }
};

// src/parser/parser.ts
var ParseError = class extends Error {
  constructor(msg, line, column) {
    super(`Erro sint\xE1tico [${line}:${column}]: ${msg}`);
    this.line = line;
    this.column = column;
    this.name = "ParseError";
  }
};
var Parser = class {
  constructor(tokens) {
    this.tokens = tokens;
    this.pos = 0;
  }
  // =============================================
  // Utilities
  // =============================================
  current() {
    return this.tokens[this.pos] ?? { type: "EOF", value: "", line: 0, column: 0 };
  }
  peek(offset = 1) {
    return this.tokens[this.pos + offset] ?? {
      type: "EOF",
      value: "",
      line: 0,
      column: 0
    };
  }
  advance() {
    const tok = this.current();
    this.pos++;
    return tok;
  }
  check(...types) {
    return types.includes(this.current().type);
  }
  match(...types) {
    if (this.check(...types)) return this.advance();
    return null;
  }
  expect(type, msg) {
    if (this.current().type === type) return this.advance();
    const tok = this.current();
    throw new ParseError(
      msg ?? `Esperado '${type}', encontrado '${tok.value || tok.type}'`,
      tok.line,
      tok.column
    );
  }
  expectIdent(msg) {
    if (this.current().type === "IDENT") return this.advance();
    const tok = this.current();
    throw new ParseError(
      msg ?? `Esperado identificador, encontrado '${tok.value || tok.type}'`,
      tok.line,
      tok.column
    );
  }
  // =============================================
  // Entry Point
  // =============================================
  parse() {
    this.expect("ALGORITMO");
    const nameTok = this.current();
    let progName = "programa";
    if (this.check("STRING")) {
      progName = this.advance().value;
    } else if (this.check("IDENT")) {
      progName = this.advance().value;
    }
    const typeDecls = [];
    const varDecls = [];
    const constDecls = [];
    const procedures = [];
    const functions = [];
    while (this.check("TIPO")) {
      typeDecls.push(...this.parseTypeDecls());
    }
    while (this.check("PROCEDIMENTO") || this.check("FUNCAO")) {
      if (this.check("PROCEDIMENTO")) procedures.push(this.parseProcedure());
      else functions.push(this.parseFunction());
    }
    while (this.check("VAR") || this.check("CONST")) {
      if (this.check("VAR")) {
        this.advance();
        while (!this.check("INICIO") && !this.check("PROCEDIMENTO") && !this.check("FUNCAO") && !this.check("CONST") && !this.check("EOF")) {
          varDecls.push(...this.parseVarDeclLine());
        }
      } else {
        this.advance();
        while (!this.check("INICIO") && !this.check("PROCEDIMENTO") && !this.check("FUNCAO") && !this.check("VAR") && !this.check("EOF")) {
          constDecls.push(this.parseConstDeclLine());
        }
      }
    }
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
      line: nameTok.line
    };
  }
  // =============================================
  // Type Declarations
  // =============================================
  parseTypeDecls() {
    const decls = [];
    this.expect("TIPO");
    while (!this.check("VAR") && !this.check("INICIO") && !this.check("PROCEDIMENTO") && !this.check("FUNCAO") && !this.check("EOF")) {
      const line = this.current().line;
      const name = this.expectIdent("Esperado nome do tipo").value;
      this.expect("EQ");
      this.expect("REGISTRO");
      const fields = [];
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
  parseVarDeclLine() {
    const line = this.current().line;
    const names = [];
    names.push(this.expectIdent("Esperado nome de vari\xE1vel").value);
    while (this.match("COMMA")) {
      names.push(this.expectIdent("Esperado nome de vari\xE1vel").value);
    }
    this.expect("COLON");
    const varType = this.parseTypeAnnotation();
    return [{ kind: "VarDecl", names, varType, line }];
  }
  // =============================================
  // Constant Declarations
  // =============================================
  parseConstDeclLine() {
    const line = this.current().line;
    const name = this.expectIdent("Esperado nome da constante").value;
    this.expect("EQ", "Esperado '=' ap\xF3s nome da constante");
    const value = this.parseExpr();
    return { kind: "ConstDecl", name, value, line };
  }
  parseTypeAnnotation() {
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
    if (this.check("VETOR")) {
      this.advance();
      this.expect("LBRACKET");
      const dims = [];
      dims.push(this.parseDimSpec());
      while (this.match("COMMA")) {
        dims.push(this.parseDimSpec());
      }
      this.expect("RBRACKET");
      this.expect("DE");
      const elementType = this.parseVectorElementType();
      return { tag: "vetor", dims, elementType };
    }
    if (this.check("MATRIZ")) {
      this.advance();
      this.expect("LBRACKET");
      const dims = [];
      dims.push(this.parseDimSpec());
      while (this.match("COMMA")) {
        dims.push(this.parseDimSpec());
      }
      this.expect("RBRACKET");
      this.expect("DE");
      const elementType = this.parseVectorElementType();
      return { tag: "vetor", dims, elementType };
    }
    if (this.check("IDENT")) {
      const name = this.advance().value;
      return { tag: "custom", name };
    }
    const tok = this.current();
    throw new ParseError(
      `Tipo desconhecido: '${tok.value}'`,
      tok.line,
      tok.column
    );
  }
  parseDimSpec() {
    const low = this.parseExpr();
    this.expect("DOTDOT");
    const high = this.parseExpr();
    return { low, high };
  }
  parseVectorElementType() {
    if (this.check("IDENT")) {
      return { tag: "custom", name: this.advance().value };
    }
    return this.parseBaseType();
  }
  parseBaseType() {
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
      tok.column
    );
  }
  // =============================================
  // Procedures & Functions
  // =============================================
  parseParams() {
    const params = [];
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
  parseParamDecl() {
    const byRef = !!this.match("VAR");
    const names = [this.expectIdent().value];
    while (this.match("COMMA")) names.push(this.expectIdent().value);
    this.expect("COLON");
    const varType = this.parseTypeAnnotation();
    return [{ names, varType, byRef }];
  }
  parseProcedure() {
    const line = this.current().line;
    this.expect("PROCEDIMENTO");
    const name = this.expectIdent("Esperado nome do procedimento").value;
    const params = this.parseParams();
    const varDecls = [];
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
  parseFunction() {
    const line = this.current().line;
    this.expect("FUNCAO");
    const name = this.expectIdent("Esperado nome da fun\xE7\xE3o").value;
    const params = this.parseParams();
    this.expect("COLON");
    const returnType = this.parseTypeAnnotation();
    const varDecls = [];
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
  parseStmtList(...terminators) {
    const stmts = [];
    while (!this.check(...terminators) && !this.check("EOF")) {
      const stmt = this.parseStmt();
      if (stmt) stmts.push(stmt);
    }
    return stmts;
  }
  // =============================================
  // Statements
  // =============================================
  parseStmt() {
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
        return this.parseIdentStmt();
      }
      default:
        this.advance();
        return null;
    }
  }
  parseWrite(newline) {
    const line = this.current().line;
    this.advance();
    this.expect("LPAREN");
    const args = [];
    if (!this.check("RPAREN")) {
      args.push(this.parseWriteArg());
      while (this.match("COMMA")) {
        args.push(this.parseWriteArg());
      }
    }
    this.expect("RPAREN");
    return { kind: "Write", args, newline, line };
  }
  parseWriteArg() {
    const expr = this.parseExpr();
    let width;
    let decimals;
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
  parseRead() {
    const line = this.current().line;
    this.advance();
    this.expect("LPAREN");
    const targets = [];
    targets.push(this.parseLValue());
    while (this.match("COMMA")) {
      targets.push(this.parseLValue());
    }
    this.expect("RPAREN");
    return { kind: "Read", targets, line };
  }
  parseLValue() {
    const tok = this.expectIdent("Esperado vari\xE1vel");
    let lv = { kind: "LIdent", name: tok.value, line: tok.line };
    while (true) {
      if (this.check("LBRACKET")) {
        this.advance();
        const indices = [this.parseExpr()];
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
  parseIf() {
    const line = this.current().line;
    this.expect("SE");
    const condition = this.parseExpr();
    this.expect("ENTAO");
    const then = this.parseStmtList("SENAO", "FIM_SE");
    let else_ = [];
    if (this.match("SENAO")) {
      else_ = this.parseStmtList("FIM_SE");
    }
    this.expect("FIM_SE");
    return { kind: "If", condition, then, else_, line };
  }
  parseFor() {
    const line = this.current().line;
    this.expect("PARA");
    const variable = this.expectIdent("Esperado vari\xE1vel do la\xE7o").value;
    this.expect("DE");
    const from = this.parseExpr();
    this.expect("ATE");
    const to = this.parseExpr();
    let step = null;
    if (this.match("PASSO")) {
      step = this.parseExpr();
    }
    this.expect("FACA");
    const body = this.parseStmtList("FIM_PARA");
    this.expect("FIM_PARA");
    return { kind: "For", variable, from, to, step, body, line };
  }
  parseWhile() {
    const line = this.current().line;
    this.expect("ENQUANTO");
    const condition = this.parseExpr();
    this.expect("FACA");
    const body = this.parseStmtList("FIM_ENQUANTO");
    this.expect("FIM_ENQUANTO");
    return { kind: "While", condition, body, line };
  }
  parseRepeat() {
    const line = this.current().line;
    this.expect("REPITA");
    const body = this.parseStmtList("ATE_QUE");
    this.expect("ATE_QUE");
    const condition = this.parseExpr();
    return { kind: "Repeat", body, condition, line };
  }
  parseChoose() {
    const line = this.current().line;
    this.expect("ESCOLHA");
    const expr = this.parseExpr();
    const cases = [];
    let otherwise = [];
    while (!this.check("FIM_ESCOLHA") && !this.check("EOF")) {
      if (this.check("OUTRA_OPCAO")) {
        this.advance();
        this.match("COLON");
        otherwise = this.parseStmtList("FIM_ESCOLHA");
        break;
      }
      if (this.check("CASO")) {
        this.advance();
        const values = [this.parseExpr()];
        while (this.match("COMMA")) values.push(this.parseExpr());
        this.match("COLON");
        const body = this.parseStmtList("CASO", "OUTRA_OPCAO", "FIM_ESCOLHA");
        cases.push({ values, body });
      } else {
        this.advance();
      }
    }
    this.expect("FIM_ESCOLHA");
    return { kind: "Choose", expr, cases, otherwise, line };
  }
  parseReturn() {
    const line = this.current().line;
    this.expect("RETORNE");
    const starters = [
      "NUMBER",
      "REAL",
      "STRING",
      "VERDADEIRO",
      "FALSO",
      "IDENT",
      "LPAREN",
      "MINUS",
      "NAO"
    ];
    if (this.check(...starters)) {
      return { kind: "Return", value: this.parseExpr(), line };
    }
    return { kind: "Return", value: null, line };
  }
  parseIdentStmt() {
    const line = this.current().line;
    const name = this.current().value;
    const nextType = this.peek().type;
    if (nextType !== "LARROW" && nextType !== "LPAREN" && nextType !== "LBRACKET" && nextType !== "DOT") {
      this.advance();
      return { kind: "CallStmt", name, args: [], line };
    }
    if (nextType === "LPAREN") {
      const saved = this.pos;
      this.advance();
      this.advance();
      let depth = 1;
      while (this.pos < this.tokens.length && depth > 0) {
        if (this.current().type === "LPAREN") depth++;
        else if (this.current().type === "RPAREN") depth--;
        this.pos++;
      }
      const afterParen = this.current().type;
      this.pos = saved;
      if (afterParen !== "LARROW") {
        const callName = this.advance().value;
        this.advance();
        const args = [];
        if (!this.check("RPAREN")) {
          args.push(this.parseExpr());
          while (this.match("COMMA")) args.push(this.parseExpr());
        }
        this.expect("RPAREN");
        return { kind: "CallStmt", name: callName, args, line };
      }
    }
    const lv = this.parseLValue();
    this.expect("LARROW");
    const value = this.parseExpr();
    return { kind: "Assign", target: lv, value, line };
  }
  // =============================================
  // Expressions (Pratt-style precedence climbing)
  // =============================================
  parseExpr() {
    return this.parseOr();
  }
  parseOr() {
    let left = this.parseAnd();
    while (this.check("OU") || this.check("XOU")) {
      const op = this.advance().value.toLowerCase();
      const right = this.parseAnd();
      left = { kind: "Binary", op, left, right, line: left.line };
    }
    return left;
  }
  parseAnd() {
    let left = this.parseNot();
    while (this.check("E")) {
      const op = this.advance().value.toLowerCase();
      const right = this.parseNot();
      left = { kind: "Binary", op, left, right, line: left.line };
    }
    return left;
  }
  parseNot() {
    if (this.check("NAO")) {
      const line = this.current().line;
      this.advance();
      return { kind: "Unary", op: "nao", expr: this.parseNot(), line };
    }
    return this.parseComparison();
  }
  parseComparison() {
    let left = this.parseAddSub();
    const ops = ["EQ", "NEQ", "LT", "LTE", "GT", "GTE"];
    while (this.check(...ops)) {
      const tok = this.advance();
      const opMap = {
        EQ: "=",
        NEQ: "<>",
        LT: "<",
        LTE: "<=",
        GT: ">",
        GTE: ">="
      };
      const op = opMap[tok.type];
      const right = this.parseAddSub();
      left = { kind: "Binary", op, left, right, line: left.line };
    }
    return left;
  }
  parseAddSub() {
    let left = this.parseMulDiv();
    while (this.check("PLUS") || this.check("MINUS")) {
      const op = this.advance().value;
      const right = this.parseMulDiv();
      left = { kind: "Binary", op, left, right, line: left.line };
    }
    return left;
  }
  parseMulDiv() {
    let left = this.parseUnary();
    while (this.check("STAR") || this.check("SLASH") || this.check("MOD") || this.check("DIV")) {
      const tok = this.advance();
      let op;
      if (tok.type === "STAR") op = "*";
      else if (tok.type === "SLASH") op = "/";
      else op = tok.value.toLowerCase();
      const right = this.parseUnary();
      left = { kind: "Binary", op, left, right, line: left.line };
    }
    return left;
  }
  parseUnary() {
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
  parsePow() {
    let base = this.parsePostfix();
    if (this.check("POW")) {
      const line = this.current().line;
      this.advance();
      const exp = this.parseUnary();
      return { kind: "Binary", op: "^", left: base, right: exp, line };
    }
    return base;
  }
  parsePostfix() {
    let expr = this.parsePrimary();
    while (true) {
      if (this.check("LBRACKET")) {
        this.advance();
        const indices = [this.parseExpr()];
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
  parsePrimary() {
    const tok = this.current();
    if (tok.type === "NUMBER") {
      this.advance();
      return {
        kind: "Literal",
        value: parseInt(tok.value, 10),
        line: tok.line
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
      if (this.check("LPAREN")) {
        this.advance();
        const args = [];
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
      tok.column
    );
  }
};

// src/interpreter/environment.ts
var RuntimeError = class extends Error {
  constructor(msg, line) {
    super(line ? `Erro em tempo de execu\xE7\xE3o [linha ${line}]: ${msg}` : `Erro em tempo de execu\xE7\xE3o: ${msg}`);
    this.line = line;
    this.name = "RuntimeError";
  }
};
var ReturnSignal = class {
  constructor(value) {
    this.value = value;
  }
};
var BreakSignal = class {
};
var Environment = class {
  constructor(parent = null) {
    this.parent = parent;
    this.store = /* @__PURE__ */ new Map();
    this.refStore = /* @__PURE__ */ new Map();
  }
  get(name) {
    const lower = name.toLowerCase();
    if (this.refStore.has(lower)) {
      const ref = this.refStore.get(lower);
      return ref.env.get(ref.name);
    }
    if (this.store.has(lower)) return this.store.get(lower);
    if (this.parent) return this.parent.get(name);
    throw new RuntimeError(`Vari\xE1vel '${name}' n\xE3o declarada`);
  }
  set(name, value) {
    const lower = name.toLowerCase();
    if (this.refStore.has(lower)) {
      const ref = this.refStore.get(lower);
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
    this.store.set(lower, value);
  }
  define(name, value) {
    this.store.set(name.toLowerCase(), value);
  }
  defineRef(name, targetEnv, targetName) {
    this.refStore.set(name.toLowerCase(), { env: targetEnv, name: targetName });
  }
  has(name) {
    const lower = name.toLowerCase();
    if (this.refStore.has(lower) || this.store.has(lower)) return true;
    return this.parent?.has(name) ?? false;
  }
  getEnvFor(name) {
    const lower = name.toLowerCase();
    if (this.refStore.has(lower)) {
      const ref = this.refStore.get(lower);
      return ref.env.getEnvFor(ref.name);
    }
    if (this.store.has(lower)) return this;
    if (this.parent) return this.parent.getEnvFor(name);
    throw new RuntimeError(`Vari\xE1vel '${name}' n\xE3o encontrada`);
  }
  snapshot() {
    const result = {};
    if (this.parent) {
      Object.assign(result, this.parent.snapshot());
    }
    for (const [k, v] of this.store.entries()) {
      result[k] = v;
    }
    return result;
  }
};
function createArray(dims, elementType) {
  const sizes = dims.map((d) => d.high - d.low + 1);
  const totalSize = sizes.reduce((a, b) => a * b, 1);
  const defaultVal = () => {
    switch (elementType) {
      case "inteiro":
        return 0;
      case "real":
        return 0;
      case "caractere":
        return "";
      case "logico":
        return false;
      default:
        return null;
    }
  };
  return {
    __type: "array",
    dims: sizes,
    low: dims.map((d) => d.low),
    data: Array.from({ length: totalSize }, defaultVal),
    elementType
  };
}
function arrayGet(arr, indices) {
  const idx = flatIndex(arr, indices);
  return arr.data[idx] ?? null;
}
function arraySet(arr, indices, value) {
  const idx = flatIndex(arr, indices);
  arr.data[idx] = value;
}
function flatIndex(arr, indices) {
  if (indices.length !== arr.dims.length) {
    throw new RuntimeError(`N\xFAmero de \xEDndices incorreto: esperado ${arr.dims.length}, recebido ${indices.length}`);
  }
  let idx = 0;
  let stride = 1;
  for (let i = arr.dims.length - 1; i >= 0; i--) {
    const adjusted = indices[i] - arr.low[i];
    if (adjusted < 0 || adjusted >= arr.dims[i]) {
      throw new RuntimeError(
        `\xCDndice ${indices[i]} fora dos limites [${arr.low[i]}..${arr.low[i] + arr.dims[i] - 1}]`
      );
    }
    idx += adjusted * stride;
    stride *= arr.dims[i];
  }
  return idx;
}
function toNumber(v, line) {
  if (typeof v === "number") return v;
  if (typeof v === "string") {
    const n = parseFloat(v);
    if (!isNaN(n)) return n;
  }
  throw new RuntimeError(`N\xE3o \xE9 poss\xEDvel converter '${String(v)}' para n\xFAmero`, line);
}
function toBoolean(v) {
  if (typeof v === "boolean") return v;
  if (typeof v === "number") return v !== 0;
  return false;
}
function toString(v) {
  if (v === null) return "";
  if (typeof v === "boolean") return v ? "VERDADEIRO" : "FALSO";
  if (typeof v === "number") {
    if (Number.isInteger(v)) return String(v);
    return v.toFixed(6).replace(/\.?0+$/, "");
  }
  if (typeof v === "string") return v;
  if (v.__type === "array") return "[vetor]";
  if (v.__type === "record") return "[registro]";
  return String(v);
}

// src/interpreter/builtins.ts
var BUILTINS = {
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
    if (n <= 0) throw new RuntimeError("log de n\xFAmero n\xE3o positivo", line);
    return Math.log10(n);
  },
  logn: ([x], line) => {
    const n = toNumber(x ?? null, line);
    if (n <= 0) throw new RuntimeError("logn de n\xFAmero n\xE3o positivo", line);
    return Math.log(n);
  },
  pi: () => Math.PI,
  quad: ([x], line) => {
    const n = toNumber(x ?? null, line);
    return n * n;
  },
  raizq: ([x], line) => {
    const n = toNumber(x ?? null, line);
    if (n < 0) throw new RuntimeError("raizq de n\xFAmero negativo", line);
    return Math.sqrt(n);
  },
  sen: ([x], line) => Math.sin(toNumber(x ?? null, line)),
  tan: ([x], line) => Math.tan(toNumber(x ?? null, line)),
  truncar: ([x, decimais], line) => {
    const n = toNumber(x ?? null, line);
    const d = decimais !== void 0 ? toNumber(decimais, line) : 0;
    const factor = Math.pow(10, d);
    return Math.trunc(n * factor) / factor;
  },
  arredonda: ([x, decimais], line) => {
    const n = toNumber(x ?? null, line);
    const d = decimais !== void 0 ? toNumber(decimais, line) : 0;
    return parseFloat(n.toFixed(d));
  },
  pot\u00EAncia: ([base, exp], line) => Math.pow(toNumber(base ?? null, line), toNumber(exp ?? null, line)),
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
  compr: ([s]) => typeof s === "string" ? s.length : 0,
  comprimento: ([s]) => typeof s === "string" ? s.length : 0,
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
  caracpnum: ([s]) => toString(s ?? null).charCodeAt(0) || 0,
  numtostr: ([x], line) => toString(toNumber(x ?? null, line)),
  strtonum: ([s]) => parseFloat(toString(s ?? null)) || 0,
  // ---- Boolean ----
  verdadeiro: () => true,
  falso: () => false
};
function callBuiltin(name, args, line) {
  const lower = name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  const fn = BUILTINS[lower];
  if (!fn) return void 0;
  return fn(args, line);
}

// src/interpreter/interpreter.ts
var Interpreter = class {
  constructor(io) {
    this.globalEnv = new Environment();
    this.procedures = /* @__PURE__ */ new Map();
    this.functions = /* @__PURE__ */ new Map();
    this.typeRegistry = /* @__PURE__ */ new Map();
    this.constants = /* @__PURE__ */ new Set();
    // nomes de constantes (imutáveis)
    this.output = [];
    this.maxIterations = 1e6;
    this.iterationCount = 0;
    this.breakpoints = /* @__PURE__ */ new Set();
    this.paused = false;
    this.currentLine = 0;
    this.io = io;
  }
  // =============================================
  // Public API
  // =============================================
  async execute(program) {
    this.globalEnv = new Environment();
    this.procedures.clear();
    this.functions.clear();
    this.typeRegistry.clear();
    this.constants.clear();
    this.output = [];
    this.iterationCount = 0;
    for (const td of program.typeDecls) {
      this.typeRegistry.set(td.name.toLowerCase(), td);
    }
    for (const proc of program.procedures) {
      this.procedures.set(proc.name.toLowerCase(), proc);
    }
    for (const func of program.functions) {
      this.functions.set(func.name.toLowerCase(), func);
    }
    await this.declareVars(program.varDecls, this.globalEnv);
    await this.declareConsts(program.constDecls ?? [], this.globalEnv);
    await this.execStmts(program.body, this.globalEnv);
  }
  getOutput() {
    return this.output.join("");
  }
  // =============================================
  // Constant Declaration
  // =============================================
  async declareConsts(decls, env) {
    for (const decl of decls) {
      const val = await this.evalExpr(decl.value, env);
      env.define(decl.name, val);
      this.constants.add(decl.name.toLowerCase());
    }
  }
  // =============================================
  // Variable Declaration
  // =============================================
  async declareVars(decls, env) {
    for (const decl of decls) {
      for (const name of decl.names) {
        const val = await this.defaultForType(decl.varType, env);
        env.define(name, val);
      }
    }
  }
  async defaultForType(type, env) {
    switch (type.tag) {
      case "inteiro":
        return 0;
      case "real":
        return 0;
      case "caractere":
        return "";
      case "logico":
        return false;
      case "vetor": {
        const dims = [];
        for (const dim of type.dims) {
          const low = toNumber(await this.evalExpr(dim.low, env), dim.low.line);
          const high = toNumber(
            await this.evalExpr(dim.high, env),
            dim.high.line
          );
          dims.push({ low, high });
        }
        const primitiveElementType = typeof type.elementType === "string" ? type.elementType : "custom";
        const arr = createArray(dims, primitiveElementType);
        if (typeof type.elementType !== "string") {
          for (let i = 0; i < arr.data.length; i++) {
            arr.data[i] = await this.defaultForType(
              { tag: "custom", name: type.elementType.name },
              env
            );
          }
        }
        return arr;
      }
      case "custom": {
        const td = this.typeRegistry.get(type.name.toLowerCase());
        if (!td) throw new RuntimeError(`Tipo '${type.name}' n\xE3o definido`);
        const fields = {};
        for (const field of td.fields) {
          for (const fname of field.names) {
            fields[fname.toLowerCase()] = await this.defaultForType(
              field.varType,
              env
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
  async execStmts(stmts, env) {
    for (const stmt of stmts) {
      await this.execStmt(stmt, env);
    }
  }
  async execStmt(stmt, env) {
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
  async checkStep(env) {
    if (this.onStep && (this.breakpoints.has(this.currentLine) || this.paused)) {
      const info = {
        line: this.currentLine,
        variables: env.snapshot(),
        output: this.output.join("")
      };
      await this.onStep(info);
    }
  }
  // ---- Assign ----
  async execAssign(stmt, env) {
    if (stmt.target.kind === "LIdent" && this.constants.has(stmt.target.name.toLowerCase())) {
      throw new RuntimeError(
        `N\xE3o \xE9 poss\xEDvel atribuir valor \xE0 constante '${stmt.target.name}'`,
        stmt.line
      );
    }
    const value = await this.evalExpr(stmt.value, env);
    await this.setLValue(stmt.target, value, env);
  }
  async setLValue(lv, value, env) {
    switch (lv.kind) {
      case "LIdent": {
        env.set(lv.name, value);
        break;
      }
      case "LIndex": {
        const base = await this.getLValueBase(lv.base, env);
        if (!base || base.__type !== "array") {
          throw new RuntimeError(
            `'${this.lvalName(lv.base)}' n\xE3o \xE9 um vetor`,
            lv.line
          );
        }
        const arr = base;
        const indices = await Promise.all(
          lv.indices.map((i) => this.evalExpr(i, env))
        );
        arraySet(
          arr,
          indices.map((i) => toNumber(i, lv.line)),
          value
        );
        break;
      }
      case "LField": {
        const base = await this.getLValueBase(lv.base, env);
        if (!base || base.__type !== "record") {
          throw new RuntimeError(
            `'${this.lvalName(lv.base)}' n\xE3o \xE9 um registro`,
            lv.line
          );
        }
        base.fields[lv.field.toLowerCase()] = value;
        break;
      }
    }
  }
  async getLValueBase(lv, env) {
    if (lv.kind === "LIdent") return env.get(lv.name);
    if (lv.kind === "LIndex") {
      const base = await this.getLValueBase(lv.base, env);
      const arr = base;
      const indices = await Promise.all(
        lv.indices.map((i) => this.evalExpr(i, env))
      );
      return arrayGet(
        arr,
        indices.map((i) => toNumber(i, lv.line))
      );
    }
    if (lv.kind === "LField") {
      const base = await this.getLValueBase(lv.base, env);
      return base.fields[lv.field.toLowerCase()] ?? null;
    }
    return null;
  }
  lvalName(lv) {
    if (lv.kind === "LIdent") return lv.name;
    if (lv.kind === "LField") return `${this.lvalName(lv.base)}.${lv.field}`;
    return "vari\xE1vel";
  }
  // ---- Write ----
  async execWrite(stmt, env) {
    const parts = [];
    for (const arg of stmt.args) {
      const val = await this.evalExpr(arg.expr, env);
      let str = toString(val);
      if (arg.width !== void 0 && typeof val === "number") {
        const decimals = arg.decimals ?? 2;
        str = val.toFixed(decimals);
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
  async execRead(stmt, env) {
    for (const target of stmt.targets) {
      const prompt = `${this.lvalName(target)}: `;
      const raw = await this.io.read(prompt);
      if (raw === null) throw new RuntimeError("Leitura cancelada");
      const current = await this.getLValueBase(target, env).catch(() => null);
      let parsed;
      if (typeof current === "boolean" || raw.toLowerCase() === "verdadeiro" || raw.toLowerCase() === "falso") {
        parsed = raw.toLowerCase() === "verdadeiro" || raw === "1" || raw.toLowerCase() === "true";
      } else if (typeof current === "number") {
        const n = parseFloat(raw.replace(",", "."));
        parsed = isNaN(n) ? 0 : n;
      } else {
        const n = parseFloat(raw.replace(",", "."));
        parsed = isNaN(n) ? raw : n;
      }
      await this.setLValue(target, parsed, env);
    }
  }
  // ---- If ----
  async execIf(stmt, env) {
    const cond = await this.evalExpr(stmt.condition, env);
    if (toBoolean(cond)) {
      await this.execStmts(stmt.then, env);
    } else {
      await this.execStmts(stmt.else_, env);
    }
  }
  // ---- For ----
  async execFor(stmt, env) {
    const from = toNumber(await this.evalExpr(stmt.from, env), stmt.line);
    const to = toNumber(await this.evalExpr(stmt.to, env), stmt.line);
    const step = stmt.step ? toNumber(await this.evalExpr(stmt.step, env), stmt.line) : from <= to ? 1 : -1;
    env.set(stmt.variable, from);
    const shouldContinue = (v) => step > 0 ? v <= to : v >= to;
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
  async execWhile(stmt, env) {
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
  async execRepeat(stmt, env) {
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
  async execChoose(stmt, env) {
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
  async execReturn(stmt, env) {
    const val = stmt.value ? await this.evalExpr(stmt.value, env) : null;
    throw new ReturnSignal(val);
  }
  // ---- Call Statement ----
  async execCallStmt(stmt, env) {
    await this.callProcedureOrFunction(stmt.name, stmt.args, env, stmt.line);
  }
  // =============================================
  // Expression Evaluation
  // =============================================
  async evalExpr(expr, env) {
    switch (expr.kind) {
      case "Literal":
        return expr.value;
      case "Ident": {
        try {
          return env.get(expr.name);
        } catch {
          throw new RuntimeError(
            `Vari\xE1vel '${expr.name}' n\xE3o declarada`,
            expr.line
          );
        }
      }
      case "Index": {
        const base = await this.evalExpr(expr.base, env);
        if (!base || base.__type !== "array") {
          throw new RuntimeError(
            `Tentativa de indexar algo que n\xE3o \xE9 vetor`,
            expr.line
          );
        }
        const indices = await Promise.all(
          expr.indices.map((i) => this.evalExpr(i, env))
        );
        return arrayGet(
          base,
          indices.map((i) => toNumber(i, expr.line))
        );
      }
      case "Field": {
        const base = await this.evalExpr(expr.base, env);
        if (!base || base.__type !== "record") {
          throw new RuntimeError(
            `Tentativa de acessar campo de n\xE3o-registro`,
            expr.line
          );
        }
        return base.fields[expr.field.toLowerCase()] ?? null;
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
        return await this.callProcedureOrFunction(
          expr.name,
          expr.args,
          env,
          expr.line
        ) ?? null;
      }
    }
  }
  async evalBinary(op, leftNode, rightNode, env, line) {
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
        if (r === 0) throw new RuntimeError("Divis\xE3o por zero", line);
        return toNumber(left, line) / r;
      }
      case "div": {
        const r = toNumber(right, line);
        if (r === 0) throw new RuntimeError("Divis\xE3o inteira por zero", line);
        return Math.trunc(toNumber(left, line) / r);
      }
      case "mod": {
        const r = toNumber(right, line);
        if (r === 0) throw new RuntimeError("M\xF3dulo por zero", line);
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
  valuesEqual(a, b) {
    if (typeof a === "string" && typeof b === "string") return a === b;
    if (typeof a === "boolean" || typeof b === "boolean")
      return Boolean(a) === Boolean(b);
    if (typeof a === "number" && typeof b === "number") return a === b;
    return a === b;
  }
  // =============================================
  // Procedure / Function Calls
  // =============================================
  async callProcedureOrFunction(name, argExprs, env, line) {
    const lower = name.toLowerCase();
    const argVals = await Promise.all(
      argExprs.map((a) => this.evalExpr(a, env))
    );
    const builtinResult = callBuiltin(lower, argVals, line);
    if (builtinResult !== void 0) return builtinResult;
    const proc = this.procedures.get(lower);
    if (proc) {
      await this.callProcedure(proc, argExprs, env, line);
      return void 0;
    }
    const func = this.functions.get(lower);
    if (func) {
      return await this.callFunction(func, argExprs, env, line);
    }
    throw new RuntimeError(
      `Procedimento/fun\xE7\xE3o '${name}' n\xE3o definido(a)`,
      line
    );
  }
  async callProcedure(proc, argExprs, callerEnv, line) {
    const localEnv = new Environment(this.globalEnv);
    let argIdx = 0;
    for (const param of proc.params) {
      for (const pname of param.names) {
        const argExpr = argExprs[argIdx++];
        if (param.byRef && argExpr) {
          if (argExpr.kind === "Ident") {
            localEnv.defineRef(
              pname,
              callerEnv.getEnvFor(argExpr.name),
              argExpr.name
            );
          } else {
            const val = argExpr ? await this.evalExpr(argExpr, callerEnv) : await this.defaultForType(param.varType, localEnv);
            localEnv.define(pname, val);
          }
        } else {
          const val = argExpr ? await this.evalExpr(argExpr, callerEnv) : await this.defaultForType(param.varType, localEnv);
          localEnv.define(pname, val);
        }
      }
    }
    await this.declareVars(proc.varDecls, localEnv);
    try {
      await this.execStmts(proc.body, localEnv);
    } catch (e) {
      if (e instanceof ReturnSignal) return;
      throw e;
    }
  }
  async callFunction(func, argExprs, callerEnv, line) {
    const localEnv = new Environment(this.globalEnv);
    let argIdx = 0;
    for (const param of func.params) {
      for (const pname of param.names) {
        const argExpr = argExprs[argIdx++];
        const val = argExpr ? await this.evalExpr(argExpr, callerEnv) : await this.defaultForType(param.varType, localEnv);
        localEnv.define(pname, val);
      }
    }
    await this.declareVars(func.varDecls, localEnv);
    localEnv.define(
      func.name,
      await this.defaultForType(func.returnType, localEnv)
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
  checkIterations(line) {
    this.iterationCount++;
    if (this.iterationCount > this.maxIterations) {
      throw new RuntimeError(
        "Limite de itera\xE7\xF5es excedido (poss\xEDvel la\xE7o infinito)",
        line
      );
    }
  }
};

// src/debugger/debugger.ts
var PortugolDebugger = class {
  constructor(io) {
    this.io = io;
    this.state = "idle";
    this.stepQueue = [];
    this.output = "";
    this.eventListeners = [];
    this.breakpoints = /* @__PURE__ */ new Set();
    this.interpreter = new Interpreter(io);
  }
  // =============================================
  // Event system
  // =============================================
  on(listener) {
    this.eventListeners.push(listener);
  }
  emit(event) {
    for (const listener of this.eventListeners) {
      listener(event);
    }
  }
  // =============================================
  // Breakpoint management
  // =============================================
  addBreakpoint(line) {
    this.breakpoints.add(line);
    this.interpreter.breakpoints.add(line);
  }
  removeBreakpoint(line) {
    this.breakpoints.delete(line);
    this.interpreter.breakpoints.delete(line);
  }
  clearBreakpoints() {
    this.breakpoints.clear();
    this.interpreter.breakpoints.clear();
  }
  // =============================================
  // Execution control
  // =============================================
  async start(program) {
    this.state = "running";
    this.output = "";
    const originalWrite = this.io.write.bind(this.io);
    const debugIO = {
      write: (text) => {
        this.output += text;
        this.emit({ type: "output", output: text });
        originalWrite(text);
      },
      read: this.io.read.bind(this.io)
    };
    const dbgInterpreter = new Interpreter(debugIO);
    dbgInterpreter.breakpoints = this.interpreter.breakpoints;
    dbgInterpreter.onStep = async (info) => {
      this.state = "paused";
      this.emit({
        type: this.breakpoints.has(info.line) ? "breakpoint" : "step",
        line: info.line,
        variables: info.variables,
        output: info.output
      });
      await this.waitForResume();
      this.state = "running";
    };
    try {
      await dbgInterpreter.execute(program);
      this.state = "finished";
      this.emit({ type: "finished", output: this.output });
    } catch (e) {
      this.state = "error";
      this.emit({ type: "error", error: e.message });
    }
  }
  // =============================================
  // Step control (called from UI)
  // =============================================
  stepInto() {
    if (this.state === "paused") {
      this.interpreter.paused = true;
      this.resolveStep();
    }
  }
  stepOver() {
    if (this.state === "paused") {
      this.interpreter.paused = false;
      this.resolveStep();
    }
  }
  continue() {
    if (this.state === "paused") {
      this.interpreter.paused = false;
      this.resolveStep();
    }
  }
  pause() {
    this.interpreter.paused = true;
  }
  stop() {
    this.state = "finished";
    this.resolveStep();
  }
  getState() {
    return this.state;
  }
  resolveStep() {
    const resolve = this.stepQueue.shift();
    if (resolve) resolve();
  }
  waitForResume() {
    return new Promise((resolve) => {
      this.stepQueue.push(resolve);
    });
  }
};

// src/index.ts
function parse(source) {
  const lexer = new Lexer(source);
  const tokens = lexer.tokenize();
  const parser = new Parser(tokens);
  return parser.parse();
}
async function execute(source, io) {
  const start = Date.now();
  const outputLines = [];
  const defaultIO = {
    write: (text) => {
      outputLines.push(text);
    },
    read: (prompt) => {
      if (typeof window !== "undefined") {
        return window.prompt(prompt) ?? "";
      }
      return "";
    }
  };
  const combinedIO = {
    write: io?.write ?? defaultIO.write,
    read: io?.read ?? defaultIO.read
  };
  try {
    const program = parse(source);
    const interpreter = new Interpreter(combinedIO);
    await interpreter.execute(program);
    return {
      output: outputLines.join(""),
      executionTimeMs: Date.now() - start
    };
  } catch (e) {
    return {
      output: outputLines.join(""),
      error: e.message,
      executionTimeMs: Date.now() - start
    };
  }
}
var PORTUGOL_LANGUAGE_ID = "portugol";
var PORTUGOL_KEYWORDS = [
  "algoritmo",
  "fimalgoritmo",
  "var",
  "const",
  "inicio",
  "inteiro",
  "real",
  "caractere",
  "logico",
  "escreva",
  "escreval",
  "leia",
  "se",
  "entao",
  "senao",
  "fimse",
  "para",
  "de",
  "ate",
  "passo",
  "faca",
  "fimpara",
  "enquanto",
  "fimenquanto",
  "repita",
  "ateque",
  "escolha",
  "caso",
  "outrocaso",
  "fimescolha",
  "procedimento",
  "fimprocedimento",
  "funcao",
  "fimfuncao",
  "retorne",
  "interrompa",
  "tipo",
  "fimtipo",
  "registro",
  "fimregistro",
  "vetor",
  "matriz",
  "e",
  "ou",
  "nao",
  "xou",
  "verdadeiro",
  "falso",
  "div",
  "mod"
];
var PORTUGOL_BUILTIN_FUNCTIONS = [
  "abs",
  "arccos",
  "arcsen",
  "arctan",
  "cos",
  "cotan",
  "exp",
  "grauprad",
  "radpgrau",
  "int",
  "log",
  "logn",
  "pi",
  "quad",
  "raizq",
  "sen",
  "tan",
  "truncar",
  "arredonda",
  "aleatorio",
  "compr",
  "comprimento",
  "copia",
  "copiastr",
  "maiusc",
  "minusc",
  "pos",
  "posstr",
  "insere",
  "apaga",
  "carascii",
  "ascii",
  "carac",
  "numtostr",
  "strtonum",
  "max",
  "min"
];
var PORTUGOL_MONARCH_LANGUAGE = {
  keywords: PORTUGOL_KEYWORDS,
  builtins: PORTUGOL_BUILTIN_FUNCTIONS,
  tokenizer: {
    root: [
      [
        /[a-zA-ZÀ-ÿ_]\w*/,
        {
          cases: {
            "@keywords": "keyword",
            "@builtins": "support.function",
            "@default": "identifier"
          }
        }
      ],
      [/".*?"/, "string"],
      [/'.*?'/, "string"],
      [/\d+\.\d+([eE][+-]?\d+)?/, "number.float"],
      [/\d+/, "number"],
      [/\/\/.*$/, "comment"],
      [/\{[^}]*\}/, "comment"],
      [/[<>]=?|<>|[+\-*/^%]|<-|←/, "operator"],
      [/[()[\].,;:]/, "delimiter"]
    ]
  },
  ignoreCase: true
};
var EXAMPLE_PROGRAMS = {
  "Ol\xE1 Mundo": `algoritmo "Ol\xE1 Mundo"
var
   bot : caractere
inicio
   bot <- "Adoro F\xEDsica"
   escreva("Ol\xE1 Mundo!")
   escreval(bot)
fimalgoritmo`,
  Fatorial: `algoritmo "Fatorial"
var
   n, i, fat: inteiro
inicio
   escreva("Digite um n\xFAmero inteiro positivo: ")
   leia(n)
   fat <- 1
   para i de 1 ate n faca
      fat <- fat * i
   fimpara
   escreval("Fatorial de ", n, " = ", fat)
fimalgoritmo`,
  "Sequ\xEAncia de Fibonacci": `algoritmo "Fibonacci"
var
   n, i, a, b, temp: inteiro
inicio
   escreva("Quantos termos da sequ\xEAncia de Fibonacci? ")
   leia(n)
   a <- 0
   b <- 1
   escreva("Fibonacci: ")
   para i de 1 ate n faca
      escreva(a, " ")
      temp <- a + b
      a <- b
      b <- temp
   fimpara
   escreval("")
fimalgoritmo`,
  "Queda Livre": `algoritmo "Queda Livre"
{ Calcula a velocidade e dist\xE2ncia de queda livre }
var
   g, t, v, h: real
inicio
   g <- 9.8
   escreva("Tempo de queda (s): ")
   leia(t)
   v <- g * t
   h <- 0.5 * g * t * t
   escreval("Velocidade: ", v:6:2, " m/s")
   escreval("Dist\xE2ncia:  ", h:6:2, " m")
fimalgoritmo`
};
var EXAMPLE_CATEGORIES = [
  {
    id: "basico",
    name: "B\xE1sico",
    icon: "\u{1F530}",
    examples: [
      {
        title: "Ol\xE1 Mundo",
        code: `algoritmo "Ol\xE1 Mundo"
var
inicio
   escreval("Ol\xE1, Mundo!")
fimalgoritmo`,
        description: "Primeiro programa - exibe uma mensagem na tela",
        difficulty: "iniciante",
        hasInput: false
      },
      {
        title: "Vari\xE1veis e Tipos",
        code: `algoritmo "Vari\xE1veis e Tipos"
var
   idade: inteiro
   nome: caractere
   altura: real
   ehEstudante: logico
inicio
   nome <- "Ana"
   idade <- 20
   altura <- 1.65
   ehEstudante <- verdadeiro
   
   escreval("Nome: ", nome)
   escreval("Idade: ", idade, " anos")
   escreval("Altura: ", altura:4:2, " m")
   escreval("Estudante? ", ehEstudante)
fimalgoritmo`,
        description: "Demonstra declara\xE7\xE3o de vari\xE1veis dos tipos b\xE1sicos",
        difficulty: "iniciante",
        hasInput: false
      },
      {
        title: "Opera\xE7\xF5es Aritm\xE9ticas",
        code: `algoritmo "Opera\xE7\xF5es Aritm\xE9ticas"
var
   a, b, soma, sub, mult: real
   divi: real
inicio
   a <- 10
   b <- 3
   
   soma <- a + b
   sub  <- a - b
   mult <- a * b
   divi <- a / b
   
   escreval("a = ", a, ", b = ", b)
   escreval("Soma:    ", soma)
   escreval("Subtra\xE7\xE3o: ", sub)
   escreval("Multiplica\xE7\xE3o: ", mult)
   escreval("Divis\xE3o: ", divi:6:2)
   escreval("Resto (a mod b): ", a - b * int(a / b))
fimalgoritmo`,
        description: "Opera\xE7\xF5es matem\xE1ticas b\xE1sicas",
        difficulty: "iniciante",
        hasInput: false
      }
    ]
  },
  {
    id: "controle",
    name: "Controle",
    icon: "\u{1F500}",
    examples: [
      {
        title: "Par ou \xCDmpar",
        code: `algoritmo "Par ou \xCDmpar"
var
   n: inteiro
inicio
   escreva("Digite um n\xFAmero: ")
   leia(n)
   
   se n mod 2 = 0 entao
      escreval(n, " \xE9 PAR")
   senao
      escreval(n, " \xE9 \xCDMPAR")
   fimse
fimalgoritmo`,
        description: "Estrutura condicional simples com se/senao",
        difficulty: "iniciante",
        hasInput: true
      },
      {
        title: "Maior de Tr\xEAs",
        code: `algoritmo "Maior de Tr\xEAs"
var
   a, b, c, maior: real
inicio
   escreva("Primeiro n\xFAmero: ")
   leia(a)
   escreva("Segundo n\xFAmero: ")
   leia(b)
   escreva("Terceiro n\xFAmero: ")
   leia(c)
   
   maior <- a
   se b > maior entao
      maior <- b
   fimse
   se c > maior entao
      maior <- c
   fimse
   
   escreval("O maior \xE9: ", maior)
fimalgoritmo`,
        description: "Encontrar o maior entre tr\xEAs valores",
        difficulty: "iniciante",
        hasInput: true
      },
      {
        title: "Calculadora",
        code: `algoritmo "Calculadora"
var
   a, b: real
   op: caractere
inicio
   escreva("Primeiro n\xFAmero: ")
   leia(a)
   escreva("Opera\xE7\xE3o (+, -, *, /): ")
   leia(op)
   escreva("Segundo n\xFAmero: ")
   leia(b)
   
   escolha op
      caso "+"
         escreval("Resultado: ", a + b)
      caso "-"
         escreval("Resultado: ", a - b)
      caso "*"
         escreval("Resultado: ", a * b)
      caso "/"
         se b = 0 entao
            escreval("Erro: divis\xE3o por zero!")
         senao
            escreval("Resultado: ", a / b)
         fimse
      outrocaso
         escreval("Opera\xE7\xE3o inv\xE1lida!")
   fimescolha
fimalgoritmo`,
        description: "Calculadora com as quatro opera\xE7\xF5es",
        difficulty: "iniciante",
        hasInput: true
      },
      {
        title: "Tabuada",
        code: `algoritmo "Tabuada"
var
   n, i, resultado: inteiro
inicio
   escreva("Digite um n\xFAmero: ")
   leia(n)
   
   para i de 0 ate 10 faca
      resultado <- n * i
      escreval(n, " x ", i, " = ", resultado)
   fimpara
fimalgoritmo`,
        description: "La\xE7o para exibir tabuada de multiplica\xE7\xE3o",
        difficulty: "iniciante",
        hasInput: true
      },
      {
        title: "N\xFAmeros Primos",
        code: `algoritmo "N\xFAmeros Primos"
var
   n, i, divisoes: inteiro
   ehPrimo: logico
inicio
   escreva("Digite um n\xFAmero: ")
   leia(n)
   
   ehPrimo <- verdadeiro
   divisoes <- 0
   
   para i de 1 ate n faca
      se n mod i = 0 entao
         divisoes <- divisoes + 1
      fimse
   fimpara
   
   se divisoes = 2 entao
      escreval(n, " \xE9 PRIMO")
   senao
      escreval(n, " N\xC3O \xE9 primo")
   fimse
fimalgoritmo`,
        description: "Verifica se um n\xFAmero \xE9 primo",
        difficulty: "intermedi\xE1rio",
        hasInput: true
      }
    ]
  },
  {
    id: "vetores",
    name: "Vetores",
    icon: "\u{1F4CA}",
    examples: [
      {
        title: "Maior e Menor Valor",
        code: `algoritmo "Maior e Menor"
var
   numeros: vetor[1..5] de inteiro
   i, maior, menor: inteiro
inicio
   para i de 1 ate 5 faca
      escreva("Digite o ", i, "\xBA n\xFAmero: ")
      leia(numeros[i])
   fimpara
   
   maior <- numeros[1]
   menor <- numeros[1]
   
   para i de 2 ate 5 faca
      se numeros[i] > maior entao
         maior <- numeros[i]
      fimse
      se numeros[i] < menor entao
         menor <- numeros[i]
      fimse
   fimpara
   
   escreval("Maior: ", maior)
   escreval("Menor: ", menor)
fimalgoritmo`,
        description: "Encontra maior e menor em um vetor",
        difficulty: "intermedi\xE1rio",
        hasInput: true
      },
      {
        title: "M\xE9dia de Valores",
        code: `algoritmo "M\xE9dia de Valores"
var
   valores: vetor[1..10] de real
   i: inteiro
   soma, media: real
inicio
   soma <- 0
   para i de 1 ate 10 faca
      escreva("Digite o ", i, "\xBA valor: ")
      leia(valores[i])
      soma <- soma + valores[i]
   fimpara
   
   media <- soma / 10
   escreval("Soma: ", soma:6:2)
   escreval("M\xE9dia: ", media:6:2)
fimalgoritmo`,
        description: "Calcula soma e m\xE9dia de 10 valores",
        difficulty: "intermedi\xE1rio",
        hasInput: true
      },
      {
        title: "Ordena\xE7\xE3o Bolha",
        code: `algoritmo "Ordena\xE7\xE3o Bolha"
var
   v: vetor[1..5] de inteiro
   i, j, temp: inteiro
inicio
   para i de 1 ate 5 faca
      escreva("Elemento [", i, "]: ")
      leia(v[i])
   fimpara
   
   para i de 1 ate 4 faca
      para j de 1 ate 5 - i faca
         se v[j] > v[j + 1] entao
            temp <- v[j]
            v[j] <- v[j + 1]
            v[j + 1] <- temp
         fimse
      fimpara
   fimpara
   
   escreval("Vetor ordenado:")
   para i de 1 ate 5 faca
      escreva(v[i], " ")
   fimpara
   escreval("")
fimalgoritmo`,
        description: "Ordena vetor pelo m\xE9todo bolha",
        difficulty: "avan\xE7ado",
        hasInput: true
      }
    ]
  },
  {
    id: "funcoes",
    name: "Fun\xE7\xF5es",
    icon: "\u2699\uFE0F",
    examples: [
      {
        title: "Fatorial com Fun\xE7\xE3o",
        code: `algoritmo "Fatorial com Fun\xE7\xE3o"
var
   n: inteiro

funcao fatorial(num: inteiro): inteiro
var
   i, fat: inteiro
inicio
   fat <- 1
   para i de 2 ate num faca
      fat <- fat * i
   fimpara
   retorne fat
fimfuncao

inicio
   escreva("Digite um n\xFAmero: ")
   leia(n)
   escreval("Fatorial: ", fatorial(n))
fimalgoritmo`,
        description: "Calcula fatorial usando fun\xE7\xE3o",
        difficulty: "intermedi\xE1rio",
        hasInput: true
      },
      {
        title: "Fatorial Recursivo",
        code: `algoritmo "Fatorial Recursivo"
var
   n: inteiro

funcao fatorial(num: inteiro): inteiro
inicio
   se num <= 1 entao
      retorne 1
   senao
      retorne num * fatorial(num - 1)
   fimse
fimfuncao

inicio
   escreva("Digite um n\xFAmero: ")
   leia(n)
   escreval("Fatorial de ", n, ": ", fatorial(n))
fimalgoritmo`,
        description: "Fatorial usando recurs\xE3o",
        difficulty: "avan\xE7ado",
        hasInput: true
      }
    ]
  },
  {
    id: "constantes",
    name: "Constantes",
    icon: "\u{1F4CC}",
    examples: [
      {
        title: "Constantes Num\xE9ricas",
        code: `algoritmo "Constantes Num\xE9ricas"
{ Demonstra constantes inteiras e reais }
const
   VELOCIDADE_LUZ = 299792458   { m/s }
   PI             = 3.14159265
   EULER          = 2.71828182
var
   raio, area, circunferencia: real
inicio
   raio <- 5
   area           <- PI * raio * raio
   circunferencia <- 2 * PI * raio
   escreval("=== Constantes Num\xE9ricas ===")
   escreval("Velocidade da luz: ", VELOCIDADE_LUZ, " m/s")
   escreval("N\xFAmero de Euler e: ", EULER:8:5)
   escreval("\xC1rea do c\xEDrculo (r=5): ", area:7:4, " m\xB2")
   escreval("Circunfer\xEAncia:    ", circunferencia:7:4, " m")
fimalgoritmo`,
        description: "Constantes inteiras e reais: velocidade da luz, \u03C0 e e",
        difficulty: "iniciante",
        hasInput: false
      },
      {
        title: "Constantes L\xF3gicas e de Texto",
        code: `algoritmo "Constantes L\xF3gicas e Texto"
{ Constantes podem ser l\xF3gicas (verdadeiro/falso) ou strings }
const
   SISTEMA_ATIVO = verdadeiro
   VERSAO        = "1.0.0"
   NOME_SISTEMA  = "Australis LMS"
var
   status: caractere
inicio
   escreval("Sistema: ", NOME_SISTEMA)
   escreval("Vers\xE3o:  ", VERSAO)
   se SISTEMA_ATIVO entao
      status <- "ONLINE"
   senao
      status <- "OFFLINE"
   fimse
   escreval("Status:  ", status)
fimalgoritmo`,
        description: "Constantes l\xF3gicas (verdadeiro/falso) e strings de texto",
        difficulty: "iniciante",
        hasInput: false
      },
      {
        title: "Constantes Aritm\xE9ticas",
        code: `algoritmo "Constantes Aritm\xE9ticas"
{ Constantes podem ser express\xF5es calculadas em tempo de compila\xE7\xE3o }
const
   PI      = 3.14159265
   DOIS_PI = 2 * 3.14159265   { express\xE3o aritm\xE9tica }
   G       = 9.80665          { gravidade padr\xE3o m/s\xB2 }
   MEIA_G  = 9.80665 / 2      { metade da gravidade }
var
   t, h, v: real
inicio
   t <- 3
   h <- MEIA_G * t * t
   v <- G * t
   escreval("Queda Livre com constantes")
   escreval("g = ", G:7:5, " m/s\xB2")
   escreval("t = ", t:4:1, " s")
   escreval("h = ", h:7:3, " m")
   escreval("v = ", v:7:3, " m/s")
   escreval("2\u03C0 = ", DOIS_PI:8:5)
fimalgoritmo`,
        description: "Constantes definidas como express\xF5es aritm\xE9ticas compostas",
        difficulty: "iniciante",
        hasInput: false
      },
      {
        title: "Conversor de Unidades",
        code: `algoritmo "Conversor de Unidades"
{ Fatores de convers\xE3o como constantes \u2014 nunca mudam! }
const
   KM_POR_MILHA    = 1.60934
   KG_POR_LIBRA    = 0.453592
   CM_POR_POLEGADA = 2.54
var
   valor, resultado: real
inicio
   escreval("=== Conversor de Unidades ===")
   valor <- 100
   resultado <- valor * KM_POR_MILHA
   escreval(valor:5:1, " milhas = ", resultado:7:3, " km")
   valor <- 150
   resultado <- valor * KG_POR_LIBRA
   escreval(valor:5:1, " libras = ", resultado:7:3, " kg")
   valor <- 72
   resultado <- valor * CM_POR_POLEGADA
   escreval(valor:5:1, " polegadas = ", resultado:7:3, " cm")
fimalgoritmo`,
        description: "Fatores de convers\xE3o de unidades como constantes",
        difficulty: "iniciante",
        hasInput: false
      },
      {
        title: "Convers\xE3o de Temperatura",
        code: `algoritmo "Convers\xE3o de Temperatura"
{ Constantes negativas e fracion\xE1rias }
const
   ZERO_ABSOLUTO_C = -273.15   { 0 Kelvin em Celsius }
   FATOR_FC        = 9 / 5     { fator Celsius \u2192 Fahrenheit }
   OFFSET_FC       = 32        { offset Fahrenheit }
var
   celsius, fahrenheit, kelvin: real
inicio
   escreva("Temperatura em Celsius: ")
   leia(celsius)
   fahrenheit <- celsius * FATOR_FC + OFFSET_FC
   kelvin     <- celsius - ZERO_ABSOLUTO_C
   escreval("=== Convers\xE3o de Temperatura ===")
   escreval("Celsius:    ", celsius:7:2, " \xB0C")
   escreval("Fahrenheit: ", fahrenheit:7:2, " \xB0F")
   escreval("Kelvin:     ", kelvin:7:2, " K")
fimalgoritmo`,
        description: "Constantes negativas e fracion\xE1rias para converter temperaturas",
        difficulty: "iniciante",
        hasInput: true
      },
      {
        title: "Geometria com Constantes",
        code: `algoritmo "Geometria com Constantes"
{ var e const podem aparecer em qualquer ordem }
var
   raio, lado: real
const
   PI = 3.14159265
var
   area_circ, vol_esfera, area_quad: real
inicio
   raio <- 3
   lado <- 4
   area_circ  <- PI * raio * raio
   vol_esfera <- (4 / 3) * PI * raio * raio * raio
   area_quad  <- lado * lado
   escreval("=== Geometria ===")
   escreval("Raio = ", raio:4:1, " | Lado = ", lado:4:1)
   escreval("\xC1rea do c\xEDrculo:   ", area_circ:7:4)
   escreval("Volume da esfera:  ", vol_esfera:7:4)
   escreval("\xC1rea do quadrado:  ", area_quad:7:1)
fimalgoritmo`,
        description: "Blocos var e const intercalados \u2014 ordem flex\xEDvel",
        difficulty: "intermedi\xE1rio",
        hasInput: false
      },
      {
        title: "Constante Negativa e Par\xEAnteses",
        code: `algoritmo "Constante Negativa e Par\xEAnteses"
{ Constantes aceitam valores negativos e express\xF5es com par\xEAnteses }
const
   TEMP_MIN = -273.15          { zero absoluto }
   FATOR    = (3 + 7) * 2      { express\xE3o com par\xEAnteses = 20 }
   DESCONTO = 100 - 15         { subtra\xE7\xE3o = 85 }
var
   t: real
inicio
   t <- 25
   escreval("Zero absoluto: ", TEMP_MIN:8:2, " \xB0C")
   escreval("Fator:         ", FATOR)
   escreval("Desconto:      ", DESCONTO, "%")
   escreval("Temperatura:   ", t:5:1, " \xB0C")
fimalgoritmo`,
        description: "Constantes com valores negativos e express\xF5es parentetizadas",
        difficulty: "iniciante",
        hasInput: false
      },
      {
        title: "Prote\xE7\xE3o de Constante",
        code: `algoritmo "Prote\xE7\xE3o de Constante"
{ Tente descomentar a linha abaixo \u2014 o interpretador vai reclamar! }
const
   LIMITE_VELOCIDADE = 110   { km/h \u2014 n\xE3o pode ser alterado }
   MULTA_BASE        = 293.47
var
   velocidade, multa: real
inicio
   escreva("Velocidade medida (km/h): ")
   leia(velocidade)
   { LIMITE_VELOCIDADE <- 200 }  { ERRO: n\xE3o pode reatribuir constante }
   se velocidade > LIMITE_VELOCIDADE entao
      multa <- MULTA_BASE * (velocidade / LIMITE_VELOCIDADE)
      escreval("MULTA: R$ ", multa:7:2)
   senao
      escreval("Velocidade dentro do limite de ", LIMITE_VELOCIDADE, " km/h")
   fimse
fimalgoritmo`,
        description: "Demonstra que constantes n\xE3o podem ser reatribu\xEDdas",
        difficulty: "intermedi\xE1rio",
        hasInput: true
      }
    ]
  },
  {
    id: "fisica",
    name: "F\xEDsica",
    icon: "\u269B\uFE0F",
    examples: [
      {
        title: "Queda Livre",
        code: `algoritmo "Queda Livre"
{ Cinem\xE1tica: movimento sob gravidade
   v = g * t
   h = (1/2) * g * t\xB2 }
var
   g, t, v, h: real
inicio
   g <- 9.81
   escreva("Tempo de queda (s): ")
   leia(t)
   
   v <- g * t
   h <- 0.5 * g * t * t
   
   escreval("Gravidade: ", g:5:2, " m/s\xB2")
   escreval("Velocidade: ", v:6:2, " m/s")
   escreval("Altura:     ", h:6:2, " m")
fimalgoritmo`,
        description: "Calcula velocidade e altura na queda livre",
        difficulty: "iniciante",
        hasInput: true
      },
      {
        title: "MRU - Movimento Retil\xEDneo",
        code: `algoritmo "Movimento Retil\xEDneo Uniforme"
{ MRU: s = s\u2080 + v * t }
var
   s0, v, t, s: real
inicio
   escreva("Posi\xE7\xE3o inicial (m): ")
   leia(s0)
   escreva("Velocidade (m/s): ")
   leia(v)
   escreva("Tempo (s): ")
   leia(t)
   
   s <- s0 + v * t
   
   escreval("Equa\xE7\xE3o: s = s\u2080 + v*t")
   escreval("s = ", s0:6:2, " + ", v:5:2, " \xD7 ", t:5:2)
   escreval("Posi\xE7\xE3o final: ", s:6:2, " m")
fimalgoritmo`,
        description: "Calcula posi\xE7\xE3o no MRU",
        difficulty: "iniciante",
        hasInput: true
      },
      {
        title: "Energia Cin\xE9tica",
        code: `algoritmo "Energia Cin\xE9tica"
{ Ec = (1/2) * m * v\xB2 }
var
   m, v, ec: real
inicio
   escreva("Massa (kg): ")
   leia(m)
   escreva("Velocidade (m/s): ")
   leia(v)
   
   ec <- 0.5 * m * v * v
   
   escreval("Energia Cin\xE9tica")
   escreval("Ec = (1/2) \xD7 m \xD7 v\xB2")
   escreval("Ec = (1/2) \xD7 ", m:5:2, " \xD7 ", v:5:2, "\xB2")
   escreval("Ec = ", ec:6:2, " J (Joules)")
fimalgoritmo`,
        description: "Calcula energia cin\xE9tica",
        difficulty: "iniciante",
        hasInput: true
      },
      {
        title: "Lei de Ohm",
        code: `algoritmo "Lei de Ohm"
{ U = R \xD7 I }
var
   u, r, i: real
   opcao: inteiro
inicio
   escreval("1 - Calcular Tens\xE3o (U)")
   escreval("2 - Calcular Resist\xEAncia (R)")
   escreval("3 - Calcular Corrente (I)")
   escreva("Escolha: ")
   leia(opcao)
   
   escolha opcao
      caso 1
         escreva("Corrente (A): ")
         leia(i)
         escreva("Resist\xEAncia (\u03A9): ")
         leia(r)
         u <- r * i
         escreval("Tens\xE3o: ", u:6:2, " V")
      caso 2
         escreva("Tens\xE3o (V): ")
         leia(u)
         escreva("Corrente (A): ")
         leia(i)
         r <- u / i
         escreval("Resist\xEAncia: ", r:6:2, " \u03A9")
      caso 3
         escreva("Tens\xE3o (V): ")
         leia(u)
         escreva("Resist\xEAncia (\u03A9): ")
         leia(r)
         i <- u / r
         escreval("Corrente: ", i:6:2, " A")
      outrocaso
         escreval("Op\xE7\xE3o inv\xE1lida!")
   fimescolha
fimalgoritmo`,
        description: "Calcula tens\xE3o, corrente ou resist\xEAncia",
        difficulty: "intermedi\xE1rio",
        hasInput: true
      },
      {
        title: "MHS - Oscilador Harm\xF4nico",
        code: `algoritmo "MHS - Oscilador Harm\xF4nico"
{ x(t) = A * cos(\u03C9t + \u03C6)
  \u03C9 = 2\u03C0f }

const
   // Declara\xE7\xE3o de constantes: Nome = Valor
   PI = 3.14159
var
   a, f, phi, t, omega, x: real
inicio
   escreva("Amplitude (m): ")
   leia(a)
   escreva("Frequ\xEAncia (Hz): ")
   leia(f)
   escreva("Fase inicial (rad): ")
   leia(phi)
   escreva("Tempo (s): ")
   leia(t)
   
   omega <- 2 * pi * f
   x <- a * cos(omega * t + phi)
   
   escreval("Oscilador Harm\xF4nico Simples")
   escreval("\u03C9 = ", omega:6:2, " rad/s")
   escreval("x(t) = A\xB7cos(\u03C9t + \u03C6)")
   escreval("x(", t:5:2, ") = ", x:6:3, " m")
fimalgoritmo`,
        description: "Calcula posi\xE7\xE3o no MHS",
        difficulty: "avan\xE7ado",
        hasInput: true
      }
    ]
  }
];
export {
  EXAMPLE_CATEGORIES,
  EXAMPLE_PROGRAMS,
  LexerError,
  PORTUGOL_BUILTIN_FUNCTIONS,
  PORTUGOL_KEYWORDS,
  PORTUGOL_LANGUAGE_ID,
  PORTUGOL_MONARCH_LANGUAGE,
  ParseError,
  PortugolDebugger,
  RuntimeError,
  execute,
  parse
};
