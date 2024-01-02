import config from './config.json';

export let REMOTE_URL: string;
export let REMOTE_WSS_URL: string;

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

console.log('🚀 ~ file: projectURLs.ts:19 ~ config:', config, REMOTE_URL);

export const SERVER_PORTS = {
  BACKEND_PORT: 3000,
  STRATEGY_ANALYZER_PORT: 3002,
  POSITION_MANAGER_PORT: 3003,
  CENTRALIZATION_PORT: 8000,
};

export const PROJECT_URLS = {
  BACKEND_URL: REMOTE_URL + ':' + SERVER_PORTS.BACKEND_PORT,
  BACKEND_WEBSOCKET: REMOTE_WSS_URL + ':' + SERVER_PORTS.BACKEND_PORT + '/ws',
  STRATEGY_ANALYZER_URL: REMOTE_URL + ':' + SERVER_PORTS.STRATEGY_ANALYZER_PORT,
  POSITION_MANAGER_URL: REMOTE_URL + ':' + SERVER_PORTS.POSITION_MANAGER_PORT,
  CENTRALIZATION_URL: 'centralization.' + REMOTE_URL,
};

if (REMOTE_URL.includes('127.0.0.1') || REMOTE_URL.includes('localhost')) {
  PROJECT_URLS.CENTRALIZATION_URL = REMOTE_URL + ':' + SERVER_PORTS.CENTRALIZATION_PORT;
}

export const BACKEND_ENDPOINTS = {
  HEALTH: '/health',
  CLEAR_DATABASE: '/clearDB',
  FETCH_ALL_HISTORICAL_DATA: '/api/fetchAllHistoricalData',
  FETCH_HISTORICAL_DATA: '/api/fetchHistoricalData',
  GET_PAIR_DATA: '/api/getPairData',
  LEVERAGE_ENDPOINTS: {
    getLeverageSymbols: '/api/symbols/leverage',
    getHistoricalDataForPair: '/api/fetchHistoricalDataForPair',
  },
  RSI_ENDPOINTS: {
    getAllRSIValues: '/api/rsi/getValues',
  },
  DATA_STORE: {
    getDataStore: '/api/getDataStore',
  },
};

export const BACKEND_URLS = {
  ROOT: PROJECT_URLS.BACKEND_URL,
  HEALTH: PROJECT_URLS.BACKEND_URL + BACKEND_ENDPOINTS.HEALTH,
  WEBSOCKET: PROJECT_URLS.BACKEND_WEBSOCKET,
  CLEAR_DATABASE: PROJECT_URLS.BACKEND_URL + BACKEND_ENDPOINTS.CLEAR_DATABASE,
  FETCH_ALL_HISTORICAL_DATA: PROJECT_URLS.BACKEND_URL + BACKEND_ENDPOINTS.FETCH_ALL_HISTORICAL_DATA,
  FETCH_HISTORICAL_DATA: PROJECT_URLS.BACKEND_URL + BACKEND_ENDPOINTS.FETCH_HISTORICAL_DATA,
  GET_PAIR_DATA: PROJECT_URLS.BACKEND_URL + BACKEND_ENDPOINTS.GET_PAIR_DATA,

  LEVERAGE_URLS: {
    getLeverageSymbols: PROJECT_URLS.BACKEND_URL + BACKEND_ENDPOINTS.LEVERAGE_ENDPOINTS.getLeverageSymbols,
    getHistoricalDataForPair: PROJECT_URLS.BACKEND_URL + BACKEND_ENDPOINTS.LEVERAGE_ENDPOINTS.getHistoricalDataForPair,
  },
  RSI_URLS: {
    getAllRSIValues: PROJECT_URLS.BACKEND_URL + BACKEND_ENDPOINTS.RSI_ENDPOINTS.getAllRSIValues,
  },
  DATA_STORE: {
    getDataStore: PROJECT_URLS.BACKEND_URL + BACKEND_ENDPOINTS.DATA_STORE.getDataStore,
  },
};

export const CENTRALIZATION_ENDPOINTS = {
  USERS: '/users',
  STRIPE_CONFIG: '/config',
  STRIPE_PAYMENT_ATTEMPT: '/create-payment-intent',
  STRIPE_CREATE_CUSTOMER: '/create-customer',
  STRIPE_CHECKOUT_SESSION: '/create_checkout_session',
};

export const CENTRALIZATION_API_URLS = {
  USERS: PROJECT_URLS.CENTRALIZATION_URL + CENTRALIZATION_ENDPOINTS.USERS,
  STRIPE_CONFIG: PROJECT_URLS.CENTRALIZATION_URL + CENTRALIZATION_ENDPOINTS.STRIPE_CONFIG,
  STRIPE_PAYMENT_ATTEMPT: PROJECT_URLS.CENTRALIZATION_URL + CENTRALIZATION_ENDPOINTS.STRIPE_PAYMENT_ATTEMPT,
  STRIPE_CREATE_CUSTOMER: PROJECT_URLS.CENTRALIZATION_URL + CENTRALIZATION_ENDPOINTS.STRIPE_CREATE_CUSTOMER,
  STRIPE_CHECKOUT_SESSION: PROJECT_URLS.CENTRALIZATION_URL + CENTRALIZATION_ENDPOINTS.STRIPE_CHECKOUT_SESSION,
};

export const STRATEGY_ANALYZER_ENDPOINTS = {
  HEALTH: '/health',
  SIGNALS: {
    EMA28_SIGNALS: '/api/getEMA28Signals',
    RSI_SIGNALS: '/api/getRSISignals',
  },
  USERS_NOTIFICATIONS: {
    getUsersNotifications: '/api/getUsersNotifications',
    loadUserNotifications: '/api/loadUserNotifications',
    saveUserNotifications: '/api/saveUserNotifications',
    addNotification: '/api/addNotification',
    removeNotification: '/api/removeNotification', // Removed URL parameters
    updateNotification: '/api/updateNotification', // Removed URL parameters
    getNotification: '/api/getNotification', // Removed URL parameters
    getNotificationForPairAndTimeframe: '/api/getNotificationForPairAndTimeframe',
    markNotificationAsSent: '/api/markNotificationAsSent', // Removed URL parameters
    resetNotificationSentStatus: '/api/resetNotificationSentStatus', // Removed URL parameters
  },
  BACKTESTING: {
    startBacktest: '/api/startBacktest',
    getBacktestResults: '/api/getBacktestResults',
  },
};

export const STRATEGY_ANALYZER_URLS = {
  HEALTH: PROJECT_URLS.STRATEGY_ANALYZER_URL + STRATEGY_ANALYZER_ENDPOINTS.HEALTH,
  SIGNALS: {
    getEMA28Signals: PROJECT_URLS.STRATEGY_ANALYZER_URL + STRATEGY_ANALYZER_ENDPOINTS.SIGNALS.EMA28_SIGNALS,
    getRSISignals: PROJECT_URLS.STRATEGY_ANALYZER_URL + STRATEGY_ANALYZER_ENDPOINTS.SIGNALS.RSI_SIGNALS,
  },
  USERS_NOTIFICATIONS: {
    getUsersNotifications:
      PROJECT_URLS.STRATEGY_ANALYZER_URL + STRATEGY_ANALYZER_ENDPOINTS.USERS_NOTIFICATIONS.getUsersNotifications,
    loadUserNotifications:
      PROJECT_URLS.STRATEGY_ANALYZER_URL + STRATEGY_ANALYZER_ENDPOINTS.USERS_NOTIFICATIONS.loadUserNotifications,
    saveUserNotifications:
      PROJECT_URLS.STRATEGY_ANALYZER_URL + STRATEGY_ANALYZER_ENDPOINTS.USERS_NOTIFICATIONS.saveUserNotifications,
    addNotification:
      PROJECT_URLS.STRATEGY_ANALYZER_URL + STRATEGY_ANALYZER_ENDPOINTS.USERS_NOTIFICATIONS.addNotification,
    removeNotification:
      PROJECT_URLS.STRATEGY_ANALYZER_URL + STRATEGY_ANALYZER_ENDPOINTS.USERS_NOTIFICATIONS.removeNotification,
    updateNotification:
      PROJECT_URLS.STRATEGY_ANALYZER_URL + STRATEGY_ANALYZER_ENDPOINTS.USERS_NOTIFICATIONS.updateNotification,
    getNotification:
      PROJECT_URLS.STRATEGY_ANALYZER_URL + STRATEGY_ANALYZER_ENDPOINTS.USERS_NOTIFICATIONS.getNotification,
    getNotificationForPairAndTimeframe:
      PROJECT_URLS.STRATEGY_ANALYZER_URL +
      STRATEGY_ANALYZER_ENDPOINTS.USERS_NOTIFICATIONS.getNotificationForPairAndTimeframe,
    markNotificationAsSent:
      PROJECT_URLS.STRATEGY_ANALYZER_URL + STRATEGY_ANALYZER_ENDPOINTS.USERS_NOTIFICATIONS.markNotificationAsSent,
    resetNotificationSentStatus:
      PROJECT_URLS.STRATEGY_ANALYZER_URL + STRATEGY_ANALYZER_ENDPOINTS.USERS_NOTIFICATIONS.resetNotificationSentStatus,
  },
  BACKTESTING: {
    startBacktest: PROJECT_URLS.STRATEGY_ANALYZER_URL + STRATEGY_ANALYZER_ENDPOINTS.BACKTESTING.startBacktest,
    getBacktestResults: PROJECT_URLS.STRATEGY_ANALYZER_URL + STRATEGY_ANALYZER_ENDPOINTS.BACKTESTING.getBacktestResults,
  },
};
