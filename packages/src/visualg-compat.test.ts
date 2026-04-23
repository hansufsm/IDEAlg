// ============================================================
// TESTE DE COMPATIBILIDADE LEXICAL - VisualG vs Australis
// ============================================================

import { Lexer } from "./lexer/lexer";
import { Parser } from "./parser/parser";
import { Interpreter } from "./interpreter/interpreter";

interface TestCase {
  name: string;
  code: string;
  shouldRun?: boolean;
}

const testCases: TestCase[] = [
  // --- ESTRUTURA BÁSICA ---
  {
    name: "Programa mínimo",
    code: `algoritmo "teste"
inicio
fimalgoritmo`,
    shouldRun: true,
  },

  // --- TIPOS DE DADOS ---
  {
    name: "Declaração de variáveis",
    code: `algoritmo "tipos"
var
   x: inteiro
   y: real
   nome: caractere
   ativo: logico
inicio
fimalgoritmo`,
    shouldRun: true,
  },

  // --- ATRIBUIÇÃO <- e = ---
  {
    name: "Atribuição com <-",
    code: `algoritmo "atribuicao"
var x: inteiro
inicio
   x <- 10
fimalgoritmo`,
    shouldRun: true,
  },

  // --- OPERADORES ---
  {
    name: "Operadores aritméticos",
    code: `algoritmo "operadores"
var a, b, r: real
inicio
   a <- 10
   b <- 3
   r <- a + b
   r <- a - b
   r <- a * b
   r <- a / b
   r <- a div b
   r <- a mod b
   r <- a ^ b
fimalgoritmo`,
    shouldRun: true,
  },

  // --- COMPARAÇÃO ---
  {
    name: "Operadores de comparação",
    code: `algoritmo "comparacao"
var x: logico
inicio
   x <- 5 = 5
   x <- 5 <> 5
   x <- 5 < 5
   x <- 5 <= 5
   x <- 5 > 5
   x <- 5 >= 5
fimalgoritmo`,
    shouldRun: true,
  },

  // --- STRINGS ---
  {
    name: "Strings com aspas duplas",
    code: `algoritmo "strings"
var nome: caractere
inicio
   nome <- "Hans"
   escreval(nome)
fimalgoritmo`,
    shouldRun: true,
  },

  {
    name: "Strings com aspas simples",
    code: `algoritmo "strings2"
var letra: caractere
inicio
   letra <- 'A'
fimalgoritmo`,
    shouldRun: true,
  },

  // --- COMENTÁRIOS ---
  {
    name: "Comentário de linha //",
    code: `algoritmo "comentario"
inicio
   // isto é um comentário
   x <- 10 // comentário final
fimalgoritmo`,
    shouldRun: true,
  },

  {
    name: "Comentário de bloco {}",
    code: `algoritmo "comentario2"
var x: inteiro
{ Isto é um
   comentário de
   múltiplas linhas }
inicio
   x <- 10
fimalgoritmo`,
    shouldRun: true,
  },

  // --- CONTROLE ---
  {
    name: "Se-Então-Senão",
    code: `algoritmo "se"
var x: inteiro
inicio
   se x > 0 entao
      escreval("positivo")
   senao
      escreval("negativo")
   fimse
fimalgoritmo`,
    shouldRun: true,
  },

  {
    name: "Para-Até-Faça",
    code: `algoritmo "para"
var i: inteiro
inicio
   para i de 1 ate 10 faca
      escreval(i)
   fimpara
fimalgoritmo`,
    shouldRun: true,
  },

  {
    name: "Para com passo",
    code: `algoritmo "parapasso"
var i: inteiro
inicio
   para i de 10 ate 1 passo -1 faca
      escreval(i)
   fimpara
fimalgoritmo`,
    shouldRun: true,
  },

  {
    name: "Enquanto",
    code: `algoritmo "enquanto"
var i: inteiro
inicio
   i <- 0
   enquanto i < 10 faca
      i <- i + 1
   fimenquanto
fimalgoritmo`,
    shouldRun: true,
  },

  {
    name: "Repita-AtéQue",
    code: `algoritmo "repita"
var i: inteiro
inicio
   i <- 0
   repita
      i <- i + 1
   ateque i >= 10
fimalgoritmo`,
    shouldRun: true,
  },

  {
    name: "Escolha-Caso",
    code: `algoritmo "escolha"
var op: inteiro
inicio
   op <- 2
   escolha op
      caso 1
         escreval("um")
      caso 2
         escreval("dois")
      outrocaso
         escreval("outro")
   fimescolha
fimalgoritmo`,
    shouldRun: true,
  },

  // --- VETORES E MATRIZES ---
  {
    name: "Vetor unidimensional",
    code: `algoritmo "vetor"
var nums: vetor[1..5] de inteiro
     i: inteiro
inicio
   para i de 1 ate 5 faca
      nums[i] <- i * 2
   fimpara
fimalgoritmo`,
    shouldRun: true,
  },

  {
    name: "Matriz multidimensional",
    code: `algoritmo "matriz"
var mat: matriz[1..3, 1..3] de real
     i, j: inteiro
inicio
   para i de 1 ate 3 faca
      para j de 1 ate 3 faca
         mat[i,j] <- i * j
      fimpara
   fimpara
fimalgoritmo`,
    shouldRun: true,
  },

  // --- REGISTROS ---
  {
    name: "Registro (tipo estruturado)",
    code: `algoritmo "registro"
tipo
   Pessoa = registro
      nome: caractere
      idade: inteiro
   fimregistro
var
   p: Pessoa
inicio
   p.nome <- "Ana"
   p.idade <- 25
fimalgoritmo`,
    shouldRun: true,
  },

  // --- FUNÇÕES E PROCEDIMENTOS ---
  {
    name: "Procedimento",
    code: `algoritmo "procedimento"
procedimento teste()
inicio
   escreval("teste")
fimprocedimento
inicio
   teste()
fimalgoritmo`,
    shouldRun: true,
  },

  {
    name: "Função",
    code: `algoritmo "funcao"
funcao dobro(n: inteiro): inteiro
inicio
   retorne n * 2
fimfuncao
inicio
   escreval(dobro(5))
fimalgoritmo`,
    shouldRun: true,
  },

  {
    name: "Função recursiva (fatorial)",
    code: `algoritmo "recursao"
funcao fatorial(n: inteiro): inteiro
inicio
   se n <= 1 entao
      retorne 1
   senao
      retorne n * fatorial(n - 1)
   fimse
fimfuncao
inicio
   escreval(fatorial(5))
fimalgoritmo`,
    shouldRun: true,
  },

  {
    name: "Parâmetro por referência (var)",
    code: `algoritmo "referencia"
procedimento troca(var a, b: inteiro)
var temp: inteiro
inicio
   temp <- a
   a <- b
   b <- temp
fimprocedimento
var x, y: inteiro
inicio
   x <- 1
   y <- 2
   troca(x, y)
fimalgoritmo`,
    shouldRun: true,
  },

  // --- FORMATAÇÃO DE SAÍDA (v:x:y) ---
  {
    name: "Formatação de reais (v:6:2)",
    code: `algoritmo "formato"
var x: real
inicio
   x <- 3.14159
   escreval("Pi: ", x:6:2)
fimalgoritmo`,
    shouldRun: true,
  },

  // --- FUNÇÕES PRÉ-DEFINIDAS ---
  {
    name: "Funções matemáticas",
    code: `algoritmo "matematica"
var r: real
inicio
   r <- raizq(16)
   r <- abs(-5)
   r <- sen(90)
   r <- cos(0)
   r <- log(100)
   r <- exp(1)
   escreval(pi)
fimalgoritmo`,
    shouldRun: true,
  },

  {
    name: "Funções de string",
    code: `algoritmo "strings3"
var texto: caractere
     len: inteiro
inicio
   texto <- "hello world"
   len <- compr(texto)
   texto <- maiusc(texto)
   texto <- minusc(texto)
fimalgoritmo`,
    shouldRun: true,
  },

  // --- CASOS EXTREMOS DO VISUALG ---
  {
    name: "Números com notação científica",
    code: `algoritmo "notacao"
var x: real
inicio
   x <- 1.5e10
   x <- 2.3E-5
fimalgoritmo`,
    shouldRun: true,
  },

  {
    name: "Palavras-chave com acentos (atequé)",
    code: `algoritmo "ateque"
var i: inteiro
inicio
   i <- 0
   repita
      i <- i + 1
   atequé i >= 5
fimalgoritmo`,
    shouldRun: true,
  },

  {
    name: "Operador atribuição Unicode (←)",
    code: `algoritmo "unicode"
var x: inteiro
inicio
   x ← 42
fimalgoritmo`,
    shouldRun: true,
  },

  {
    name: "Mistura de <- e ←",
    code: `algoritmo "mistura"
var x, y: inteiro
inicio
   x <- 10
   y ← 20
fimalgoritmo`,
    shouldRun: true,
  },
];

// =============================================
// GERAR TESTES JEST DINAMICAMENTE
// =============================================

describe("Compatibilidade VisualG", () => {
  testCases.forEach((tc) => {
    if (tc.shouldRun !== false) {
      it(`[OK] ${tc.name}`, () => {
        const lexer = new Lexer(tc.code);
        const tokens = lexer.tokenize();
        expect(tokens.length).toBeGreaterThan(0);

        const parser = new Parser(tokens);
        const ast = parser.parse();
        expect(ast).toBeDefined();
      });
    } else {
      it(`[ERRO] ${tc.name}`, () => {
        expect(() => {
          const lexer = new Lexer(tc.code);
          const tokens = lexer.tokenize();
          const parser = new Parser(tokens);
          parser.parse();
        }).toThrow();
      });
    }
  });
});
