import { BACKEND_URLS } from 'trading-shared';

// const WebSocket = require('ws')
import * as WebSocket from 'ws';


export class BackendClient {
    private ws: WebSocket | null = null;
    private BACKEND_WEBSOCKET_URL: string;
    private readonly RECONNECT_INTERVAL: number = 5000;  // 5 seconds
    private isConnected: boolean = false;
    private strategyAnalyzer: any;

    constructor(strategyAnalyzer, BACKEND_WEBSOCKET_URL: string = BACKEND_URLS.WEBSOCKET) {
        this.strategyAnalyzer = strategyAnalyzer;
        this.BACKEND_WEBSOCKET_URL = BACKEND_WEBSOCKET_URL;
        global.logger.debug("🚀 ~ file: backendWebSocket.ts:15 ~ BackendClient ~ constructor ~ this.BACKEND_WEBSOCKET_URL:", this.BACKEND_WEBSOCKET_URL)
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
        global.logger.debug('Connected to BE');
        this.isConnected = true;

        // Subscribe to topics
        this.subscribeToTopic('getKlines');
        this.subscribeToTopic('getRealTimeData');
    }


    private onMessage(data: any) {
        const dataObject = JSON.parse(data);
        global.logger.debug(`Received data from BE`);
        try {
            global.logger.debug("🚀 ~ file: backendWebSocket.ts:64 ~ BackendClient ~ dataObject:", dataObject.topic)
            if (dataObject.topic === 'getRealTimeData') {
                this.strategyAnalyzer?.analyzeRSIRealTime(dataObject.data);
                this.strategyAnalyzer?.analyzeRSIPastData(dataObject.data);
                this.strategyAnalyzer?.analyzeEMAPastData(dataObject.data);
            }

        } catch (error) {
            global.logger.debug("🚀 ~ file: backendWebSocket.ts:71 ~ BackendClient ~ onMessage ~ error:", error, dataObject)

        }
    }

    private onPong() {
        global.logger.debug('Received pong from BE');
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
    private onClose() {
        global.logger.debug('Disconnected from BE');
        this.isConnected = false;

        // Attempt to reconnect after some time
        setTimeout(() => {
            global.logger.debug('Attempting to reconnect...');
            this.connect();
        }, this.RECONNECT_INTERVAL);
    }

}

