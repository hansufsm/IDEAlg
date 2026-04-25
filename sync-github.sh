#!/bin/bash

# Australis IDE - GitHub Sync Automation Script
# Este script automatiza o ciclo de vida de desenvolvimento: Testes, Build e Deploy.

set -e # Aborta o script em caso de erro

GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}✦ Iniciando sincronização Australis IDE...${NC}"

# 1. Verificação de dependências
echo -e "${BLUE}1/5 Verificando dependências...${NC}"
npm install > /dev/null 2>&1

# 2. Execução de testes no core (portugol-interpreter)
echo -e "${BLUE}2/5 Executando testes do interpretador...${NC}"
if cd packages/portugol-interpreter && npm test; then
    echo -e "${GREEN}✓ Testes do interpretador passaram!${NC}"
    cd ../..
else
    echo -e "${RED}✗ Falha nos testes. Sincronização abortada.${NC}"
    exit 1
fi

# 3. Verificação de build do Next.js
echo -e "${BLUE}3/5 Validando build da aplicação...${NC}"
if npm run build; then
    echo -e "${GREEN}✓ Build concluído com sucesso!${NC}"
else
    echo -e "${RED}✗ Falha no build da aplicação.${NC}"
    exit 1
fi

# 4. Preparação do Commit
echo -e "${BLUE}4/5 Preparando alterações...${NC}"
git add .

# Verifica se há algo para commitar
if git diff --cached --quiet; then
    echo -e "${GREEN}! Nada para atualizar no momento.${NC}"
    exit 0
fi

echo -e "${GREEN}O que foi alterado? Escolha o tipo (Conventional Commits):${NC}"
echo "1) feat (nova funcionalidade)"
echo "2) fix (correção de erro)"
echo "3) docs (documentação)"
echo "4) refactor (melhoria de código)"
read -p "Opção (1-4): " OPT

case $OPT in
    1) TYPE="feat" ;;
    2) TYPE="fix" ;;
    3) TYPE="docs" ;;
    4) TYPE="refactor" ;;
    *) TYPE="chore" ;;
esac

read -p "Descrição do commit: " MSG
FULL_MSG="$TYPE: $MSG"

# 5. Push para o GitHub
echo -e "${BLUE}5/5 Enviando para o GitHub...${NC}"
git commit -m "$FULL_MSG"

CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)
if git push origin "$CURRENT_BRANCH"; then
    echo -e "${GREEN}✦ Australis IDE atualizada com sucesso no GitHub!${NC}"
else
    echo -e "${RED}✗ Falha no push. Verifique sua conexão ou autenticação.${NC}"
    exit 1
fi

echo -e "${GREEN}Sincronização concluída.${NC}"