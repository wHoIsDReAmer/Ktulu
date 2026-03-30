#!/bin/bash
set -e

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
SERVER_DIR="$ROOT/test-server"

if [ ! -d "$SERVER_DIR" ]; then
    echo "Test server not set up. Run scripts/setup-test-server.sh first."
    exit 1
fi

echo "Building plugin shadow JAR..."
"$ROOT/gradlew" -p "$ROOT" :plugin:shadowJar

echo "Deploying to test server..."
cp "$ROOT/plugin/build/libs/Ktulu.jar" "$SERVER_DIR/plugins/"

echo "Done! Plugin deployed to test-server/plugins/Ktulu.jar"
echo ""
echo "If the server is running, use '/reload confirm' in the console to reload."
