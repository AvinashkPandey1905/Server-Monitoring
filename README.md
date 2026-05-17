# Server Monitoring Dashboard

Real-time server monitoring dashboard built with **Node.js**, **Express**, **Socket.IO**, and **Chart.js**. Monitors CPU, memory, disk, network, and processes with threshold-based alerting.

![Node.js](https://img.shields.io/badge/Node.js-339933?style=flat&logo=node.js&logoColor=white)
![Express](https://img.shields.io/badge/Express-000000?style=flat&logo=express&logoColor=white)
![Socket.IO](https://img.shields.io/badge/Socket.IO-010101?style=flat&logo=socket.io&logoColor=white)
![Chart.js](https://img.shields.io/badge/Chart.js-FF6384?style=flat&logo=chart.js&logoColor=white)

## Features

- 📊 **Real-time Metrics** — CPU, Memory, Disk, Network stats updated every 2s
- 📈 **Live Charts** — CPU history, memory usage, disk partitions, network throughput
- 🔔 **Alert Engine** — Configurable threshold-based alerting (CPU/Memory/Disk)
- 📋 **Process Table** — Top 10 processes by CPU with state and user info
- 🖥️ **System Info** — OS, kernel, architecture, load average at a glance
- 🌙 **Dark Theme** — Glassmorphic design with neon accents
- 📱 **Responsive** — Works on desktop, tablet, and mobile
- 🚀 **Deploy-ready** — PM2 config, Nginx reverse proxy, install script

## Tech Stack

| Layer      | Technology                   |
|------------|------------------------------|
| Backend    | Node.js, Express, Socket.IO  |
| Frontend   | HTML5, CSS3, Chart.js 4      |
| Monitoring | systeminformation, os module |
| Deployment | PM2, Nginx, Ubuntu           |

## Quick Start

```bash
# Install dependencies
npm install

# Start in development (auto-restart on changes)
npm run dev

# Start in production
npm start
```

Open [http://localhost:3001](http://localhost:3001) in your browser.

## Production Deployment (Ubuntu)

```bash
sudo ./scripts/install.sh
```

This installs Node.js, PM2, Nginx, and configures everything automatically.

## Configuration

Copy `.env.example` to `.env` and adjust:

```env
PORT=3001
METRICS_INTERVAL=2000
ALERT_CPU_THRESHOLD=80
ALERT_MEMORY_THRESHOLD=85
ALERT_DISK_THRESHOLD=90
```

## Project Structure

```
server-monitoring-dashboard/
├── server.js                    # Express + Socket.IO main server
├── ecosystem.config.js          # PM2 process config
├── src/
│   ├── collectors/
│   │   ├── systemCollector.js   # CPU, memory, system info
│   │   ├── diskCollector.js     # Disk/filesystem usage
│   │   ├── networkCollector.js  # Network interfaces & throughput
│   │   └── processCollector.js  # Top processes
│   ├── utils/
│   │   └── alertEngine.js       # Threshold-based alerting
│   └── config/
│       └── thresholds.js        # Alert thresholds
├── public/
│   ├── index.html               # Dashboard UI
│   ├── css/dashboard.css        # Dark theme styles
│   └── js/
│       ├── app.js               # Socket.IO client + DOM updates
│       ├── charts.js            # Chart.js configurations
│       └── utils.js             # Formatters & helpers
├── nginx/monitoring.conf        # Nginx reverse proxy config
└── scripts/install.sh           # Ubuntu deployment script
```

## License

MIT
# Server-Monitoring
