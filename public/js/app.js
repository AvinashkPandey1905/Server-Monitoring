/**
 * Main application — Socket.IO client + DOM updates
 */
(function () {
  'use strict';

  // ─── DOM References ──────────────────────────────────────
  const $ = (sel) => document.querySelector(sel);
  const $$ = (sel) => document.querySelectorAll(sel);

  const dom = {
    status: $('#connectionStatus'),
    statusText: $('.status-text'),
    uptime: $('#uptime'),
    clients: $('#clients'),
    hostname: $('#hostname'),
    // Cards
    cpuValue: $('#cpuValue'),
    cpuBar: $('#cpuBar'),
    memValue: $('#memValue'),
    memBar: $('#memBar'),
    diskValue: $('#diskValue'),
    diskBar: $('#diskBar'),
    netValue: $('#netValue'),
    netRx: $('#netRx'),
    netTx: $('#netTx'),
    // Charts meta
    cpuModel: $('#cpuModel'),
    memTotal: $('#memTotal'),
    // Process
    processBody: $('#processBody'),
    procTotal: $('#procTotal'),
    procRunning: $('#procRunning'),
    // Alerts
    alertsList: $('#alertsList'),
    alertCount: $('#alertCount'),
    // System Info
    sysOS: $('#sysOS'),
    sysKernel: $('#sysKernel'),
    sysArch: $('#sysArch'),
    sysCPU: $('#sysCPU'),
    sysCores: $('#sysCores'),
    sysRAM: $('#sysRAM'),
    sysPlatform: $('#sysPlatform'),
    sysLoad: $('#sysLoad'),
  };

  // ─── Initialize Charts ───────────────────────────────────
  const cpuChart = createCPUChart($('#cpuChart').getContext('2d'));
  const memChart = createMemoryChart($('#memChart').getContext('2d'));
  const diskChart = createDiskChart($('#diskChart').getContext('2d'));
  const netChart = createNetworkChart($('#netChart').getContext('2d'));

  // ─── Socket.IO Connection ────────────────────────────────
  const socket = io({
    reconnectionAttempts: 10,
    reconnectionDelay: 2000,
    timeout: 10000,
  });

  socket.on('connect', () => {
    dom.status.classList.remove('disconnected');
    dom.statusText.textContent = 'Connected';
    console.log('[WS] Connected to server');
  });

  socket.on('disconnect', () => {
    dom.status.classList.add('disconnected');
    dom.statusText.textContent = 'Disconnected';
    console.warn('[WS] Disconnected from server');
  });

  socket.on('connect_error', () => {
    dom.status.classList.add('disconnected');
    dom.statusText.textContent = 'Connection Error';
  });

  // ─── Metrics Handler ────────────────────────────────────
  socket.on('metrics:update', (data) => {
    updateCards(data);
    updateCharts(data);
    updateProcessTable(data.processes);
    updateAlerts(data.alerts);
    updateSystemInfo(data);
    updateHeader(data);
  });

  // ─── Update Functions ───────────────────────────────────
  function updateHeader(data) {
    if (data.system) {
      dom.uptime.textContent = data.system.uptimeFormatted || '--';
      dom.hostname.textContent = data.system.hostname || '--';
    }
    if (data.connectedClients !== undefined) {
      dom.clients.textContent = data.connectedClients;
    }
  }

  function updateCards(data) {
    // CPU
    if (data.cpu) {
      const cpuPct = data.cpu.usage.toFixed(1);
      dom.cpuValue.textContent = cpuPct + '%';
      dom.cpuValue.style.color = Utils.getPercentColor(data.cpu.usage);
      dom.cpuBar.style.width = cpuPct + '%';
    }

    // Memory
    if (data.memory) {
      const memPct = data.memory.usagePercent.toFixed(1);
      dom.memValue.textContent = memPct + '%';
      dom.memValue.style.color = Utils.getPercentColor(data.memory.usagePercent);
      dom.memBar.style.width = memPct + '%';
    }

    // Disk
    if (data.disks && data.disks.length > 0) {
      const mainDisk = data.disks[0];
      const diskPct = mainDisk.usagePercent.toFixed(1);
      dom.diskValue.textContent = diskPct + '%';
      dom.diskValue.style.color = Utils.getPercentColor(mainDisk.usagePercent);
      dom.diskBar.style.width = diskPct + '%';
    }

    // Network
    if (data.network && data.network.stats && data.network.stats.length > 0) {
      const totalRx = data.network.stats.reduce((s, n) => s + (n.rxPerSec || 0), 0);
      const totalTx = data.network.stats.reduce((s, n) => s + (n.txPerSec || 0), 0);
      dom.netValue.textContent = Utils.formatBytesPerSec(totalRx + totalTx);
      dom.netRx.textContent = Utils.formatBytesPerSec(totalRx);
      dom.netTx.textContent = Utils.formatBytesPerSec(totalTx);
    }
  }

  function updateCharts(data) {
    const label = Utils.getTimeLabel();

    // CPU
    if (data.cpu) {
      pushDataPoint(cpuChart, label, data.cpu.usage);
      dom.cpuModel.textContent = Utils.truncate(data.cpu.model, 35);
    }

    // Memory
    if (data.memory) {
      pushDataPoint(memChart, label, data.memory.used, data.memory.available);
      dom.memTotal.textContent = Utils.formatBytes(data.memory.total);
    }

    // Disk (replace data, don't push)
    if (data.disks && data.disks.length > 0) {
      diskChart.data.labels = data.disks.map((d) => d.mount);
      diskChart.data.datasets[0].data = data.disks.map((d) => d.used);
      diskChart.data.datasets[1].data = data.disks.map((d) => d.available);
      diskChart.update('none');
    }

    // Network
    if (data.network && data.network.stats && data.network.stats.length > 0) {
      const totalRx = data.network.stats.reduce((s, n) => s + (n.rxPerSec || 0), 0);
      const totalTx = data.network.stats.reduce((s, n) => s + (n.txPerSec || 0), 0);
      pushDataPoint(netChart, label, totalRx, totalTx);
    }
  }

  function updateProcessTable(processes) {
    if (!processes) return;

    dom.procTotal.textContent = processes.total || 0;
    dom.procRunning.textContent = processes.running || 0;

    if (!processes.topProcesses || processes.topProcesses.length === 0) {
      dom.processBody.innerHTML =
        '<tr><td colspan="6" class="empty-state">No processes</td></tr>';
      return;
    }

    dom.processBody.innerHTML = processes.topProcesses
      .map(
        (p) => `
      <tr>
        <td>${p.pid}</td>
        <td>${Utils.truncate(p.name, 25)}</td>
        <td style="color:${Utils.getPercentColor(p.cpu)}">${p.cpu.toFixed(1)}%</td>
        <td style="color:${Utils.getPercentColor(p.mem)}">${p.mem.toFixed(1)}%</td>
        <td>${Utils.stateBadge(p.state)}</td>
        <td>${Utils.truncate(p.user, 12)}</td>
      </tr>`
      )
      .join('');
  }

  function updateAlerts(alerts) {
    if (!alerts || alerts.length === 0) {
      dom.alertCount.textContent = '0';
      dom.alertCount.classList.remove('has-alerts');
      dom.alertsList.innerHTML = `
        <div class="empty-state">
          <i class="fas fa-check-circle"></i>
          <p>All systems nominal</p>
        </div>`;
      return;
    }

    dom.alertCount.textContent = alerts.length;
    dom.alertCount.classList.add('has-alerts');

    dom.alertsList.innerHTML = alerts
      .map(
        (a) => `
      <div class="alert-item ${a.severity}">
        <i class="fas ${a.severity === 'critical' ? 'fa-circle-exclamation' : 'fa-triangle-exclamation'}"></i>
        <div>
          <div class="alert-msg">${a.message}</div>
          <div class="alert-time">${Utils.formatTime(a.timestamp)}</div>
        </div>
      </div>`
      )
      .join('');
  }

  function updateSystemInfo(data) {
    if (!data.system) return;
    const sys = data.system;
    const cpu = data.cpu;
    const mem = data.memory;

    dom.sysOS.textContent = sys.distro || sys.platform || '--';
    dom.sysKernel.textContent = Utils.truncate(sys.kernel, 25) || '--';
    dom.sysArch.textContent = sys.arch || '--';
    dom.sysCPU.textContent = Utils.truncate(cpu?.model, 30) || '--';
    dom.sysCores.textContent = cpu?.cores || '--';
    dom.sysRAM.textContent = mem ? Utils.formatBytes(mem.total) : '--';
    dom.sysPlatform.textContent = sys.platform || '--';
    dom.sysLoad.textContent = cpu?.loadAvg ? cpu.loadAvg.join(' / ') : '--';
  }
})();
