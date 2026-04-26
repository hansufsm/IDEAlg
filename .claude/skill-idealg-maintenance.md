# Claude Skill: IDEAlg Maintenance

**ID:** `idealg-maintenance`  
**Version:** 1.0  
**Type:** Project Maintenance  
**Status:** Active  

## Descrição

Skill automática para gerenciar, validar e manter o repositório IDEAlg — cobrindo build, testes, documentação, exemplos e qualidade de código.

---

## Operações Disponíveis

### 1. **Validate Project** 📋
Valida o estado atual do projeto e gera um relatório de saúde.

```bash
npx claude skill idealg-maintenance validate
```

**O que verifica:**
- ✅ Build status (`npm run build`)
- ✅ TypeScript errors (`npm run type-check`)
- ✅ Git status (commits pendentes, branch atual)
- ✅ Dependências desatualizadas
- ✅ Arquivos de licença presentes
- ✅ README atualizado
- ✅ Documentação links válidos

**Retorna:** Relatório de saúde em JSON ou markdown

---

### 2. **Create Example** 📝
Gera novo arquivo de exemplo Portugol com estrutura padrão.

```bash
npx claude skill idealg-maintenance create-example --name "seu-exemplo" --category "controle"
```

**Parâmetros:**
- `--name` (obrigatório): Nome do arquivo (ex: "bubble-sort")
- `--category` (opcional): Categoria (básico, controle, vetores, funções, constantes, física)
- `--difficulty` (opcional): Nível (iniciante, intermediário, avançado)

**Gera:**
- `/exemplos/NN-seu-exemplo.por` com header comentado
- Atualiza `docs/REFERENCIA.md` se necessário
- Commit automático (opcional)

**Exemplo:**
```bash
npx claude skill idealg-maintenance create-example --name "ordenacao-vetor" --category "vetores" --difficulty intermediário
```

---

### 3. **Update Docs** 📖
Atualiza documentação automaticamente.

```bash
npx claude skill idealg-maintenance update-docs --type "referencia|guides|api"
```

**Tipos:**
- `referencia` — Regenera tabelas de comandos em `docs/REFERENCIA.md` baseado no interpretador
- `guides` — Verifica links e atualiza índices
- `api` — Documenta exports públicos do interpretador

---

### 4. **Generate Report** 📊
Gera relatório de métricas e estado do projeto.

```bash
npx claude skill idealg-maintenance generate-report --format "html|json|markdown"
```

**Métricas incluídas:**
- Linhas de código por arquivo
- Cobertura de testes
- Exemplos funcionais
- Build time
- Bundle size
- Commits por tipo (feat, fix, docs, etc)
- Open issues no GitHub

---

### 5. **Lint & Format** 🎨
Valida qualidade de código em novos arquivos.

```bash
npx claude skill idealg-maintenance lint --path "src/" --fix
```

**Verifica:**
- ✅ TypeScript strict mode
- ✅ Unused imports
- ✅ Consistent naming (camelCase, SCREAMING_SNAKE_CASE)
- ✅ Comments em português
- ✅ No `any` types
- ✅ Tailwind class usage

**Flag `--fix`:** Auto-corrige problemas quando possível

---

### 6. **Test Examples** ✅
Executa todos os exemplos `.por` para verificar se compilam e rodam.

```bash
npx claude skill idealg-maintenance test-examples --verbose
```

**O que testa:**
- Syntax válido
- Sem runtime errors
- Output esperado (opcional, com arquivo `.expected`)

**Gera:** Relatório de quais exemplos passam/falham

---

### 7. **Sync Dependencies** 🔄
Atualiza dependências e verifica compatibilidade.

```bash
npx claude skill idealg-maintenance sync-deps --check --update
```

**Flags:**
- `--check` — Apenas lista desatualizado
- `--update` — Atualiza tudo (cria branch separada)
- `--security` — Apenas vulnerabilidades

---

### 8. **Deploy Checklist** 🚀
Valida que tudo está pronto para deploy em GitHub Pages.

```bash
npx claude skill idealg-maintenance deploy-checklist
```

**Verifica:**
- ✅ Build completa sem erros
- ✅ Nenhuma branch não-mergeada
- ✅ Licenças presentes (MIT, CC-BY)
- ✅ Metadata SEO completa
- ✅ GitHub workflow existe
- ✅ CHANGELOG atualizado (opcional)
- ✅ Version bump (se necessário)

**Retorna:** Checklist interativa com status

---

## Configuration

Crie um arquivo `.claude/skill-config.json`:

```json
{
  "skill_id": "idealg-maintenance",
  "project_name": "IDEAlg",
  "repository": "https://github.com/hansufsm/IDEAlg",
  "language": "pt-BR",
  "commands": {
    "build": "npm run build",
    "test": "npm test",
    "lint": "next lint",
    "type_check": "tsc --noEmit"
  },
  "example_categories": [
    "básico",
    "controle",
    "vetores",
    "funções",
    "constantes",
    "física"
  ],
  "github_pages_enabled": true,
  "dual_licensing": {
    "code": "MIT",
    "content": "CC-BY-4.0"
  }
}
```

---

## Exemplos de Uso

### Validação diária
```bash
npx claude skill idealg-maintenance validate
npx claude skill idealg-maintenance test-examples
```

### Criar novo exemplo
```bash
npx claude skill idealg-maintenance create-example \
  --name "quicksort" \
  --category "vetores" \
  --difficulty avançado
```

### Preparar para deploy
```bash
npx claude skill idealg-maintenance deploy-checklist
npx claude skill idealg-maintenance generate-report --format html
git push origin main
```

### Update de documentação
```bash
npx claude skill idealg-maintenance update-docs --type referencia
npx claude skill idealg-maintenance lint --path src/ --fix
git commit -am "docs: regenerate reference"
```

---

## Estrutura Interna

```
.claude/
├── skill-idealg-maintenance.md    (este arquivo)
├── skill-config.json              (configuração)
├── skills/
│   ├── validate.ts                (validação)
│   ├── create-example.ts          (gerar exemplos)
│   ├── update-docs.ts             (documentação)
│   ├── generate-report.ts         (relatórios)
│   ├── lint.ts                    (linting)
│   ├── test-examples.ts           (testes)
│   ├── sync-deps.ts               (dependências)
│   └── deploy-checklist.ts        (checklist)
└── hooks/
    ├── pre-commit.sh              (validar antes de commit)
    └── pre-push.sh                (validar antes de push)
```

---

## Integração com Git Hooks

Adicione a `.git/hooks/pre-commit`:

```bash
#!/bin/bash
npx claude skill idealg-maintenance lint --path src/ --fix
npx claude skill idealg-maintenance validate --quick
```

---

## Roadmap

- [ ] v1.1 — Integração com GitHub Actions (auto-run validate on PR)
- [ ] v1.2 — Dashboard Web de métricas
- [ ] v1.3 — AI-powered sugestões de exemplos
- [ ] v2.0 — Multi-language support (Englsh, Spanish, French)
- [ ] v2.1 — VS Code extension

---

## Troubleshooting

**Q: Build falha?**  
A: Execute `npx claude skill idealg-maintenance validate --verbose` para diagnosticar

**Q: Como adicionar novo comando à skill?**  
A: Crie arquivo em `.claude/skills/seu-comando.ts` e registre em `skill-config.json`

**Q: Posso usar em CI/CD?**  
A: Sim! Todas as operações retornam exit code 0 (sucesso) ou 1 (erro) para uso em scripts

---

## Licença

Esta skill está licenciada sob a mesma licença do projeto (MIT para código, CC-BY-4.0 para documentação).

---

## Suporte

Para bugs ou sugestões, abra uma [issue](https://github.com/hansufsm/IDEAlg/issues) com a tag `[skill]`.

**Autor:** Claude Code v15  
**Mantido por:** hansufsm  
**Última atualização:** 2026-04-25
