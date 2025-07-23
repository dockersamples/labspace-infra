#!/bin/bash

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print status
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

echo -e "${BLUE}🔧 Fixing Compose File - Adding Lab Interface Service${NC}"
echo -e "${BLUE}===================================================${NC}"
echo

# Check if we're in the right directory
if [ ! -f "compose.yaml" ] && [ ! -f "docker-compose.yml" ]; then
    print_error "No Docker Compose file found. Please run this script in the workshop-poc-infra directory."
    exit 1
fi

# Determine which compose file to use
COMPOSE_FILE="compose.yaml"
if [ ! -f "compose.yaml" ] && [ -f "docker-compose.yml" ]; then
    COMPOSE_FILE="docker-compose.yml"
fi

print_status "Working with compose file: $COMPOSE_FILE"

# Create backup
print_status "Creating backup of $COMPOSE_FILE..."
cp "$COMPOSE_FILE" "${COMPOSE_FILE}.backup.$(date +%Y%m%d-%H%M%S)"

# Remove any incorrectly added lab-interface service
print_status "Cleaning up any incorrect lab-interface entries..."
sed -i.tmp '/lab-interface:/,$d' "$COMPOSE_FILE"
rm -f "${COMPOSE_FILE}.tmp"

# Create a proper lab-interface service definition
print_status "Creating proper lab-interface service definition..."

# Find where to insert the service (after the last service, before networks/volumes)
python3 << 'EOF' || python << 'EOF'
import yaml
import sys

# Read the current compose file
with open('compose.yaml' if 'compose.yaml' in open('.').read() else 'docker-compose.yml', 'r') as f:
    compose_data = yaml.safe_load(f)

# Add the lab-interface service
if 'services' not in compose_data:
    compose_data['services'] = {}

compose_data['services']['lab-interface'] = {
    'image': 'nginx:alpine',
    'container_name': 'lab-interface',
    'ports': ['8080:80'],
    'volumes': [
        './lab-interface:/usr/share/nginx/html:ro',
        './nginx.conf:/etc/nginx/nginx.conf:ro'
    ],
    'depends_on': ['workspace', 'instructions'],
    'networks': ['workshop-poc'],
    'restart': 'unless-stopped',
    'labels': ['demo-setup=true']
}

# Write back to the compose file
compose_file = 'compose.yaml' if 'compose.yaml' in open('.').read() else 'docker-compose.yml'
with open(compose_file, 'w') as f:
    yaml.dump(compose_data, f, default_flow_style=False, sort_keys=False)

print(f"✅ Successfully added lab-interface service to {compose_file}")
EOF

if [ $? -ne 0 ]; then
    print_warning "Python YAML method failed, using manual method..."

    # Manual method - find the right place to insert
    # Look for the end of services section
    if grep -q "^networks:" "$COMPOSE_FILE"; then
        # Insert before networks section
        sed -i.tmp '/^networks:/i\
\
  # Lab interface serving the split-screen layout\
  lab-interface:\
    image: nginx:alpine\
    container_name: lab-interface\
    ports:\
      - "8080:80"\
    volumes:\
      - ./lab-interface:/usr/share/nginx/html:ro\
      - ./nginx.conf:/etc/nginx/nginx.conf:ro\
    depends_on:\
      - workspace\
      - instructions\
    networks:\
      - workshop-poc\
    restart: unless-stopped\
    labels:\
      - demo-setup=true\
' "$COMPOSE_FILE"
    elif grep -q "^volumes:" "$COMPOSE_FILE"; then
        # Insert before volumes section
        sed -i.tmp '/^volumes:/i\
\
  # Lab interface serving the split-screen layout\
  lab-interface:\
    image: nginx:alpine\
    container_name: lab-interface\
    ports:\
      - "8080:80"\
    volumes:\
      - ./lab-interface:/usr/share/nginx/html:ro\
      - ./nginx.conf:/etc/nginx/nginx.conf:ro\
    depends_on:\
      - workspace\
      - instructions\
    networks:\
      - workshop-poc\
    restart: unless-stopped\
    labels:\
      - demo-setup=true\
' "$COMPOSE_FILE"
    else
        # Append to end of file
        cat >> "$COMPOSE_FILE" << 'EOF'

  # Lab interface serving the split-screen layout
  lab-interface:
    image: nginx:alpine
    container_name: lab-interface
    ports:
      - "8080:80"
    volumes:
      - ./lab-interface:/usr/share/nginx/html:ro
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
    depends_on:
      - workspace
      - instructions
    networks:
      - workshop-poc
    restart: unless-stopped
    labels:
      - demo-setup=true
EOF
    fi

    # Clean up temporary file
    rm -f "${COMPOSE_FILE}.tmp"
fi

# Validate the compose file
print_status "Validating compose file..."
if docker compose config > /dev/null 2>&1; then
    print_status "✅ Compose file validation successful!"
else
    print_error "❌ Compose file validation failed!"
    print_status "Restoring from backup..."

    # Find the most recent backup
    BACKUP_FILE=$(ls -t "${COMPOSE_FILE}.backup."* | head -1)
    if [ -f "$BACKUP_FILE" ]; then
        cp "$BACKUP_FILE" "$COMPOSE_FILE"
        print_status "✅ Restored from backup: $BACKUP_FILE"
    fi

    print_error "Please check your compose file manually."
    exit 1
fi

# Create lab-interface directory if it doesn't exist
if [ ! -d "lab-interface" ]; then
    print_status "Creating lab-interface directory..."
    mkdir -p lab-interface
fi

# Create nginx configuration if it doesn't exist
if [ ! -f "nginx.conf" ]; then
    print_status "Creating nginx configuration..."
    cat > nginx.conf << 'EOF'
events {
    worker_connections 1024;
}

http {
    include /etc/nginx/mime.types;
    default_type application/octet-stream;

    upstream vscode {
        server workspace:8085;
    }

    upstream instructions {
        server instructions:3000;
    }

    server {
        listen 80;
        server_name localhost;

        location / {
            root /usr/share/nginx/html;
            index index.html;
            try_files $uri $uri/ /index.html;
        }

        location /vscode/ {
            proxy_pass http://vscode/;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;

            # WebSocket support
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection "upgrade";
        }

        location /api/instructions/ {
            proxy_pass http://instructions/;
            proxy_set_header Host $host;
        }
    }
}
EOF
fi

# Create placeholder index.html if it doesn't exist
if [ ! -f "lab-interface/index.html" ]; then
    print_status "Creating placeholder index.html..."
    cat > lab-interface/index.html << 'EOF'
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Lab Playground - Setup Complete</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: #1e1e1e;
            color: #cccccc;
            margin: 0;
            padding: 20px;
            line-height: 1.6;
        }
        .container {
            max-width: 800px;
            margin: 0 auto;
            background: #252526;
            border-radius: 8px;
            padding: 30px;
            border: 1px solid #3e3e42;
            text-align: center;
        }
        h1 { color: #4fc3f7; }
        .success {
            background: #2d4a2d;
            border: 1px solid #4caf50;
            border-radius: 5px;
            padding: 20px;
            margin: 20px 0;
            color: #a5d6a7;
        }
        code {
            background: #1e1e1e;
            padding: 10px;
            border-radius: 5px;
            display: inline-block;
            margin: 10px;
            font-family: monospace;
        }
        a {
            color: #4fc3f7;
            text-decoration: none;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>🧪 Lab Interface Setup Complete!</h1>

        <div class="success">
            <h2>✅ Service Successfully Added</h2>
            <p>The lab-interface service has been properly added to your compose file.</p>
        </div>

        <h2>🎯 Next Steps</h2>
        <p>Replace this placeholder with the complete lab interface HTML:</p>

        <ol style="text-align: left; max-width: 500px; margin: 0 auto;">
            <li>Copy the complete HTML from the lab-playground artifact</li>
            <li>Replace the content of <code>lab-interface/index.html</code></li>
            <li>Run: <code>docker compose restart lab-interface</code></li>
        </ol>

        <h2>🌐 Access Points</h2>
        <p>
            <a href="http://localhost:8085">VS Code Server</a> |
            <a href="http://localhost:3000">Instructions API</a>
        </p>

        <p><em>Once you replace this file, you'll have the complete split-screen lab experience!</em></p>
    </div>
</body>
</html>
EOF
fi

# Start the service
print_status "Starting lab-interface service..."
docker compose up -d lab-interface

# Wait for service to start
sleep 3

# Check status
print_status "Checking service status..."
docker compose ps lab-interface

echo
echo -e "${GREEN}🎉 Lab Interface Service Successfully Added!${NC}"
echo -e "${BLUE}===========================================${NC}"
echo
echo -e "${YELLOW}📍 Current Status:${NC}"
echo -e "  ✅ Service added to compose file"
echo -e "  ✅ Nginx configuration created"
echo -e "  ✅ Placeholder HTML created"
echo -e "  ✅ Service is running"
echo
echo -e "${YELLOW}🌐 Access Points:${NC}"
echo -e "  🧪 Lab Interface:      ${GREEN}http://localhost:8080${NC}"
echo -e "  💻 VS Code Server:     ${GREEN}http://localhost:8085${NC}"
echo -e "  📚 Instructions API:   ${GREEN}http://localhost:3000${NC}"
echo
echo -e "${YELLOW}📋 Next Steps:${NC}"
echo -e "  1. Replace ${BLUE}lab-interface/index.html${NC} with the complete lab interface"
echo -e "  2. Run: ${BLUE}docker compose restart lab-interface${NC}"
echo -e "  3. Enjoy your complete lab playground!"
echo
echo -e "${GREEN}Setup Complete! 🎓${NC}"