# 🌐 Adicionar Skills ao Seu Perfil Claude Cloud

Como adicionar suas skills personalizadas ao seu perfil do Claude (claude.ai) para usar em qualquer projeto.

---

## 📋 O que Você Tem

Criei **2 níveis de skills** para você:

### **1. Skills Globais** (Usáveis em QUALQUER projeto)
- 🔍 Validate Project — Valida qualquer projeto
- 📊 Git Status — Mostra status git
- 🔐 Security Audit — Verifica vulnerabilidades
- ✓ Type Check — Valida TypeScript

**Arquivo:** `~/.claude/skills/project-validator.sh`  
**Arquivo:** `~/.claude/skill-template.json`

### **2. Skills Específicas** (IDEAlg apenas)
- 🔍 IDEAlg Validate — Valida IDEAlg
- ⚙️ IDEAlg Config — Config do IDEAlg
- 📖 IDEAlg Docs — Documentação

**Arquivo:** `./.claude/skill-validate-quick.sh`  
**Arquivo:** `./.claude/skill-config.json`

---

## 🚀 Como Adicionar ao Seu Perfil Cloud

### **Opção 1: Via Settings do Claude Code Web** (Recomendado)

1. Vá para [claude.ai/code](https://claude.ai/code)
2. Clique **⚙️ Settings** (canto superior)
3. Procure por **"Custom Skills"** ou **"Shortcuts"**
4. Adicione as skills:

```json
{
  "shortcuts": [
    {
      "key": "ctrl+shift+v",
      "name": "Validate Project",
      "command": "bash ~/.claude/skills/project-validator.sh"
    },
    {
      "key": "ctrl+shift+g",
      "name": "Git Status",
      "command": "git status && git log --oneline -5"
    }
  ]
}
```

5. **Salve** (Ctrl+S)

---

### **Opção 2: Via Arquivo de Perfil Global**

Se Claude Code Web suporta, coloque em `~/.claude/global-settings.json`:

```json
{
  "profile": "hans-hansufsm",
  "email": "hans@ufsm.br",
  "custom_skills": [
    {
      "id": "validate",
      "name": "Validate Project",
      "command": "bash ~/.claude/skills/project-validator.sh",
      "shortcut": "ctrl+shift+v"
    },
    {
      "id": "git-status",
      "name": "Git Status",
      "command": "git status && git log --oneline -5",
      "shortcut": "ctrl+shift+g"
    },
    {
      "id": "npm-audit",
      "name": "Security Audit",
      "command": "npm audit",
      "shortcut": "ctrl+shift+a"
    }
  ]
}
```

---

### **Opção 3: Via Claude Code CLI (Se usar desktop)**

```bash
# Instalar skills globalmente
claude skill add validate "bash ~/.claude/skills/project-validator.sh" --global

claude skill add git-status "git status && git log --oneline -5" --global

claude skill add npm-audit "npm audit" --global

# Ver skills instaladas
claude skill list --global

# Usar uma skill
claude skill run validate
```

---

## 📁 Estrutura de Arquivos

```
~/.claude/
├── skills/                        ← Skills globais
│   ├── project-validator.sh       ← Validador universal
│   └── ... (adicione mais skills)
│
├── skill-template.json            ← Template de skills
├── global-settings.json           ← Configuração global (opcional)
└── ... (outros arquivos)

Seus Projetos/
├── IDEAlg/
│   └── .claude/
│       ├── skill-validate-quick.sh    ← Skills específicas
│       └── settings.json              ← Config do projeto
│
└── Outro-Projeto/
    └── .claude/
        └── settings.json              ← Herda skills globais + add locais
```

---

## 💡 Exemplo: Usando as Skills

### **Depois que Configurar:**

```bash
# Em qualquer projeto, validar:
Ctrl+Shift+V
# ou
claude skill run validate

# Ver status git:
Ctrl+Shift+G
# ou
claude skill run git-status

# Auditar segurança:
Ctrl+Shift+A
# ou
claude skill run npm-audit
```

---

## 🎯 Próximos Passos

### **Passo 1: Preparar**
```bash
# Criar diretório se não existir
mkdir -p ~/.claude/skills

# Copiar scripts
cp .claude/skill-validate-quick.sh ~/.claude/skills/
cp ~/.claude/skills/project-validator.sh ~/.claude/skills/
```

### **Passo 2: Configurar**
Escolha uma opção acima (Web, Arquivo ou CLI)

### **Passo 3: Testar**
```bash
# Se usando CLI:
claude skill run validate

# Se usando Web:
# Pressione seu atalho (Ctrl+Shift+V)
```

### **Passo 4: Customizar**
Adicione mais skills conforme precisar

---

## 📚 Suas Skills Disponíveis

### **Globais (Qualquer Projeto)**
| ID | Atalho | Comando |
|----|--------|---------|
| validate | Ctrl+Shift+V | `bash ~/.claude/skills/project-validator.sh` |
| git-status | Ctrl+Shift+G | `git status && git log --oneline -5` |
| npm-audit | Ctrl+Shift+A | `npm audit` |
| type-check | Ctrl+Shift+T | `tsc --noEmit` |

### **IDEAlg (Específicas)**
| ID | Atalho | Comando |
|----|--------|---------|
| idealg-validate | Ctrl+Shift+Alt+V | `./.claude/skill-validate-quick.sh` |
| idealg-config | Ctrl+Shift+Alt+C | `cat ./.claude/skill-config.json \| jq .` |

---

## 🔐 Dicas de Segurança

✅ **Faça:**
- Armazene scripts em `~/.claude/skills/`
- Use `bash` ou `sh` explicitamente
- Valide comandos antes de adicionar

❌ **Não Faça:**
- Não adicione credentials em skills
- Não rodar scripts de fontes não-confiáveis
- Não compartilhe `settings.json` com senhas

---

## ❓ FAQ

**P: As skills funcionam offline?**  
R: Sim, se usar Claude Code CLI (desktop). Web requer internet.

**P: Posso adicionar skills de outras pessoas?**  
R: Sim! Copie o comando e adapte conforme necessário.

**P: Como deletar uma skill?**  
R: No Settings, remova da array `custom_skills` e salve.

**P: As skills sincronizam entre dispositivos?**  
R: Se usar Cloud (Web), sim. Se local, não.

**P: Posso agendar skills para rodar automaticamente?**  
R: Sim, se seu ambiente suporta cron/scheduler + CLI.

---

## 🔗 Arquivos Relacionados

- **Skill Template:** `~/.claude/skill-template.json`
- **Project Validator:** `~/.claude/skills/project-validator.sh`
- **IDEAlg Specifics:** `IDEAlg/.claude/skill-validate-quick.sh`
- **Documentação:** `IDEAlg/.claude/skill-idealg-maintenance.md`

---

## ✅ Checklist Final

- [ ] Criei `~/.claude/skills/` directory
- [ ] Copiei `project-validator.sh` para `~/.claude/skills/`
- [ ] Configurei skills em Settings (Web ou arquivo)
- [ ] Testei um atalho (Ctrl+Shift+V)
- [ ] ✅ Skills funcionando!

---

**Status:** ✅ Pronto para usar  
**Versão:** 1.0  
**Autor:** Hans (hansufsm)  
**Email:** hans@ufsm.br

Suas skills estão prontas para usar em qualquer projeto! 🚀
