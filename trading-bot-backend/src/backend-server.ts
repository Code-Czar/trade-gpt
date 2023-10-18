// import { Server as WebSocketServer } from 'ws';
import { PAIR_TYPES } from './types/consts';
import { stringifyMap, convertPairToJSON } from './utils/convertData';
import { cryptoFetcher } from './dataFetchers';
const { TradingBot } = require('./bot');
const { WebsocketStreamer } = require('./websocketStreamer');
const express = require('express');
const http = require('http');
const WebSocket = require('ws');

const app = express();
const cors = require('cors');
const bodyParser = require('body-parser')

app.use(bodyParser.json());

// Enable CORS
app.use(cors());

// Create an HTTP server by hand for WebSocket server to use later.
const server = http.createServer(app);

// Create a WebSocket server by passing the HTTP server instance to WebSocket.Server.
// const wss = new WebSocket.Server({ server, path: '/ws' });

// // Set up a connection listener to handle incoming WebSocket connections.
// wss.on('connection', (ws) => {
//     console.log('Client connected');

//     // Send a welcome message to the newly connected client.
//     ws.send('Welcome to the WebSocket server!');

//     // Set up a message listener on this connection to receive messages from the client.
//     ws.on('message', (message) => {
//         console.log(`Received message: ${message}`);
//     });
// });

app.get('/', (req, res) => {
    res.send('Hello from Express!');
});

const websocketStreamer = new WebsocketStreamer(server);
const bot = new TradingBot(websocketStreamer);
const PORT = 3000;
server.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});





app.get('/api/symbols/leverage', async (req: Request, res: Response) => {
    try {
        const symbolsWithLeverage = await cryptoFetcher.getBybitPairsWithLeverage();
        res.status(200).json(symbolsWithLeverage);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error fetching symbols with leverage' });
    }
});


app.get('/api/leverage/fullData/:symbol', async (req: Request, res: Response) => {
    let { symbol } = req.params;
    try {
        const symbolData = await convertPairToJSON(bot.dataStore.get(PAIR_TYPES.leveragePairs).get(symbol))
        res.status(200).json(symbolData);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: '/api/leverage/fullData : Error fetching data' });
    }
});
app.get('/api/leverage/fullData/:symbol/:timeframe', async (req: Request, res: Response) => {
    let { symbol, timeframe } = req.params;
    try {
        const symbolData = await convertPairToJSON(bot.dataStore.get(PAIR_TYPES.leveragePairs).get(symbol))
        const result = {}
        Object.entries(symbolData).forEach(([key, value]) => {
            if (value[timeframe]) {
                result[key] = value[timeframe]
            }
        })
        res.status(200).json(result);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: '/api/leverage/fullData : Error fetching data' });
    }
});

// Retrieves OHLCV, RSI, SMA, EMA, MACD, VOLUMES, Bollinger Bands
app.get('/api/leverage/:symbol/:subdata', async (req: Request, res: Response) => {
    let { symbol, subdata } = req.params;
    try {
        const symbolData = await convertPairToJSON(bot.dataStore.get(PAIR_TYPES.leveragePairs).get(symbol))
        res.status(200).json(symbolData[subdata]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: '/api/leverage/fullData : Error fetching data' });
    }
});

app.get('/api/leverage/:symbol/:subdata/:timeframe', async (req: Request, res: Response) => {
    let { symbol, subdata, timeframe } = req.params;
    try {
        const symbolData = await convertPairToJSON(bot.dataStore.get(PAIR_TYPES.leveragePairs).get(symbol))
        res.status(200).json(symbolData[subdata][timeframe]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: '/api/leverage/fullData : Error fetching data' });
    }
});


app.get('/api/lastRsi/bulk', async (req: Request, res: Response) => {

    const leveragePairsResult = await stringifyMap(bot.dataStore.get(PAIR_TYPES.leveragePairs))
    const result = {}
    Object.entries(leveragePairsResult).forEach(([symbol, pair]) => {
        result[symbol] = { rsi: {}, details: pair.details }

        Object.entries(pair.rsi).forEach(([timeFrameKey, data]) => {
            const lastRSI = data.rsiData
            // console.log("🚀 ~ file: backend-server.ts:130 ~ Object.entries ~ timeFrameKey:", timeFrameKey, lastRSI, lastRSI.length)
            if (data.rsiData.length > 0) {

                result[symbol].rsi[timeFrameKey] = data.rsiData[data.rsiData.length - 1].value
            }
            else {
                result[symbol].rsi[timeFrameKey] = null
            }
        });
    })

    return res.status(200).json(result)
})
app.get('/api/getDataStore', async (req: Request, res: Response) => {
    const leveragePairsResult = await stringifyMap(bot.dataStore.get(PAIR_TYPES.leveragePairs))
    return res.status(200).json(leveragePairsResult)
})

// Tests 
app.get('/api/rsi/getValues', async (req: Request, res: Response) => {
    const leveragePairsResult = await stringifyMap(bot.dataStore.get(PAIR_TYPES.leveragePairs))
    return res.status(200).json(leveragePairsResult)
})
app.get('/api/getSymbolValues/:symbol', async (req: Request, res: Response) => {
    let { symbol } = req.params;
    try {
        const symbolData = await convertPairToJSON(bot.dataStore.get(PAIR_TYPES.leveragePairs).get(symbol))
        res.status(200).json(symbolData);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: '/api/leverage/fullData : Error fetching data' });
    }
});

app.post('/set-rsi', async (req: Request, res: Response) => {
    const { pair, timeframe, rsiValues } = req.body;

    // Validate the request body
    if (!pair || !timeframe || !rsiValues || !Array.isArray(rsiValues)) {
        return res.status(400).json({ error: 'Invalid request body' });
    }

    // Navigate to the specific asset pair and timeframe
    const assetPairData = bot.dataStore.get(pair);
    if (!assetPairData) {
        return res.status(404).json({ error: 'Asset pair not found' });
    }
    const rsiMap = assetPairData.rsi;
    if (!rsiMap) {
        return res.status(404).json({ error: 'RSI map not found' });
    }

    // Set the new RSI values
    rsiMap.set(timeframe, rsiValues);

    res.status(200).json({ message: 'RSI values updated successfully' });
});

app.get('/health', (req, res) => {
    try {
        res.status(200).json({
            refreshRate: bot.refreshRate
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error fetching health data' });
    }
});

bot.populateDataStoreParallel()



// const PORT = 3000;

// app.listen(PORT, () => {
//     console.log(`Server is running on http://localhost:${PORT}`);
//     // bot.populateDataStore()
//     // bot.populateDataStoreParallel()
// });

