"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BACKEND_URLS = exports.BACKEND_ENDPOINTS = exports.PROJECT_URLS = exports.SERVER_PORTS = exports.REMOTE_WSS_URL = exports.REMOTE_URL = void 0;
var dotenv = require('dotenv');
var path = require('path');
var dotenvPath = path.resolve(__dirname, '.env_shared');
dotenv.config({ path: dotenvPath });
console.log("Current directory LIBRARY :", dotenvPath);
exports.REMOTE_URL = 'https://' + process.env.REMOTE_URL;
exports.REMOTE_WSS_URL = 'wss://' + process.env.REMOTE_URL;
exports.SERVER_PORTS = {
    BACKEND_PORT: 3000,
    STRATEGY_ANALYZER_PORT: 3002,
    POSITION_MANAGER_PORT: 3003,
    CENTRALIZATION_PORT: 8100,
};
exports.PROJECT_URLS = {
    BACKEND_URL: exports.REMOTE_URL + ':' + exports.SERVER_PORTS.BACKEND_PORT,
    BACKEND_WEBSOCKET: exports.REMOTE_WSS_URL + '/ws',
    STRATEGY_ANALYZER_URL: exports.REMOTE_URL + ':' + exports.SERVER_PORTS.STRATEGY_ANALYZER_PORT,
    POSITION_MANAGER_URL: exports.REMOTE_URL + ':' + exports.SERVER_PORTS.POSITION_MANAGER_PORT,
    CENTRALIZATION_URL: exports.REMOTE_URL + ':' + exports.SERVER_PORTS.CENTRALIZATION_PORT,
};
exports.BACKEND_ENDPOINTS = {
    LEVERAGE_ENDPOINTS: {
        getLeverageSymbols: '/api/symbols/leverage'
    },
    RSI_ENDPOINTS: {
        getAllRSIValues: '/api/rsi/getValues',
    }
};
exports.BACKEND_URLS = {
    ROOT: exports.PROJECT_URLS.BACKEND_URL,
    WEBSOCKET: exports.PROJECT_URLS.BACKEND_WEBSOCKET,
    LEVERAGE_URLS: {
        getLeverageSymbols: exports.PROJECT_URLS.BACKEND_URL + exports.BACKEND_ENDPOINTS.LEVERAGE_ENDPOINTS.getLeverageSymbols,
    },
    RSI_URLS: {
        getAllRSIValues: exports.PROJECT_URLS.BACKEND_URL + exports.BACKEND_ENDPOINTS.RSI_ENDPOINTS.getAllRSIValues,
    },
};
exports.default = { PROJECT_URLS: exports.PROJECT_URLS };
