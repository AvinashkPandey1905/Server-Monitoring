require('dotenv').config();

const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');

// Collectors
const { collectSystemMetrics } = require('./src/collectors/systemCollector');
const { collectDiskMetrics } = require('./src/collectors/diskCollector');
const { collectNetworkMetrics } = require('./src/collectors/networkCollector');
const { collectProcessMetrics } = require('./src/collectors/processCollector');
const { evaluateAlerts } = require('./src/utils/alertEngine');

const app = express();
const server = http.createServer(app);

const PORT = process.env.PORT || 3001;
const METRICS_INTERVAL = parseInt(process.env.METRICS_INTERVAL) || 2000;

// ─── Middleware ───────────────────────────────────────────────
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "https://cdn.jsdelivr.net", "https://cdnjs.cloudflare.com"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com", "https://cdnjs.cloudflare.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com", "https://cdnjs.cloudflare.com"],
      connectSrc: ["'self'", "ws:", "wss:"],
      imgSrc: ["'self'", "data:"],
    },
  },
}));
app.use(cors());
app.use(compression());
app.use(morgan('dev'));
app.use(express.static(path.join(__dirname, 'public')));

// ─── Socket.IO ───────────────────────────────────────────────
const io = new Server(server, {
  cors: { origin: '*', methods: ['GET', 'POST'] },
  pingTimeout: 60000,
  pingInterval: 25000,
});

// Track connected clients
let connectedClients = 0;

io.on('connection', (socket) => {
  connectedClients++;
  console.log(`[WS] Client connected (${connectedClients} total) — ${socket.id}`);

  // Send initial metrics immediately
  broadcastMetrics(socket);

  socket.on('disconnect', () => {
    connectedClients--;
    console.log(`[WS] Client disconnected (${connectedClients} total) — ${socket.id}`);
  });

  // Allow clients to request specific metrics
  socket.on('request:metrics', () => broadcastMetrics(socket));
});

// ─── Metrics Broadcast ───────────────────────────────────────
async function broadcastMetrics(target = io) {
  try {
    const [system, disk, network, processes] = await Promise.all([
      collectSystemMetrics(),
      collectDiskMetrics(),
      collectNetworkMetrics(),
      collectProcessMetrics(),
    ]);

    const metrics = {
      ...system,
      ...disk,
      network: network,
      processes: processes,
      connectedClients,
    };

    // Evaluate alerts
    const alerts = evaluateAlerts(metrics);
    metrics.alerts = alerts;

    target.emit('metrics:update', metrics);
  } catch (err) {
    console.error('[Metrics] Collection error:', err.message);
    target.emit('metrics:error', { message: 'Failed to collect metrics' });
  }
}

// Periodic broadcast
setInterval(() => {
  if (connectedClients > 0) {
    broadcastMetrics();
  }
}, METRICS_INTERVAL);

// ─── REST API ────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    uptime: process.uptime(),
    timestamp: Date.now(),
    connectedClients,
  });
});

app.get('/api/metrics', async (req, res) => {
  try {
    const [system, disk, network, processes] = await Promise.all([
      collectSystemMetrics(),
      collectDiskMetrics(),
      collectNetworkMetrics(),
      collectProcessMetrics(),
    ]);
    res.json({ ...system, ...disk, network, processes });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── Start ───────────────────────────────────────────────────
server.listen(PORT, () => {
  console.log('');
  console.log('  ╔══════════════════════════════════════════════╗');
  console.log('  ║    🖥️  Server Monitoring Dashboard           ║');
  console.log('  ╠══════════════════════════════════════════════╣');
  console.log(`  ║  Dashboard : http://localhost:${PORT}           ║`);
  console.log(`  ║  API       : http://localhost:${PORT}/api/health ║`);
  console.log(`  ║  Interval  : ${METRICS_INTERVAL}ms                      ║`);
  console.log(`  ║  Env       : ${process.env.NODE_ENV || 'development'}               ║`);
  console.log('  ╚══════════════════════════════════════════════╝');
  console.log('');
});

// ─── Graceful Shutdown ───────────────────────────────────────
process.on('SIGTERM', () => {
  console.log('[Server] SIGTERM received. Shutting down gracefully...');
  io.close();
  server.close(() => process.exit(0));
});

process.on('SIGINT', () => {
  console.log('[Server] SIGINT received. Shutting down...');
  io.close();
  server.close(() => process.exit(0));
});
