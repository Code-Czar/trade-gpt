import { VersatileLogger } from "trading-shared"
global.logger = new VersatileLogger('StrategyAnalyzerServer', true);

const express = require('express');
const cors = require('cors');
const fs = require('fs');
const https = require('https');
const http = require('http'); // Import the HTTP module

// const fetch = require('node-fetch');

const dotenv = require('dotenv');
const path = require('path');
dotenv.config({ path: path.join(__dirname, '.env') });

global.logger.debug('Current directory:', process.cwd());

import { SERVER_PORTS } from 'trading-shared';

import { BackendClient } from './backendWebSocket';
import { StrategyAnalyzer } from './strategyAnalyzerClass';
import { UsersNotificationsController } from "./controllers";

const mode = process.env.MODE;

let httpsOptions = {};
let server;

const app = express();
app.use(errorHandler);
app.use(cors());
app.use(express.json()); // for parsing application/json
app.use(express.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded


if (mode === 'PRODUCTION') {
    const certificatePath = '/etc/letsencrypt/live/infinite-opportunities.pro';
    const key = fs.readFileSync(`${certificatePath}/privkey.pem`);
    const cert = fs.readFileSync(`${certificatePath}/fullchain.pem`);
    global.logger.debug('🚀 ~ file: strategyAnalyzerServer.ts:13 ~ key:', key, cert);
    httpsOptions = {
        key: key,
        cert: cert,
    };
    server = https.createServer(httpsOptions, app);
}
else {
    // Use HTTP for DEV mode
    server = http.createServer(app);
}



function errorHandler(err: any, req: Request, res: Response, next: NextFunction) {
    console.error(`Error occurred while processing route ${req.originalUrl}`);
    console.error(err);

    // You can customize the error response as needed
    res.status(500).json({ error: 'Internal Server Error' });
}

// Add the error handling middleware to your Express app


server.listen(SERVER_PORTS.STRATEGY_ANALYZER_PORT, () => {
    global.logger.debug(`SA Server running on port ${SERVER_PORTS.STRATEGY_ANALYZER_PORT}`);
});

//  Init controllers 
const usersNotificationsController = new UsersNotificationsController(app)


// Start clients 
const strategyAnalyzer = new StrategyAnalyzer();
strategyAnalyzer.init()

const client = new BackendClient(strategyAnalyzer);

app.get('/health', (req, res) => {
    res.status(200).json({
        message: "Hello from SA ! ",
    })
});

app.get('/api/getRSISignals/:symbolName', (req, res) => {
    const { symbolName } = req.params;
    if (strategyAnalyzer.pastRSISignals[symbolName]) {
        {
            res.status(200).json(strategyAnalyzer.pastRSISignals[symbolName]);
        }
    }
    res.status(404).send('No RSI signals found for this symbol');
});

app.get('/api/getEMA28Signals/:symbolName', (req, res) => {
    const { symbolName } = req.params;
    if (strategyAnalyzer.pastEMA28Signals[symbolName]) {
        {
            res.status(200).json(strategyAnalyzer.pastEMA28Signals[symbolName]);
        }
    }
    res.status(404).send('No EMA28 signals found for this symbol');
});

export default app;
