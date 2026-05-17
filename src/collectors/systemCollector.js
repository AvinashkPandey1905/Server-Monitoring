const os = require('os');
const si = require('systeminformation');

let prevCpuData = null;

/**
 * Collect CPU and general system metrics
 */
async function collectSystemMetrics() {
  const [cpuLoad, cpuTemp, mem, time, osInfo] = await Promise.all([
    si.currentLoad(),
    si.cpuTemperature().catch(() => ({ main: null })),
    si.mem(),
    si.time(),
    si.osInfo(),
  ]);

  const cpus = os.cpus();
  const uptime = os.uptime();

  return {
    cpu: {
      usage: Math.round(cpuLoad.currentLoad * 100) / 100,
      cores: cpus.length,
      model: cpus[0]?.model || 'Unknown',
      speed: cpus[0]?.speed || 0,
      temperature: cpuTemp.main,
      loadAvg: os.loadavg().map((v) => Math.round(v * 100) / 100),
      perCore: cpuLoad.cpus.map((c) => Math.round(c.load * 100) / 100),
    },
    memory: {
      total: mem.total,
      used: mem.used,
      free: mem.free,
      available: mem.available,
      usagePercent: Math.round((mem.used / mem.total) * 10000) / 100,
      swapTotal: mem.swaptotal,
      swapUsed: mem.swapused,
    },
    system: {
      hostname: os.hostname(),
      platform: os.platform(),
      arch: os.arch(),
      osRelease: osInfo.release,
      distro: osInfo.distro,
      kernel: osInfo.kernel,
      uptime,
      uptimeFormatted: formatUptime(uptime),
    },
    timestamp: Date.now(),
  };
}

function formatUptime(seconds) {
  const d = Math.floor(seconds / 86400);
  const h = Math.floor((seconds % 86400) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  const parts = [];
  if (d > 0) parts.push(`${d}d`);
  if (h > 0) parts.push(`${h}h`);
  if (m > 0) parts.push(`${m}m`);
  parts.push(`${s}s`);
  return parts.join(' ');
}

module.exports = { collectSystemMetrics };
