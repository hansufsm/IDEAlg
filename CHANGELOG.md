# Changelog

Todas as mudanças notáveis neste projeto são documentadas aqui.

O formato segue [Keep a Changelog](https://keepachangelog.com/pt-BR/1.1.0/),
e o projeto adota [Semantic Versioning](https://semver.org/lang/pt-BR/).

---

## [Não lançado]

### Adicionado
- Diagrama Mermaid do fluxo de execução (Lexer → Parser → AST → Interpreter) em `docs/architecture.md`
- JSDoc formal nas interfaces e funções públicas de `portugol-interpreter` (`IOInterface`, `ExecutionResult`, `StepInfo`, `parse()`, `execute()`)
- JSDoc na classe `Interpreter` e na classe `PortugolDebugger` (com exemplos de uso)
- JSDoc nos tipos `DebuggerState` e `DebuggerEvent`
- JSDoc no hook `usePortugolRunner` e seus tipos (`RunMode`, `DebugState`, `Project`, `InputPrompt`)
- JSDoc nas interfaces de props de `PortugolEditor` e `IDEConsole`

---

## [1.0.0] — 2026-04-26

### Adicionado
- Interpretador Portugol completo: Lexer, Parser (descida recursiva), AST, Interpreter tree-walker
- Suporte a todos os tipos primitivos: `inteiro`, `real`, `caractere`, `logico`
- Estruturas de controle: `se/senao/fimse`, `para/fimpara`, `enquanto/fimenquanto`, `repita/ateque`, `escolha/caso`
- Funções e procedimentos com recursão
- Arrays (vetores e matrizes) e registros (`tipo ... registro`)
- Constantes (`const`) com expressões aritméticas
- Funções nativas (stdlib): matemática (`abs`, `sen`, `cos`, `raizq`, `log`, ...), strings (`compr`, `copia`, `maiusc`, ...), aleatório (`aleatorio`)
- Debugger passo a passo com breakpoints, `stepInto`, `stepOver`, `continue` e inspeção de variáveis
- Editor Monaco com syntax highlighting Monarch customizado para Portugol
- Autocompletar de palavras-chave e funções nativas no editor
- Console de saída com suporte a `escreva` / `escreval`
- Entrada interativa assíncrona via `leia` (suspende execução, aguarda input do usuário)
- Gerenciamento de projetos com persistência em `localStorage`
- Auto-save periódico (30 segundos) do projeto corrente
- Compartilhamento de código via URL (codificação base64)
- Sistema de temas (dark/light) com variáveis CSS e persistência
- Página de projetos (`/ide/projects`)
- Rota de código compartilhado (`/ide/shared/[slug]`)
- Exemplos de programas categorizados (básico, controle, vetores, funções, constantes, física)
- Documentação: `README.md`, `CONTRIBUTING.md`, `docs/architecture.md`, `docs/REFERENCIA.md`, `docs/getting-started.md`, `docs/testing.md`
- Licença dual: MIT (código) + CC BY 4.0 (conteúdo educacional)
- Templates de issues no GitHub (bug report, feature request)

### Tecnologias
- Next.js 15 (App Router) + React 19 + TypeScript
- Monaco Editor (`@monaco-editor/react`)
- Tailwind CSS
- Vitest (frontend) + Jest (interpretador)

---

[Não lançado]: https://github.com/hansufsm/idealg/compare/v1.0.0...HEAD
[1.0.0]: https://github.com/hansufsm/idealg/releases/tag/v1.0.0
