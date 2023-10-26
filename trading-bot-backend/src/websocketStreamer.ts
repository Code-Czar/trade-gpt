import { Server as WebSocketServer } from 'ws';

export class WebsocketStreamer {
    private websocket;
    private clients: Set<WebSocket> = new Set();
    private subscriptions: Map<string, Set<WebSocket>> = new Map();

    constructor(server: any) {
        global.logger.info("🚀 ~ file: websocketStreamer.ts:9 ~ WebsocketStreamer ~ constructor ~ server:", server)
        this.websocket = new WebSocketServer({ server, path: '/ws' });

        this.websocket.on('connection', (ws: WebSocket) => {
            global.logger.info('SA connected');
            this.clients.add(ws);

            ws.on('message', (message: string) => {
                const data = JSON.parse(message);
                global.logger.info('Received:', data);
                if (data.subscribe) {
                    if (!this.subscriptions.has(data.subscribe)) {
                        this.subscriptions.set(data.subscribe, new Set());
                    }
                    this.subscriptions.get(data.subscribe)?.add(ws);
                } else if (data.unsubscribe) {
                    this.subscriptions.get(data.unsubscribe)?.delete(ws);
                }
            });

            ws.on('close', () => {
                global.logger.info('SA disconnected');
                this.clients.delete(ws);
                // Remove this client from all subscriptions
                for (let [, clientSet] of this.subscriptions) {
                    clientSet.delete(ws);
                }
            });
        });

        // Ping clients every 1 second to keep the connection alive
        setInterval(() => {
            this.clients.forEach((ws: WebSocket) => {
                ws.ping();
            });
        }, 1000);
    }

    // Function to broadcast data to all clients subscribed to a particular topic
    broadcast(topic: string, data: any) {
        const subscribers = this.subscriptions.get(topic);
        subscribers?.forEach((ws: WebSocket) => {
            ws.send(JSON.stringify({ topic, data: data }));
        });
    }

    getWebSocket() {
        return this.websocket;
    }
}
