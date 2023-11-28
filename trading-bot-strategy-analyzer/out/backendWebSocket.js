"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BackendClient = void 0;
var trading_shared_1 = require("trading-shared");
// const WebSocket = require('ws')
var WebSocket = require("ws");
var BackendClient = /** @class */ (function () {
    function BackendClient(strategyAnalyzer, BACKEND_WEBSOCKET_URL) {
        if (BACKEND_WEBSOCKET_URL === void 0) { BACKEND_WEBSOCKET_URL = trading_shared_1.BACKEND_URLS.WEBSOCKET; }
        this.ws = null;
        this.RECONNECT_INTERVAL = 5000; // 5 seconds
        this.isConnected = false;
        this.strategyAnalyzer = strategyAnalyzer;
        this.BACKEND_WEBSOCKET_URL = BACKEND_WEBSOCKET_URL;
        global.logger.debug("🚀 ~ file: backendWebSocket.ts:15 ~ BackendClient ~ constructor ~ this.BACKEND_WEBSOCKET_URL:", this.BACKEND_WEBSOCKET_URL);
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
        global.logger.debug('Connected to BE');
        this.isConnected = true;
        // Subscribe to topics
        this.subscribeToTopic('getKlines');
        this.subscribeToTopic('getRealTimeData');
    };
    BackendClient.prototype.onMessage = function (data) {
        var _a, _b, _c;
        var dataObject = JSON.parse(data);
        global.logger.debug("Received data from BE");
        try {
            global.logger.debug("🚀 ~ file: backendWebSocket.ts:64 ~ BackendClient ~ dataObject:", dataObject.topic);
            if (dataObject.topic === 'getRealTimeData') {
                (_a = this.strategyAnalyzer) === null || _a === void 0 ? void 0 : _a.analyzeRSIRealTime(dataObject.data);
                (_b = this.strategyAnalyzer) === null || _b === void 0 ? void 0 : _b.analyzeRSIPastData(dataObject.data);
                (_c = this.strategyAnalyzer) === null || _c === void 0 ? void 0 : _c.analyzeEMAPastData(dataObject.data);
            }
        }
        catch (error) {
            global.logger.debug("🚀 ~ file: backendWebSocket.ts:71 ~ BackendClient ~ onMessage ~ error:", error, dataObject);
        }
    };
    BackendClient.prototype.onPong = function () {
        global.logger.debug('Received pong from BE');
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
    BackendClient.prototype.onClose = function () {
        var _this = this;
        global.logger.debug('Disconnected from BE');
        this.isConnected = false;
        // Attempt to reconnect after some time
        setTimeout(function () {
            global.logger.debug('Attempting to reconnect...');
            _this.connect();
        }, this.RECONNECT_INTERVAL);
    };
    return BackendClient;
}());
exports.BackendClient = BackendClient;
