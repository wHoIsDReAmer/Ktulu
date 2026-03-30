#!/bin/bash
set -e

SERVER_DIR="$(cd "$(dirname "$0")/.." && pwd)/test-server"
PAPER_VERSION="1.21.4"

echo "Fetching latest build number for Paper ${PAPER_VERSION}..."
PAPER_BUILD=$(curl -s "https://api.papermc.io/v2/projects/paper/versions/${PAPER_VERSION}/builds" | python3 -c "import sys,json; print(json.load(sys.stdin)['builds'][-1]['build'])")
PAPER_URL="https://api.papermc.io/v2/projects/paper/versions/${PAPER_VERSION}/builds/${PAPER_BUILD}/downloads/paper-${PAPER_VERSION}-${PAPER_BUILD}.jar"
echo "Latest build: ${PAPER_BUILD}"

echo "=== Ktulu Test Server Setup ==="

mkdir -p "$SERVER_DIR/plugins"

if [ ! -f "$SERVER_DIR/paper.jar" ]; then
    echo "Downloading Paper ${PAPER_VERSION} build ${PAPER_BUILD}..."
    curl -L -o "$SERVER_DIR/paper.jar" "$PAPER_URL"
    echo "Download complete."
else
    echo "Paper server jar already exists."
fi

if [ ! -f "$SERVER_DIR/eula.txt" ]; then
    echo "eula=true" > "$SERVER_DIR/eula.txt"
    echo "EULA accepted."
fi

if [ ! -f "$SERVER_DIR/server.properties" ]; then
    cat > "$SERVER_DIR/server.properties" << 'EOF'
server-port=25565
online-mode=false
max-players=5
level-name=world
motd=Ktulu Test Server
spawn-protection=0
EOF
    echo "server.properties created."
fi

echo ""
echo "=== Setup Complete ==="
echo ""
echo "Build & deploy plugin:"
echo "  ./gradlew :plugin:shadowJar"
echo "  cp plugin/build/libs/Ktulu.jar test-server/plugins/"
echo ""
echo "Start server:"
echo "  cd test-server && java -jar paper.jar --nogui"
