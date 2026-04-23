// ============================================================
// AUSTRALIS – Portugol Interpreter Tests (Jest)
// 55 casos de teste cobrindo toda a gramática VisualG 2.0
// ============================================================

import { execute, parse } from "../src/index";
import { Lexer } from "../src/lexer/lexer";
import { Parser } from "../src/parser/parser";

// Helper: run code and return output
async function run(code: string, inputs: string[] = []): Promise<string> {
  let inputIdx = 0;
  const result = await execute(code, {
    read: () => inputs[inputIdx++] ?? "0",
  });
  if (result.error) throw new Error(result.error);
  return result.output.trim();
}

async function runWithError(code: string): Promise<string> {
  const result = await execute(code, { read: () => "0" });
  return result.error ?? "";
}

// =============================================
// 1. LEXER
// =============================================
describe("Lexer", () => {
  test("1.1 tokeniza palavras-chave básicas", () => {
    const lexer = new Lexer("algoritmo fimalgoritmo var inicio");
    const tokens = lexer.tokenize();
    expect(tokens[0]!.type).toBe("ALGORITMO");
    expect(tokens[1]!.type).toBe("FIM_ALGORITMO");
    expect(tokens[2]!.type).toBe("VAR");
    expect(tokens[3]!.type).toBe("INICIO");
  });

  test("1.2 tokeniza números inteiros e reais", () => {
    const lexer = new Lexer("42 3.14 2.7e10");
    const tokens = lexer.tokenize();
    expect(tokens[0]!.type).toBe("NUMBER");
    expect(tokens[1]!.type).toBe("REAL");
    expect(tokens[2]!.type).toBe("REAL");
  });

  test("1.3 tokeniza strings com aspas duplas", () => {
    const lexer = new Lexer('"Olá Mundo"');
    const tokens = lexer.tokenize();
    expect(tokens[0]!.type).toBe("STRING");
    expect(tokens[0]!.value).toBe("Olá Mundo");
  });

  test("1.4 ignora comentários de linha (//)", () => {
    const lexer = new Lexer("// comentário\n42");
    const tokens = lexer.tokenize();
    expect(tokens[0]!.type).toBe("NUMBER");
    expect(tokens[0]!.value).toBe("42");
  });

  test("1.5 ignora comentários de bloco {}", () => {
    const lexer = new Lexer("{ comentário } 99");
    const tokens = lexer.tokenize();
    expect(tokens[0]!.type).toBe("NUMBER");
    expect(tokens[0]!.value).toBe("99");
  });

  test("1.6 tokeniza operador de atribuição <-", () => {
    const lexer = new Lexer("x <- 10");
    const tokens = lexer.tokenize();
    expect(tokens[1]!.type).toBe("LARROW");
  });

  test("1.7 tokeniza operadores de comparação", () => {
    const lexer = new Lexer("<> <= >= < >");
    const tokens = lexer.tokenize();
    expect(tokens[0]!.type).toBe("NEQ");
    expect(tokens[1]!.type).toBe("LTE");
    expect(tokens[2]!.type).toBe("GTE");
  });

  test("1.8 tokeniza verdadeiro e falso", () => {
    const lexer = new Lexer("verdadeiro falso");
    const tokens = lexer.tokenize();
    expect(tokens[0]!.type).toBe("VERDADEIRO");
    expect(tokens[1]!.type).toBe("FALSO");
  });
});

// =============================================
// 2. PARSER
// =============================================
describe("Parser", () => {
  test("2.1 parseia programa mínimo", () => {
    const ast = parse(`algoritmo "teste"\ninicio\nfimalgoritmo`);
    expect(ast.kind).toBe("Program");
    expect(ast.name).toBe("teste");
  });

  test("2.2 parseia declaração de variáveis", () => {
    const ast = parse(`algoritmo "t"\nvar\n  x, y: inteiro\ninicio\nfimalgoritmo`);
    expect(ast.varDecls.length).toBe(1);
    expect(ast.varDecls[0]!.names).toEqual(["x", "y"]);
  });

  test("2.3 parseia atribuição", () => {
    const ast = parse(`algoritmo "t"\nvar\n  x: inteiro\ninicio\n  x <- 42\nfimalgoritmo`);
    expect(ast.body[0]!.kind).toBe("Assign");
  });

  test("2.4 parseia escreva e escreval", () => {
    const ast = parse(`algoritmo "t"\ninicio\n  escreva("a")\n  escreval("b")\nfimalgoritmo`);
    expect((ast.body[0] as any).kind).toBe("Write");
    expect((ast.body[0] as any).newline).toBe(false);
    expect((ast.body[1] as any).newline).toBe(true);
  });

  test("2.5 parseia se-então-senão-fimse", () => {
    const ast = parse(`algoritmo "t"\nvar\n  x: inteiro\ninicio\n  se x > 0 entao\n    escreval("pos")\n  senao\n    escreval("neg")\n  fimse\nfimalgoritmo`);
    expect(ast.body[0]!.kind).toBe("If");
  });

  test("2.6 parseia laço para", () => {
    const ast = parse(`algoritmo "t"\nvar\n  i: inteiro\ninicio\n  para i de 1 ate 10 faca\n    escreval(i)\n  fimpara\nfimalgoritmo`);
    expect(ast.body[0]!.kind).toBe("For");
  });

  test("2.7 parseia enquanto", () => {
    const ast = parse(`algoritmo "t"\nvar\n  x: inteiro\ninicio\n  enquanto x < 10 faca\n    x <- x + 1\n  fimenquanto\nfimalgoritmo`);
    expect(ast.body[0]!.kind).toBe("While");
  });

  test("2.8 parseia repita-atequé", () => {
    const ast = parse(`algoritmo "t"\nvar\n  x: inteiro\ninicio\n  repita\n    x <- x + 1\n  ateque x >= 5\nfimalgoritmo`);
    expect(ast.body[0]!.kind).toBe("Repeat");
  });
});

// =============================================
// 3. INTERPRETER – TIPOS E OPERAÇÕES BÁSICAS
// =============================================
describe("Inteiros e Reais", () => {
  test("3.1 escreve inteiro", async () => {
    expect(await run(`algoritmo "t"\ninicio\n  escreval(42)\nfimalgoritmo`)).toBe("42");
  });

  test("3.2 escreve real", async () => {
    const out = await run(`algoritmo "t"\ninicio\n  escreval(3.14)\nfimalgoritmo`);
    expect(out).toContain("3.14");
  });

  test("3.3 atribuição e impressão de variável", async () => {
    expect(await run(`algoritmo "t"\nvar\n  x: inteiro\ninicio\n  x <- 99\n  escreval(x)\nfimalgoritmo`)).toBe("99");
  });

  test("3.4 operação aritmética soma", async () => {
    expect(await run(`algoritmo "t"\nvar\n  r: inteiro\ninicio\n  r <- 3 + 4\n  escreval(r)\nfimalgoritmo`)).toBe("7");
  });

  test("3.5 operação subtração", async () => {
    expect(await run(`algoritmo "t"\nvar\n  r: inteiro\ninicio\n  r <- 10 - 3\n  escreval(r)\nfimalgoritmo`)).toBe("7");
  });

  test("3.6 operação multiplicação", async () => {
    expect(await run(`algoritmo "t"\nvar\n  r: inteiro\ninicio\n  r <- 6 * 7\n  escreval(r)\nfimalgoritmo`)).toBe("42");
  });

  test("3.7 operação divisão real", async () => {
    const out = await run(`algoritmo "t"\nvar\n  r: real\ninicio\n  r <- 10 / 4\n  escreval(r)\nfimalgoritmo`);
    expect(parseFloat(out)).toBeCloseTo(2.5);
  });

  test("3.8 divisão inteira (div)", async () => {
    expect(await run(`algoritmo "t"\nvar\n  r: inteiro\ninicio\n  r <- 10 div 3\n  escreval(r)\nfimalgoritmo`)).toBe("3");
  });

  test("3.9 módulo (mod)", async () => {
    expect(await run(`algoritmo "t"\nvar\n  r: inteiro\ninicio\n  r <- 10 mod 3\n  escreval(r)\nfimalgoritmo`)).toBe("1");
  });

  test("3.10 potenciação (^)", async () => {
    expect(await run(`algoritmo "t"\nvar\n  r: real\ninicio\n  r <- 2 ^ 10\n  escreval(r)\nfimalgoritmo`)).toBe("1024");
  });
});

// =============================================
// 4. STRINGS
// =============================================
describe("Strings e Caracteres", () => {
  test("4.1 concatenação de strings com +", async () => {
    expect(await run(`algoritmo "t"\nvar\n  s: caractere\ninicio\n  s <- "Olá" + " " + "Mundo"\n  escreval(s)\nfimalgoritmo`)).toBe("Olá Mundo");
  });

  test("4.2 comprimento de string", async () => {
    expect(await run(`algoritmo "t"\ninicio\n  escreval(compr("fisica"))\nfimalgoritmo`)).toBe("6");
  });

  test("4.3 maiusc e minusc", async () => {
    expect(await run(`algoritmo "t"\ninicio\n  escreval(maiusc("olá"))\nfimalgoritmo`)).toBe("OLÁ");
  });

  test("4.4 copia substring", async () => {
    expect(await run(`algoritmo "t"\ninicio\n  escreval(copia("algoritmo", 1, 4))\nfimalgoritmo`)).toBe("algo");
  });

  test("4.5 pos encontra posição", async () => {
    expect(await run(`algoritmo "t"\ninicio\n  escreval(pos("go", "algoritmo"))\nfimalgoritmo`)).toBe("3");
  });
});

// =============================================
// 5. LÓGICO
// =============================================
describe("Operadores Lógicos", () => {
  test("5.1 e lógico verdadeiro", async () => {
    expect(await run(`algoritmo "t"\nvar\n  b: logico\ninicio\n  b <- verdadeiro e verdadeiro\n  escreval(b)\nfimalgoritmo`)).toBe("VERDADEIRO");
  });

  test("5.2 e lógico falso", async () => {
    expect(await run(`algoritmo "t"\nvar\n  b: logico\ninicio\n  b <- verdadeiro e falso\n  escreval(b)\nfimalgoritmo`)).toBe("FALSO");
  });

  test("5.3 ou lógico", async () => {
    expect(await run(`algoritmo "t"\nvar\n  b: logico\ninicio\n  b <- falso ou verdadeiro\n  escreval(b)\nfimalgoritmo`)).toBe("VERDADEIRO");
  });

  test("5.4 nao lógico", async () => {
    expect(await run(`algoritmo "t"\nvar\n  b: logico\ninicio\n  b <- nao verdadeiro\n  escreval(b)\nfimalgoritmo`)).toBe("FALSO");
  });
});

// =============================================
// 6. CONTROLE DE FLUXO
// =============================================
describe("Controle de Fluxo", () => {
  test("6.1 se-entao (verdadeiro)", async () => {
    expect(await run(`algoritmo "t"\ninicio\n  se 1 > 0 entao\n    escreval("sim")\n  fimse\nfimalgoritmo`)).toBe("sim");
  });

  test("6.2 se-senao (falso)", async () => {
    expect(await run(`algoritmo "t"\ninicio\n  se 0 > 1 entao\n    escreval("sim")\n  senao\n    escreval("nao")\n  fimse\nfimalgoritmo`)).toBe("nao");
  });

  test("6.3 para com passo 1", async () => {
    expect(await run(`algoritmo "t"\nvar\n  i, s: inteiro\ninicio\n  s <- 0\n  para i de 1 ate 5 faca\n    s <- s + i\n  fimpara\n  escreval(s)\nfimalgoritmo`)).toBe("15");
  });

  test("6.4 para com passo customizado", async () => {
    const out = await run(`algoritmo "t"\nvar\n  i: inteiro\ninicio\n  para i de 0 ate 10 passo 2 faca\n    escreva(i, " ")\n  fimpara\nfimalgoritmo`);
    expect(out.trim()).toBe("0 2 4 6 8 10");
  });

  test("6.5 enquanto", async () => {
    expect(await run(`algoritmo "t"\nvar\n  x: inteiro\ninicio\n  x <- 1\n  enquanto x <= 3 faca\n    escreva(x, " ")\n    x <- x + 1\n  fimenquanto\nfimalgoritmo`)).toBe("1 2 3");
  });

  test("6.6 repita-ateque", async () => {
    expect(await run(`algoritmo "t"\nvar\n  x: inteiro\ninicio\n  x <- 0\n  repita\n    x <- x + 1\n  ateque x >= 3\n  escreval(x)\nfimalgoritmo`)).toBe("3");
  });

  test("6.7 escolha-caso", async () => {
    expect(await run(`algoritmo "t"\nvar\n  x: inteiro\ninicio\n  x <- 2\n  escolha x\n    caso 1\n      escreval("um")\n    caso 2\n      escreval("dois")\n    outrocaso\n      escreval("outro")\n  fimescolha\nfimalgoritmo`)).toBe("dois");
  });

  test("6.8 interrompa em laço", async () => {
    expect(await run(`algoritmo "t"\nvar\n  i: inteiro\ninicio\n  para i de 1 ate 10 faca\n    se i = 4 entao\n      interrompa\n    fimse\n    escreva(i, " ")\n  fimpara\nfimalgoritmo`)).toBe("1 2 3");
  });
});

// =============================================
// 7. VETORES E MATRIZES
// =============================================
describe("Vetores e Matrizes", () => {
  test("7.1 vetor de inteiros - soma", async () => {
    expect(await run(`algoritmo "t"\nvar\n  v: vetor[1..5] de inteiro\n  i, s: inteiro\ninicio\n  para i de 1 ate 5 faca\n    v[i] <- i * 2\n  fimpara\n  s <- 0\n  para i de 1 ate 5 faca\n    s <- s + v[i]\n  fimpara\n  escreval(s)\nfimalgoritmo`)).toBe("30");
  });

  test("7.2 vetor de reais", async () => {
    const out = await run(`algoritmo "t"\nvar\n  v: vetor[1..3] de real\ninicio\n  v[1] <- 1.5\n  v[2] <- 2.5\n  v[3] <- 3.0\n  escreval(v[1] + v[2] + v[3])\nfimalgoritmo`);
    expect(parseFloat(out)).toBeCloseTo(7.0);
  });

  test("7.3 matriz 2x2 determinante", async () => {
    expect(await run(`algoritmo "t"\nvar\n  m: vetor[1..2, 1..2] de inteiro\n  det: inteiro\ninicio\n  m[1,1] <- 3\n  m[1,2] <- 8\n  m[2,1] <- 4\n  m[2,2] <- 6\n  det <- m[1,1] * m[2,2] - m[1,2] * m[2,1]\n  escreval(det)\nfimalgoritmo`)).toBe("-14");
  });

  test("7.4 vetor de caracteres", async () => {
    expect(await run(`algoritmo "t"\nvar\n  v: vetor[1..3] de caractere\ninicio\n  v[1] <- "a"\n  v[2] <- "b"\n  v[3] <- "c"\n  escreval(v[1] + v[2] + v[3])\nfimalgoritmo`)).toBe("abc");
  });

  test("7.5 vetor de registro customizado", async () => {
    expect(await run(`algoritmo "t"\ntipo Aluno = registro\n  nome: caractere\n  nota: real\nfimregistro\nvar\n  turma: vetor[1..2] de Aluno\ninicio\n  turma[1].nome <- "Ana"\n  turma[1].nota <- 9.5\n  turma[2].nome <- "Beto"\n  turma[2].nota <- 7.25\n  escreval(turma[1].nome, " ", turma[2].nome)\n  escreval(turma[1].nota + turma[2].nota)\nfimalgoritmo`)).toBe("Ana Beto\n16.75");
  });
});

// =============================================
// 8. PROCEDIMENTOS E FUNÇÕES
// =============================================
describe("Procedimentos e Funções", () => {
  test("8.1 procedimento sem parâmetro", async () => {
    expect(await run(`algoritmo "t"\nprocedimento saudacao\ninicio\n  escreval("Olá!")\nfimprocedimento\ninicio\n  saudacao\nfimalgoritmo`)).toBe("Olá!");
  });

  test("8.2 procedimento com parâmetros", async () => {
    expect(await run(`algoritmo "t"\nprocedimento dobro(x: inteiro)\ninicio\n  escreval(x * 2)\nfimprocedimento\ninicio\n  dobro(21)\nfimalgoritmo`)).toBe("42");
  });

  test("8.3 função retorna valor", async () => {
    expect(await run(`algoritmo "t"\nfuncao quadrado(x: inteiro): inteiro\ninicio\n  retorne x * x\nfimfuncao\nvar\n  r: inteiro\ninicio\n  r <- quadrado(7)\n  escreval(r)\nfimalgoritmo`)).toBe("49");
  });

  test("8.4 função fatorial recursiva", async () => {
    expect(await run(`algoritmo "t"\nfuncao fat(n: inteiro): inteiro\ninicio\n  se n <= 1 entao\n    retorne 1\n  senao\n    retorne n * fat(n - 1)\n  fimse\nfimfuncao\nvar\n  r: inteiro\ninicio\n  r <- fat(5)\n  escreval(r)\nfimalgoritmo`)).toBe("120");
  });

  test("8.5 parâmetro por referência (var)", async () => {
    expect(await run(`algoritmo "t"\nprocedimento troca(var a, b: inteiro)\nvar\n  t: inteiro\ninicio\n  t <- a\n  a <- b\n  b <- t\nfimprocedimento\nvar\n  x, y: inteiro\ninicio\n  x <- 10\n  y <- 20\n  troca(x, y)\n  escreval(x, " ", y)\nfimalgoritmo`)).toBe("20 10");
  });
});

// =============================================
// 9. FUNÇÕES PRÉ-DEFINIDAS
// =============================================
describe("Funções Pré-definidas", () => {
  test("9.1 abs", async () => {
    expect(await run(`algoritmo "t"\ninicio\n  escreval(abs(-5))\nfimalgoritmo`)).toBe("5");
  });

  test("9.2 raizq", async () => {
    const out = await run(`algoritmo "t"\nvar\n  r: real\ninicio\n  r <- raizq(16)\n  escreval(r)\nfimalgoritmo`);
    expect(parseFloat(out)).toBeCloseTo(4.0);
  });

  test("9.3 sen (seno de 90 graus)", async () => {
    const out = await run(`algoritmo "t"\nvar\n  r: real\ninicio\n  r <- sen(grauprad(90))\n  escreval(r)\nfimalgoritmo`);
    expect(parseFloat(out)).toBeCloseTo(1.0);
  });

  test("9.4 cos (cosseno de 0 graus)", async () => {
    const out = await run(`algoritmo "t"\nvar\n  r: real\ninicio\n  r <- cos(grauprad(0))\n  escreval(r)\nfimalgoritmo`);
    expect(parseFloat(out)).toBeCloseTo(1.0);
  });

  test("9.5 int (parte inteira)", async () => {
    expect(await run(`algoritmo "t"\ninicio\n  escreval(int(3.9))\nfimalgoritmo`)).toBe("3");
  });

  test("9.6 quad", async () => {
    expect(await run(`algoritmo "t"\ninicio\n  escreval(quad(9))\nfimalgoritmo`)).toBe("81");
  });

  test("9.7 log (base 10)", async () => {
    const out = await run(`algoritmo "t"\nvar\n  r: real\ninicio\n  r <- log(1000)\n  escreval(r)\nfimalgoritmo`);
    expect(parseFloat(out)).toBeCloseTo(3.0);
  });

  test("9.8 pi", async () => {
    const out = await run(`algoritmo "t"\nvar\n  r: real\ninicio\n  r <- pi()\n  escreval(r)\nfimalgoritmo`);
    expect(parseFloat(out)).toBeCloseTo(Math.PI);
  });

  test("9.9 max e min", async () => {
    expect(await run(`algoritmo "t"\ninicio\n  escreval(max(3, 7))\n  escreval(min(3, 7))\nfimalgoritmo`)).toBe("7\n3");
  });
});

// =============================================
// 10. REGISTRO (TIPO CUSTOMIZADO)
// =============================================
describe("Registros", () => {
  test("10.1 criação e acesso a campos de registro", async () => {
    expect(await run(`algoritmo "t"\ntipo\n  Ponto = registro\n    x, y: real\n  fimregistro\nvar\n  p: Ponto\ninicio\n  p.x <- 3.0\n  p.y <- 4.0\n  escreval(raizq(p.x ^ 2 + p.y ^ 2))\nfimalgoritmo`)).toBe("5");
  });
});

// =============================================
// 11. LEITURA DE ENTRADA
// =============================================
describe("Entrada/Saída", () => {
  test("11.1 leia inteiro", async () => {
    expect(await run(`algoritmo "t"\nvar\n  x: inteiro\ninicio\n  leia(x)\n  escreval(x * 2)\nfimalgoritmo`, ["21"])).toBe("42");
  });

  test("11.2 leia múltiplos valores", async () => {
    expect(await run(`algoritmo "t"\nvar\n  a, b: inteiro\ninicio\n  leia(a, b)\n  escreval(a + b)\nfimalgoritmo`, ["10", "32"])).toBe("42");
  });

  test("11.3 leia string", async () => {
    expect(await run(`algoritmo "t"\nvar\n  s: caractere\ninicio\n  leia(s)\n  escreval("Olá, " + s + "!")\nfimalgoritmo`, ["Maria"])).toBe("Olá, Maria!");
  });
});

// =============================================
// 12. ERROS EM TEMPO DE EXECUÇÃO
// =============================================
describe("Tratamento de Erros", () => {
  test("12.1 divisão por zero lança erro", async () => {
    const err = await runWithError(`algoritmo "t"\nvar\n  x: inteiro\ninicio\n  x <- 10 / 0\nfimalgoritmo`);
    expect(err).toContain("zero");
  });

  test("12.2 variável não declarada lança erro", async () => {
    const err = await runWithError(`algoritmo "t"\ninicio\n  escreval(xNaoDeclarada)\nfimalgoritmo`);
    expect(err.length).toBeGreaterThan(0);
  });

  test("12.3 índice fora dos limites do vetor", async () => {
    const err = await runWithError(`algoritmo "t"\nvar\n  v: vetor[1..3] de inteiro\ninicio\n  v[10] <- 5\nfimalgoritmo`);
    expect(err).toContain("fora dos limites");
  });

  test("12.4 laço infinito protegido", async () => {
    const err = await runWithError(`algoritmo "t"\nvar\n  x: inteiro\ninicio\n  x <- 0\n  enquanto verdadeiro faca\n    x <- x + 1\n  fimenquanto\nfimalgoritmo`);
    expect(err).toContain("iterações");
  });
});

// =============================================
// 13. PROGRAMAS DE FÍSICA (Contexto pedagógico)
// =============================================
describe("Programas de Física", () => {
  test("13.1 lei de Ohm V = R * I", async () => {
    const out = await run(
      `algoritmo "Lei de Ohm"\nvar\n  R, I, V: real\ninicio\n  leia(R)\n  leia(I)\n  V <- R * I\n  escreval(V)\nfimalgoritmo`,
      ["100", "0.5"]
    );
    expect(parseFloat(out)).toBeCloseTo(50.0);
  });

  test("13.2 energia cinética Ec = 0.5 * m * v^2", async () => {
    const out = await run(
      `algoritmo "Energia Cinética"\nvar\n  m, v, Ec: real\ninicio\n  leia(m)\n  leia(v)\n  Ec <- 0.5 * m * v ^ 2\n  escreval(Ec)\nfimalgoritmo`,
      ["2", "10"]
    );
    expect(parseFloat(out)).toBeCloseTo(100.0);
  });

  test("13.3 queda livre h = 0.5 * g * t^2", async () => {
    const out = await run(
      `algoritmo "Queda Livre"\nvar\n  g, t, h: real\ninicio\n  g <- 9.8\n  leia(t)\n  h <- 0.5 * g * t ^ 2\n  escreval(h)\nfimalgoritmo`,
      ["10"]
    );
    expect(parseFloat(out)).toBeCloseTo(490.0);
  });
});

// =============================================
// 14. CONSTANTES (bloco const)
// =============================================
describe("Constantes (bloco const)", () => {
  test("14.1 const numérica usada em escreva", async () => {
    const out = await run(
      `algoritmo "Const"\nvar\n  x: real\nconst\n  pi = 3.14\ninicio\n  escreval(pi)\nfimalgoritmo`
    );
    expect(parseFloat(out)).toBeCloseTo(3.14);
  });

  test("14.2 const string usada em escreva", async () => {
    const out = await run(
      `algoritmo "Const"\nconst\n  msg = "ola mundo"\ninicio\n  escreval(msg)\nfimalgoritmo`
    );
    expect(out.trim()).toBe("ola mundo");
  });

  test("14.3 const usada em expressão aritmética", async () => {
    const out = await run(
      `algoritmo "Const"\nvar\n  r, area: real\nconst\n  pi = 3.14159\ninicio\n  r <- 2\n  area <- pi * r * r\n  escreval(area)\nfimalgoritmo`
    );
    expect(parseFloat(out)).toBeCloseTo(12.566, 2);
  });

  test("14.4 const antes de var (ordem invertida)", async () => {
    const out = await run(
      `algoritmo "Const"\nconst\n  g = 9.8\nvar\n  t, h: real\ninicio\n  t <- 2\n  h <- 0.5 * g * t * t\n  escreval(h)\nfimalgoritmo`
    );
    expect(parseFloat(out)).toBeCloseTo(19.6, 1);
  });

  test("14.5 const e var juntos com leia", async () => {
    const out = await run(
      `algoritmo "Primeiro Programa"\nvar\n  nome: caractere\nconst\n  pi = 3.14\ninicio\n  escreva("PI vale: ", pi)\n  escreval("")\n  leia(nome)\n  escreva("Ola, ", nome, "!")\nfimalgoritmo`,
      ["Joao"]
    );
    expect(out).toContain("PI vale: 3.14");
    expect(out).toContain("Ola, Joao!");
  });

  test("14.6 atribuição a constante lança erro", async () => {
    await expect(
      run(
        `algoritmo "Const"\nconst\n  x = 10\ninicio\n  x <- 20\nfimalgoritmo`
      )
    ).rejects.toThrow(/constante/i);
  });
});
