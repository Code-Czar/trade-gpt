const dotenv = require('dotenv');
const path = require('path');
const dotenvPath = path.resolve(__dirname, '.env_shared');
dotenv.config({ path: dotenvPath });

console.log("Current directory LIBRARY :", dotenvPath);


export const REMOTE_URL = 'https://' + process.env.REMOTE_URL;
export const REMOTE_WSS_URL = 'wss://' + process.env.REMOTE_URL;


export const SERVER_PORTS = {
    BACKEND_PORT: 3000,
    STRATEGY_ANALYZER_PORT: 3002,
    POSITION_MANAGER_PORT: 3003,
    CENTRALIZATION_PORT: 8100,
}

export const PROJECT_URLS = {
    BACKEND_URL: REMOTE_URL + ':' + SERVER_PORTS.BACKEND_PORT,
    BACKEND_WEBSOCKET: REMOTE_WSS_URL + '/ws',
    STRATEGY_ANALYZER_URL: REMOTE_URL + ':' + SERVER_PORTS.STRATEGY_ANALYZER_PORT,
    POSITION_MANAGER_URL: REMOTE_URL + ':' + SERVER_PORTS.POSITION_MANAGER_PORT,
    CENTRALIZATION_URL: REMOTE_URL + ':' + SERVER_PORTS.CENTRALIZATION_PORT,
};

export const BACKEND_ENDPOINTS = {
    LEVERAGE_ENDPOINTS: {
        getLeverageSymbols: '/api/symbols/leverage'
    },
    RSI_ENDPOINTS: {
        getAllRSIValues: '/api/rsi/getValues',
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

export default { PROJECT_URLS }