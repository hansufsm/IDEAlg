{
  Exemplo 05: Vetor
  Descrição: Declaração e acesso a vetores (arrays)
  Objetivo: Aprender a trabalhar com arrays e percorrê-los
}

algoritmo "Vetor"

var
  numeros: vetor [1..5] de inteiro
  i: inteiro
  soma: inteiro

inicio
  escreval("Lendo 5 números:")
  soma <- 0

  para i de 1 ate 5 faca
    escreval("Digite o número ", i, ":")
    leia(numeros[i])
    soma <- soma + numeros[i]
  fimpara

  escreval("")
  escreval("Números digitados:")
  para i de 1 ate 5 faca
    escreval("Posição ", i, ": ", numeros[i])
  fimpara

  escreval("")
  escreval("Soma dos números: ", soma)
  escreval("Média: ", soma / 5)
fimalgoritmo
