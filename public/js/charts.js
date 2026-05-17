/**
 * Chart.js configurations for the monitoring dashboard
 */

const MAX_DATA_POINTS = 60;

const chartDefaults = {
  responsive: true,
  maintainAspectRatio: false,
  animation: { duration: 400, easing: 'easeOutQuart' },
  interaction: { mode: 'index', intersect: false },
  plugins: {
    legend: {
      display: true,
      position: 'top',
      align: 'end',
      labels: {
        color: '#8892a4',
        font: { family: "'Inter', sans-serif", size: 10 },
        boxWidth: 8,
        boxHeight: 8,
        borderRadius: 2,
        padding: 12,
        usePointStyle: true,
        pointStyle: 'circle',
      },
    },
    tooltip: {
      backgroundColor: 'rgba(15, 20, 37, 0.95)',
      titleColor: '#e8eaf0',
      bodyColor: '#8892a4',
      borderColor: 'rgba(255,255,255,0.1)',
      borderWidth: 1,
      cornerRadius: 8,
      padding: 10,
      titleFont: { family: "'Inter', sans-serif", size: 11, weight: '600' },
      bodyFont: { family: "'JetBrains Mono', monospace", size: 11 },
      displayColors: true,
      boxWidth: 8,
      boxHeight: 8,
      boxPadding: 4,
    },
  },
  scales: {
    x: {
      grid: { color: 'rgba(255,255,255,0.03)', drawBorder: false },
      ticks: { color: '#5a6478', font: { family: "'JetBrains Mono', monospace", size: 9 }, maxTicksLimit: 8 },
      border: { display: false },
    },
    y: {
      grid: { color: 'rgba(255,255,255,0.03)', drawBorder: false },
      ticks: { color: '#5a6478', font: { family: "'JetBrains Mono', monospace", size: 9 } },
      border: { display: false },
      min: 0,
    },
  },
};

// ─── CPU Chart ───────────────────────────────────────────────
function createCPUChart(ctx) {
  return new Chart(ctx, {
    type: 'line',
    data: {
      labels: [],
      datasets: [{
        label: 'CPU %',
        data: [],
        borderColor: '#00d4ff',
        backgroundColor: 'rgba(0, 212, 255, 0.08)',
        fill: true,
        tension: 0.4,
        borderWidth: 2,
        pointRadius: 0,
        pointHitRadius: 10,
      }],
    },
    options: {
      ...chartDefaults,
      scales: {
        ...chartDefaults.scales,
        y: { ...chartDefaults.scales.y, max: 100, ticks: { ...chartDefaults.scales.y.ticks, callback: (v) => v + '%' } },
      },
    },
  });
}

// ─── Memory Chart ────────────────────────────────────────────
function createMemoryChart(ctx) {
  return new Chart(ctx, {
    type: 'line',
    data: {
      labels: [],
      datasets: [
        {
          label: 'Used',
          data: [],
          borderColor: '#b388ff',
          backgroundColor: 'rgba(179, 136, 255, 0.08)',
          fill: true,
          tension: 0.4,
          borderWidth: 2,
          pointRadius: 0,
        },
        {
          label: 'Available',
          data: [],
          borderColor: '#00e676',
          backgroundColor: 'rgba(0, 230, 118, 0.05)',
          fill: true,
          tension: 0.4,
          borderWidth: 1.5,
          pointRadius: 0,
          borderDash: [4, 4],
        },
      ],
    },
    options: {
      ...chartDefaults,
      scales: {
        ...chartDefaults.scales,
        y: {
          ...chartDefaults.scales.y,
          ticks: { ...chartDefaults.scales.y.ticks, callback: (v) => Utils.formatBytes(v, 0) },
        },
      },
    },
  });
}

// ─── Disk Chart ──────────────────────────────────────────────
function createDiskChart(ctx) {
  return new Chart(ctx, {
    type: 'bar',
    data: {
      labels: [],
      datasets: [
        {
          label: 'Used',
          data: [],
          backgroundColor: 'rgba(255, 145, 0, 0.7)',
          borderColor: '#ff9100',
          borderWidth: 1,
          borderRadius: 4,
        },
        {
          label: 'Available',
          data: [],
          backgroundColor: 'rgba(0, 230, 118, 0.3)',
          borderColor: '#00e676',
          borderWidth: 1,
          borderRadius: 4,
        },
      ],
    },
    options: {
      ...chartDefaults,
      scales: {
        ...chartDefaults.scales,
        x: { ...chartDefaults.scales.x, stacked: true },
        y: {
          ...chartDefaults.scales.y,
          stacked: true,
          ticks: { ...chartDefaults.scales.y.ticks, callback: (v) => Utils.formatBytes(v, 0) },
        },
      },
    },
  });
}

// ─── Network Chart ───────────────────────────────────────────
function createNetworkChart(ctx) {
  return new Chart(ctx, {
    type: 'line',
    data: {
      labels: [],
      datasets: [
        {
          label: 'Download',
          data: [],
          borderColor: '#00e676',
          backgroundColor: 'rgba(0, 230, 118, 0.06)',
          fill: true,
          tension: 0.4,
          borderWidth: 2,
          pointRadius: 0,
        },
        {
          label: 'Upload',
          data: [],
          borderColor: '#ff9100',
          backgroundColor: 'rgba(255, 145, 0, 0.06)',
          fill: true,
          tension: 0.4,
          borderWidth: 2,
          pointRadius: 0,
        },
      ],
    },
    options: {
      ...chartDefaults,
      scales: {
        ...chartDefaults.scales,
        y: {
          ...chartDefaults.scales.y,
          ticks: { ...chartDefaults.scales.y.ticks, callback: (v) => Utils.formatBytesPerSec(v) },
        },
      },
    },
  });
}

/**
 * Push data point and trim to max
 */
function pushDataPoint(chart, label, ...values) {
  chart.data.labels.push(label);
  values.forEach((val, i) => {
    if (chart.data.datasets[i]) {
      chart.data.datasets[i].data.push(val);
    }
  });

  // Trim old data
  while (chart.data.labels.length > MAX_DATA_POINTS) {
    chart.data.labels.shift();
    chart.data.datasets.forEach((ds) => ds.data.shift());
  }

  chart.update('none');
}
