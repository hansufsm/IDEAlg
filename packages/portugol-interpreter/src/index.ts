// ============================================================
// AUSTRALIS – Portugol Interpreter – Public API
// ============================================================

import { Lexer } from "./lexer/lexer";
import { Parser } from "./parser/parser";
import {
   Interpreter,
   IOInterface,
   ExecutionResult,
} from "./interpreter/interpreter";
import { ProgramNode } from "./parser/ast";

export { LexerError } from "./lexer/lexer";
export { ParseError } from "./parser/parser";
export { RuntimeError } from "./interpreter/environment";
export { PortugolDebugger } from "./debugger/debugger";
export type {
   IOInterface,
   ExecutionResult,
   StepInfo,
} from "./interpreter/interpreter";
export type { DebuggerState, DebuggerEvent } from "./debugger/debugger";
export type { ProgramNode } from "./parser/ast";
export type {
   PortugolValue,
   PortugolArray,
   PortugolRecord,
} from "./interpreter/environment";

/**
 * Transforma código-fonte Portugol em uma AST (`ProgramNode`).
 *
 * Executa Lexer + Parser. Lança `LexerError` ou `ParseError` em caso de
 * erro de sintaxe — capture-os para exibir mensagens ao usuário.
 *
 * @param source Código-fonte Portugol completo (string UTF-8).
 * @returns Raiz da AST pronta para ser passada a `Interpreter` ou `PortugolDebugger`.
 * @throws {LexerError} Token inválido encontrado durante a tokenização.
 * @throws {ParseError} Estrutura sintática inválida encontrada durante o parse.
 *
 * @example
 * ```ts
 * import { parse } from "portugol-interpreter";
 * const ast = parse(`algoritmo "Oi"\ninicio\n  escreval("Olá!")\nfimalgoritmo`);
 * ```
 */
export function parse(source: string): ProgramNode {
   const lexer = new Lexer(source);
   const tokens = lexer.tokenize();
   const parser = new Parser(tokens);
   return parser.parse();
}

/**
 * Executa código-fonte Portugol de ponta a ponta (parse + interpretação).
 *
 * Nunca lança exceção — erros de sintaxe e de runtime são capturados e
 * retornados em `ExecutionResult.error`. Use `io` para capturar saída ou
 * fornecer entradas personalizadas (ex.: console do browser, testes unitários).
 *
 * @param source Código-fonte Portugol completo (string UTF-8).
 * @param io     Implementação opcional de I/O. Se omitida, `write` acumula
 *               em `ExecutionResult.output` e `read` usa `window.prompt`.
 * @returns Objeto com `output` (texto impresso), `executionTimeMs` e,
 *          opcionalmente, `error` (mensagem de erro se a execução falhou).
 *
 * @example
 * ```ts
 * import { execute } from "portugol-interpreter";
 *
 * const lines: string[] = [];
 * const result = await execute(code, {
 *   write: (text) => lines.push(text),
 *   read: (_prompt) => "42",
 * });
 * if (result.error) console.error(result.error);
 * else console.log(lines.join(""));
 * ```
 */
export async function execute(
   source: string,
   io?: Partial<IOInterface>,
): Promise<ExecutionResult> {
   const start = Date.now();
   const outputLines: string[] = [];

   const defaultIO: IOInterface = {
      write: (text: string) => {
         outputLines.push(text);
      },
      read: (prompt: string) => {
         if (typeof window !== "undefined") {
            return window.prompt(prompt) ?? "";
         }
         return "";
      },
   };

   const combinedIO: IOInterface = {
      write: io?.write ?? defaultIO.write,
      read: io?.read ?? defaultIO.read,
   };

   try {
      const program = parse(source);
      const interpreter = new Interpreter(combinedIO);
      await interpreter.execute(program);

      return {
         output: outputLines.join(""),
         executionTimeMs: Date.now() - start,
      };
   } catch (e) {
      return {
         output: outputLines.join(""),
         error: (e as Error).message,
         executionTimeMs: Date.now() - start,
      };
   }
}

// =============================================
// Monaco Editor language definition
// =============================================
export const PORTUGOL_LANGUAGE_ID = "portugol";

export const PORTUGOL_KEYWORDS = [
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
   "mod",
];

export const PORTUGOL_BUILTIN_FUNCTIONS = [
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
   "min",
];

export const PORTUGOL_MONARCH_LANGUAGE = {
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
                  "@default": "identifier",
               },
            },
         ],
         [/".*?"/, "string"],
         [/'.*?'/, "string"],
         [/\d+\.\d+([eE][+-]?\d+)?/, "number.float"],
         [/\d+/, "number"],
         [/\/\/.*$/, "comment"],
         [/\{[^}]*\}/, "comment"],
         [/[<>]=?|<>|[+\-*/^%]|<-|←/, "operator"],
         [/[()[\].,;:]/, "delimiter"],
      ],
   },
   ignoreCase: true,
};

// =============================================
// Example programs for seeding
// =============================================

/** Metadados de um programa de exemplo exibido na IDE. */
export interface ExampleProgram {
   title: string;
   code: string;
   description: string;
   difficulty: "iniciante" | "intermediário" | "avançado";
   /** Indica se o programa usa `leia` e, portanto, requer entrada do usuário. */
   hasInput: boolean;
}

/** Agrupamento de exemplos por tema para exibição categorizada na IDE. */
export interface ExampleCategory {
   id: string;
   name: string;
   icon: string;
   examples: ExampleProgram[];
}

// Legacy flat list for compatibility
export const EXAMPLE_PROGRAMS: Record<string, string> = {
   "Olá Mundo": `algoritmo "Olá Mundo"
var
   bot : caractere
inicio
   bot <- "Adoro Física"
   escreva("Olá Mundo!")
   escreval(bot)
fimalgoritmo`,
   Fatorial: `algoritmo "Fatorial"
var
   n, i, fat: inteiro
inicio
   escreva("Digite um número inteiro positivo: ")
   leia(n)
   fat <- 1
   para i de 1 ate n faca
      fat <- fat * i
   fimpara
   escreval("Fatorial de ", n, " = ", fat)
fimalgoritmo`,

   "Sequência de Fibonacci": `algoritmo "Fibonacci"
var
   n, i, a, b, temp: inteiro
inicio
   escreva("Quantos termos da sequência de Fibonacci? ")
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
{ Calcula a velocidade e distância de queda livre }
var
   g, t, v, h: real
inicio
   g <- 9.8
   escreva("Tempo de queda (s): ")
   leia(t)
   v <- g * t
   h <- 0.5 * g * t * t
   escreval("Velocidade: ", v:6:2, " m/s")
   escreval("Distância:  ", h:6:2, " m")
fimalgoritmo`,
};

// Categorized examples for IDE
export const EXAMPLE_CATEGORIES: ExampleCategory[] = [
   {
      id: "basico",
      name: "Básico",
      icon: "🔰",
      examples: [
         {
            title: "Olá Mundo",
            code: `algoritmo "Olá Mundo"
var
inicio
   escreval("Olá, Mundo!")
fimalgoritmo`,
            description: "Primeiro programa - exibe uma mensagem na tela",
            difficulty: "iniciante",
            hasInput: false,
         },
         {
            title: "Variáveis e Tipos",
            code: `algoritmo "Variáveis e Tipos"
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
            description: "Demonstra declaração de variáveis dos tipos básicos",
            difficulty: "iniciante",
            hasInput: false,
         },
         {
            title: "Operações Aritméticas",
            code: `algoritmo "Operações Aritméticas"
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
   escreval("Subtração: ", sub)
   escreval("Multiplicação: ", mult)
   escreval("Divisão: ", divi:6:2)
   escreval("Resto (a mod b): ", a - b * int(a / b))
fimalgoritmo`,
            description: "Operações matemáticas básicas",
            difficulty: "iniciante",
            hasInput: false,
         },
      ],
   },
   {
      id: "controle",
      name: "Controle",
      icon: "🔀",
      examples: [
         {
            title: "Par ou Ímpar",
            code: `algoritmo "Par ou Ímpar"
var
   n: inteiro
inicio
   escreva("Digite um número: ")
   leia(n)
   
   se n mod 2 = 0 entao
      escreval(n, " é PAR")
   senao
      escreval(n, " é ÍMPAR")
   fimse
fimalgoritmo`,
            description: "Estrutura condicional simples com se/senao",
            difficulty: "iniciante",
            hasInput: true,
         },
         {
            title: "Maior de Três",
            code: `algoritmo "Maior de Três"
var
   a, b, c, maior: real
inicio
   escreva("Primeiro número: ")
   leia(a)
   escreva("Segundo número: ")
   leia(b)
   escreva("Terceiro número: ")
   leia(c)
   
   maior <- a
   se b > maior entao
      maior <- b
   fimse
   se c > maior entao
      maior <- c
   fimse
   
   escreval("O maior é: ", maior)
fimalgoritmo`,
            description: "Encontrar o maior entre três valores",
            difficulty: "iniciante",
            hasInput: true,
         },
         {
            title: "Calculadora",
            code: `algoritmo "Calculadora"
var
   a, b: real
   op: caractere
inicio
   escreva("Primeiro número: ")
   leia(a)
   escreva("Operação (+, -, *, /): ")
   leia(op)
   escreva("Segundo número: ")
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
            escreval("Erro: divisão por zero!")
         senao
            escreval("Resultado: ", a / b)
         fimse
      outrocaso
         escreval("Operação inválida!")
   fimescolha
fimalgoritmo`,
            description: "Calculadora com as quatro operações",
            difficulty: "iniciante",
            hasInput: true,
         },
         {
            title: "Tabuada",
            code: `algoritmo "Tabuada"
var
   n, i, resultado: inteiro
inicio
   escreva("Digite um número: ")
   leia(n)
   
   para i de 0 ate 10 faca
      resultado <- n * i
      escreval(n, " x ", i, " = ", resultado)
   fimpara
fimalgoritmo`,
            description: "Laço para exibir tabuada de multiplicação",
            difficulty: "iniciante",
            hasInput: true,
         },
         {
            title: "Números Primos",
            code: `algoritmo "Números Primos"
var
   n, i, divisoes: inteiro
   ehPrimo: logico
inicio
   escreva("Digite um número: ")
   leia(n)
   
   ehPrimo <- verdadeiro
   divisoes <- 0
   
   para i de 1 ate n faca
      se n mod i = 0 entao
         divisoes <- divisoes + 1
      fimse
   fimpara
   
   se divisoes = 2 entao
      escreval(n, " é PRIMO")
   senao
      escreval(n, " NÃO é primo")
   fimse
fimalgoritmo`,
            description: "Verifica se um número é primo",
            difficulty: "intermediário",
            hasInput: true,
         },
      ],
   },
   {
      id: "vetores",
      name: "Vetores",
      icon: "📊",
      examples: [
         {
            title: "Maior e Menor Valor",
            code: `algoritmo "Maior e Menor"
var
   numeros: vetor[1..5] de inteiro
   i, maior, menor: inteiro
inicio
   para i de 1 ate 5 faca
      escreva("Digite o ", i, "º número: ")
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
            difficulty: "intermediário",
            hasInput: true,
         },
         {
            title: "Média de Valores",
            code: `algoritmo "Média de Valores"
var
   valores: vetor[1..10] de real
   i: inteiro
   soma, media: real
inicio
   soma <- 0
   para i de 1 ate 10 faca
      escreva("Digite o ", i, "º valor: ")
      leia(valores[i])
      soma <- soma + valores[i]
   fimpara
   
   media <- soma / 10
   escreval("Soma: ", soma:6:2)
   escreval("Média: ", media:6:2)
fimalgoritmo`,
            description: "Calcula soma e média de 10 valores",
            difficulty: "intermediário",
            hasInput: true,
         },
         {
            title: "Ordenação Bolha",
            code: `algoritmo "Ordenação Bolha"
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
            description: "Ordena vetor pelo método bolha",
            difficulty: "avançado",
            hasInput: true,
         },
      ],
   },
   {
      id: "funcoes",
      name: "Funções",
      icon: "⚙️",
      examples: [
         {
            title: "Fatorial com Função",
            code: `algoritmo "Fatorial com Função"
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
   escreva("Digite um número: ")
   leia(n)
   escreval("Fatorial: ", fatorial(n))
fimalgoritmo`,
            description: "Calcula fatorial usando função",
            difficulty: "intermediário",
            hasInput: true,
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
   escreva("Digite um número: ")
   leia(n)
   escreval("Fatorial de ", n, ": ", fatorial(n))
fimalgoritmo`,
            description: "Fatorial usando recursão",
            difficulty: "avançado",
            hasInput: true,
         },
      ],
   },
   {
      id: "constantes",
      name: "Constantes",
      icon: "📌",
      examples: [
         {
            title: "Constantes Numéricas",
            code: `algoritmo "Constantes Numéricas"
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
   escreval("=== Constantes Numéricas ===")
   escreval("Velocidade da luz: ", VELOCIDADE_LUZ, " m/s")
   escreval("Número de Euler e: ", EULER:8:5)
   escreval("Área do círculo (r=5): ", area:7:4, " m²")
   escreval("Circunferência:    ", circunferencia:7:4, " m")
fimalgoritmo`,
            description: "Constantes inteiras e reais: velocidade da luz, π e e",
            difficulty: "iniciante",
            hasInput: false,
         },
         {
            title: "Constantes Lógicas e de Texto",
            code: `algoritmo "Constantes Lógicas e Texto"
{ Constantes podem ser lógicas (verdadeiro/falso) ou strings }
const
   SISTEMA_ATIVO = verdadeiro
   VERSAO        = "1.0.0"
   NOME_SISTEMA  = "Australis LMS"
var
   status: caractere
inicio
   escreval("Sistema: ", NOME_SISTEMA)
   escreval("Versão:  ", VERSAO)
   se SISTEMA_ATIVO entao
      status <- "ONLINE"
   senao
      status <- "OFFLINE"
   fimse
   escreval("Status:  ", status)
fimalgoritmo`,
            description: "Constantes lógicas (verdadeiro/falso) e strings de texto",
            difficulty: "iniciante",
            hasInput: false,
         },
         {
            title: "Constantes Aritméticas",
            code: `algoritmo "Constantes Aritméticas"
{ Constantes podem ser expressões calculadas em tempo de compilação }
const
   PI      = 3.14159265
   DOIS_PI = 2 * 3.14159265   { expressão aritmética }
   G       = 9.80665          { gravidade padrão m/s² }
   MEIA_G  = 9.80665 / 2      { metade da gravidade }
var
   t, h, v: real
inicio
   t <- 3
   h <- MEIA_G * t * t
   v <- G * t
   escreval("Queda Livre com constantes")
   escreval("g = ", G:7:5, " m/s²")
   escreval("t = ", t:4:1, " s")
   escreval("h = ", h:7:3, " m")
   escreval("v = ", v:7:3, " m/s")
   escreval("2π = ", DOIS_PI:8:5)
fimalgoritmo`,
            description: "Constantes definidas como expressões aritméticas compostas",
            difficulty: "iniciante",
            hasInput: false,
         },
         {
            title: "Conversor de Unidades",
            code: `algoritmo "Conversor de Unidades"
{ Fatores de conversão como constantes — nunca mudam! }
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
            description: "Fatores de conversão de unidades como constantes",
            difficulty: "iniciante",
            hasInput: false,
         },
         {
            title: "Conversão de Temperatura",
            code: `algoritmo "Conversão de Temperatura"
{ Constantes negativas e fracionárias }
const
   ZERO_ABSOLUTO_C = -273.15   { 0 Kelvin em Celsius }
   FATOR_FC        = 9 / 5     { fator Celsius → Fahrenheit }
   OFFSET_FC       = 32        { offset Fahrenheit }
var
   celsius, fahrenheit, kelvin: real
inicio
   escreva("Temperatura em Celsius: ")
   leia(celsius)
   fahrenheit <- celsius * FATOR_FC + OFFSET_FC
   kelvin     <- celsius - ZERO_ABSOLUTO_C
   escreval("=== Conversão de Temperatura ===")
   escreval("Celsius:    ", celsius:7:2, " °C")
   escreval("Fahrenheit: ", fahrenheit:7:2, " °F")
   escreval("Kelvin:     ", kelvin:7:2, " K")
fimalgoritmo`,
            description: "Constantes negativas e fracionárias para converter temperaturas",
            difficulty: "iniciante",
            hasInput: true,
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
   escreval("Área do círculo:   ", area_circ:7:4)
   escreval("Volume da esfera:  ", vol_esfera:7:4)
   escreval("Área do quadrado:  ", area_quad:7:1)
fimalgoritmo`,
            description: "Blocos var e const intercalados — ordem flexível",
            difficulty: "intermediário",
            hasInput: false,
         },
         {
            title: "Constante Negativa e Parênteses",
            code: `algoritmo "Constante Negativa e Parênteses"
{ Constantes aceitam valores negativos e expressões com parênteses }
const
   TEMP_MIN = -273.15          { zero absoluto }
   FATOR    = (3 + 7) * 2      { expressão com parênteses = 20 }
   DESCONTO = 100 - 15         { subtração = 85 }
var
   t: real
inicio
   t <- 25
   escreval("Zero absoluto: ", TEMP_MIN:8:2, " °C")
   escreval("Fator:         ", FATOR)
   escreval("Desconto:      ", DESCONTO, "%")
   escreval("Temperatura:   ", t:5:1, " °C")
fimalgoritmo`,
            description: "Constantes com valores negativos e expressões parentetizadas",
            difficulty: "iniciante",
            hasInput: false,
         },
         {
            title: "Proteção de Constante",
            code: `algoritmo "Proteção de Constante"
{ Tente descomentar a linha abaixo — o interpretador vai reclamar! }
const
   LIMITE_VELOCIDADE = 110   { km/h — não pode ser alterado }
   MULTA_BASE        = 293.47
var
   velocidade, multa: real
inicio
   escreva("Velocidade medida (km/h): ")
   leia(velocidade)
   { LIMITE_VELOCIDADE <- 200 }  { ERRO: não pode reatribuir constante }
   se velocidade > LIMITE_VELOCIDADE entao
      multa <- MULTA_BASE * (velocidade / LIMITE_VELOCIDADE)
      escreval("MULTA: R$ ", multa:7:2)
   senao
      escreval("Velocidade dentro do limite de ", LIMITE_VELOCIDADE, " km/h")
   fimse
fimalgoritmo`,
            description: "Demonstra que constantes não podem ser reatribuídas",
            difficulty: "intermediário",
            hasInput: true,
         },
      ],
   },
   {
      id: "fisica",
      name: "Física",
      icon: "⚛️",
      examples: [
         {
            title: "Queda Livre",
            code: `algoritmo "Queda Livre"
{ Cinemática: movimento sob gravidade
   v = g * t
   h = (1/2) * g * t² }
var
   g, t, v, h: real
inicio
   g <- 9.81
   escreva("Tempo de queda (s): ")
   leia(t)
   
   v <- g * t
   h <- 0.5 * g * t * t
   
   escreval("Gravidade: ", g:5:2, " m/s²")
   escreval("Velocidade: ", v:6:2, " m/s")
   escreval("Altura:     ", h:6:2, " m")
fimalgoritmo`,
            description: "Calcula velocidade e altura na queda livre",
            difficulty: "iniciante",
            hasInput: true,
         },
         {
            title: "MRU - Movimento Retilíneo",
            code: `algoritmo "Movimento Retilíneo Uniforme"
{ MRU: s = s₀ + v * t }
var
   s0, v, t, s: real
inicio
   escreva("Posição inicial (m): ")
   leia(s0)
   escreva("Velocidade (m/s): ")
   leia(v)
   escreva("Tempo (s): ")
   leia(t)
   
   s <- s0 + v * t
   
   escreval("Equação: s = s₀ + v*t")
   escreval("s = ", s0:6:2, " + ", v:5:2, " × ", t:5:2)
   escreval("Posição final: ", s:6:2, " m")
fimalgoritmo`,
            description: "Calcula posição no MRU",
            difficulty: "iniciante",
            hasInput: true,
         },
         {
            title: "Energia Cinética",
            code: `algoritmo "Energia Cinética"
{ Ec = (1/2) * m * v² }
var
   m, v, ec: real
inicio
   escreva("Massa (kg): ")
   leia(m)
   escreva("Velocidade (m/s): ")
   leia(v)
   
   ec <- 0.5 * m * v * v
   
   escreval("Energia Cinética")
   escreval("Ec = (1/2) × m × v²")
   escreval("Ec = (1/2) × ", m:5:2, " × ", v:5:2, "²")
   escreval("Ec = ", ec:6:2, " J (Joules)")
fimalgoritmo`,
            description: "Calcula energia cinética",
            difficulty: "iniciante",
            hasInput: true,
         },
         {
            title: "Lei de Ohm",
            code: `algoritmo "Lei de Ohm"
{ U = R × I }
var
   u, r, i: real
   opcao: inteiro
inicio
   escreval("1 - Calcular Tensão (U)")
   escreval("2 - Calcular Resistência (R)")
   escreval("3 - Calcular Corrente (I)")
   escreva("Escolha: ")
   leia(opcao)
   
   escolha opcao
      caso 1
         escreva("Corrente (A): ")
         leia(i)
         escreva("Resistência (Ω): ")
         leia(r)
         u <- r * i
         escreval("Tensão: ", u:6:2, " V")
      caso 2
         escreva("Tensão (V): ")
         leia(u)
         escreva("Corrente (A): ")
         leia(i)
         r <- u / i
         escreval("Resistência: ", r:6:2, " Ω")
      caso 3
         escreva("Tensão (V): ")
         leia(u)
         escreva("Resistência (Ω): ")
         leia(r)
         i <- u / r
         escreval("Corrente: ", i:6:2, " A")
      outrocaso
         escreval("Opção inválida!")
   fimescolha
fimalgoritmo`,
            description: "Calcula tensão, corrente ou resistência",
            difficulty: "intermediário",
            hasInput: true,
         },
         {
            title: "MHS - Oscilador Harmônico",
            code: `algoritmo "MHS - Oscilador Harmônico"
{ x(t) = A * cos(ωt + φ)
  ω = 2πf }

const
   // Declaração de constantes: Nome = Valor
   PI = 3.14159
var
   a, f, phi, t, omega, x: real
inicio
   escreva("Amplitude (m): ")
   leia(a)
   escreva("Frequência (Hz): ")
   leia(f)
   escreva("Fase inicial (rad): ")
   leia(phi)
   escreva("Tempo (s): ")
   leia(t)
   
   omega <- 2 * pi * f
   x <- a * cos(omega * t + phi)
   
   escreval("Oscilador Harmônico Simples")
   escreval("ω = ", omega:6:2, " rad/s")
   escreval("x(t) = A·cos(ωt + φ)")
   escreval("x(", t:5:2, ") = ", x:6:3, " m")
fimalgoritmo`,
            description: "Calcula posição no MHS",
            difficulty: "avançado",
            hasInput: true,
         },
      ],
   },
];
