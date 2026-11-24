#!/bin/sh
# Runtime config (VITE_API_URL) is read from the container environment by
# the app itself: /env.js for the browser (src/hooks.server.ts) and
# process.env on the server (src/lib/services/api.ts). Nothing to generate.
exec "$@"
