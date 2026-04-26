# IDEALG — IDE Online de Portugol

[![Site](https://img.shields.io/badge/Site-online-brightgreen)](https://hansufsm.github.io/IDEAlg)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)
[![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)](https://www.typescriptlang.org/)

## O que é o IDEAlg?

IDEAlg é uma IDE web moderna para aprender programação em **Portugol**. Roda integralmente no navegador — sem instalação necessária. Desenvolvida especialmente para iniciantes, oferece um ambiente intuitivo e responsivo para praticar lógica de programação.

## 🎥 Demo

<!-- TODO: gravar gif -->
<!-- <img src="assets/demo.gif" alt="IDEAlg Demo" width="100%" /> -->

## 🚀 Teste Agora

Acesse a IDE em produção: **[hansufsm.github.io/IDEAlg](https://hansufsm.github.io/IDEAlg)**

## 🛠️ Como Rodar Localmente

Pré-requisitos: **Node.js 18+** e **npm** (ou `yarn`/`pnpm`).

```bash
# Clonar o repositório
git clone https://github.com/hansufsm/IDEAlg.git
cd IDEAlg

# Instalar dependências
npm install

# Rodar em modo desenvolvimento
npm run dev

# Abrir no navegador
# http://localhost:3000
```

Para build de produção:

```bash
npm run build
npm start
```

## 📚 Exemplos

A pasta `/exemplos` contém 5 programas básicos para aprender Portugol:

| Arquivo | Descrição |
|---------|-----------|
| `01-ola-mundo.por` | Primeiro programa: imprime "Olá, Mundo!" |
| `02-variaveis.por` | Declaração e operações com variáveis |
| `03-se-senao.por` | Estruturas condicionais (`se` / `senao`) |
| `04-enquanto.por` | Loops com `enquanto` |
| `05-vetor.por` | Declaração e acesso a vetores |

Use o botão **📚 Exemplos** na IDE para carregá-los automaticamente.

## ✨ Funcionalidades

- **🎯 Editor Inteligente** — Monaco Editor com syntax highlighting e detecção de erros em tempo real
- **▶️ Execução Interativa** — Interprete Portugol compatível com VisuAlg 3.0
- **🐛 Depuração** — Breakpoints, stepping, inspetor de variáveis
- **💾 Projetos Locais** — Salve e carregue programas no navegador
- **🔗 Compartilhamento** — Gere links para compartilhar código com colegas
- **🌙 Tema Claro/Escuro** — Alterne entre modos de exibição
- **📱 Responsivo** — Funciona em desktop, tablet e mobile
- **📖 Documentação Integrada** — Referência de comandos Portugol

## 🛠️ Tecnologias

| Tecnologia | Finalidade |
|-----------|-----------|
| [Next.js 15](https://nextjs.org/) | Framework React + renderização |
| [Monaco Editor](https://microsoft.github.io/monaco-editor/) | Editor de código (VS Code engine) |
| [TypeScript](https://www.typescriptlang.org/) | Linguagem tipada |
| [Tailwind CSS](https://tailwindcss.com/) | Estilização utilitária |
| [Vitest](https://vitest.dev/) | Testes unitários |

## 📖 Documentação

Para aprender mais sobre o projeto:

- **[Guia Rápido](./docs/getting-started.md)** — Como começar a contribuir
- **[Referência Portugol](./docs/REFERENCIA.md)** — Tabela de comandos suportados
- **[Arquitetura](./docs/architecture.md)** — Detalhes técnicos da IDE
- **[Testes](./docs/testing.md)** — Como rodar e escrever testes

## 🤝 Contribuindo

Contribuições são bem-vindas! Se encontrou um bug ou tem uma ideia de feature:

1. **Fork** o repositório (`github.com/hansufsm/IDEAlg/fork`)
2. **Crie uma branch** para sua mudança:
   ```bash
   git checkout -b feat/minha-feature
   ```
3. **Commit** suas mudanças (use [Conventional Commits](https://www.conventionalcommits.org/)):
   ```bash
   git commit -m "feat: adiciona nova funcionalidade"
   git commit -m "fix: corrige bug no parser"
   ```
4. **Push** e abra um **Pull Request**
   ```bash
   git push origin feat/minha-feature
   ```

Veja [CONTRIBUTING.md](./CONTRIBUTING.md) para mais detalhes.

## 📄 Licença

Este projeto usa **duas licenças** para diferentes tipos de conteúdo:

### Código-fonte
O código-fonte está licenciado sob a **Licença MIT** — veja [LICENSE](./LICENSE) para detalhes. Você pode usar, modificar e distribuir livremente para fins comerciais e não-comerciais.

### Documentação e Exemplos
A documentação, exemplos e materiais educacionais estão licenciados sob **Creative Commons Attribution 4.0** (CC BY 4.0) — veja [LICENSE.CC](./LICENSE.CC) para detalhes. Você pode compartilhar e adaptar estes materiais desde que forneça atribuição apropriada.

---

**Desenvolvido com ❤️ por [Hans](https://github.com/hansufsm) para a [UFSM](https://www.ufsm.br/)**

*Ferramentas educacionais modernas para o ensino de computação no Brasil.*
