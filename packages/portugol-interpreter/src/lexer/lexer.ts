// ============================================================
// AUSTRALIS – Portugol Lexer (Tokenizador)
// Compatível com VisualG 2.0
// ============================================================

export type TokenType =
  // Literals
  | "NUMBER"
  | "STRING"
  | "BOOLEAN"
  | "REAL"
  // Identifiers & Keywords
  | "IDENT"
  | "ALGORITMO"
  | "FIM_ALGORITMO"
  | "VAR"
  | "CONST"
  | "INICIO"
  | "INTEIRO"
  | "REAL_TYPE"
  | "CARACTERE"
  | "LOGICO"
  | "ESCREVA"
  | "ESCREVAL"
  | "LEIA"
  | "SE"
  | "ENTAO"
  | "SENAO"
  | "FIM_SE"
  | "PARA"
  | "DE"
  | "ATE"
  | "PASSO"
  | "FACA"
  | "FIM_PARA"
  | "ENQUANTO"
  | "FIM_ENQUANTO"
  | "REPITA"
  | "ATE_QUE"
  | "ESCOLHA"
  | "CASO"
  | "OUTRA_OPCAO"
  | "FIM_ESCOLHA"
  | "PROCEDIMENTO"
  | "FIM_PROCEDIMENTO"
  | "FUNCAO"
  | "FIM_FUNCAO"
  | "RETORNE"
  | "TIPO"
  | "FIM_TIPO"
  | "REGISTRO"
  | "FIM_REGISTRO"
  | "VETOR"
  | "MATRIZ"
  | "DE_TIPO"
  | "INTERROMPA"
  | "E"
  | "OU"
  | "NAO"
  | "XOU"
  | "VERDADEIRO"
  | "FALSO"
  // Operators
  | "PLUS"
  | "MINUS"
  | "STAR"
  | "SLASH"
  | "MOD"
  | "DIV"
  | "POW"
  | "EQ"
  | "NEQ"
  | "LT"
  | "LTE"
  | "GT"
  | "GTE"
  | "ASSIGN"
  | "LARROW"
  // Punctuation
  | "LPAREN"
  | "RPAREN"
  | "LBRACKET"
  | "RBRACKET"
  | "COMMA"
  | "COLON"
  | "SEMICOLON"
  | "DOT"
  | "DOTDOT"
  | "EOF";

export interface Token {
  type: TokenType;
  value: string;
  line: number;
  column: number;
}

const KEYWORDS: Record<string, TokenType> = {
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
  atequé: "ATE_QUE",
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
  mod: "MOD",
};

export class LexerError extends Error {
  constructor(
    msg: string,
    public line: number,
    public column: number,
  ) {
    super(`Erro léxico [${line}:${column}]: ${msg}`);
    this.name = "LexerError";
  }
}

export class Lexer {
  private pos = 0;
  private line = 1;
  private column = 1;
  private tokens: Token[] = [];

  constructor(private source: string) { }

  tokenize(): Token[] {
    while (this.pos < this.source.length) {
      this.skipWhitespaceAndComments();
      if (this.pos >= this.source.length) break;

      const ch = this.current();

      if (ch === "\n") {
        this.advance();
        continue;
      }

      if (this.isDigit(ch) || (ch === "." && this.isDigit(this.peek(1)))) {
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
      column: this.column,
    });
    return this.tokens;
  }

  private skipWhitespaceAndComments() {
    while (this.pos < this.source.length) {
      const ch = this.current();
      if (ch === " " || ch === "\t" || ch === "\r") {
        this.advance();
      } else if (ch === "/" && this.peek(1) === "/") {
        // line comment
        while (this.pos < this.source.length && this.current() !== "\n")
          this.advance();
      } else if (ch === "{") {
        // block comment
        while (this.pos < this.source.length && this.current() !== "}")
          this.advance();
        if (this.pos < this.source.length) this.advance();
      } else {
        break;
      }
    }
  }

  private readNumber() {
    const start = this.pos;
    const startLine = this.line;
    const startCol = this.column;
    let isReal = false;

    while (this.pos < this.source.length && this.isDigit(this.current()))
      this.advance();

    if (
      this.pos < this.source.length &&
      this.current() === "." &&
      this.peek(1) !== "."
    ) {
      isReal = true;
      this.advance();
      while (this.pos < this.source.length && this.isDigit(this.current()))
        this.advance();
    }

    // Scientific notation
    if (
      this.pos < this.source.length &&
      (this.current() === "e" || this.current() === "E")
    ) {
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
      column: startCol,
    });
  }

  private readString(quote: string) {
    const startLine = this.line;
    const startCol = this.column;
    this.advance(); // skip opening quote
    let value = "";
    while (this.pos < this.source.length && this.current() !== quote) {
      if (this.current() === "\n") break;
      value += this.current();
      this.advance();
    }
    if (this.pos < this.source.length) this.advance(); // skip closing quote
    this.tokens.push({
      type: "STRING",
      value,
      line: startLine,
      column: startCol,
    });
  }

  private readIdent() {
    const startLine = this.line;
    const startCol = this.column;
    let value = "";
    while (
      this.pos < this.source.length &&
      (this.isAlphaNum(this.current()) || this.current() === "_")
    ) {
      value += this.current();
      this.advance();
    }
    const lower = value
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");
    const kwType = KEYWORDS[lower];
    this.tokens.push({
      type: kwType ?? "IDENT",
      value,
      line: startLine,
      column: startCol,
    });
  }

  private readSymbol() {
    const startLine = this.line;
    const startCol = this.column;
    const ch = this.current();

    const twoChar = ch + (this.peek(1) ?? "");

    // Atribuição <- ou ← (Unicode U+2190)
    if (twoChar === "<-" || ch === "←") {
      this.tokens.push({
        type: "LARROW",
        value: "<-",
        line: startLine,
        column: startCol,
      });
      this.advance();
      if (ch !== "←") this.advance(); // só avança 2 se era <-
      return;
    }
    if (twoChar === "<>") {
      this.tokens.push({
        type: "NEQ",
        value: twoChar,
        line: startLine,
        column: startCol,
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
        column: startCol,
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
        column: startCol,
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
        column: startCol,
      });
      this.advance();
      this.advance();
      return;
    }

    const map: Record<string, TokenType> = {
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
      ".": "DOT",
    };

    if (map[ch]) {
      this.tokens.push({
        type: map[ch]!,
        value: ch,
        line: startLine,
        column: startCol,
      });
      this.advance();
    } else {
      throw new LexerError(
        `Caractere inesperado: '${ch}'`,
        startLine,
        startCol,
      );
    }
  }

  private current() {
    return this.source[this.pos] ?? "";
  }
  private peek(offset: number) {
    return this.source[this.pos + offset] ?? "";
  }
  private advance() {
    if (this.source[this.pos] === "\n") {
      this.line++;
      this.column = 1;
    } else {
      this.column++;
    }
    this.pos++;
  }
  private isDigit(ch: string) {
    return ch >= "0" && ch <= "9";
  }
  private isAlpha(ch: string) {
    return /[a-zA-ZÀ-ÿ]/.test(ch);
  }
  private isAlphaNum(ch: string) {
    return this.isAlpha(ch) || this.isDigit(ch);
  }
}
