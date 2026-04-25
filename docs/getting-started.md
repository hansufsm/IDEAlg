# Guia de Início Rápido

Bem-vindo ao desenvolvimento do IDEALG! Siga este guia para configurar seu ambiente.

## Pré-requisitos

- Node.js (v18 ou superior)
- npm ou yarn

## Instalação

1. Clone o repositório.
2. Instale as dependências na raiz:
   ```bash
   npm install
   ```

## Desenvolvimento

Para rodar o projeto em modo de desenvolvimento:

```bash
npm run dev
```
Acesse `http://localhost:3000/ide`.

## Estrutura de Comandos

- `npm run build`: Gera o pacote de produção.
- `npm run lint`: Verifica erros de linting.
- `npm run type-check`: Valida tipos do TypeScript.
- `npm test`: Executa os testes unitários da interface.

## Trabalhando no Interpretador

Se você precisar modificar o motor de execução:

1. Vá para a pasta do pacote:
   ```bash
   cd packages/portugol-interpreter
   ```
2. Rode os testes para garantir que nada quebrou:
   ```bash
   npm test
   ```
3. O projeto principal usa este pacote via referência local.
