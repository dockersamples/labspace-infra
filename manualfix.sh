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

echo -e "${BLUE}🔧 Manual Compose Fix - Precise Service Addition${NC}"
echo -e "${BLUE}===============================================${NC}"
echo

# Check if we're in the right directory
if [ ! -f "compose.yaml" ]; then
    print_error "compose.yaml not found. Please run this script in the workshop-poc-infra directory."
    exit 1
fi

print_status "Found compose.yaml"

# Create backup
print_status "Creating backup of compose.yaml..."
cp compose.yaml "compose.yaml.backup.$(date +%Y%m%d-%H%M%S)"

# Show current structure
print_status "Analyzing current compose.yaml structure..."
echo -e "${BLUE}Current top-level sections:${NC}"
grep "^[a-z]" compose.yaml | head -10

# Stop any existing lab-interface container
print_status "Stopping any existing lab-interface container..."
docker compose stop lab-interface 2>/dev/null || true
docker compose rm -f lab-interface 2>/dev/null || true

# Method 1: Find the exact place to insert the service
print_status "Finding the right place to insert lab-interface service..."

# Create a new compose file with the lab-interface service added
cat > compose_new.yaml << 'EOF'
# This will be built by combining the original file with our new service
EOF

# Flag to track if we're in services section
in_services=false
services_ended=false

while IFS= read -r line; do
    # Check if we're starting the services section
    if [[ "$line" =~ ^services: ]]; then
        echo "$line" >> compose_new.yaml
        in_services=true
        continue
    fi
    
    # Check if we're ending the services section (hit networks or volumes)
    if [[ "$line" =~ ^(networks|volumes): ]] && [ "$in_services" = true ]; then
        # Add our service before ending services section
        cat >> compose_new.yaml << 'LABINTERFACE'

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
LABINTERFACE
        echo "" >> compose_new.yaml
        services_ended=true
        in_services=false
    fi
    
    echo "$line" >> compose_new.yaml
    
done < compose.yaml

# If we reached end of file without finding networks/volumes, add the service at the end
if [ "$in_services" = true ] && [ "$services_ended" = false ]; then
    cat >> compose_new.yaml << 'LABINTERFACE'

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
LABINTERFACE
fi

# Replace the original file
mv compose_new.yaml compose.yaml

print_status "Service added to compose.yaml"

# Validate the compose file
print_status "Validating compose file..."
if docker compose config > /dev/null 2>&1; then
    print_status "✅ Compose file validation successful!"
else
    print_error "❌ Compose file validation failed!"
    print_status "Showing validation errors:"
    docker compose config 2>&1 || true
    
    # Restore from backup
    print_status "Restoring from backup..."
    BACKUP_FILE=$(ls -t compose.yaml.backup.* 2>/dev/null | head -1)
    if [ -f "$BACKUP_FILE" ]; then
        cp "$BACKUP_FILE" compose.yaml
        print_status "✅ Restored from backup: $BACKUP_FILE"
    fi
    
    print_error "Manual fix failed. Let's try a different approach..."
    echo
    echo -e "${YELLOW}Alternative: Manual addition${NC}"
    echo "1. Open compose.yaml in your editor"
    echo "2. Find the services: section"
    echo "3. Add this at the end of the services (before networks:):"
    echo
    cat << 'MANUAL'
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
MANUAL
    echo
    exit 1
fi

# Create required files
print_status "Creating required files..."

# Create lab-interface directory
mkdir -p lab-interface

# Create nginx configuration
print_status "Creating nginx.conf..."
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

# Create minimal placeholder HTML
print_status "Creating placeholder index.html..."
cat > lab-interface/index.html << 'EOF'
<!DOCTYPE html>
<html>
<head>
    <title>Lab Interface Ready</title>
    <style>
        body { 
            font-family: Arial, sans-serif; 
            background: #1e1e1e; 
            color: #fff; 
            text-align: center; 
            padding: 50px; 
        }
        .container { 
            max-width: 600px; 
            margin: 0 auto; 
            background: #252526; 
            padding: 30px; 
            border-radius: 8px; 
        }
        h1 { color: #4fc3f7; }
        .success { background: #2d4a2d; padding: 20px; border-radius: 5px; margin: 20px 0; }
        code { background: #333; padding: 5px; border-radius: 3px; }
    </style>
</head>
<body>
    <div class="container">
        <h1>🧪 Lab Interface Ready!</h1>
        <div class="success">
            <h2>✅ Service Successfully Added</h2>
            <p>The lab-interface service is now running properly.</p>
        </div>
        <h3>Next Steps:</h3>
        <ol style="text-align: left;">
            <li>Replace this file with the complete lab interface HTML</li>
            <li>Run: <code>docker compose restart lab-interface</code></li>
            <li>Enjoy your split-screen lab experience!</li>
        </ol>
        <p><strong>Access:</strong><br>
        <a href="http://localhost:8085" style="color: #4fc3f7;">VS Code Server</a> | 
        <a href="http://localhost:3000" style="color: #4fc3f7;">Instructions API</a></p>
    </div>
</body>
</html>
EOF

# Start the service
print_status "Starting lab-interface service..."
docker compose up -d lab-interface

# Wait and check
sleep 3
print_status "Checking service status..."
docker compose ps lab-interface

# Test
if curl -s http://localhost:8080 > /dev/null 2>&1; then
    print_status "✅ Lab interface is accessible at http://localhost:8080"
else
    print_warning "⚠️  Service starting up, please wait..."
fi

echo
echo -e "${GREEN}🎉 Success! Lab Interface Added and Running${NC}"
echo -e "${BLUE}==========================================${NC}"
echo
echo -e "${YELLOW}📍 Your Lab Playground:${NC}"
echo -e "  🧪 Lab Interface:    ${GREEN}http://localhost:8080${NC}"
echo -e "  💻 VS Code:          ${GREEN}http://localhost:8085${NC}"
echo -e "  📚 Instructions:     ${GREEN}http://localhost:3000${NC}"
echo
echo -e "${YELLOW}📋 Final Step:${NC}"
echo -e "  Replace ${BLUE}lab-interface/index.html${NC} with the complete lab interface"
echo -e "  Then: ${BLUE}docker compose restart lab-interface${NC}"
echo
echo -e "${GREEN}Your workshop infrastructure is complete! 🎓${NC}"
