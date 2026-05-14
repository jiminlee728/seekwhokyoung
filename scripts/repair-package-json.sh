#!/usr/bin/env bash
set -euo pipefail

cat > package.json <<'JSON'
{
  "name": "seekwhokyoung",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "scripts": {
    "build": "tsc -p tsconfig.json",
    "test": "npm run build && node --test \"dist/**/*.test.js\"",
    "start": "node scripts/server.mjs",
    "serve": "node scripts/server.mjs"
  },
  "devDependencies": {}
}
JSON

node -e "JSON.parse(require('fs').readFileSync('package.json','utf8')); console.log('package.json ok')"
echo "복구 완료: npm start 를 다시 실행하세요."
