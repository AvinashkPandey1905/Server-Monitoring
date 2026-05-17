#!/bin/bash
# ═══════════════════════════════════════════════════════
#  Server Monitoring Dashboard — Ubuntu Setup Script
# ═══════════════════════════════════════════════════════
set -e


echo "  🖥️  Server Monitoring Dashboard Setup        "


# Check if running as root
if [ "$EUID" -ne 0 ]; then
  echo "⚠️  Please run as root (sudo ./install.sh)"
  exit 1
fi

# ─── 1. System Update ─────────────────────────────────
echo "📦 Updating system packages..."
apt update && apt upgrade -y

# ─── 2. Install Node.js (LTS) ─────────────────────────
echo "📦 Installing Node.js LTS..."
if ! command -v node &> /dev/null; then
  curl -fsSL https://deb.nodesource.com/setup_lts.x | bash -
  apt install -y nodejs
fi
echo "   Node.js: $(node --version)"
echo "   npm: $(npm --version)"

# ─── 3. Install PM2 ───────────────────────────────────
echo "📦 Installing PM2..."
npm install -g pm2

# ─── 4. Install Nginx ─────────────────────────────────
echo "📦 Installing Nginx..."
apt install -y nginx
systemctl enable nginx

# ─── 5. Setup Application ─────────────────────────────
APP_DIR="/opt/server-monitoring-dashboard"
echo "📁 Setting up application at $APP_DIR..."

if [ -d "$APP_DIR" ]; then
  echo "   Directory exists. Pulling latest changes..."
else
  mkdir -p $APP_DIR
fi

# Copy files (or git clone in production)
cp -r . $APP_DIR/ 2>/dev/null || true

cd $APP_DIR

# ─── 6. Install Dependencies ──────────────────────────
echo "📦 Installing Node.js dependencies..."
npm install --production

# Create logs directory
mkdir -p logs

# ─── 7. Setup Environment ─────────────────────────────
if [ ! -f .env ]; then
  cp .env.example .env
  echo "📝 Created .env file from template. Edit as needed."
fi

# ─── 8. Configure Nginx ───────────────────────────────
echo "🌐 Configuring Nginx..."
cp nginx/monitoring.conf /etc/nginx/sites-available/monitoring
ln -sf /etc/nginx/sites-available/monitoring /etc/nginx/sites-enabled/monitoring
nginx -t && systemctl reload nginx

# ─── 9. Start with PM2 ────────────────────────────────
echo "🚀 Starting application with PM2..."
pm2 start ecosystem.config.js --env production
pm2 save
pm2 startup systemd -u root --hp /root

# ─── Done ──────────────────────────────────────────────
echo ""
echo "  ✅ Setup Complete!                          \"
echo "                                             "
echo "  Dashboard: http://localhost:3001             "
echo "  PM2 Status: pm2 status                      "
echo "  PM2 Logs:   pm2 logs server-monitor          "
echo "  Next steps:                                 "
echo "  1. Edit .env with your settings             "
echo "  2. Update Nginx server_name                 "
echo "  3. Setup SSL with: certbot --nginx          "
