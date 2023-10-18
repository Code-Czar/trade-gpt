"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BackendClient = void 0;
var shared_1 = require("shared");
console.log("🚀 ~ file: backendWebSocket.ts:2 ~ BACKEND_URLS:", shared_1.BACKEND_URLS, shared_1.REMOTE_URL, shared_1.REMOTE_WSS_URL);
// const WebSocket = require('ws')
var WebSocket = require("ws");
var BackendClient = /** @class */ (function () {
    function BackendClient(BACKEND_WEBSOCKET_URL) {
        if (BACKEND_WEBSOCKET_URL === void 0) { BACKEND_WEBSOCKET_URL = shared_1.BACKEND_URLS.WEBSOCKET; }
        this.ws = null;
        this.RECONNECT_INTERVAL = 5000; // 5 seconds
        this.isConnected = false;
        this.BACKEND_WEBSOCKET_URL = BACKEND_WEBSOCKET_URL;
        console.log("🚀 ~ file: backendWebSocket.ts:15 ~ BackendClient ~ constructor ~ this.BACKEND_WEBSOCKET_URL:", this.BACKEND_WEBSOCKET_URL);
        this.connect();
    }
    BackendClient.prototype.connect = function () {
        var _this = this;
        this.ws = new WebSocket(this.BACKEND_WEBSOCKET_URL);
        this.ws.on('open', this.onOpen.bind(this));
        this.ws.on('close', this.onClose.bind(this));
        this.ws.on('message', this.onMessage.bind(this));
        this.ws.on('pong', this.onPong.bind(this));
        // Set up a ping interval for health check
        var pingInterval = setInterval(function () {
            if (_this.ws && _this.isConnected) {
                _this.ws.ping();
            }
            else {
                clearInterval(pingInterval);
            }
        }, 1000);
    };
    BackendClient.prototype.onOpen = function () {
        console.log('Connected to BE');
        this.isConnected = true;
        // Subscribe to topics
        this.subscribeToTopic('getKlines');
        this.subscribeToTopic('getRealTimeData');
    };
    BackendClient.prototype.onClose = function () {
        var _this = this;
        console.log('Disconnected from BE');
        this.isConnected = false;
        // Attempt to reconnect after some time
        setTimeout(function () {
            console.log('Attempting to reconnect...');
            _this.connect();
        }, this.RECONNECT_INTERVAL);
    };
    BackendClient.prototype.onMessage = function (data) {
        var dataObject = JSON.parse(data);
        console.log("Received data from BE: ".concat(data));
        console.log("Data Object: ".concat(dataObject));
    };
    BackendClient.prototype.onPong = function () {
        console.log('Received pong from BE');
        this.isConnected = true;
    };
    BackendClient.prototype.subscribeToTopic = function (topic) {
        if (this.ws) {
            this.ws.send(JSON.stringify({ subscribe: topic }));
        }
    };
    BackendClient.prototype.unsubscribeFromTopic = function (topic) {
        if (this.ws) {
            this.ws.send(JSON.stringify({ unsubscribe: topic }));
        }
    };
    return BackendClient;
}());
exports.BackendClient = BackendClient;