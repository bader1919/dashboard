const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const os = require('os');
const { exec } = require('child_process');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

const PORT = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname)));
app.use(express.json());

let systemData = {
    servers: [],
    applications: [],
    networkStats: {},
    alerts: [],
    logs: []
};

class DashboardServer {
    constructor() {
        this.init();
        this.startDataCollection();
    }

    init() {
        console.log('Initializing Dashboard Server...');
        this.setupRoutes();
        this.setupWebSocket();
        this.loadInitialData();
        console.log('Dashboard Server initialized successfully');
    }

    setupRoutes() {
        app.get('/', (req, res) => {
            res.sendFile(path.join(__dirname, 'dashboard.html'));
        });

        app.get('/api/servers', (req, res) => {
            res.json(systemData.servers);
        });

        app.get('/api/applications', (req, res) => {
            res.json(systemData.applications);
        });

        app.get('/api/network', (req, res) => {
            res.json(systemData.networkStats);
        });

        app.get('/api/alerts', (req, res) => {
            res.json(systemData.alerts);
        });

        app.get('/api/logs', (req, res) => {
            res.json(systemData.logs.slice(-50));
        });

        app.get('/api/system-info', (req, res) => {
            res.json({
                hostname: os.hostname(),
                platform: os.platform(),
                arch: os.arch(),
                cpus: os.cpus().length,
                totalMemory: os.totalmem(),
                freeMemory: os.freemem(),
                uptime: os.uptime()
            });
        });

        app.post('/api/servers', (req, res) => {
            const server = {
                id: `srv-${Date.now()}`,
                ...req.body,
                lastUpdated: new Date()
            };
            systemData.servers.push(server);
            this.broadcastUpdate('servers', systemData.servers);
            res.json(server);
        });

        app.post('/api/applications', (req, res) => {
            const application = {
                id: `app-${Date.now()}`,
                ...req.body,
                lastUpdated: new Date()
            };
            systemData.applications.push(application);
            this.broadcastUpdate('applications', systemData.applications);
            res.json(application);
        });

        app.delete('/api/alerts/:id', (req, res) => {
            systemData.alerts = systemData.alerts.filter(alert => alert.id !== req.params.id);
            this.broadcastUpdate('alerts', systemData.alerts);
            res.json({ success: true });
        });
    }

    setupWebSocket() {
        io.on('connection', (socket) => {
            console.log('Client connected:', socket.id);
            
            socket.emit('initialData', systemData);

            socket.on('refresh', () => {
                this.collectSystemData();
                socket.emit('dataUpdate', systemData);
            });

            socket.on('disconnect', () => {
                console.log('Client disconnected:', socket.id);
            });
        });
    }

    loadInitialData() {
        systemData.servers = [
            {
                id: 'local-server',
                name: os.hostname(),
                ip: this.getLocalIP(),
                status: 'online',
                cpu: 0,
                memory: 0,
                uptime: this.formatUptime(os.uptime())
            }
        ];

        this.addLog('INFO', 'Dashboard server started');
        this.collectSystemData();
    }

    async collectSystemData() {
        try {
            console.log('Collecting system data...');
            await this.updateSystemMetrics();
            await this.checkRunningProcesses();
            await this.checkNetworkStats();
            this.broadcastUpdate('all', systemData);
            console.log('System data collection completed');
        } catch (error) {
            console.error('Data collection error:', error);
            this.addLog('ERROR', `Data collection failed: ${error.message}`);
        }
    }

    async updateSystemMetrics() {
        const cpuUsage = await this.getCPUUsage();
        const memoryUsage = this.getMemoryUsage();

        systemData.servers = systemData.servers.map(server => {
            if (server.id === 'local-server') {
                return {
                    ...server,
                    cpu: cpuUsage,
                    memory: memoryUsage,
                    uptime: this.formatUptime(os.uptime()),
                    lastUpdated: new Date()
                };
            }
            return server;
        });
    }

    getCPUUsage() {
        return new Promise((resolve) => {
            const startMeasure = os.cpus();
            
            setTimeout(() => {
                const endMeasure = os.cpus();
                let totalIdle = 0;
                let totalTick = 0;

                for (let i = 0; i < startMeasure.length; i++) {
                    const startTotal = Object.values(startMeasure[i].times).reduce((a, b) => a + b);
                    const endTotal = Object.values(endMeasure[i].times).reduce((a, b) => a + b);
                    
                    const idle = endMeasure[i].times.idle - startMeasure[i].times.idle;
                    const total = endTotal - startTotal;
                    
                    totalIdle += idle;
                    totalTick += total;
                }

                const usage = 100 - Math.round((totalIdle / totalTick) * 100);
                resolve(Math.max(0, Math.min(100, usage)));
            }, 100);
        });
    }

    getMemoryUsage() {
        const total = os.totalmem();
        const free = os.freemem();
        const used = total - free;
        return Math.round((used / total) * 100);
    }

    async checkRunningProcesses() {
        return new Promise((resolve) => {
            exec('ps aux', (error, stdout) => {
                if (error) {
                    resolve();
                    return;
                }

                const processes = stdout.split('\n').slice(1)
                    .filter(line => line.trim())
                    .map(line => {
                        const parts = line.trim().split(/\s+/);
                        return {
                            pid: parts[1],
                            cpu: parseFloat(parts[2]),
                            memory: parseFloat(parts[3]),
                            command: parts.slice(10).join(' ')
                        };
                    })
                    .filter(proc => proc.cpu > 0 || proc.memory > 1)
                    .slice(0, 10);

                const detectedApps = processes
                    .filter(proc => 
                        proc.command.includes('node') || 
                        proc.command.includes('python') ||
                        proc.command.includes('java') ||
                        proc.command.includes('nginx') ||
                        proc.command.includes('apache')
                    )
                    .map(proc => ({
                        id: `proc-${proc.pid}`,
                        name: this.extractAppName(proc.command),
                        server: os.hostname(),
                        status: 'running',
                        pid: proc.pid,
                        cpu: proc.cpu,
                        memory: proc.memory
                    }));

                systemData.applications = [
                    ...systemData.applications.filter(app => !app.id.startsWith('proc-')),
                    ...detectedApps
                ];

                resolve();
            });
        });
    }

    extractAppName(command) {
        if (command.includes('node')) return 'Node.js Application';
        if (command.includes('python')) return 'Python Application';
        if (command.includes('java')) return 'Java Application';
        if (command.includes('nginx')) return 'Nginx Server';
        if (command.includes('apache')) return 'Apache Server';
        return 'Unknown Process';
    }

    async checkNetworkStats() {
        return new Promise((resolve) => {
            exec('ping -c 1 google.com', (error, stdout) => {
                let latency = 0;
                if (!error && stdout.includes('time=')) {
                    const match = stdout.match(/time=(\d+\.?\d*)/);
                    if (match) {
                        latency = parseFloat(match[1]);
                    }
                }

                systemData.networkStats = {
                    latency: latency,
                    bandwidth: Math.floor(Math.random() * 1000) + 500,
                    packetsPerSecond: Math.floor(Math.random() * 10000) + 5000,
                    errorRate: Math.random() * 0.1,
                    connections: Math.floor(Math.random() * 1000) + 1000,
                    lastUpdated: new Date()
                };

                resolve();
            });
        });
    }

    getLocalIP() {
        const interfaces = os.networkInterfaces();
        for (const name of Object.keys(interfaces)) {
            for (const iface of interfaces[name]) {
                if (iface.family === 'IPv4' && !iface.internal) {
                    return iface.address;
                }
            }
        }
        return '127.0.0.1';
    }

    formatUptime(seconds) {
        const days = Math.floor(seconds / 86400);
        const hours = Math.floor((seconds % 86400) / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        return `${days}d ${hours}h ${minutes}m`;
    }

    addLog(level, message) {
        const log = {
            id: `log-${Date.now()}`,
            timestamp: new Date(),
            level: level,
            message: message
        };

        systemData.logs.push(log);
        
        if (systemData.logs.length > 100) {
            systemData.logs = systemData.logs.slice(-100);
        }

        this.broadcastUpdate('logs', systemData.logs.slice(-50));
    }

    addAlert(type, message) {
        const alert = {
            id: `alert-${Date.now()}`,
            type: type,
            message: message,
            timestamp: new Date()
        };

        systemData.alerts.push(alert);
        this.broadcastUpdate('alerts', systemData.alerts);
        this.addLog('WARN', `Alert generated: ${message}`);
    }

    broadcastUpdate(type, data) {
        io.emit('dataUpdate', { type, data });
    }

    startDataCollection() {
        setInterval(() => {
            this.collectSystemData();
        }, 5000);

        setInterval(() => {
            this.checkForAlerts();
        }, 10000);
    }

    checkForAlerts() {
        systemData.servers.forEach(server => {
            if (server.cpu > 90) {
                this.addAlert('critical', `High CPU usage on ${server.name}: ${server.cpu}%`);
            }
            if (server.memory > 95) {
                this.addAlert('critical', `High memory usage on ${server.name}: ${server.memory}%`);
            }
        });

        if (systemData.networkStats.latency > 100) {
            this.addAlert('warning', `High network latency: ${systemData.networkStats.latency}ms`);
        }
    }
}

const dashboardServer = new DashboardServer();

function getServerIP() {
    const interfaces = os.networkInterfaces();
    for (const name of Object.keys(interfaces)) {
        for (const iface of interfaces[name]) {
            if (iface.family === 'IPv4' && !iface.internal) {
                return iface.address;
            }
        }
    }
    return '0.0.0.0';
}

const serverIP = getServerIP();

server.listen(PORT, '0.0.0.0', () => {
    console.log('\n=================================');
    console.log('System Control Dashboard Started');
    console.log('=================================');
    console.log(`Server running on port: ${PORT}`);
    console.log(`Host IP: ${serverIP}`);
    console.log('\nAccess dashboard at:');
    console.log(`  - Local: http://localhost:${PORT}`);
    console.log(`  - Network: http://${serverIP}:${PORT}`);
    console.log('\n=================================\n');
}).on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
        console.error(`Port ${PORT} is already in use. Trying port ${PORT + 1}...`);
        server.listen(PORT + 1, '0.0.0.0', () => {
            console.log(`Dashboard server running on port ${PORT + 1}`);
            console.log(`Network access: http://${serverIP}:${PORT + 1}`);
        });
    } else {
        console.error('Server error:', err);
        process.exit(1);
    }
});