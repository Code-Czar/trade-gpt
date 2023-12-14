#!/bin/bash

# Start Telegraf
telegraf --config /usr/local/etc/telegraf.conf &

# Optional: Wait for a moment to ensure Telegraf is up
sleep 5

# Start the backend server
ts-node --transpile-only src/backend-server.ts
