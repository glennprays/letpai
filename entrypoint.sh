#!/bin/sh
# Generate runtime-env.js from container environment variables.
# This allows configuring VITE_API_URL at container startup
# without rebuilding the Docker image.

cat > /app/build/client/runtime-env.js <<EOF
window.__env__ = {
  VITE_API_URL: "${VITE_API_URL:-http://localhost:3000/api/v1}"
};
EOF

exec "$@"
