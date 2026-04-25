# @australis/portugol-interpreter

O motor de execução de Portugol para a IDEALG. Este pacote é responsável por transformar código fonte em texto em uma Árvore de Sintaxe Abstrata (AST) e executá-la de forma segura no ambiente JavaScript. Ele é o core da linguagem.

## 📦 Instalação

```bash
npm install @australis/portugol-interpreter
```

## 🚀 Uso Rápido

```typescript
import { Interpreter } from '@australis/portugol-interpreter';

const code = `
algoritmo "Exemplo"
inicio
   escreval("Olá Mundo!")
fimalgoritmo
`;

const interpreter = new Interpreter();

// Captura a saída do console da linguagem
interpreter.onOutput((message) => {
  console.log("Saída do Portugol:", message);
});

await interpreter.run(code);
```

## 🛠️ Arquitetura

O interpretador opera em três etapas principais:

1.  **Lexer (Análise Léxica):** Converte a string bruta em tokens (palavras-chave, identificadores, operadores).
2.  **Parser (Análise Sintática):** Consome os tokens e constrói a AST, validando a estrutura gramatical.
3.  **Interpreter (Execução):** Percorre a AST (tree-walking) e manipula o ambiente de variáveis e pilha de chamadas.

## 📚 Funcionalidades Suportadas

| Categoria | Comandos Suportados |
| :--- | :--- |
| **Tipos** | `inteiro`, `real`, `caractere`, `logico`, `vetor` |
| **Controle** | `se..entao..senao`, `para..ate..faca`, `escolha..caso` |
| **Loops** | `enquanto..faca`, `repita..ate` |
| **Built-ins** | `escreva`, `leia`, `raizq`, `abs`, `sen`, `cos`, `tan` |
 
## 🧪 Testes

Para garantir a integridade do motor de execução:

```bash
npm test
```

---
*Baseado nas especificações do VisuAlg 3.0.*