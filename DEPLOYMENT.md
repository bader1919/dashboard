# System Control Dashboard - Deployment Guide

## Quick Deployment

### Requirements
- Node.js 14+ installed on target host
- Network access to the host

### Installation Steps

1. **Copy all files to your target host:**
   ```
   dashboard.html
   dashboard.css
   dashboard.js
   server.js
   package.json
   start-dashboard.sh (optional)
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the dashboard:**
   ```bash
   # Option 1: Use npm
   npm start
   
   # Option 2: Custom port
   PORT=8080 npm start
   
   # Option 3: Use startup script
   bash start-dashboard.sh
   ```

4. **Access the dashboard:**
   - The server will display the exact URLs to use
   - Example output:
     ```
     =================================
     System Control Dashboard Started
     =================================
     Server running on port: 3000
     Host IP: 192.168.1.100
     
     Access dashboard at:
       - Local: http://localhost:3000
       - Network: http://192.168.1.100:3000
     =================================
     ```

## Network Configuration

### Firewall Settings
If you can't access the dashboard from other machines:

**Linux/Ubuntu:**
```bash
sudo ufw allow 3000
```

**CentOS/RHEL:**
```bash
sudo firewall-cmd --permanent --add-port=3000/tcp
sudo firewall-cmd --reload
```

**Windows:**
```powershell
netsh advfirewall firewall add rule name="Dashboard" dir=in action=allow protocol=TCP localport=3000
```

### Port Configuration
Change the default port by setting the PORT environment variable:
```bash
PORT=8080 npm start
```

## Production Deployment

### Using PM2 (Recommended)
```bash
# Install PM2
npm install -g pm2

# Start dashboard with PM2
pm2 start server.js --name "dashboard"

# Save PM2 configuration
pm2 save

# Set PM2 to start on boot
pm2 startup
```

### Using systemd (Linux)
Create a service file:
```bash
sudo nano /etc/systemd/system/dashboard.service
```

Content:
```ini
[Unit]
Description=System Control Dashboard
After=network.target

[Service]
Type=simple
User=your-user
WorkingDirectory=/path/to/dashboard
ExecStart=/usr/bin/node server.js
Restart=always
Environment=NODE_ENV=production
Environment=PORT=3000

[Install]
WantedBy=multi-user.target
```

Enable and start:
```bash
sudo systemctl enable dashboard
sudo systemctl start dashboard
```

## Customization

### Adding Custom Servers
Use the API to add servers to monitor:
```bash
curl -X POST http://your-host:3000/api/servers \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Web Server",
    "ip": "192.168.1.50",
    "status": "online"
  }'
```

### Environment Variables
- `PORT`: Server port (default: 3000)
- `NODE_ENV`: Environment mode (development/production)

## Troubleshooting

### Common Issues

1. **Port already in use:**
   ```bash
   lsof -ti:3000 | xargs kill -9
   ```

2. **Permission denied:**
   ```bash
   sudo chown -R $USER:$USER /path/to/dashboard
   ```

3. **Can't access from network:**
   - Check firewall settings
   - Verify the server is binding to 0.0.0.0
   - Use the network IP displayed in console

### Logs
Check server logs for debugging:
```bash
# If using PM2
pm2 logs dashboard

# If using systemd
sudo journalctl -u dashboard -f
```

## Security Notes

- Dashboard has no authentication by default
- Intended for internal network use
- For external access, consider adding authentication
- Monitor the logs for any suspicious activity

## Performance

- Updates every 5 seconds
- Automatic cleanup of old logs (keeps last 100)
- WebSocket connections for real-time updates
- Lightweight CPU and memory footprint