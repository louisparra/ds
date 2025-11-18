#!/usr/bin/env bash
# What this file is:
# Convenience helper to bootstrap the monorepo: installs root deps, and runs package builds where configured.
# Edit by: Maintainers. Update when bootstrap steps change.
# When to update (example):
# When new package-level build requirements or package managers change.
# Approvals: Eng Lead.
#
# Usage:
#   bash scripts/bootstrap-monorepo.sh
#
# Expected output:
# - Runs `npm ci` at root, then runs `bash scripts/build-packages.sh`.
set -euo pipefail

echo "Bootstrapping monorepo..."
if [ -f package.json ]; then
  echo "Installing root dependencies (npm ci)..."
  npm ci
else
  echo "No package.json at root — skipping npm ci."
fi

echo "Building packages..."
bash scripts/build-packages.sh

echo "Bootstrap complete."
