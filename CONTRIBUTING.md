# Contribuindo para IDEALG

Obrigado por seu interesse em melhorar a IDEALG! Para manter a qualidade do código "world-class", seguimos estas diretrizes.

## 🛠 Fluxo de Desenvolvimento

1.  **Monorepo:** Não misture lógica de UI (`src/`) com lógica de execução (`packages/portugol-interpreter`).
2.  **TypeScript:** Todos os novos componentes devem ser estritamente tipados. Evite o uso de `any`.
3.  **Estilização:** Utilize as variáveis CSS globais definidas em `:root` para garantir suporte a temas.
4.  **Integração de Diagnósticos:** Erros retornados pelo interpretador devem ser obrigatoriamente integrados visualmente ao editor (via Markers/Diagnostics) para garantir uma UX fluida.

## 📝 Padrões de Commit

Seguimos a especificação Conventional Commits:

-   `feat:` Uma nova funcionalidade.
-   `fix:` Correção de um erro.
-   `docs:` Mudanças apenas na documentação.
-   `refactor:` Alteração de código que não corrige erro nem adiciona funcionalidade.

## 🧪 Testes

Sempre que alterar o interpretador:
```bash
cd packages/portugol-interpreter
npm test
```

Certifique-se de que nenhum teste existente quebrou (Regressão).

## 📜 Licenças

O IDEAlg usa **duas licenças complementares**:

- **MIT License** — Código-fonte (`.ts`, `.tsx`, scripts)
- **Creative Commons BY 4.0** — Documentação, exemplos e materiais educacionais

Ao contribuir:

- ✅ Novo código segue **MIT**
- ✅ Novos exemplos/docs seguem **CC BY 4.0**
- ✅ Você consente que suas contribuições sejam licenciadas sob estas licenças

Para detalhes, veja [LICENSING.md](./LICENSING.md).