module.exports = {
  cpu: parseInt(process.env.ALERT_CPU_THRESHOLD) || 80,
  memory: parseInt(process.env.ALERT_MEMORY_THRESHOLD) || 85,
  disk: parseInt(process.env.ALERT_DISK_THRESHOLD) || 90,
  network: {
    rxPerSec: 100 * 1024 * 1024, // 100 MB/s
    txPerSec: 100 * 1024 * 1024,
  },
};
