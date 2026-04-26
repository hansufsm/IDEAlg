# IDEAlg Skill — Setup no Claude Code Web

Como configurar e usar a skill no **claude.ai/code** (versão web).

---

## 🚀 Quick Start (30 segundos)

### **Opção Mais Fácil: Via Settings**

1. Abra [claude.ai/code](https://claude.ai/code)
2. Abra este projeto (IDEAlg)
3. Clique no **⚙️ Settings** (canto superior)
4. Na seção `Custom Skills`, adicione:

```json
{
  "id": "idealg:validate",
  "name": "IDEAlg Validate",
  "command": "./.claude/skill-validate-quick.sh",
  "shortcut": "ctrl+shift+v"
}
```

5. **Salve** (Ctrl+S ou botão Save)
6. Agora pressione `Ctrl+Shift+V` para validar!

---

## 📚 Entendendo as Skills

### **O que é uma Skill?**
Uma skill é um comando que você pode executar rapidamente no Claude Code Web. Basicamente:
- Nome legível
- Descrição
- Comando a executar (bash script, CLI, etc)
- Atalho opcional (keyboard shortcut)

### **Skills Disponíveis em IDEAlg**

| Skill | Atalho | O que faz |
|-------|--------|----------|
| **IDEAlg Validate** | Ctrl+Shift+V | Validação rápida (arquivos, exemplos) |
| **IDEAlg Config** | Ctrl+Shift+C | Mostra configuração (stack, build commands) |
| **IDEAlg Docs** | — | Abre documentação completa da skill |

---

## 🔧 Como Configurar (3 Formas)

### **Forma 1: Manual no Settings** ⭐
1. Clique ⚙️ Settings
2. Vá para "Custom Skills"
3. Cole a configuração JSON
4. Salve

**Vantagem:** Customizável, salva em seu workspace

**Arquivo de referência:** `.claude/settings.json`

---

### **Forma 2: Importar Configuração Pronta**

Já criei um `settings.json` pronto com 4 skills:

```bash
cat .claude/settings.json
```

**Para usar:**
1. Copie o conteúdo de `.claude/settings.json`
2. Abra Settings no Code Web
3. Cole na seção "Custom Skills"
4. Salve

---

### **Forma 3: Usar Via Terminal Built-in**

No Claude Code Web, abra o terminal (fundo da tela) e execute:

```bash
.claude/skill-validate-quick.sh
```

**Vantagem:** Sem setup, funciona imediatamente

---

## 💡 Exemplos de Uso

### **Validar Projeto**
```
👤: Execute a validação da skill
🤖: Rodando .claude/skill-validate-quick.sh...
✓ LICENSE
✓ LICENSE.CC
✓ README.md
✓ 5 exemplos
```

### **Ver Configuração**
```
👤: Mostra a config da skill
🤖: cat ./.claude/skill-config.json | jq .
{
  "skill_id": "idealg-maintenance",
  "framework": "Next.js 15",
  ...
}
```

### **Atalho de Teclado**
```
1. Pressione Ctrl+Shift+V
2. Skill executa automaticamente
3. Resultado aparece no console
```

---

## 📋 Structure de Skills

**Diretório `.claude/`:**
```
.claude/
├── settings.json                  ← Sua configuração (edite isso!)
├── skill-idealg-maintenance.md    ← Documentação de 8 operações
├── skill-config.json              ← Config central (não edite)
├── skill-validate-quick.sh        ← Validação rápida ⚡
├── skill-validate.sh              ← Validação completa ⏱️
├── test-skill.sh                  ← Teste funcional
└── README.md                       ← Como usar skills
```

---

## 🎯 Próximos Passos

### **Passo 1: Setup (Agora)**
```bash
# Copie a config:
cat .claude/settings.json
# Cole em Settings → Custom Skills
```

### **Passo 2: Teste (Próximo)**
```bash
# Pressione Ctrl+Shift+V
# Ou execute:
./.claude/skill-validate-quick.sh
```

### **Passo 3: Use em Future Sessions**
- Toda vez que abrir o projeto, as skills estarão disponíveis
- Use Ctrl+Shift+V para validar rapidamente
- Use Ctrl+Shift+C para ver configuração

---

## ❓ FAQ

**P: Onde salvam as settings?**  
R: No seu workspace do Claude Code Web (cloud, não local)

**P: Posso customizar os comandos?**  
R: Sim! Edite `command` em settings.json

**P: Funciona offline?**  
R: Não, Claude Code Web requer internet. Para offline, use Claude Code CLI (desktop)

**P: Como adicionar novas skills?**  
R: Crie novo script em `.claude/` e registre em `settings.json` na array `custom_skills`

**P: Qual é a diferença entre validate quick e full?**  
R: Quick = apenas arquivos/config ⚡, Full = inclui build completo ⏱️

**P: Posso usar emojis em skill names?**  
R: Sim! Ex: "🔍 IDEAlg Validate"

---

## 🔗 Links Úteis

- [Claude Code Web](https://claude.ai/code)
- [Documentação Skill](./skill-idealg-maintenance.md)
- [Configuração](./skill-config.json)
- [Guia Memory](../memory/user-idealg-skill-guide.md)

---

## 💾 Checklist de Setup

- [ ] Abri claude.ai/code
- [ ] Abri Settings (⚙️)
- [ ] Copiei `./.claude/settings.json`
- [ ] Colei em Custom Skills
- [ ] Cliquei Save/Salvar
- [ ] Testei Ctrl+Shift+V
- [ ] ✅ Skill funcionando!

---

**Status:** ✅ Skill criada e pronta  
**Versão:** 1.0  
**Última atualização:** 2026-04-25

Para dúvidas, consulte:
- `skill-idealg-maintenance.md` (documentação técnica)
- `.claude/README.md` (guia de uso)
