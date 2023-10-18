export class WebsocketStreamer {
    private websocket: any;
    private clients: Set<any>;
    private subscriptions: Map<string, Set<any>>;

    constructor(webSocket) {
        this.websocket = webSocket;
        this.clients = new Set();
        this.subscriptions = new Map();

        this.websocket.on('connection', (ws) => {
            console.log('Client connected');
            this.clients.add(ws);

            // Ping/Pong mechanism every 1 second
            const pingInterval = setInterval(() => {
                ws.ping();
            }, 1000);

            ws.on('pong', () => {
                console.log('Pong received');
            });

            ws.on('message', (message) => {
                const data = JSON.parse(message);
                switch (data.type) {
                    case 'subscribe':
                        this.subscribeClient(ws, data.topic);
                        break;
                    case 'unsubscribe':
                        this.unsubscribeClient(ws, data.topic);
                        break;
                    default:
                        console.log('Received:', message);
                        break;
                }
            });

            ws.on('close', () => {
                console.log('Client disconnected');
                this.clients.delete(ws);
                clearInterval(pingInterval);
                this.unsubscribeClientFromAllTopics(ws);
            });
        });
    }

    subscribeClient(client, topic) {
        if (!this.subscriptions.has(topic)) {
            this.subscriptions.set(topic, new Set());
        }
        this.subscriptions.get(topic).add(client);
    }

    unsubscribeClient(client, topic) {
        if (this.subscriptions.has(topic)) {
            this.subscriptions.get(topic).delete(client);
        }
    }

    unsubscribeClientFromAllTopics(client) {
        for (const clientSet of this.subscriptions.values()) {
            clientSet.delete(client);
        }
    }

    notifyTopic(topic, data) {
        if (this.subscriptions.has(topic)) {
            const clients = this.subscriptions.get(topic);
            clients.forEach(client => {
                client.send(JSON.stringify({ type: topic, data }));
            });
        }
    }

    getWebSocket() {
        return this.websocket;
    }
}
