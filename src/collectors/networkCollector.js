const si = require('systeminformation');

let prevStats = null;

/**
 * Collect network interface stats with throughput calculation
 */
async function collectNetworkMetrics() {
  const [interfaces, stats] = await Promise.all([
    si.networkInterfaces(),
    si.networkStats(),
  ]);

  const activeInterfaces = (Array.isArray(interfaces) ? interfaces : [interfaces])
    .filter((iface) => iface.operstate === 'up' || iface.ip4)
    .map((iface) => ({
      iface: iface.iface,
      ip4: iface.ip4,
      ip6: iface.ip6,
      mac: iface.mac,
      type: iface.type,
      speed: iface.speed,
      operstate: iface.operstate,
    }));

  const networkStats = (Array.isArray(stats) ? stats : [stats]).map((s) => ({
    iface: s.iface,
    rxBytes: s.rx_bytes,
    txBytes: s.tx_bytes,
    rxPerSec: Math.round(s.rx_sec || 0),
    txPerSec: Math.round(s.tx_sec || 0),
    rxDropped: s.rx_dropped,
    txDropped: s.tx_dropped,
    rxErrors: s.rx_errors,
    txErrors: s.tx_errors,
  }));

  return {
    interfaces: activeInterfaces,
    stats: networkStats,
  };
}

module.exports = { collectNetworkMetrics };
