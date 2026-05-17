const si = require('systeminformation');

/**
 * Collect top processes sorted by CPU usage
 */
async function collectProcessMetrics() {
  const procs = await si.processes();

  const topByCPU = procs.list
    .sort((a, b) => b.cpu - a.cpu)
    .slice(0, 10)
    .map((p) => ({
      pid: p.pid,
      name: p.name,
      cpu: Math.round(p.cpu * 100) / 100,
      mem: Math.round(p.mem * 100) / 100,
      memVsz: p.memVsz,
      memRss: p.memRss,
      state: p.state,
      user: p.user,
      started: p.started,
      command: p.command?.substring(0, 80),
    }));

  return {
    total: procs.all,
    running: procs.running,
    blocked: procs.blocked,
    sleeping: procs.sleeping,
    topProcesses: topByCPU,
  };
}

module.exports = { collectProcessMetrics };
