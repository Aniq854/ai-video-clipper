#!/bin/bash

# Start warp-plus in the background
echo "Starting warp-plus tunnel..."
./warp-plus --bind 127.0.0.1:8086 &
WARP_PID=$!

# Wait for it to connect
echo "Waiting 5 seconds for WARP to connect..."
sleep 5

# Check if tunnel is working
echo "Health Check: Testing WARP Proxy connection..."
curl -s --socks5 127.0.0.1:8086 https://cloudflare.com/cdn-cgi/trace | grep warp=
if [ $? -eq 0 ]; then
    echo "✅ WARP Tunnel is successfully connected and routing traffic!"
else
    echo "❌ WARP Tunnel failed to connect or time out."
fi

# Start the main Node.js server
echo "Starting backend server..."
node src/app.js
