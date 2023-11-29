import config from './config.json';

let REMOTE_URL: string;
let REMOTE_WSS_URL: string;

// Check if we are in a Node.js environment
if (typeof process !== 'undefined' && process.versions && process.versions.node) {
    const fs = require('fs');
    const path = require('path');
    const configPath = path.resolve(__dirname, 'config.json');
    const jsonData = fs.readFileSync(configPath, 'utf-8');
    const loadedConfig = JSON.parse(jsonData);

    REMOTE_URL = loadedConfig.REMOTE_URL;
    REMOTE_WSS_URL = loadedConfig.REMOTE_WSS;
} else {
    // In a browser environment, use the imported config
    REMOTE_URL = config.REMOTE_URL;
    REMOTE_WSS_URL = config.REMOTE_WSS;
}

// ... rest of the code remains unchanged

console.log("🚀 ~ file: projectURLs.ts:19 ~ config:", config, REMOTE_URL);


export const SERVER_PORTS = {
    BACKEND_PORT: 3000,
    STRATEGY_ANALYZER_PORT: 3002,
    POSITION_MANAGER_PORT: 3003,
    CENTRALIZATION_PORT: 8000,
}

export const PROJECT_URLS = {
    BACKEND_URL: REMOTE_URL + ':' + SERVER_PORTS.BACKEND_PORT,
    BACKEND_WEBSOCKET: REMOTE_WSS_URL + ':' + SERVER_PORTS.BACKEND_PORT + '/ws',
    STRATEGY_ANALYZER_URL: REMOTE_URL + ':' + SERVER_PORTS.STRATEGY_ANALYZER_PORT,
    POSITION_MANAGER_URL: REMOTE_URL + ':' + SERVER_PORTS.POSITION_MANAGER_PORT,
    CENTRALIZATION_URL: REMOTE_URL + ':' + SERVER_PORTS.CENTRALIZATION_PORT,
};

export const BACKEND_ENDPOINTS = {
    LEVERAGE_ENDPOINTS: {
        getLeverageSymbols: '/api/symbols/leverage',
        getHistoricalDataForPair: '/api/fetchHistoricalDataForPair'
    },
    RSI_ENDPOINTS: {
        getAllRSIValues: '/api/rsi/getValues',
    }
};

export const CENTRALIZATION_ENDPOINTS = {
    USERS: '/users',
    STRIPE_CONFIG: '/config',
    STRIPE_PAYMENT_ATTEMPT: '/create-payment-intent',
    STRIPE_CREATE_CUSTOMER: '/create-customer',
    STRIPE_CHECKOUT_SESSION: '/create_checkout_session'
};

export const STRATEGY_ANALYZER_URLS = {
    SIGNALS: {
        getEMA28Signals: PROJECT_URLS.STRATEGY_ANALYZER_URL + '/api/getEMA28Signals',
        getRSISignals: PROJECT_URLS.STRATEGY_ANALYZER_URL + '/api/getRSISignals',
    }
};

export const BACKEND_URLS = {
    ROOT: PROJECT_URLS.BACKEND_URL,
    WEBSOCKET: PROJECT_URLS.BACKEND_WEBSOCKET,
    LEVERAGE_URLS: {
        getLeverageSymbols: PROJECT_URLS.BACKEND_URL + BACKEND_ENDPOINTS.LEVERAGE_ENDPOINTS.getLeverageSymbols,
    },
    RSI_URLS: {
        getAllRSIValues: PROJECT_URLS.BACKEND_URL + BACKEND_ENDPOINTS.RSI_ENDPOINTS.getAllRSIValues,
    },
};


// export default { PROJECT_URLS }