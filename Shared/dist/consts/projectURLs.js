"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BACKEND_URLS = exports.STRATEGY_ANALYZER_URLS = exports.CENTRALIZATION_ENDPOINTS = exports.BACKEND_ENDPOINTS = exports.PROJECT_URLS = exports.SERVER_PORTS = void 0;
const config_json_1 = __importDefault(require("./config.json"));
let REMOTE_URL;
let REMOTE_WSS_URL;
// Check if we are in a Node.js environment
if (typeof process !== 'undefined' && process.versions && process.versions.node) {
    const fs = require('fs');
    const path = require('path');
    const configPath = path.resolve(__dirname, 'config.json');
    const jsonData = fs.readFileSync(configPath, 'utf-8');
    const loadedConfig = JSON.parse(jsonData);
    REMOTE_URL = loadedConfig.REMOTE_URL;
    REMOTE_WSS_URL = loadedConfig.REMOTE_WSS;
}
else {
    // In a browser environment, use the imported config
    REMOTE_URL = config_json_1.default.REMOTE_URL;
    REMOTE_WSS_URL = config_json_1.default.REMOTE_WSS;
}
// ... rest of the code remains unchanged
console.log("🚀 ~ file: projectURLs.ts:19 ~ config:", config_json_1.default, REMOTE_URL);
exports.SERVER_PORTS = {
    BACKEND_PORT: 3000,
    STRATEGY_ANALYZER_PORT: 3002,
    POSITION_MANAGER_PORT: 3003,
    CENTRALIZATION_PORT: 8000,
};
exports.PROJECT_URLS = {
    BACKEND_URL: REMOTE_URL + ':' + exports.SERVER_PORTS.BACKEND_PORT,
    BACKEND_WEBSOCKET: REMOTE_WSS_URL + '/ws',
    STRATEGY_ANALYZER_URL: REMOTE_URL + ':' + exports.SERVER_PORTS.STRATEGY_ANALYZER_PORT,
    POSITION_MANAGER_URL: REMOTE_URL + ':' + exports.SERVER_PORTS.POSITION_MANAGER_PORT,
    CENTRALIZATION_URL: REMOTE_URL + ':' + exports.SERVER_PORTS.CENTRALIZATION_PORT,
};
exports.BACKEND_ENDPOINTS = {
    LEVERAGE_ENDPOINTS: {
        getLeverageSymbols: '/api/symbols/leverage'
    },
    RSI_ENDPOINTS: {
        getAllRSIValues: '/api/rsi/getValues',
    }
};
exports.CENTRALIZATION_ENDPOINTS = {
    USERS: '/users',
    STRIPE_CONFIG: '/config',
    STRIPE_PAYMENT_ATTEMPT: '/create-payment-intent',
    STRIPE_CREATE_CUSTOMER: '/create-customer'
};
exports.STRATEGY_ANALYZER_URLS = {
    SIGNALS: {
        getEMA28Signals: exports.PROJECT_URLS.STRATEGY_ANALYZER_URL + '/api/getEMA28Signals',
        getRSISignals: exports.PROJECT_URLS.STRATEGY_ANALYZER_URL + '/api/getRSISignals',
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
// export default { PROJECT_URLS }
//# sourceMappingURL=projectURLs.js.map