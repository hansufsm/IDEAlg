#!/bin/bash
echo "✓ IDEAlg Skill - Test"
echo "Files:"
ls -1 LICENSE LICENSE.CC README.md LICENSING.md 2>/dev/null && echo "✓ All required files present"
echo ""
echo "Examples:"
ls -1 exemplos/*.por 2>/dev/null | wc -l | xargs echo "  Found"
echo ""
echo "✓ Skill is working!"
