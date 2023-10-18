import { BACKEND_URLS, REMOTE_URL, REMOTE_WSS_URL } from 'shared';
console.log("🚀 ~ file: backendWebSocket.ts:2 ~ BACKEND_URLS:", BACKEND_URLS, REMOTE_URL, REMOTE_WSS_URL)

// const WebSocket = require('ws')
import * as WebSocket from 'ws';


export class BackendClient {
    private ws: WebSocket | null = null;
    private BACKEND_WEBSOCKET_URL: string;
    private readonly RECONNECT_INTERVAL: number = 5000;  // 5 seconds
    private isConnected: boolean = false;

    constructor(BACKEND_WEBSOCKET_URL: string = BACKEND_URLS.WEBSOCKET) {
        this.BACKEND_WEBSOCKET_URL = BACKEND_WEBSOCKET_URL;
        console.log("🚀 ~ file: backendWebSocket.ts:15 ~ BackendClient ~ constructor ~ this.BACKEND_WEBSOCKET_URL:", this.BACKEND_WEBSOCKET_URL)
        this.connect();
    }

    private connect() {
        this.ws = new WebSocket(this.BACKEND_WEBSOCKET_URL);

        this.ws.on('open', this.onOpen.bind(this));
        this.ws.on('close', this.onClose.bind(this));
        this.ws.on('message', this.onMessage.bind(this));
        this.ws.on('pong', this.onPong.bind(this));

        // Set up a ping interval for health check
        const pingInterval = setInterval(() => {
            if (this.ws && this.isConnected) {
                this.ws.ping();
            } else {
                clearInterval(pingInterval);
            }
        }, 1000);
    }

    private onOpen() {
        console.log('Connected to BE');
        this.isConnected = true;

        // Subscribe to topics
        this.subscribeToTopic('getKlines');
        this.subscribeToTopic('getRealTimeData');
    }

    private onClose() {
        console.log('Disconnected from BE');
        this.isConnected = false;

        // Attempt to reconnect after some time
        setTimeout(() => {
            console.log('Attempting to reconnect...');
            this.connect();
        }, this.RECONNECT_INTERVAL);
    }

    private onMessage(data: any) {
        const dataObject = JSON.parse(data);
        console.log(`Received data from BE: ${data}`);
        console.log(`Data Object: ${dataObject}`);
    }

    private onPong() {
        console.log('Received pong from BE');
        this.isConnected = true;
    }

    public subscribeToTopic(topic: string) {
        if (this.ws) {
            this.ws.send(JSON.stringify({ subscribe: topic }));
        }
    }

    public unsubscribeFromTopic(topic: string) {
        if (this.ws) {
            this.ws.send(JSON.stringify({ unsubscribe: topic }));
        }
    }
}

