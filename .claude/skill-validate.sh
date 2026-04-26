#!/bin/bash

# IDEAlg Maintenance Skill - Validate Operation
# Valida o estado atual do repositório

set -e

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔍 IDEAlg Maintenance Skill - Validate"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

PASSED=0
FAILED=0
WARNINGS=0

check_status() {
  if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓${NC} $1"
    ((PASSED++))
  else
    echo -e "${RED}✗${NC} $1"
    ((FAILED++))
  fi
}

check_exists() {
  if [ -f "$1" ]; then
    echo -e "${GREEN}✓${NC} $1 exists"
    ((PASSED++))
  else
    echo -e "${RED}✗${NC} $1 missing"
    ((FAILED++))
  fi
}

check_warning() {
  if [ $? -eq 0 ]; then
    echo -e "${YELLOW}⚠${NC} $1"
    ((WARNINGS++))
  else
    echo -e "${GREEN}✓${NC} $1"
    ((PASSED++))
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

echo "📦 Checking example files..."
check_exists "exemplos/01-ola-mundo.por"
check_exists "exemplos/02-variaveis.por"
check_exists "exemplos/03-se-senao.por"
check_exists "exemplos/04-enquanto.por"
check_exists "exemplos/05-vetor.por"
echo ""

echo "🏗️  Checking build..."
npm run build > /dev/null 2>&1
check_status "npm run build"
echo ""

echo "📝 Checking TypeScript..."
npm run type-check > /dev/null 2>&1
check_status "npm run type-check"
echo ""

echo "🔗 Checking git status..."
GIT_STATUS=$(git status --porcelain)
if [ -z "$GIT_STATUS" ]; then
  echo -e "${GREEN}✓${NC} Working directory clean"
  ((PASSED++))
else
  echo -e "${YELLOW}⚠${NC} Uncommitted changes:"
  echo "$GIT_STATUS" | sed 's/^/  /'
  ((WARNINGS++))
fi
echo ""

echo "📋 Checking git branch..."
CURRENT_BRANCH=$(git branch --show-current)
if [ "$CURRENT_BRANCH" = "main" ]; then
  echo -e "${GREEN}✓${NC} On main branch"
  ((PASSED++))
else
  echo -e "${YELLOW}⚠${NC} On branch: $CURRENT_BRANCH"
  ((WARNINGS++))
fi
echo ""

echo "🌐 Checking dependencies..."
if npm ls > /dev/null 2>&1; then
  echo -e "${GREEN}✓${NC} Dependencies OK"
  ((PASSED++))
else
  echo -e "${YELLOW}⚠${NC} Dependencies have issues"
  ((WARNINGS++))
fi
echo ""

echo "📄 Checking next.config.js..."
if grep -q "basePath.*IDEAlg" next.config.js; then
  echo -e "${GREEN}✓${NC} basePath configured for GitHub Pages"
  ((PASSED++))
else
  echo -e "${RED}✗${NC} basePath not configured"
  ((FAILED++))
fi
echo ""

echo "🎨 Checking theme..."
if grep -q "darkMode.*class" tailwind.config.ts; then
  echo -e "${GREEN}✓${NC} Tailwind dark mode configured"
  ((PASSED++))
else
  echo -e "${YELLOW}⚠${NC} Tailwind dark mode may need review"
  ((WARNINGS++))
fi
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📊 Validation Summary"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${GREEN}Passed:${NC}  $PASSED"
if [ $WARNINGS -gt 0 ]; then
  echo -e "${YELLOW}Warnings:${NC} $WARNINGS"
fi
if [ $FAILED -gt 0 ]; then
  echo -e "${RED}Failed:${NC}  $FAILED"
fi
echo ""

if [ $FAILED -eq 0 ]; then
  echo -e "${GREEN}✓ Validation passed!${NC}"
  exit 0
else
  echo -e "${RED}✗ Validation failed!${NC}"
  exit 1
fi
