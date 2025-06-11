class SystemDashboard {
    constructor() {
        this.servers = [];
        this.applications = [];
        this.networkStats = {};
        this.alerts = [];
        this.logs = [];
        this.isConnected = false;
        this.refreshInterval = 5000;
        
        this.init();
    }

    init() {
        this.loadMockData();
        this.updateDisplay();
        this.startAutoRefresh();
        this.setupEventListeners();
    }

    loadMockData() {
        this.servers = [
            {
                id: 'srv-001',
                name: 'Web Server 01',
                ip: '192.168.1.10',
                status: 'online',
                cpu: 45,
                memory: 67,
                uptime: '15d 4h 32m'
            },
            {
                id: 'srv-002',
                name: 'Database Server',
                ip: '192.168.1.11',
                status: 'online',
                cpu: 78,
                memory: 82,
                uptime: '30d 12h 15m'
            },
            {
                id: 'srv-003',
                name: 'API Gateway',
                ip: '192.168.1.12',
                status: 'warning',
                cpu: 92,
                memory: 58,
                uptime: '7d 18h 45m'
            },
            {
                id: 'srv-004',
                name: 'Load Balancer',
                ip: '192.168.1.13',
                status: 'offline',
                cpu: 0,
                memory: 0,
                uptime: '0h 0m'
            }
        ];

        this.applications = [
            {
                id: 'app-001',
                name: 'E-commerce Frontend',
                server: 'Web Server 01',
                status: 'running',
                port: 3000,
                version: 'v2.1.3'
            },
            {
                id: 'app-002',
                name: 'User Authentication API',
                server: 'API Gateway',
                status: 'running',
                port: 8080,
                version: 'v1.5.2'
            },
            {
                id: 'app-003',
                name: 'Payment Processing',
                server: 'API Gateway',
                status: 'stopped',
                port: 8081,
                version: 'v1.2.1'
            },
            {
                id: 'app-004',
                name: 'Analytics Dashboard',
                server: 'Web Server 01',
                status: 'running',
                port: 3001,
                version: 'v1.0.8'
            },
            {
                id: 'app-005',
                name: 'MongoDB Instance',
                server: 'Database Server',
                status: 'running',
                port: 27017,
                version: 'v5.0.3'
            }
        ];

        this.networkStats = {
            latency: 45,
            bandwidth: 856,
            packetsPerSecond: 12540,
            errorRate: 0.02,
            connections: 2847
        };

        this.alerts = [
            {
                id: 'alert-001',
                type: 'critical',
                message: 'Load Balancer is offline',
                timestamp: new Date(Date.now() - 300000)
            },
            {
                id: 'alert-002',
                type: 'warning',
                message: 'API Gateway CPU usage above 90%',
                timestamp: new Date(Date.now() - 180000)
            },
            {
                id: 'alert-003',
                type: 'info',
                message: 'Payment Processing service stopped',
                timestamp: new Date(Date.now() - 120000)
            }
        ];

        this.logs = [
            { timestamp: new Date(), level: 'INFO', message: 'Dashboard initialized successfully' },
            { timestamp: new Date(Date.now() - 60000), level: 'WARN', message: 'High CPU usage detected on API Gateway' },
            { timestamp: new Date(Date.now() - 120000), level: 'ERROR', message: 'Connection lost to Load Balancer' },
            { timestamp: new Date(Date.now() - 180000), level: 'INFO', message: 'Payment Processing service stopped by admin' }
        ];

        this.isConnected = true;
    }

    updateDisplay() {
        this.updateConnectionStatus();
        this.updateServerGrid();
        this.updateApplicationList();
        this.updateNetworkStats();
        this.updateOverviewStats();
        this.updateAlerts();
        this.updateLogs();
        this.updateLastUpdateTime();
    }

    updateConnectionStatus() {
        const statusElement = document.getElementById('connectionStatus');
        const circle = statusElement.querySelector('.fa-circle');
        
        if (this.isConnected) {
            statusElement.innerHTML = '<i class="fas fa-circle"></i> Connected';
            circle.style.color = '#10b981';
        } else {
            statusElement.innerHTML = '<i class="fas fa-circle"></i> Disconnected';
            circle.style.color = '#ef4444';
        }
    }

    updateServerGrid() {
        const serverGrid = document.getElementById('serverGrid');
        serverGrid.innerHTML = '';

        this.servers.forEach(server => {
            const serverCard = document.createElement('div');
            serverCard.className = 'server-card';
            
            const statusClass = server.status === 'online' ? 'status-online' : 
                               server.status === 'offline' ? 'status-offline' : 'status-warning';
            
            const statusIcon = server.status === 'online' ? 'fa-check-circle' : 
                              server.status === 'offline' ? 'fa-times-circle' : 'fa-exclamation-triangle';

            serverCard.innerHTML = `
                <div class="server-name">${server.name}</div>
                <div class="server-status ${statusClass}">
                    <i class="fas ${statusIcon}"></i>
                    ${server.status.charAt(0).toUpperCase() + server.status.slice(1)}
                </div>
                <div class="server-metrics">
                    <div>CPU: ${server.cpu}%</div>
                    <div>Memory: ${server.memory}%</div>
                    <div>Uptime: ${server.uptime}</div>
                </div>
            `;
            
            serverGrid.appendChild(serverCard);
        });
    }

    updateApplicationList() {
        const applicationList = document.getElementById('applicationList');
        applicationList.innerHTML = '';

        this.applications.forEach(app => {
            const appItem = document.createElement('div');
            appItem.className = 'app-item';
            
            const statusClass = app.status === 'running' ? 'status-online' : 'status-offline';
            const statusIcon = app.status === 'running' ? 'fa-play-circle' : 'fa-stop-circle';

            appItem.innerHTML = `
                <div class="app-info">
                    <div class="app-name">${app.name}</div>
                    <div class="app-server">Server: ${app.server} | Port: ${app.port} | ${app.version}</div>
                </div>
                <div class="app-status ${statusClass}">
                    <i class="fas ${statusIcon}"></i>
                    ${app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                </div>
            `;
            
            applicationList.appendChild(appItem);
        });
    }

    updateNetworkStats() {
        const networkStats = document.getElementById('networkStats');
        networkStats.innerHTML = `
            <div class="network-item">
                <div class="network-value">${this.networkStats.latency}ms</div>
                <div class="network-label">Latency</div>
            </div>
            <div class="network-item">
                <div class="network-value">${this.networkStats.bandwidth}</div>
                <div class="network-label">Mbps</div>
            </div>
            <div class="network-item">
                <div class="network-value">${this.networkStats.packetsPerSecond.toLocaleString()}</div>
                <div class="network-label">Packets/sec</div>
            </div>
            <div class="network-item">
                <div class="network-value">${this.networkStats.errorRate}%</div>
                <div class="network-label">Error Rate</div>
            </div>
            <div class="network-item">
                <div class="network-value">${this.networkStats.connections.toLocaleString()}</div>
                <div class="network-label">Connections</div>
            </div>
        `;
    }

    updateOverviewStats() {
        const onlineServers = this.servers.filter(s => s.status === 'online').length;
        const runningApps = this.applications.filter(a => a.status === 'running').length;
        const avgUptime = 96.7;

        document.getElementById('totalServers').textContent = `${onlineServers}/${this.servers.length}`;
        document.getElementById('runningApps').textContent = `${runningApps}/${this.applications.length}`;
        document.getElementById('networkLatency').textContent = `${this.networkStats.latency}ms`;
        document.getElementById('uptime').textContent = `${avgUptime}%`;
    }

    updateAlerts() {
        const alertsList = document.getElementById('alertsList');
        alertsList.innerHTML = '';

        if (this.alerts.length === 0) {
            alertsList.innerHTML = '<div style="text-align: center; color: #94a3b8; padding: 20px;">No active alerts</div>';
            return;
        }

        this.alerts.forEach(alert => {
            const alertItem = document.createElement('div');
            alertItem.className = `alert-item alert-${alert.type}`;
            
            const icon = alert.type === 'critical' ? 'fa-exclamation-circle' :
                        alert.type === 'warning' ? 'fa-exclamation-triangle' : 'fa-info-circle';

            alertItem.innerHTML = `
                <i class="fas ${icon}"></i>
                <div>
                    <div>${alert.message}</div>
                    <div style="font-size: 0.8rem; opacity: 0.7; margin-top: 4px;">
                        ${this.formatTime(alert.timestamp)}
                    </div>
                </div>
            `;
            
            alertsList.appendChild(alertItem);
        });
    }

    updateLogs() {
        const logsContainer = document.getElementById('logsContainer');
        logsContainer.innerHTML = '';

        this.logs.slice(-10).reverse().forEach(log => {
            const logItem = document.createElement('div');
            logItem.className = 'log-item';
            
            logItem.innerHTML = `
                <span class="log-timestamp">[${this.formatTime(log.timestamp)}]</span>
                <span style="color: ${this.getLogLevelColor(log.level)}">[${log.level}]</span>
                ${log.message}
            `;
            
            logsContainer.appendChild(logItem);
        });
    }

    getLogLevelColor(level) {
        switch (level) {
            case 'ERROR': return '#ef4444';
            case 'WARN': return '#f59e0b';
            case 'INFO': return '#3b82f6';
            default: return '#94a3b8';
        }
    }

    formatTime(timestamp) {
        return timestamp.toLocaleTimeString('en-US', { 
            hour12: false,
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
    }

    updateLastUpdateTime() {
        document.getElementById('lastUpdate').textContent = 
            `Last Update: ${this.formatTime(new Date())}`;
    }

    simulateDataChanges() {
        this.servers.forEach(server => {
            if (server.status === 'online') {
                server.cpu = Math.max(0, Math.min(100, server.cpu + (Math.random() - 0.5) * 10));
                server.memory = Math.max(0, Math.min(100, server.memory + (Math.random() - 0.5) * 5));
            }
        });

        this.networkStats.latency = Math.max(1, this.networkStats.latency + (Math.random() - 0.5) * 10);
        this.networkStats.bandwidth = Math.max(0, this.networkStats.bandwidth + (Math.random() - 0.5) * 50);

        if (Math.random() < 0.1) {
            this.addRandomLog();
        }
    }

    addRandomLog() {
        const messages = [
            'System health check completed',
            'Backup process started',
            'User session expired',
            'Database connection pool updated',
            'Cache cleared successfully'
        ];
        
        const levels = ['INFO', 'WARN', 'ERROR'];
        const randomMessage = messages[Math.floor(Math.random() * messages.length)];
        const randomLevel = levels[Math.floor(Math.random() * levels.length)];
        
        this.logs.push({
            timestamp: new Date(),
            level: randomLevel,
            message: randomMessage
        });

        if (this.logs.length > 50) {
            this.logs = this.logs.slice(-50);
        }
    }

    startAutoRefresh() {
        setInterval(() => {
            this.simulateDataChanges();
            this.updateDisplay();
        }, this.refreshInterval);
    }

    setupEventListeners() {
        document.addEventListener('keydown', (e) => {
            if (e.key === 'F5') {
                e.preventDefault();
                this.refreshAll();
            }
        });
    }

    refreshAll() {
        this.simulateDataChanges();
        this.updateDisplay();
        this.addLog('INFO', 'Manual refresh completed');
    }

    addLog(level, message) {
        this.logs.push({
            timestamp: new Date(),
            level: level,
            message: message
        });
        
        if (this.logs.length > 50) {
            this.logs = this.logs.slice(-50);
        }
    }
}

function refreshServers() {
    dashboard.simulateDataChanges();
    dashboard.updateServerGrid();
    dashboard.updateOverviewStats();
    dashboard.addLog('INFO', 'Server status refreshed');
    dashboard.updateLogs();
}

function refreshApplications() {
    dashboard.updateApplicationList();
    dashboard.updateOverviewStats();
    dashboard.addLog('INFO', 'Application status refreshed');
    dashboard.updateLogs();
}

function refreshNetwork() {
    dashboard.simulateDataChanges();
    dashboard.updateNetworkStats();
    dashboard.updateOverviewStats();
    dashboard.addLog('INFO', 'Network status refreshed');
    dashboard.updateLogs();
}

function clearAlerts() {
    dashboard.alerts = [];
    dashboard.updateAlerts();
    dashboard.addLog('INFO', 'Alerts cleared by user');
    dashboard.updateLogs();
}

function clearLogs() {
    dashboard.logs = [];
    dashboard.updateLogs();
    dashboard.addLog('INFO', 'Logs cleared by user');
    dashboard.updateLogs();
}

let dashboard;

document.addEventListener('DOMContentLoaded', () => {
    dashboard = new SystemDashboard();
});