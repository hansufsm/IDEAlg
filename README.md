# IDEALG - IDE Portugol

Um interpretador visual e interativo para **Portugol** (pseudocódigo em português), compatível com **VisuAlg**. Escreva, execute e depure seus programas diretamente no navegador.

## 🚀 Recursos

- **Editor Avançado** — Syntax highlighting, autocomplete e realce de linha
- **Execução em Tempo Real** — Veja o resultado imediatamente com entrada interativa
- **Debugger** — Breakpoints e step-by-step debugging com inspeção de variáveis
- **Gerenciamento de Projetos** — Salve seus programas localmente
- **Compartilhamento** — Compartilhe seus programas com um simples link
- **Responsivo** — Use em desktop, tablet ou celular

## 🛠️ Instalação

```bash
npm install
# ou
yarn install
```

## 📝 Desenvolvimento

```bash
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000) no seu navegador.

## 🏗️ Build

```bash
npm run build
npm start
```

## 📦 Estrutura

```
idealg/
├── src/
│   ├── app/
│   │   ├── ide/             # Rotas do IDE
│   │   ├── page.tsx         # Landing page
│   │   ├── layout.tsx       # Root layout
│   │   └── globals.css      # Estilos globais
│   ├── components/          # Componentes React (editor, terminal, etc.)
│   └── lib/                 # Hooks e utilitários
├── package.json
├── tailwind.config.ts
└── tsconfig.json
```

## 🔌 Dependências Principais

- **Next.js 15** — Framework React
- **React 19** — UI library
- **Monaco Editor** — Editor de código com syntax highlighting
- **CodeMirror 6** — Editor leve para mobile
- **Tailwind CSS** — Utility-first CSS
- **portugol-interpreter** — Engine do interpretador Portugol

## 🐛 Contribuindo

Bugs e sugestões são bem-vindos! Abra uma issue no [GitHub](https://github.com/hansufsm/idealg).

## 📄 Licença

MIT

## 🙏 Agradecimentos

Desenvolvido para a educação em português. Compatível com **VisuAlg**.
