# Biblioteca Padrão Portugol (StdLib)

Este documento descreve as funções built-in suportadas pelo interpretador da Australis IDE, seguindo a compatibilidade com o VisuAlg 3.0.

## 🧮 Matemática

| Função | Assinatura | Retorno | Descrição | Exemplo |
| :--- | :--- | :--- | :--- | :--- |
| `abs` | `abs(x: real)` | `real` | Valor absoluto de x. | `abs(-5) -> 5` |
| `raizq` | `raizq(x: real)` | `real` | Raiz quadrada de x. | `raizq(9) -> 3` |
| `potencia` | `potencia(b, e: real)` | `real` | b elevado a e. | `potencia(2, 10) -> 1024` |
| `sen` | `sen(x: real)` | `real` | Seno de x (radianos). | `sen(0) -> 0` |
| `cos` | `cos(x: real)` | `real` | Cosseno de x (radianos). | `cos(0) -> 1` |
| `int` | `int(x: real)` | `inteiro` | Trunca o valor para inteiro. | `int(3.9) -> 3` |
| `pi` | `pi()` | `real` | Retorna o valor de π. | `3.14159...` |

## 🔤 Texto (Strings)

| Função | Assinatura | Retorno | Descrição | Exemplo |
| :--- | :--- | :--- | :--- | :--- |
| `compr` | `compr(s: caractere)` | `inteiro` | Comprimento da string. | `compr("abc") -> 3` |
| `copia` | `copia(s, i, n)` | `caractere` | Retorna n caracteres de s desde i. | `copia("test", 1, 2) -> "te"` |
| `maiusc` | `maiusc(s: caractere)` | `caractere` | Converte para maiúsculas. | `maiusc("a") -> "A"` |
| `pos` | `pos(sub, s)` | `inteiro` | Posição de sub em s (0 se não achar). | `pos("b", "abc") -> 2` |

## 🎲 Aleatoriedade e Conversão

| Função | Assinatura | Retorno | Descrição |
| :--- | :--- | :--- | :--- |
| `aleatorio` | `aleatorio(a, b: int)` | `inteiro` | Inteiro aleatório entre a e b. |
| `caracpnum` | `caracpnum(s: caractere)`| `real` | Converte string para número. |
| `numpcarac` | `numpcarac(n: real)` | `caractere` | Converte número para string. |

---
*Nota: O interpretador utiliza precisão dupla para cálculos reais.*