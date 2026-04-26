{
  Exemplo 02: Variáveis
  Descrição: Declaração e operações com variáveis
  Objetivo: Entender como usar variáveis e realizar operações básicas
}

algoritmo "Variáveis"

var
  nome: caractere
  idade: inteiro
  altura: real
  ativo: logico

inicio
  nome <- "João"
  idade <- 25
  altura <- 1.75
  ativo <- verdadeiro

  escreval("Nome: ", nome)
  escreval("Idade: ", idade)
  escreval("Altura: ", altura)
  escreval("Ativo: ", ativo)

  escreval("")
  escreval("Somando 10 à idade:")
  idade <- idade + 10
  escreval("Nova idade: ", idade)
fimalgoritmo
