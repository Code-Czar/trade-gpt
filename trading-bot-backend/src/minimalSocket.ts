const express = require('express');
const http = require('http');
const WebSocket = require('ws');

const app = express();
const cors = require('cors');
const bodyParser = require('body-parser')

app.use(bodyParser.json());

// Enable CORS
app.use(cors());

// Create an HTTP server by hand for WebSocket server to use later.
const server = http.createServer(app);

// Create a WebSocket server by passing the HTTP server instance to WebSocket.Server.
const wss = new WebSocket.Server({ server, path: '/ws' });

// Set up a connection listener to handle incoming WebSocket connections.
wss.on('connection', (ws) => {
    global.logger.info('Client connected');

    // Send a welcome message to the newly connected client.
    ws.send('Welcome to the WebSocket server!');

    // Set up a message listener on this connection to receive messages from the client.
    ws.on('message', (message) => {
        global.logger.info(`Received message: ${message}`);
    });
});

app.get('/', (req, res) => {
    res.send('Hello from Express!');
});

const PORT = 3000;
server.listen(PORT, () => {
    global.logger.info(`Server is running on http://localhost:${PORT}`);
});
