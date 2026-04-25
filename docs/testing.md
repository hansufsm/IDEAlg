# Infraestrutura de Testes - IDEALG

Esta documentação descreve como configurar e executar testes unitários e de integração no projeto IDEALG.

## 🧪 Vitest (Testes Unitários e de Componentes)

Para a interface Next.js, configuramos o **Vitest**, que é um executor de testes extremamente rápido e compatível com Vite/Next.js.

### Instalação

Como o ambiente atual possui restrições de rede, você deve executar o seguinte comando localmente para instalar as dependências necessárias:

```bash
npm install -D vitest @vitejs/plugin-react jsdom @testing-library/react @testing-library/jest-dom @testing-library/user-event
```

### Arquivos de Configuração Criados

1.  `vitest.config.ts`: Configuração principal do Vitest, incluindo suporte a JSX, ambiente `jsdom` e aliases (`@/`).
2.  `src/test/setup.ts`: Configura extensões do `jest-dom` e mocks globais (ex: `matchMedia`).
3.  `src/contexts/ThemeContext.test.tsx`: Exemplo de teste unitário funcional para o contexto de tema.

### Como Executar

```bash
# Executar todos os testes uma única vez
npm test

# Executar testes em modo watch (desenvolvimento)
npm run test:watch
```

## 🏗️ Testes do Interpretador (Jest)

O núcleo do interpretador Portugol já possui testes próprios.

```bash
cd packages/portugol-interpreter
npm test
```

## 🚀 Confirmação de Build

O projeto está configurado para validar tipos e linting em cada build, o que é verificado automaticamente pelo Vercel antes de qualquer deploy.

```bash
# Validar tipos
npm run type-check

# Validar linting
npm run lint
```

## 💡 Próximos Passos Sugeridos

1.  **Playwright**: Instalar para testes de ponta-a-ponta (E2E), permitindo testar o fluxo de "Escrever código -> Executar -> Ver saída" automaticamente.
2.  **Cobertura de Código**: Adicionar `@vitest/coverage-v8` para monitorar quais partes da aplicação ainda não possuem testes.
