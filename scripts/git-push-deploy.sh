#!/bin/bash

# ===============================
# Git Push & Optional Deploy Script (Auto-detect ESM)
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
    # Auto-detect deploy-commands.js in scripts/ folder
    DEPLOY_FILE=$(find "$(pwd)/scripts" -maxdepth 1 -name "deploy-commands.js" | head -n 1)

    if [ -n "$DEPLOY_FILE" ]; then
        echo -e "${GREEN}Running deploy script: $DEPLOY_FILE${NC}"
        node "$DEPLOY_FILE" || {
            echo -e "${RED}Error: Deploy script failed.${NC}"
        }
        echo -e "${GREEN}Deploy finished.${NC}"
    else
        echo -e "${RED}No deploy-commands.js found in scripts/. Skipping deploy.${NC}"
    fi
else
    echo -e "${YELLOW}Skipping deploy.${NC}"
fi

echo -e "${GREEN}Script finished.${NC}"
