{
  Exemplo 04: Enquanto
  Descrição: Loop enquanto (while)
  Objetivo: Entender como repetir um bloco de código enquanto uma condição é verdadeira
}

algoritmo "Enquanto"

var
  contador: inteiro
  numero: inteiro
  soma: inteiro

inicio
  escreval("Contagem de 1 a 10:")
  contador <- 1
  enquanto contador <= 10 faca
    escreval(contador)
    contador <- contador + 1
  fimenquanto

  escreval("")
  escreval("Somando números até digitar 0:")
  soma <- 0
  numero <- 1

  enquanto numero <> 0 faca
    escreval("Digite um número (0 para parar):")
    leia(numero)
    soma <- soma + numero
  fimenquanto

  escreval("Soma total: ", soma)
fimalgoritmo
