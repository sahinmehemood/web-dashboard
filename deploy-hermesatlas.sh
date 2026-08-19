#!/bin/bash
# Deploy Hermes Atlas website to GitHub Pages
# Usage: ./deploy-hermesatlas.sh
set -e

SRC_DIR="/data/data/com.termux/files/home/hermesatlas"
DEPLOY_DIR="/data/data/com.termux/files/home/web-dashboard"
SUBPATH="hermesatlas"

echo "=== Building Hermes Atlas ==="
cd "$SRC_DIR"
node node_modules/typescript/bin/tsc -b
node node_modules/vite/bin/vite.js build

echo "=== Deploying to gh-pages ==="
cd "$DEPLOY_DIR"
git checkout gh-pages
rm -rf "$SUBPATH"
mkdir -p "$SUBPATH"
cp -r "$SRC_DIR/dist/." "$SUBPATH/"
cp "$SUBPATH/index.html" "$SUBPATH/404.html"
printf '' > .nojekyll
git add -A
git commit -q -m "Rebuild Hermes Atlas ($(date -u +%Y-%m-%dT%H:%M:%SZ))"
git push origin gh-pages
git checkout main

echo "=== Done ==="
echo "Live at: https://sahinmehemood.github.io/web-dashboard/hermesatlas/"
