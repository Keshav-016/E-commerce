#!/usr/bin/env sh
set -e

# Ensure node modules exist (in case user mounted an empty volume)
if [ ! -d node_modules ]; then
  echo "node_modules not found, running npm ci..."
  npm ci
fi

# Generate prisma client
echo "Running prisma generate..."
npx prisma generate || true

# Apply db schema in dev (optional; comment out if you don't want auto push)
if [ ! -z "$PRISMA_AUTO_PUSH" ]; then
  echo "Running prisma db push..."
  npx prisma db push
fi

# Start dev server (nodemon/tsx configured in package.json)
echo "Starting dev server..."
npm run dev
