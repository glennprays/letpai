#!/bin/sh
# Rebuild the app and (re)start the fixture API + production server in the
# background, so `PW_CHANNEL=chrome npx playwright test` can reuse them
# (playwright.config.ts sets reuseExistingServer outside CI).
set -e
cd "$(dirname "$0")/.."
pkill -f "node tests/mock-api.ts" 2>/dev/null || true
pkill -f "node build" 2>/dev/null || true
corepack pnpm build > /tmp/letpai-build.log 2>&1 || { tail -40 /tmp/letpai-build.log; exit 1; }
nohup node tests/mock-api.ts > /tmp/letpai-mock.log 2>&1 &
LETPAI_STYLEGUIDE=1 PORT=4173 ORIGIN=http://localhost:4173 nohup node build > /tmp/letpai-app.log 2>&1 &
sleep 1.5
curl -sf -o /dev/null http://localhost:4173/ && echo "app ready on :4173, mock api on :3000"
