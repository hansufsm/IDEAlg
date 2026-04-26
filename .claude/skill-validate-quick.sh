#!/bin/bash

# IDEAlg Maintenance Skill - Quick Validate
# Validação rápida sem compilação completa

set -e

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "⚡ IDEAlg - Quick Validation"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

PASSED=0
FAILED=0

check_exists() {
  if [ -f "$1" ]; then
    echo -e "${GREEN}✓${NC} $1"
    ((PASSED++))
  else
    echo -e "${RED}✗${NC} $1"
    ((FAILED++))
  fi
}

echo "📋 Checking required files..."
check_exists "LICENSE"
check_exists "LICENSE.CC"
check_exists "README.md"
check_exists "LICENSING.md"
check_exists "CONTRIBUTING.md"
check_exists "next.config.js"
check_exists ".github/workflows/deploy.yml"
check_exists "docs/REFERENCIA.md"
check_exists "public/favicon.svg"
echo ""

echo "📦 Checking examples..."
check_exists "exemplos/01-ola-mundo.por"
check_exists "exemplos/02-variaveis.por"
check_exists "exemplos/03-se-senao.por"
check_exists "exemplos/04-enquanto.por"
check_exists "exemplos/05-vetor.por"
echo ""

echo "🔗 Checking git..."
BRANCH=$(git branch --show-current)
COMMITS=$(git log --oneline -5 | wc -l)
echo -e "${GREEN}✓${NC} Branch: $BRANCH"
echo -e "${GREEN}✓${NC} Recent commits: $COMMITS"
echo ""

echo "📄 Checking configuration..."
if [ -f "next.config.js" ] && grep -q "basePath" next.config.js; then
  echo -e "${GREEN}✓${NC} Next.js basePath configured"
  ((PASSED++))
fi

if [ -f "tailwind.config.ts" ] && grep -q "darkMode.*class" tailwind.config.ts; then
  echo -e "${GREEN}✓${NC} Tailwind dark mode configured"
  ((PASSED++))
fi

if [ -f "package.json" ] && grep -q "keywords" package.json; then
  echo -e "${GREEN}✓${NC} package.json keywords configured"
  ((PASSED++))
fi
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📊 Summary"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${GREEN}Files OK:${NC} $PASSED"
if [ $FAILED -gt 0 ]; then
  echo -e "${RED}Missing:${NC}  $FAILED"
fi
echo ""

if [ $FAILED -eq 0 ]; then
  echo -e "${GREEN}✓ Project is healthy!${NC}"
  exit 0
else
  echo -e "${RED}✗ Some files are missing${NC}"
  exit 1
fi
