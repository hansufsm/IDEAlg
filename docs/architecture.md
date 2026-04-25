# Arquitetura do IDEALG

Este documento descreve a estrutura técnica e o funcionamento interno do IDEALG.

## Visão Geral

O IDEALG é uma IDE web para Portugol, construída sobre o ecossistema Next.js. O sistema é dividido em dois grandes domínios: o **Motor de Execução** (Interpreter) e a **Interface do Usuário** (IDE).

## Componentes Principais

### 1. Portugol Interpreter (`/packages/portugol-interpreter`)
O "coração" do projeto. É um interpretador escrito em TypeScript que realiza:
- **Lexing/Parsing**: Transforma o código Portugol em uma AST (Abstract Syntax Tree).
- **Interpretador**: Executa a AST linha a linha.
- **Debugger**: Provê ganchos para pausa, inspeção de variáveis e breakpoints.

### 2. Editor de Código (`/src/components/PortugolEditor.tsx`)
Utiliza o **Monaco Editor** (o mesmo do VS Code) com:
- **Monarch Tokens**: Definição de sintaxe para Portugol.
- **Decorations**: Realce de linha de debug e breakpoints.
- **Autocomplete**: Sugestões baseadas em palavras-chave e snippets de Portugol.

### 3. Sistema de Execução (`/src/lib/usePortugolRunner.ts`)
Um hook customizado que gerencia o ciclo de vida da execução:
- Interfaceia com o interpretador.
- Gerencia o estado do console (saída).
- Lida com entradas do usuário (`leia`).
- Controla o estado do debugger.

## Fluxo de Execução

1. O usuário digita o código no `PortugolEditor`.
2. Ao clicar em "Executar", o `usePortugolRunner` envia o código para o `portugol-interpreter`.
3. O interpretador executa o código assincronamente.
4. As saídas são enviadas de volta para o componente `IDEConsole` através de callbacks de IO.

## Gerenciamento de Estado

- **Tema**: Centralizado no `ThemeContext`, persiste preferências no `localStorage` e aplica classes CSS no `documentElement`.
- **Projetos**: Gerenciados localmente no `localStorage` (via `usePortugolRunner`), permitindo salvar e carregar múltiplos arquivos.

## Estilização

O projeto utiliza um sistema de **Variáveis CSS** puras (definidas em `globals.css`) para garantir que a UI se adapte dinamicamente ao tema escolhido, evitando o overhead de múltiplas bibliotecas de estilo e garantindo performance premium.
