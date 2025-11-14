#!/usr/bin/env sh
set -e

# Ensure node modules exist (in case user mounted an empty volume)
if [ ! -d node_modules ]; then
  echo "node_modules not found, running npm ci..."
  npm ci
fi


# Start dev server (nodemon/tsx configured in package.json)
echo "Starting dev server..."
npm run dev
