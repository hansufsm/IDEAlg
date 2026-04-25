# Australis IDE ✦ 🚀

Uma IDE web moderna e intuitiva para programação em **Portugol**, desenvolvida com **Next.js 14** e **TypeScript**. Este projeto visa democratizar o aprendizado de lógica de programação através de uma interface de alta performance e ferramentas robustas de execução.

## 🚀 Funcionalidades

 - **📁 Gestão de Projetos:** Persistência local e sincronização de algoritmos.
 - **🔗 Compartilhamento:** Geração de slugs únicos para visualização pública.
 - **⚡ Interpretador Integrado:** Engine própria compatível com VisuAlg 3.0.
 - **🚨 Realce de Erros:** Feedback visual instantâneo de erros de sintaxe e execução diretamente no editor de código (Monaco/CodeMirror).
 - **🎨 UI/UX Moderna:** Suporte a temas dinâmicos e painéis retráteis.
 - **🛠️ DX de Elite:** Totalmente tipado com TypeScript e estruturado em Monorepo.

## 🛠️ Tecnologias

- **Frontend:** [Next.js](https://nextjs.org/) (App Router)
- **Linguagem:** [TypeScript](https://www.typescriptlang.org/)
- **Estilização:** Variáveis CSS dinâmicas para temas.
- **Core:** `portugol-interpreter` (Interpretador próprio da linguagem).

##  Estrutura do Projeto
Este projeto utiliza uma estrutura de **Monorepo** e uma organização **híbrida baseada em funcionalidades (Features)**:

```text
├── packages/
│   └── portugol-interpreter/  # Motor de execução (Lexer, Parser, Interpreter)
├── src/
│   ├── app/                   # Rotas e Páginas (Next.js App Router)
│   ├── components/            # Componentes de UI globais/genéricos
│   ├── contexts/              # Contextos globais (Tema, Notificações)
│   ├── hooks/                 # Hooks utilitários globais
│   ├── features/              # Lógica organizada por domínio
│   │   ├── ide/               # Hook de realce, editor, interpretador context
│   │   └── projects/          # Gerenciamento de arquivos e projetos
│   └── types/                 # Definições de tipos globais
└── public/                    # Ativos estáticos
```
## 🏁 Como Começar

1. **Instalar dependências:**
   ```bash
   npm install
   ```

2. **Executar em modo de desenvolvimento:**
   ```bash
   npm run dev
   ```

3. **Acessar:**
   Abra http://localhost:3000/ide no seu navegador.

## 🤝 Contribuição

1. Faça um **Fork** do projeto.
2. Crie uma **Branch** para sua feature (`git checkout -b feature/nova-funcionalidade`).
3. Faça o **Commit** (`git commit -m 'feat: adiciona nova funcionalidade'`).
4. **Push** para a Branch (`git push origin feature/nova-funcionalidade`).

---
*Nota: Este projeto está em desenvolvimento ativo. Algumas funcionalidades de backend estão sendo migradas.*