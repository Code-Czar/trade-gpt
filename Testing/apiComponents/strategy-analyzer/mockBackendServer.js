const express = require('express');
const http = require('http');
const WebSocket = require('ws');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server, path: '/ws'  });

// WebSocket server to manage connected clients
wss.on('connection', (ws) => {
  console.log('Client connected');

  // Listen for messages from connected clients
  ws.on('message', (message) => {
    console.log(`Received message: ${message}`);
  });

  // Handle client disconnection
  ws.on('close', () => {
    console.log('Client disconnected');
  });
});

// Middleware to parse JSON in POST requests
app.use(express.json());

// Route to receive data from POST requests and send it to WebSocket clients
app.post('/sendDataToStrategyAnalyzer', (req, res) => {
  const data = req.body;

  // Send the data to all connected WebSocket clients
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(data));
    }
  });

  res.status(200).json({ message: 'Data sent to Strategy Analyzer' });
});

// Start the HTTP server on port 3000
server.listen(3000, () => {
  console.log('Express app listening on port 3000');
});

