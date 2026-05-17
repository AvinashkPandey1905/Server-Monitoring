const thresholds = require('../config/thresholds');

/**
 * Evaluate current metrics against thresholds and return active alerts
 */
function evaluateAlerts(metrics) {
  const alerts = [];
  const now = Date.now();

  // CPU alert
  if (metrics.cpu && metrics.cpu.usage > thresholds.cpu) {
    alerts.push({
      id: `cpu-${now}`,
      severity: metrics.cpu.usage > 95 ? 'critical' : 'warning',
      type: 'CPU',
      message: `CPU usage at ${metrics.cpu.usage.toFixed(1)}% (threshold: ${thresholds.cpu}%)`,
      value: metrics.cpu.usage,
      threshold: thresholds.cpu,
      timestamp: now,
    });
  }

  // Memory alert
  if (metrics.memory && metrics.memory.usagePercent > thresholds.memory) {
    alerts.push({
      id: `mem-${now}`,
      severity: metrics.memory.usagePercent > 95 ? 'critical' : 'warning',
      type: 'Memory',
      message: `Memory usage at ${metrics.memory.usagePercent.toFixed(1)}% (threshold: ${thresholds.memory}%)`,
      value: metrics.memory.usagePercent,
      threshold: thresholds.memory,
      timestamp: now,
    });
  }

  // Disk alerts
  if (metrics.disks) {
    metrics.disks.forEach((disk) => {
      if (disk.usagePercent > thresholds.disk) {
        alerts.push({
          id: `disk-${disk.mount}-${now}`,
          severity: disk.usagePercent > 95 ? 'critical' : 'warning',
          type: 'Disk',
          message: `Disk ${disk.mount} at ${disk.usagePercent.toFixed(1)}% (threshold: ${thresholds.disk}%)`,
          value: disk.usagePercent,
          threshold: thresholds.disk,
          timestamp: now,
        });
      }
    });
  }

  return alerts;
}

module.exports = { evaluateAlerts };
