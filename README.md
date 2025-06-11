# System Control Dashboard

A comprehensive control room-style dashboard for monitoring applications, servers, and network status in real-time.

## Features

🖥️ **Server Monitoring**
- Real-time server status tracking
- CPU and memory usage monitoring
- Server uptime tracking
- Visual status indicators

🚀 **Application Management**
- Track running applications across servers
- Monitor application status and ports
- Process detection and monitoring

🌐 **Network Status**
- Network latency monitoring
- Bandwidth tracking
- Connection statistics
- Error rate monitoring

📊 **System Overview**
- Consolidated system statistics
- Real-time performance metrics
- Uptime monitoring

🚨 **Alerts & Logging**
- Automated alert generation
- Real-time system logs
- Alert management and clearing

⚡ **Real-time Updates**
- WebSocket-based live updates
- Auto-refresh functionality
- Manual refresh options

## Quick Start

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Start the Server**
   ```bash
   # Option 1: Use the startup script (recommended for WSL2)
   bash start-dashboard.sh
   
   # Option 2: Use npm
   PORT=3001 npm start
   ```

3. **Open Dashboard**
   - **WSL2 Users**: Navigate to `http://172.19.18.183:3001` in your Windows browser
   - **Linux/Mac**: Navigate to `http://localhost:3001` in your browser

## WSL2 Troubleshooting

If you're using WSL2 and can't access the dashboard:

1. **Use the WSL2 IP Address**
   ```bash
   # Get your WSL2 IP
   hostname -I | awk '{print $1}'
   # Use this IP in your browser: http://YOUR_WSL2_IP:3001
   ```

2. **Windows Firewall**
   - The Windows Firewall might block the connection
   - Try temporarily disabling it or adding an exception for Node.js

3. **Port Forwarding (Alternative)**
   ```bash
   # Forward port from Windows to WSL2
   netsh interface portproxy add v4tov4 listenport=3001 listenaddress=0.0.0.0 connectport=3001 connectaddress=172.19.18.183
   ```

## Development Mode

For development with auto-restart:
```bash
npm run dev
```

## Dashboard Layout

The dashboard features a control room-style interface with:

- **Header**: Connection status and last update time
- **Server Panel**: Grid view of all monitored servers
- **Applications Panel**: List of running applications
- **Network Panel**: Network performance metrics
- **Overview Panel**: System-wide statistics
- **Alerts Panel**: Critical system alerts
- **Logs Panel**: Real-time system logs

## API Endpoints

- `GET /api/servers` - Get all servers
- `GET /api/applications` - Get all applications
- `GET /api/network` - Get network statistics
- `GET /api/alerts` - Get system alerts
- `GET /api/logs` - Get system logs
- `GET /api/system-info` - Get system information
- `POST /api/servers` - Add a new server
- `POST /api/applications` - Add a new application
- `DELETE /api/alerts/:id` - Delete an alert

## WebSocket Events

- `initialData` - Initial data load
- `dataUpdate` - Real-time data updates
- `refresh` - Manual refresh trigger

## Customization

### Adding Custom Servers

To monitor additional servers, use the API:

```javascript
fetch('/api/servers', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: 'Custom Server',
    ip: '192.168.1.100',
    status: 'online'
  })
});
```

### Styling

The dashboard uses CSS custom properties for theming. Modify `dashboard.css` to customize:

- Color scheme
- Layout dimensions
- Animation effects
- Font preferences

### Data Collection

The server automatically detects:
- Running processes (Node.js, Python, Java, Nginx, Apache)
- System metrics (CPU, Memory, Network)
- Network connectivity and latency

## Browser Support

- Chrome/Chromium 80+
- Firefox 75+
- Safari 13+
- Edge 80+

## Performance

- Updates every 5 seconds
- WebSocket for real-time communication
- Efficient data broadcasting
- Automatic cleanup of old logs

## Security Notes

- Dashboard intended for internal network use
- No authentication implemented by default
- Consider adding authentication for production use

## Troubleshooting

**Port Already in Use**
```bash
lsof -ti:3000 | xargs kill -9
```

**Permission Errors**
- Ensure Node.js has proper permissions
- Run with appropriate user privileges

**Network Issues**
- Check firewall settings
- Verify network connectivity
- Test with `telnet localhost 3000`

## License

MIT License - see LICENSE file for details