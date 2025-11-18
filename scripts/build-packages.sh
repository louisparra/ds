#!/usr/bin/env bash
# What this file is:
# Iterates packages/* and runs `npm run build` if the package has a build script.
# Edit by: Maintainers. Update when packaging strategy changes.
# Approvals: Eng Lead.
#
# Usage:
#   bash scripts/build-packages.sh
#
# Expected output:
# - For each package with a build script: prints package name and runs its build command.
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
PACKAGES_DIR="$ROOT_DIR/packages"

if [ ! -d "$PACKAGES_DIR" ]; then
  echo "No packages/ directory found; nothing to build."
  exit 0
fi

for pkg in "$PACKAGES_DIR"/*; do
  if [ -d "$pkg" ]; then
    pkgJson="$pkg/package.json"
    if [ -f "$pkgJson" ]; then
      name=$(node -e "console.log(require('$pkgJson').name)"
      ) || name="$(basename $pkg)"
      echo "Processing package: $name ($pkg)"
      # Only run npm run build if present in package.json scripts
      hasBuild=$(node -e "const p=require('$pkgJson'); console.log(p.scripts && p.scripts.build ? 'yes':'no')")
      if [ "$hasBuild" = "yes" ]; then
        echo "Running build for $name"
        (cd "$pkg" && npm run build)
      else
        echo "No build script for $name — skipping"
      fi
    fi
  fi
done

echo "All packages processed."
