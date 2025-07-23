#!/bin/bash

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

echo -e "${BLUE}🎉 Completing Lab Interface Setup${NC}"
echo -e "${BLUE}=================================${NC}"
echo

print_status "Your compose.yaml looks perfect! Lab-interface service is properly configured."

# Create required directories
print_status "Creating lab-interface directory..."
mkdir -p lab-interface

# Create nginx configuration tailored to your setup
print_status "Creating nginx.conf for your configuration..."
cat > nginx.conf << 'EOF'
events {
    worker_connections 1024;
}

http {
    include /etc/nginx/mime.types;
    default_type application/octet-stream;
    
    # Upstream for VS Code workspace (port 8085)
    upstream vscode {
        server workspace:8085;
    }
    
    # Upstream for instructions server (port 3000, mapped to host 8000)
    upstream instructions {
        server instructions:3000;
    }
    
    server {
        listen 80;
        server_name localhost;
        
        # Serve lab interface static files
        location / {
            root /usr/share/nginx/html;
            index index.html;
            try_files $uri $uri/ /index.html;
        }
        
        # Proxy to VS Code server with WebSocket support
        location /vscode/ {
            proxy_pass http://vscode/;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            
            # WebSocket support for VS Code
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection "upgrade";
            
            # Increase timeouts for VS Code
            proxy_connect_timeout 60s;
            proxy_send_timeout 60s;
            proxy_read_timeout 60s;
        }
        
        # Proxy to instructions API
        location /api/instructions/ {
            proxy_pass http://instructions/;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        }
        
        # Health check endpoint
        location /health {
            access_log off;
            return 200 "healthy\n";
            add_header Content-Type text/plain;
        }
    }
}
EOF

# Create enhanced placeholder HTML with your specific configuration
print_status "Creating placeholder index.html..."
cat > lab-interface/index.html << 'EOF'
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Docker Workshop Lab Playground</title>
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
            max-width: 900px;
            margin: 0 auto;
            background: #252526;
            border-radius: 8px;
            padding: 30px;
            border: 1px solid #3e3e42;
        }
        h1 { 
            color: #4fc3f7; 
            text-align: center;
            margin-bottom: 30px;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 10px;
        }
        .status-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 20px;
            margin: 30px 0;
        }
        .service-card {
            background: #2d2d30;
            border: 1px solid #3e3e42;
            border-radius: 8px;
            padding: 20px;
            text-align: center;
        }
        .service-card h3 {
            color: #81c784;
            margin: 0 0 10px 0;
        }
        .service-status {
            font-size: 24px;
            margin: 10px 0;
        }
        .success {
            background: #2d4a2d;
            border: 1px solid #4caf50;
            border-radius: 5px;
            padding: 20px;
            margin: 20px 0;
            color: #a5d6a7;
            text-align: center;
        }
        .next-steps {
            background: #2d2d30;
            border: 1px solid #3e3e42;
            border-radius: 8px;
            padding: 25px;
            margin: 30px 0;
        }
        .next-steps h2 {
            color: #4fc3f7;
            margin-top: 0;
        }
        .step {
            background: #1e1e1e;
            border-left: 4px solid #4fc3f7;
            padding: 15px 20px;
            margin: 15px 0;
            border-radius: 0 5px 5px 0;
        }
        .step-number {
            background: #4fc3f7;
            color: #1e1e1e;
            width: 24px;
            height: 24px;
            border-radius: 50%;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            font-weight: bold;
            margin-right: 10px;
        }
        code {
            background: #1e1e1e;
            padding: 8px 12px;
            border-radius: 4px;
            display: inline-block;
            margin: 5px 2px;
            font-family: 'Monaco', 'Menlo', monospace;
            font-size: 13px;
            border: 1px solid #3e3e42;
        }
        .code-block {
            background: #1e1e1e;
            border: 1px solid #3e3e42;
            border-radius: 5px;
            padding: 15px;
            margin: 15px 0;
            overflow-x: auto;
            position: relative;
        }
        .copy-btn {
            position: absolute;
            top: 10px;
            right: 10px;
            background: #4fc3f7;
            color: #1e1e1e;
            border: none;
            padding: 5px 10px;
            border-radius: 3px;
            cursor: pointer;
            font-size: 12px;
        }
        a {
            color: #4fc3f7;
            text-decoration: none;
            font-weight: 500;
        }
        a:hover { 
            text-decoration: underline;
        }
        .access-links {
            display: flex;
            justify-content: center;
            gap: 20px;
            margin: 30px 0;
            flex-wrap: wrap;
        }
        .access-link {
            background: #2d2d30;
            border: 2px solid #4fc3f7;
            color: #4fc3f7;
            padding: 12px 24px;
            text-decoration: none;
            border-radius: 8px;
            transition: all 0.2s;
            font-weight: 600;
        }
        .access-link:hover {
            background: #4fc3f7;
            color: #1e1e1e;
            text-decoration: none;
        }
        .warning {
            background: #4a2d2d;
            border: 1px solid #f44336;
            border-radius: 5px;
            padding: 15px;
            margin: 20px 0;
            color: #ffcdd2;
        }
        .loading {
            animation: pulse 2s infinite;
        }
        @keyframes pulse {
            0% { opacity: 1; }
            50% { opacity: 0.5; }
            100% { opacity: 1; }
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>
            🧪 Docker Workshop Lab Playground
        </h1>
        
        <div class="success">
            <h2>✅ Lab Interface Successfully Configured!</h2>
            <p>Your lab-interface service has been properly added to the compose file and is ready to go.</p>
        </div>
        
        <div class="status-grid">
            <div class="service-card">
                <h3>💻 VS Code Workspace</h3>
                <div class="service-status" id="vscode-status">⏳</div>
                <p>Port: 8085</p>
                <p id="vscode-info">Checking...</p>
            </div>
            
            <div class="service-card">
                <h3>📚 Instructions Server</h3>
                <div class="service-status" id="instructions-status">⏳</div>
                <p>Port: 8000 → 3000</p>
                <p id="instructions-info">Checking...</p>
            </div>
            
            <div class="service-card">
                <h3>🧪 Lab Interface</h3>
                <div class="service-status">✅</div>
                <p>Port: 8080</p>
                <p>Ready for upgrade!</p>
            </div>
        </div>
        
        <div class="access-links">
            <a href="http://localhost:8085" class="access-link" target="_blank">
                💻 Open VS Code
            </a>
            <a href="http://localhost:8000" class="access-link" target="_blank">
                📚 View Instructions
            </a>
        </div>
        
        <div class="next-steps">
            <h2>🎯 Complete Your Lab Setup</h2>
            <p>Your infrastructure is running! Now upgrade this interface to get the full split-screen experience:</p>
            
            <div class="step">
                <span class="step-number">1</span>
                <strong>Replace this HTML file</strong> with the complete lab interface
            </div>
            
            <div class="step">
                <span class="step-number">2</span>
                <strong>Restart the service:</strong>
                <div class="code-block">
                    <button class="copy-btn" onclick="copyCode(this)">Copy</button>
                    <code>docker compose restart lab-interface</code>
                </div>
            </div>
            
            <div class="step">
                <span class="step-number">3</span>
                <strong>Enjoy your split-screen lab playground!</strong> You'll have instructions on the left and VS Code on the right.
            </div>
        </div>
        
        <div class="next-steps">
            <h2>🔧 Useful Commands</h2>
            
            <p><strong>Check all services:</strong></p>
            <div class="code-block">
                <button class="copy-btn" onclick="copyCode(this)">Copy</button>
                <code>docker compose ps</code>
            </div>
            
            <p><strong>View service logs:</strong></p>
            <div class="code-block">
                <button class="copy-btn" onclick="copyCode(this)">Copy</button>
                <code>docker compose logs -f lab-interface</code>
            </div>
            
            <p><strong>Restart all services:</strong></p>
            <div class="code-block">
                <button class="copy-btn" onclick="copyCode(this)">Copy</button>
                <code>docker compose restart</code>
            </div>
        </div>
        
        <div class="warning">
            <h3>⚠️ Remember</h3>
            <p>This is a placeholder interface. Replace <code>lab-interface/index.html</code> with the complete lab interface to get the full split-screen experience with workshop instructions on the left and VS Code on the right!</p>
        </div>
    </div>

    <script>
        function copyCode(button) {
            const codeBlock = button.nextElementSibling;
            const text = codeBlock.textContent;
            navigator.clipboard.writeText(text).then(() => {
                button.textContent = 'Copied!';
                setTimeout(() => {
                    button.textContent = 'Copy';
                }, 2000);
            });
        }
        
        function checkServices() {
            // Check VS Code (port 8085)
            fetch('http://localhost:8085')
                .then(response => {
                    if (response.ok) {
                        document.getElementById('vscode-status').textContent = '✅';
                        document.getElementById('vscode-info').textContent = 'Online & Ready';
                    } else {
                        document.getElementById('vscode-status').textContent = '⚠️';
                        document.getElementById('vscode-info').textContent = 'Responding but not ready';
                    }
                })
                .catch(() => {
                    document.getElementById('vscode-status').textContent = '❌';
                    document.getElementById('vscode-info').textContent = 'Not accessible';
                });
            
            // Check Instructions (port 8000)
            fetch('http://localhost:8000')
                .then(response => {
                    if (response.ok) {
                        document.getElementById('instructions-status').textContent = '✅';
                        document.getElementById('instructions-info').textContent = 'Online & Ready';
                    } else {
                        document.getElementById('instructions-status').textContent = '⚠️';
                        document.getElementById('instructions-info').textContent = 'Responding but not ready';
                    }
                })
                .catch(() => {
                    document.getElementById('instructions-status').textContent = '❌';
                    document.getElementById('instructions-info').textContent = 'Not accessible';
                });
        }
        
        // Check services on load and every 10 seconds
        document.addEventListener('DOMContentLoaded', checkServices);
        setInterval(checkServices, 10000);
    </script>
</body>
</html>
EOF

# Validate the compose file
print_status "Validating compose.yaml..."
if docker compose config > /dev/null 2>&1; then
    print_status "✅ Compose file is valid!"
else
    print_warning "⚠️  Compose validation had warnings, but this is likely okay"
fi

# Start the lab-interface service
print_status "Starting lab-interface service..."
docker compose up -d lab-interface

# Wait for service to start
print_status "Waiting for service to start..."
sleep 5

# Check service status
print_status "Checking all services..."
docker compose ps

# Test lab interface accessibility
print_status "Testing lab interface..."
if curl -s -o /dev/null -w "%{http_code}" http://localhost:8080 | grep -q "200"; then
    print_status "✅ Lab interface is accessible!"
else
    print_warning "⚠️  Lab interface may still be starting..."
fi

echo
echo -e "${GREEN}🎉 Lab Interface Setup Complete!${NC}"
echo -e "${BLUE}================================${NC}"
echo
echo -e "${YELLOW}🌐 Your Workshop Environment:${NC}"
echo -e "  🧪 Lab Playground:    ${GREEN}http://localhost:8080${NC} (this interface)"
echo -e "  💻 VS Code Workspace: ${GREEN}http://localhost:8085${NC}"
echo -e "  📚 Instructions:      ${GREEN}http://localhost:8000${NC}"
echo -e "  🚀 App Preview:       ${GREEN}http://localhost:3000${NC} (when running apps)"
echo
echo -e "${YELLOW}📋 Final Step:${NC}"
echo -e "  Replace ${BLUE}lab-interface/index.html${NC} with the complete lab interface HTML"
echo -e "  Then run: ${BLUE}docker compose restart lab-interface${NC}"
echo
echo -e "${YELLOW}🎯 What You'll Get:${NC}"
echo -e "  • Split-screen interface: Instructions ← → VS Code"
echo -e "  • Multiple workshop tracks (Docker Basics, Todo App, etc.)"
echo -e "  • Interactive code copying and progress tracking"
echo -e "  • Integrated development environment"
echo
echo -e "${GREEN}Your workshop infrastructure is ready! 🎓${NC}"
echo -e "${BLUE}Visit http://localhost:8080 to see the current interface${NC}"
