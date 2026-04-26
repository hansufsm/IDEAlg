{
  Exemplo 03: Se e Senão
  Descrição: Estruturas condicionais
  Objetivo: Aprender a usar if/else para tomar decisões
}

algoritmo "Se Senão"

var
  numero: inteiro

inicio
  escreval("Digite um número:")
  leia(numero)

  se numero > 0 entao
    escreval("O número é positivo!")
  senao
    se numero < 0 entao
      escreval("O número é negativo!")
    senao
      escreval("O número é zero!")
    fimse
  fimse

  escreval("")
  escreval("Verificando se é par ou ímpar:")

  se numero % 2 = 0 entao
    escreval("O número é PAR")
  senao
    escreval("O número é ÍMPAR")
  fimse
fimalgoritmo
