/**
 * Utility formatters for the monitoring dashboard
 */
const Utils = {
  /**
   * Format bytes into human-readable string
   */
  formatBytes(bytes, decimals = 1) {
    if (!bytes || bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(decimals)) + ' ' + sizes[i];
  },

  /**
   * Format bytes per second
   */
  formatBytesPerSec(bytes) {
    return this.formatBytes(bytes) + '/s';
  },

  /**
   * Format uptime from seconds
   */
  formatUptime(seconds) {
    if (!seconds) return '--';
    const d = Math.floor(seconds / 86400);
    const h = Math.floor((seconds % 86400) / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const parts = [];
    if (d > 0) parts.push(`${d}d`);
    if (h > 0) parts.push(`${h}h`);
    parts.push(`${m}m`);
    return parts.join(' ');
  },

  /**
   * Format percentage with color class
   */
  getPercentColor(value) {
    if (value >= 90) return 'var(--accent-red)';
    if (value >= 70) return 'var(--accent-orange)';
    if (value >= 50) return 'var(--accent-yellow)';
    return 'var(--accent-green)';
  },

  /**
   * Get time label for chart axis
   */
  getTimeLabel() {
    const now = new Date();
    return now.toLocaleTimeString('en-US', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  },

  /**
   * Format timestamp to short time
   */
  formatTime(timestamp) {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  },

  /**
   * Truncate string to max length
   */
  truncate(str, max = 20) {
    if (!str) return '--';
    return str.length > max ? str.substring(0, max) + '…' : str;
  },

  /**
   * Get state badge HTML
   */
  stateBadge(state) {
    const colors = {
      running: 'var(--accent-green)',
      sleeping: 'var(--accent-cyan)',
      idle: 'var(--text-muted)',
      stopped: 'var(--accent-red)',
      zombie: 'var(--accent-orange)',
    };
    const color = colors[state] || 'var(--text-muted)';
    return `<span style="color:${color}; font-weight:500">${state || '--'}</span>`;
  },
};
