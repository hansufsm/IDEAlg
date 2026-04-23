// ============================================================
// Testes dos exemplos de constantes para validação antes de
// adicionar ao catálogo da IDE
// ============================================================

import { execute } from "./index";

async function run(code: string, inputList: string[] = []): Promise<string> {
  let idx = 0;
  const lines: string[] = [];
  const result = await execute(code, {
    write: (t: string) => lines.push(t),
    read: () => inputList[idx++] ?? "",
  });
  if (result.error) throw new Error(result.error);
  return lines.join("");
}

describe("Exemplos de Constantes", () => {
  test("Ex1 – Constantes numéricas (inteiro e real)", async () => {
    const out = await run(`algoritmo "Constantes Numéricas"
const
   VELOCIDADE_LUZ = 299792458
   PI             = 3.14159265
   EULER          = 2.71828182
var
   raio, area, circunferencia: real
inicio
   raio <- 5
   area <- PI * raio * raio
   circunferencia <- 2 * PI * raio
   escreval("=== Constantes Numéricas ===")
   escreval("Velocidade da luz: ", VELOCIDADE_LUZ, " m/s")
   escreval("Numero de Euler e: ", EULER:8:5)
   escreval("Area do circulo (r=5): ", area:7:4, " m2")
   escreval("Circunferencia:    ", circunferencia:7:4, " m")
fimalgoritmo`);
    expect(out).toContain("299792458");
    expect(out).toContain("2.71828");
    expect(out).toContain("78.5398");
  });

  test("Ex2 – Constante lógica e de texto", async () => {
    const out = await run(`algoritmo "Constantes Logicas e Texto"
const
   SISTEMA_ATIVO  = verdadeiro
   VERSAO         = "1.0.0"
   NOME_SISTEMA   = "Australis LMS"
var
   status: caractere
inicio
   escreval("Sistema: ", NOME_SISTEMA)
   escreval("Versao:  ", VERSAO)
   se SISTEMA_ATIVO entao
      status <- "ONLINE"
   senao
      status <- "OFFLINE"
   fimse
   escreval("Status:  ", status)
fimalgoritmo`);
    expect(out).toContain("Australis LMS");
    expect(out).toContain("1.0.0");
    expect(out).toContain("ONLINE");
  });

  test("Ex3 – Constante aritmética (expressão composta)", async () => {
    const out = await run(`algoritmo "Constantes Aritmeticas"
const
   PI      = 3.14159265
   DOIS_PI = 2 * 3.14159265
   G       = 9.80665
   MEIA_G  = 9.80665 / 2
var
   t, h, v: real
inicio
   t <- 3
   h <- MEIA_G * t * t
   v <- G * t
   escreval("Queda Livre com constantes")
   escreval("g = ", G:7:5, " m/s2")
   escreval("t = ", t:4:1, " s")
   escreval("h = ", h:7:3, " m")
   escreval("v = ", v:7:3, " m/s")
   escreval("2pi = ", DOIS_PI:8:5)
fimalgoritmo`);
    expect(out).toContain("9.80665");
    expect(out).toContain("44.130");
    expect(out).toContain("6.2831"); // 2*PI arredondado
  });

  test("Ex4 – Constantes em conversão de unidades", async () => {
    const out = await run(`algoritmo "Conversao de Unidades"
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
fimalgoritmo`);
    expect(out).toContain("160.934");
    expect(out).toContain("68.03"); // 150 * 0.453592
    expect(out).toContain("182.880");
  });

  test("Ex5 – Constantes físicas com cálculo de energia", async () => {
    const out = await run(`algoritmo "Energia de Repouso"
const
   C  = 299792458
   C2 = 299792458 * 299792458
var
   massa, energia: real
inicio
   massa <- 0.001
   energia <- massa * C2
   escreval("E = m x c2")
   escreval("Massa: ", massa:6:4, " kg")
   escreval("c = ", C, " m/s")
   escreval("E = ", energia, " J")
fimalgoritmo`);
    expect(out).toContain("E = m x c2");
    expect(out).toContain("299792458");
  });

  test("Ex6 – Constantes de temperatura (conversão)", async () => {
    const out = await run(`algoritmo "Conversao de Temperatura"
const
   ZERO_ABSOLUTO_C = -273.15
   FATOR_FC        = 9 / 5
   OFFSET_FC       = 32
var
   celsius, fahrenheit, kelvin: real
inicio
   escreva("Temperatura em Celsius: ")
   leia(celsius)
   fahrenheit <- celsius * FATOR_FC + OFFSET_FC
   kelvin     <- celsius - ZERO_ABSOLUTO_C
   escreval("=== Conversao de Temperatura ===")
   escreval("Celsius:    ", celsius:7:2, " C")
   escreval("Fahrenheit: ", fahrenheit:7:2, " F")
   escreval("Kelvin:     ", kelvin:7:2, " K")
fimalgoritmo`, ["100"]);
    expect(out).toContain("212.00");
    expect(out).toContain("373.15");
  });

  test("Ex7 – Constantes com var e const intercalados", async () => {
    const out = await run(`algoritmo "Geometria com Constantes"
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
   escreval("Area do circulo:   ", area_circ:7:4)
   escreval("Volume da esfera:  ", vol_esfera:7:4)
   escreval("Area do quadrado:  ", area_quad:7:1)
fimalgoritmo`);
    expect(out).toContain("28.2743");
    expect(out).toContain("113.0973");
    expect(out).toContain("16.0");
  });

  test("Ex8 – Constante negativa e expressão com parênteses", async () => {
    const out = await run(`algoritmo "Constante Negativa"
const
   TEMP_MIN = -273.15
   FATOR    = (3 + 7) * 2
var
   t: real
inicio
   t <- 25
   escreval("Zero absoluto: ", TEMP_MIN:8:2, " C")
   escreval("Fator: ", FATOR)
   escreval("Temperatura: ", t:5:1, " C")
fimalgoritmo`);
    expect(out).toContain("-273.15");
    expect(out).toContain("20");
  });
});
