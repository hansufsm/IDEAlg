# Claude Skills — IDEAlg

Documentação de skills e automações para manutenção do repositório IDEAlg.

## 📚 Skills Disponíveis

### 1. **Validate Skill** ✅
Valida o estado completo do projeto.

**Arquivo:** `skill-validate.sh`  
**Uso:**
```bash
.claude/skill-validate.sh
```

**O que verifica:**
- ✓ Arquivos obrigatórios presentes (LICENSE, README, etc)
- ✓ 5 exemplos .por presentes
- ✓ Build compila sem erros
- ✓ TypeScript type-checking passa
- ✓ Git status (branch, commits)
- ✓ Dependências resolvidas
- ✓ Configuração Next.js (basePath, deploy)
- ✓ Tema Tailwind configurado

**Exemplo de Output:**
```
✓ LICENSE exists
✓ LICENSE.CC exists
✓ README.md exists
✓ npm run build
✓ npm run type-check
✓ Working directory clean
✓ On main branch
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Passed:  18
Failed:  0
✓ Validation passed!
```

---

## 🔧 Configuração

### skill-config.json
Arquivo central de configuração que define:
- Comandos disponíveis (build, test, lint, etc)
- Categorias de exemplos
- Stack técnico (Next.js 15, React 19, TypeScript 5.6)
- Diretórios do projeto
- Licenças (MIT + CC-BY-4.0)
- Metadados SEO
- Configuração de deploy (GitHub Pages)
- Features do projeto

**Localização:** `.claude/skill-config.json`

---

## 📖 Documentação de Skill

Arquivo completo que descreve todas as operações disponíveis.

**Localização:** `.claude/skill-idealg-maintenance.md`

**Operações descritas:**
1. Validate Project
2. Create Example
3. Update Docs
4. Generate Report
5. Lint & Format
6. Test Examples
7. Sync Dependencies
8. Deploy Checklist

---

## 🚀 Como Usar as Skills

### Validação rápida
```bash
.claude/skill-validate.sh
```

### Validação desde a IDE (se integrado)
```
/idealg-validate
```

### Verificar configuração
```bash
cat .claude/skill-config.json | jq '.stack'
```

### Ver todos os comandos disponíveis
```bash
cat .claude/skill-config.json | jq '.commands'
```

---

## 🔄 Integração com Git Hooks

Para integrar a skill com git, crie `.git/hooks/pre-push`:

```bash
#!/bin/bash
echo "🔍 Running IDEAlg validation..."
.claude/skill-validate.sh || exit 1
echo "✓ Ready to push!"
```

Torne-o executável:
```bash
chmod +x .git/hooks/pre-push
```

---

## 📊 Próximos Passos

- [ ] Implementar `create-example` script
- [ ] Implementar `generate-report` script
- [ ] Implementar `deploy-checklist` script
- [ ] Integração com GitHub Actions
- [ ] Dashboard de métricas
- [ ] Suporte multi-idioma

---

## 🎯 Estrutura Esperada

```
.claude/
├── README.md                      (este arquivo)
├── skill-idealg-maintenance.md    (documentação completa)
├── skill-config.json              (configuração)
├── skill-validate.sh              (validação executável)
├── skills/                        (scripts de implementação)
│   ├── create-example.sh
│   ├── generate-report.sh
│   ├── lint.sh
│   ├── deploy-checklist.sh
│   └── ...
└── hooks/                         (git hooks)
    ├── pre-commit.sh
    └── pre-push.sh
```

---

## 📝 Exemplo: Adicionar Novo Script

Para adicionar um novo script de skill:

1. Crie o arquivo em `.claude/skills/seu-script.sh`
2. Torne-o executável: `chmod +x .claude/skills/seu-script.sh`
3. Documente em `.claude/skill-idealg-maintenance.md`
4. Registre o comando em `.claude/skill-config.json`

**Template:**
```bash
#!/bin/bash
# IDEAlg Maintenance Skill - Seu Script
# Descrição do que faz

set -e

echo "📋 Seu Script"
# implementação aqui
```

---

## 🐛 Troubleshooting

**P: Script permission denied**  
R: Execute `chmod +x .claude/skill-validate.sh`

**P: Validation falha com "npm: command not found"**  
R: Certifique-se que Node.js está instalado: `node --version`

**P: Build falha após mudanças**  
R: Execute `npm install && npm run build` para diagnosticar

---

## 📜 Licença

Skills estão sob a mesma licença do projeto (MIT para código).

---

**Mantido por:** hansufsm  
**Última atualização:** 2026-04-25  
**Status:** Active ✅
