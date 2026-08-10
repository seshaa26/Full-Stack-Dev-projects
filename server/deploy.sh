#!/bin/bash
# ── DevXGen Deployment Script ────────────────────────────────
# Run this on your Oracle Cloud VM
# Usage: bash deploy.sh [--first-run]
#
# Flags:
#   --first-run    Install Docker, set up SSL certificates

set -euo pipefail

# ── Configuration ────────────────────────────────────────────
DOMAIN="api.devxgen.in"
EMAIL="admin@devxgen.in"  # For Let's Encrypt notifications
PROJECT_DIR="$(cd "$(dirname "$0")/.." && pwd)"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

log()  { echo -e "${GREEN}[✓]${NC} $1"; }
warn() { echo -e "${YELLOW}[!]${NC} $1"; }
err()  { echo -e "${RED}[✗]${NC} $1"; exit 1; }
info() { echo -e "${CYAN}[→]${NC} $1"; }

# ── First-run setup ──────────────────────────────────────────
first_run_setup() {
    info "Running first-time setup..."

    # Install Docker if not present
    if ! command -v docker &> /dev/null; then
        info "Installing Docker..."
        sudo apt-get update
        sudo apt-get install -y ca-certificates curl gnupg
        sudo install -m 0755 -d /etc/apt/keyrings
        curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
        sudo chmod a+r /etc/apt/keyrings/docker.gpg
        echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
        sudo apt-get update
        sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
        sudo usermod -aG docker $USER
        log "Docker installed successfully"
    else
        log "Docker already installed"
    fi

    # Open firewall ports (Oracle Cloud uses iptables)
    info "Configuring firewall..."
    sudo iptables -I INPUT 6 -m state --state NEW -p tcp --dport 80 -j ACCEPT
    sudo iptables -I INPUT 6 -m state --state NEW -p tcp --dport 443 -j ACCEPT
    sudo netfilter-persistent save 2>/dev/null || true
    log "Firewall configured"

    # Obtain SSL certificate
    info "Obtaining SSL certificate for ${DOMAIN}..."
    sudo mkdir -p /var/www/certbot
    docker run --rm \
        -v /etc/letsencrypt:/etc/letsencrypt \
        -v /var/www/certbot:/var/www/certbot \
        -p 80:80 \
        certbot/certbot certonly \
        --standalone \
        --email "${EMAIL}" \
        --agree-tos \
        --no-eff-email \
        -d "${DOMAIN}"
    log "SSL certificate obtained"

    # Set up auto-renewal cron job
    info "Setting up SSL auto-renewal..."
    (crontab -l 2>/dev/null; echo "0 3 * * * cd ${PROJECT_DIR} && docker compose run --rm certbot renew && docker compose exec nginx nginx -s reload") | crontab -
    log "Auto-renewal cron job configured"
}

# ── Main deployment ──────────────────────────────────────────
deploy() {
    cd "${PROJECT_DIR}"

    # Check for .env file
    if [ ! -f server/.env ]; then
        err "server/.env not found! Copy server/.env.production to server/.env and fill in values."
    fi

    info "Pulling latest code..."
    git pull origin main 2>/dev/null || warn "Not a git repo or no remote — skipping git pull"

    info "Building Docker images..."
    docker compose build --no-cache

    info "Starting services..."
    docker compose up -d

    # Wait for API to be healthy
    info "Waiting for API to be healthy..."
    sleep 5
    for i in $(seq 1 12); do
        if curl -sf http://localhost:5000/api/health > /dev/null 2>&1; then
            log "API is healthy!"
            break
        fi
        if [ $i -eq 12 ]; then
            err "API health check failed after 60 seconds. Check logs: docker compose logs api"
        fi
        sleep 5
    done

    # Show status
    echo ""
    echo -e "${GREEN}╔══════════════════════════════════════════════╗${NC}"
    echo -e "${GREEN}║   🚀 DevXGen deployed successfully!         ║${NC}"
    echo -e "${GREEN}║                                              ║${NC}"
    echo -e "${GREEN}║   API:    https://${DOMAIN}/api/health   ║${NC}"
    echo -e "${GREEN}║   Nginx:  https://${DOMAIN}              ║${NC}"
    echo -e "${GREEN}╚══════════════════════════════════════════════╝${NC}"
    echo ""

    docker compose ps
}

# ── Entry point ──────────────────────────────────────────────
if [[ "${1:-}" == "--first-run" ]]; then
    first_run_setup
fi

deploy
