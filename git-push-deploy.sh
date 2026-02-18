#!/usr/bin/env bash
# git-push-deploy.sh
# Usage:
#  ./git-push-deploy.sh           # push then prompt to deploy global
#  ./git-push-deploy.sh --guild GUILD_ID   # push then prompt to deploy to guild
#  ./git-push-deploy.sh -y --guild GUILD_ID  # push then deploy without prompt

set -euo pipefail

# run git push with all args except those meant for deploy. We'll forward args starting from --deploy-*
# Simpler: pass all args to git push, then forward same args to deploy script.
# If you want different behavior, edit accordingly.

echo "Running: git push"
git push "$@" || { echo "git push failed"; exit 1; }

echo "git push succeeded."

# Now run deploy script
if command -v node >/dev/null 2>&1; then
  echo "Running deploy-commands.js..."
  node deploy-commands.js "$@"
else
  echo "node not found in PATH. Please run deploy-commands.js manually."
  exit 1
fi
