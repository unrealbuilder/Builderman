#!/bin/bash

# ===============================
# Git Push & Optional Deploy Script (ESM-friendly)
# ===============================

# Colors for output
RED="\033[0;31m"
GREEN="\033[0;32m"
YELLOW="\033[1;33m"
NC="\033[0m" # No Color

echo -e "${YELLOW}Starting Git Push & Deploy Script...${NC}"

# Detect current branch
BRANCH=$(git branch --show-current)
if [ -z "$BRANCH" ]; then
    echo -e "${RED}Error: Not on any git branch.${NC}"
    exit 1
fi
echo -e "${GREEN}Current branch: $BRANCH${NC}"

# Check for uncommitted changes
if ! git diff-index --quiet HEAD --; then
    echo -e "${YELLOW}You have uncommitted changes.${NC}"
else
    echo -e "${GREEN}No uncommitted changes detected.${NC}"
fi

# Prompt for commit message
read -p "Enter commit message: " COMMIT_MSG
if [ -z "$COMMIT_MSG" ]; then
    echo -e "${RED}No commit message entered. Exiting.${NC}"
    exit 1
fi

# Stage all changes
git add .

# Commit
git commit -m "$COMMIT_MSG"

# Confirm before pushing
read -p "Push to branch '$BRANCH'? (y/n) " CONFIRM
if [[ "$CONFIRM" =~ ^[Yy]$ ]]; then
    git push origin "$BRANCH"
    echo -e "${GREEN}Changes pushed to $BRANCH successfully!${NC}"
else
    echo -e "${RED}Push canceled.${NC}"
    exit 0
fi

# Optional: Run deploy script
read -p "Run deploy script after push? (y/n) " DEPLOY_CONFIRM
if [[ "$DEPLOY_CONFIRM" =~ ^[Yy]$ ]]; then
    DEPLOY_PATH="./deploy-commands.js"
    if [ -f "$DEPLOY_PATH" ]; then
        echo -e "${GREEN}Running deploy-commands.js...${NC}"
        # Run the deploy script with Node as ESM
        node --loader esm "$DEPLOY_PATH" || {
            echo -e "${RED}Error running deploy-commands.js.${NC}"
        }
        echo -e "${GREEN}Deploy finished.${NC}"
    else
        echo -e "${RED}deploy-commands.js not found. Skipping deploy.${NC}"
    fi
else
    echo -e "${YELLOW}Skipping deploy.${NC}"
fi

echo -e "${GREEN}Script finished.${NC}"
