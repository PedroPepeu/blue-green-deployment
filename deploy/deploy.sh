#!/bin/bash

# This script manages blue-green deployment for the Quote Generator app

# Create nginx config directory if it doesn't exist
mkdir -p deploy/nginx

# Default values
ACTIVE_ENV="blue"
NEW_ENV="green"

# Function to check if an environment is currently active
check_active_env() {
    if [ -f "deploy/nginx/nginx.conf" ]; then
        if grep -q "proxy_pass http://quote-generator-blue:3000" "deploy/nginx/nginx.conf"; then
            ACTIVE_ENV="blue"
            NEW_ENV="green"
        else
            ACTIVE_ENV="green"
            NEW_ENV="blue"
        fi
    fi
    echo "Current active environment: $ACTIVE_ENV"
    echo "New environment will be: $NEW_ENV"
}

# Function to create nginx configuration
create_nginx_conf() {
    local target=$1
    cat > deploy/nginx/nginx.conf << EOF
server {
    listen 80;
    server_name localhost;

    location / {
        proxy_pass http://quote-generator-$target:3000;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
}
EOF
    echo "Created nginx configuration pointing to $target environment"
}

# Function to build and start containers
start_deployment() {
    echo "Starting deployment..."
    docker-compose -f deploy/docker-compose.yml up -d --build
    echo "Deployment started"
}

# Function to switch traffic to new environment
switch_traffic() {
    echo "Switching traffic from $ACTIVE_ENV to $NEW_ENV..."
    create_nginx_conf $NEW_ENV
    docker-compose -f deploy/docker-compose.yml restart nginx
    echo "Traffic switched to $NEW_ENV environment"
}

# Function to health check
health_check() {
    local env=$1
    local port
    
    if [ "$env" == "blue" ]; then
        port=8081
    else
        port=8082
    fi
    
    echo "Performing health check on $env environment (port $port)..."
    
    # Wait for service to be ready
    sleep 5
    
    # Check health endpoint
    response=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:$port/health)
    
    if [ "$response" == "200" ]; then
        echo "Health check passed for $env environment"
        return 0
    else
        echo "Health check failed for $env environment: HTTP status $response"
        return 1
    fi
}

# Function to rollback if health check fails
rollback() {
    echo "Rolling back to $ACTIVE_ENV environment..."
    create_nginx_conf $ACTIVE_ENV
    docker-compose -f deploy/docker-compose.yml restart nginx
    echo "Rollback complete, traffic routed back to $ACTIVE_ENV environment"
}

# Main execution
check_active_env

# Initial setup or if no nginx.conf exists
if [ ! -f "deploy/nginx/nginx.conf" ]; then
    echo "No existing configuration found. Setting up initial deployment..."
    create_nginx_conf $ACTIVE_ENV
    start_deployment
    
    # Check if initial deployment is healthy
    if health_check $ACTIVE_ENV; then
        echo "Initial deployment successful"
    else
        echo "Initial deployment failed health check!"
        exit 1
    fi
else
    # Existing deployment - start new version and switch if healthy
    start_deployment
    
    # Check if new environment is healthy
    if health_check $NEW_ENV; then
        switch_traffic
        echo "Deployment successful"
    else
        echo "New environment failed health check, maintaining current deployment"
        exit 1
    fi
fi

# Optional: Remove the old version after successful switch
# Uncomment if you want to automatically remove the old version
# echo "Cleaning up old $ACTIVE_ENV environment..."
# docker-compose -f deploy/docker-compose.yml stop $ACTIVE_ENV
# docker-compose -f deploy/docker-compose.yml rm -f $ACTIVE_ENV