const si = require('systeminformation');

/**
 * Collect disk / filesystem usage
 */
async function collectDiskMetrics() {
  const fsSize = await si.fsSize();

  const disks = fsSize
    .filter((fs) => fs.size > 0)
    .map((fs) => ({
      fs: fs.fs,
      type: fs.type,
      mount: fs.mount,
      size: fs.size,
      used: fs.used,
      available: fs.available,
      usagePercent: Math.round(fs.use * 100) / 100,
    }));

  return { disks };
}

module.exports = { collectDiskMetrics };
