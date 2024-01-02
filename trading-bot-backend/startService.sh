#!/bin/bash

# Check if the second argument is '--testing'
if [ "$2" == "--testing" ]; then
  export TELEGRAF_TEST_MODE="true"
  TESTING_FLAG="--testing"  # This flag is for your backend server
else
  export TELEGRAF_TEST_MODE="false"
  TESTING_FLAG=""
fi

# Start Telegraf with the environment variable set
telegraf --config /usr/local/etc/telegraf.conf &

# Optional: Wait for a moment to ensure Telegraf is up
sleep 5

# Define the log level, defaulting to 'INFO' if not set
LOG_LEVEL=${1:-INFO}

# Start the backend server with the appropriate flags
ts-node --transpile-only src/backend-server.ts --loglevel=$LOG_LEVEL $TESTING_FLAG
