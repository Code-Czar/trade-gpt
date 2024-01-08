"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.STRATEGY_ANALYZER_URLS = exports.CENTRALIZATION_API_URLS = exports.CENTRALIZATION_ENDPOINTS = exports.BACKEND_URLS = exports.BACKEND_ENDPOINTS = exports.PROJECT_URLS = exports.SERVER_PORTS = exports.REMOTE_WSS_URL = exports.REMOTE_URL = void 0;
const config_json_1 = __importDefault(require("./config.json"));
// Check if we are in a Node.js environment
if (typeof process !== 'undefined' && process.versions && process.versions.node) {
    const fs = require('fs');
    const path = require('path');
    const configPath = path.resolve(__dirname, 'config.json');
    const jsonData = fs.readFileSync(configPath, 'utf-8');
    const loadedConfig = JSON.parse(jsonData);
    exports.REMOTE_URL = loadedConfig.REMOTE_URL;
    exports.REMOTE_WSS_URL = loadedConfig.REMOTE_WSS;
}
else {
    // In a browser environment, use the imported config
    exports.REMOTE_URL = config_json_1.default.REMOTE_URL;
    exports.REMOTE_WSS_URL = config_json_1.default.REMOTE_WSS;
}
console.log("🚀 ~ file: projectURLs.ts:19 ~ config:", config_json_1.default, exports.REMOTE_URL);
exports.SERVER_PORTS = {
    BACKEND_PORT: 3000,
    STRATEGY_ANALYZER_PORT: 3002,
    POSITION_MANAGER_PORT: 3003,
    CENTRALIZATION_PORT: 8000,
};
exports.PROJECT_URLS = {
    BACKEND_URL: exports.REMOTE_URL + ':' + exports.SERVER_PORTS.BACKEND_PORT,
    BACKEND_WEBSOCKET: exports.REMOTE_WSS_URL + ':' + exports.SERVER_PORTS.BACKEND_PORT + '/ws',
    STRATEGY_ANALYZER_URL: exports.REMOTE_URL + ':' + exports.SERVER_PORTS.STRATEGY_ANALYZER_PORT,
    POSITION_MANAGER_URL: exports.REMOTE_URL + ':' + exports.SERVER_PORTS.POSITION_MANAGER_PORT,
    CENTRALIZATION_URL: 'centralization.' + exports.REMOTE_URL,
};
if (exports.REMOTE_URL.includes('127.0.0.1') || exports.REMOTE_URL.includes('localhost')) {
    exports.PROJECT_URLS.CENTRALIZATION_URL = exports.REMOTE_URL + ":" + exports.SERVER_PORTS.CENTRALIZATION_PORT;
}
exports.BACKEND_ENDPOINTS = {
    LEVERAGE_ENDPOINTS: {
        getLeverageSymbols: '/api/symbols/leverage',
        getHistoricalDataForPair: '/api/fetchHistoricalDataForPair'
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
        getHistoricalDataForPair: exports.PROJECT_URLS.BACKEND_URL + exports.BACKEND_ENDPOINTS.LEVERAGE_ENDPOINTS.getHistoricalDataForPair,
    },
    RSI_URLS: {
        getAllRSIValues: exports.PROJECT_URLS.BACKEND_URL + exports.BACKEND_ENDPOINTS.RSI_ENDPOINTS.getAllRSIValues,
    },
};
exports.CENTRALIZATION_ENDPOINTS = {
    USERS: '/users',
    STRIPE_CONFIG: '/config',
    STRIPE_PAYMENT_ATTEMPT: '/create-payment-intent',
    STRIPE_CREATE_CUSTOMER: '/create-customer',
    STRIPE_CHECKOUT_SESSION: '/create_checkout_session',
    STRIPE_CANCEL_SUBSCRIPTION: '/cancel-subscription'
};
exports.CENTRALIZATION_API_URLS = {
    USERS: exports.PROJECT_URLS.CENTRALIZATION_URL + exports.CENTRALIZATION_ENDPOINTS.USERS,
    STRIPE_CONFIG: exports.PROJECT_URLS.CENTRALIZATION_URL + exports.CENTRALIZATION_ENDPOINTS.STRIPE_CONFIG,
    STRIPE_PAYMENT_ATTEMPT: exports.PROJECT_URLS.CENTRALIZATION_URL + exports.CENTRALIZATION_ENDPOINTS.STRIPE_PAYMENT_ATTEMPT,
    STRIPE_CREATE_CUSTOMER: exports.PROJECT_URLS.CENTRALIZATION_URL + exports.CENTRALIZATION_ENDPOINTS.STRIPE_CREATE_CUSTOMER,
    STRIPE_CHECKOUT_SESSION: exports.PROJECT_URLS.CENTRALIZATION_URL + exports.CENTRALIZATION_ENDPOINTS.STRIPE_CHECKOUT_SESSION,
    STRIPE_CANCEL_SUBSCRIPTION: exports.PROJECT_URLS.CENTRALIZATION_URL + exports.CENTRALIZATION_ENDPOINTS.STRIPE_CANCEL_SUBSCRIPTION
};
exports.STRATEGY_ANALYZER_URLS = {
    SIGNALS: {
        getEMA28Signals: exports.PROJECT_URLS.STRATEGY_ANALYZER_URL + '/api/getEMA28Signals',
        getRSISignals: exports.PROJECT_URLS.STRATEGY_ANALYZER_URL + '/api/getRSISignals',
    }
};
//# sourceMappingURL=projectURLs.js.map