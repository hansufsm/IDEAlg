# Referência de Comandos Portugol

Esta página documenta os comandos e estruturas suportadas pela IDE IDEAlg.

## Entrada e Saída

### `escreva`
Imprime na tela **sem quebra de linha**.

```portugol
escreva("Olá")
escreva(" Mundo") { Continua na mesma linha }
```

### `escreval`
Imprime na tela **com quebra de linha** (end-of-line).

```portugol
escreval("Olá, Mundo!")
escreval("Próxima linha")
```

### `leia`
Lê entrada do usuário e armazena em uma variável.

```portugol
var
  nome: caractere
  idade: inteiro
inicio
  escreval("Qual é o seu nome?")
  leia(nome)
  escreval("Qual é a sua idade?")
  leia(idade)
fimalgoritmo
```

---

## Estruturas Condicionais

### `se / senao / fimse`
Executa código condicionalmente.

```portugol
var
  numero: inteiro
inicio
  leia(numero)
  
  se numero > 0 entao
    escreval("Número positivo")
  senao
    escreval("Número não-positivo")
  fimse
fimalgoritmo
```

Aninhamento:

```portugol
se numero > 0 entao
  escreval("Positivo")
senao
  se numero < 0 entao
    escreval("Negativo")
  senao
    escreval("Zero")
  fimse
fimse
```

### `escolha / caso / fimescolha`
Seleção por valor (switch).

```portugol
var
  dia: inteiro
inicio
  leia(dia)
  
  escolha dia
    caso 1
      escreval("Segunda")
    caso 2
      escreval("Terça")
    caso 3
      escreval("Quarta")
    outrocaso
      escreval("Outro dia")
  fimescolha
fimalgoritmo
```

---

## Estruturas de Repetição

### `para / ate / faz / fimpara`
Loop com contador (for).

```portugol
var
  i: inteiro
inicio
  para i de 1 ate 10 faca
    escreval(i)
  fimpara
fimalgoritmo
```

Decrescente:

```portugol
para i de 10 ate 1 passo -1 faca
  escreval(i)
fimpara
```

### `enquanto / faca / fimenquanto`
Loop com condição pré-testada (while).

```portugol
var
  numero: inteiro
inicio
  numero <- 1
  enquanto numero <= 10 faca
    escreval(numero)
    numero <- numero + 1
  fimenquanto
fimalgoritmo
```

### `repita / ate`
Loop com condição pós-testada (do-while).

```portugol
var
  numero: inteiro
inicio
  repita
    escreval("Digite um número (0 para parar):")
    leia(numero)
  ate numero = 0
fimalgoritmo
```

---

## Declaração de Variáveis

### Tipos Básicos

```portugol
var
  nome: caractere              { String }
  idade: inteiro               { Número inteiro }
  altura: real                 { Número decimal }
  ativo: logico                { Booleano (verdadeiro / falso) }
```

### Vetores (Arrays)

```portugol
var
  numeros: vetor [1..5] de inteiro
  matriz: vetor [1..3, 1..3] de real
inicio
  numeros[1] <- 10
  numeros[2] <- 20
  escreval(numeros[1])
fimalgoritmo
```

---

## Constantes

Defina valores que não mudam durante o programa.

```portugol
const
  PI = 3.14159
  LIMITE = 100
  MENSAGEM = "Olá"

var
  raio: real
  area: real
inicio
  raio <- 5
  area <- PI * raio * raio
  escreval("Área: ", area)
fimalgoritmo
```

---

## Funções

### Função com Retorno

```portugol
funcao soma(a, b: inteiro): inteiro
inicio
  retorne a + b
fimfuncao

var
  resultado: inteiro
inicio
  resultado <- soma(5, 3)
  escreval("Resultado: ", resultado)
fimalgoritmo
```

### Procedimento (sem Retorno)

```portugol
procedimento saudacao(nome: caractere)
inicio
  escreval("Olá, ", nome, "!")
fimprocedimento

inicio
  saudacao("Maria")
  saudacao("João")
fimalgoritmo
```

---

## Operadores Aritméticos

| Operador | Descrição | Exemplo |
|----------|-----------|---------|
| `+` | Adição | `5 + 3` = 8 |
| `-` | Subtração | `5 - 3` = 2 |
| `*` | Multiplicação | `5 * 3` = 15 |
| `/` | Divisão | `15 / 3` = 5 |
| `%` | Módulo (resto) | `17 % 5` = 2 |
| `**` ou `^` | Potência | `2 ** 3` = 8 |

---

## Operadores Lógicos

| Operador | Descrição | Exemplo |
|----------|-----------|---------|
| `e` | AND (e) | `(x > 0) e (x < 10)` |
| `ou` | OR (ou) | `(x = 0) ou (x = 1)` |
| `nao` | NOT (não) | `nao ativo` |

---

## Operadores de Comparação

| Operador | Descrição | Exemplo |
|----------|-----------|---------|
| `=` | Igualdade | `x = 5` |
| `<>` | Desigualdade | `x <> 0` |
| `>` | Maior que | `x > 10` |
| `<` | Menor que | `x < 10` |
| `>=` | Maior ou igual | `x >= 10` |
| `<=` | Menor ou igual | `x <= 10` |

---

## Estrutura de um Programa

Toda programa Portugol segue este padrão:

```portugol
algoritmo "Nome do Programa"

const
  { constantes aqui }

var
  { variáveis aqui }

procedimento nome_proc()
  { corpo do procedimento }
fimprocedimento

funcao nome_func(): tipo
  { corpo da função }
fimfuncao

inicio
  { corpo principal }
fimalgoritmo
```

---

## Comentários

Comentários não são executados e servem para documentar o código.

```portugol
{ Comentário em bloco }

{ Este é
  um comentário
  multi-linha }
```

---

## Exemplos Completos

### Cálculo de Fatorial

```portugol
algoritmo "Fatorial"

var
  numero, resultado, i: inteiro

inicio
  escreval("Digite um número:")
  leia(numero)

  resultado <- 1
  para i de 1 ate numero faca
    resultado <- resultado * i
  fimpara

  escreval("Fatorial de ", numero, " é: ", resultado)
fimalgoritmo
```

### Média de Notas

```portugol
algoritmo "Média"

var
  nota1, nota2, nota3, media: real

inicio
  escreval("Digite a primeira nota:")
  leia(nota1)
  escreval("Digite a segunda nota:")
  leia(nota2)
  escreval("Digite a terceira nota:")
  leia(nota3)

  media <- (nota1 + nota2 + nota3) / 3

  se media >= 7 entao
    escreval("Aprovado!")
  senao
    escreval("Reprovado!")
  fimse

  escreval("Média: ", media)
fimalgoritmo
```

---

## Recursos Não Suportados

- Registros (records) — Use vetores como alternativa
- Arquivos (file I/O) — Digite na tela ou via console
- Ponteiros — Não suportados
- Classes e OOP — Use funções e procedimentos

---

## Dicas de Debug

Use `escreval` estrategicamente para acompanhar a execução:

```portugol
escreval("DEBUG: valor de x = ", x)
escreval("DEBUG: dentro do loop")
```

Ou use a funcionalidade de **Debug** da IDE:
1. Clique no número de linha para adicionar um breakpoint
2. Pressione **Debug**
3. Use **Step Into** para avançar linha por linha
4. Inspecione variáveis no painel "Variáveis"

---

Para mais informações, consulte a documentação de [Início Rápido](./getting-started.md) ou abra os exemplos na IDE.
