# IDEAlg — Contexto do Projeto

IDE web para Portugol (pseudocódigo em português, compatível com VisuAlg), voltada para ensino de lógica de programação no Brasil.

## Stack

- **Frontend**: Next.js 15 (App Router), React 19, TypeScript
- **Editor**: Monaco Editor com syntax highlighting Monarch customizado
- **Interpreter**: pacote local `packages/portugol-interpreter` (Lexer → Parser → AST → Interpreter → Debugger)
- **Testes**: Vitest (frontend), Jest (interpreter)
- **Estilo**: Tailwind CSS + variáveis CSS para theming dinâmico

## Estrutura

```
src/                        # App Next.js
  app/                      # Rotas (/, /ide, /ide/projects, /ide/shared/[slug])
  components/               # Componentes React da IDE
  contexts/                 # ThemeContext
  hooks/                    # usePortugolRunner, useLocalStorage, useEditorMarkers
packages/
  portugol-interpreter/     # Pacote standalone do interpretador
    src/lexer/              # Tokenização
    src/parser/             # Parser recursivo descendente + AST
    src/interpreter/        # Executor de AST + environment + builtins
    src/debugger/           # Breakpoints, step-by-step, inspeção de variáveis
```

## Estado atual

- Core do interpretador: ~95% completo (todos os tipos, estruturas de controle, funções, recursão, arrays, registros)
- UI da IDE: ~85% completo
- Debugger core: pronto; **UI do debugger: não implementada** (próximo passo natural)

## Estilo de desenvolvimento

Antes de implementar qualquer coisa, pergunte o que o usuário quer fazer e continue perguntando até não restar nenhuma dúvida. Nunca assuma nada. Aprofunde tudo que estiver vago, implícito, incompleto ou ambíguo — inclusive detalhes que o usuário nunca tenha pensado.
