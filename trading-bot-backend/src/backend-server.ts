import { VersatileLogger, REMOTE_URL } from "trading-shared";
import { stringifyMap, convertPairToJSON } from './utils/convertData';
import { PAIR_TYPES } from './types/consts';
import { cryptoFetcher } from './dataFetchers';
const { TradingBot } = require('./bot');
const { WebsocketStreamer } = require('./websocketStreamer');

const express = require('express');
const http = require('http');
const https = require('https');
const fs = require('fs');

global.logger = new VersatileLogger('BackendServer', true, false);

const app = express();
const cors = require('cors');
const bodyParser = require('body-parser');

app.use(bodyParser.json());
app.use(cors());

let server;
if (!REMOTE_URL.includes("localhost") && !REMOTE_URL.includes("127.0.0.1")) {
    // Use the paths from your Apache SSL configuration
    const privateKey = fs.readFileSync('/etc/letsencrypt/live/infinite-opportunities.pro/privkey.pem', 'utf8');
    const certificate = fs.readFileSync('/etc/letsencrypt/live/infinite-opportunities.pro/fullchain.pem', 'utf8');

    const credentials = { key: privateKey, cert: certificate };
    server = https.createServer(credentials, app);
} else {
    server = http.createServer(app);
}

const PORT = 3000
const CLEAR_DATABASE = false;

const websocketStreamer = new WebsocketStreamer(server)
const bot = new TradingBot(websocketStreamer, CLEAR_DATABASE)


app.get('/api/symbols/leverage', async (req: Request, res: Response) => {
    try {
        const symbolsWithLeverage = await cryptoFetcher.getBybitPairsWithLeverage()
        res.status(200).json(symbolsWithLeverage)
    } catch (error) {
        console.error(error)
        res.status(500).json({ error: 'Error fetching symbols with leverage' })
    }
})

app.get(
    '/api/leverage/fullData/:symbol',
    async (req: Request, res: Response) => {
        let { symbol } = req.params
        try {
            const symbolData = await convertPairToJSON(
                bot.dataStore.get(PAIR_TYPES.leveragePairs).get(symbol),
            )
            res.status(200).json(symbolData)
        } catch (error) {
            console.error(error)
            res
                .status(500)
                .json({ error: '/api/leverage/fullData : Error fetching data' })
        }
    },
)
app.get(
    '/api/leverage/fullData/:symbol/:timeframe',
    async (req: Request, res: Response) => {
        let { symbol, timeframe } = req.params
        try {
            const symbolData = await convertPairToJSON(
                bot.dataStore.get(PAIR_TYPES.leveragePairs).get(symbol),
            )
            const result = {}
            Object.entries(symbolData).forEach(([key, value]) => {
                if (value[timeframe]) {
                    result[key] = value[timeframe]
                }
            })
            res.status(200).json(result)
        } catch (error) {
            console.error(error)
            res
                .status(500)
                .json({ error: '/api/leverage/fullData : Error fetching data' })
        }
    },
)

app.get(
    '/api/leverage/:symbol/:subdata',
    async (req: Request, res: Response) => {
        let { symbol, subdata } = req.params
        try {
            const symbolData = await convertPairToJSON(
                bot.dataStore.get(PAIR_TYPES.leveragePairs).get(symbol),
            )
            res.status(200).json(symbolData[subdata])
        } catch (error) {
            console.error(error)
            res
                .status(500)
                .json({ error: '/api/leverage/fullData : Error fetching data' })
        }
    },
)

app.get(
    '/api/leverage/:symbol/:subdata/:timeframe',
    async (req: Request, res: Response) => {
        let { symbol, subdata, timeframe } = req.params
        try {
            const symbolData = await convertPairToJSON(
                bot.dataStore.get(PAIR_TYPES.leveragePairs).get(symbol),
            )
            res.status(200).json(symbolData[subdata][timeframe])
        } catch (error) {
            console.error(error)
            res
                .status(500)
                .json({ error: '/api/leverage/fullData : Error fetching data' })
        }
    },
)

app.get('/api/lastRsi/bulk', async (req: Request, res: Response) => {
    const leveragePairsResult = await stringifyMap(
        bot.dataStore.get(PAIR_TYPES.leveragePairs),
    )
    const result = {}
    Object.entries(leveragePairsResult).forEach(([symbol, pair]) => {
        result[symbol] = { rsi: {}, details: pair.details }

        Object.entries(pair.rsi).forEach(([timeFrameKey, data]) => {
            const lastRSI = data.rsiData

            if (data.rsiData.length > 0) {
                result[symbol].rsi[timeFrameKey] =
                    data.rsiData[data.rsiData.length - 1].value
            } else {
                result[symbol].rsi[timeFrameKey] = null
            }
        })
    })

    return res.status(200).json(result)
})
app.get('/api/getDataStore', async (req: Request, res: Response) => {
    const leveragePairsResult = await stringifyMap(
        bot.dataStore.get(PAIR_TYPES.leveragePairs),
    )
    return res.status(200).json(leveragePairsResult)
})

app.get('/api/rsi/getValues', async (req: Request, res: Response) => {
    const leveragePairsResult = await stringifyMap(
        bot.dataStore.get(PAIR_TYPES.leveragePairs),
    )
    return res.status(200).json(leveragePairsResult)
})
app.get('/api/getSymbolValues/:symbol', async (req: Request, res: Response) => {
    let { symbol } = req.params
    try {
        const symbolData = await convertPairToJSON(
            bot.dataStore.get(PAIR_TYPES.leveragePairs).get(symbol),
        )
        res.status(200).json(symbolData)
    } catch (error) {
        console.error(error)
        res
            .status(500)
            .json({ error: '/api/leverage/fullData : Error fetching data' })
    }
})

app.post('/set-rsi', async (req: Request, res: Response) => {
    const { pair, timeframe, rsiValues } = req.body

    if (!pair || !timeframe || !rsiValues || !Array.isArray(rsiValues)) {
        return res.status(400).json({ error: 'Invalid request body' })
    }

    const assetPairData = bot.dataStore.get(pair)
    if (!assetPairData) {
        return res.status(404).json({ error: 'Asset pair not found' })
    }
    const rsiMap = assetPairData.rsi
    if (!rsiMap) {
        return res.status(404).json({ error: 'RSI map not found' })
    }

    rsiMap.set(timeframe, rsiValues)

    res.status(200).json({ message: 'RSI values updated successfully' })
})

app.get('/getLeveragePairs', async (req, res) => {
    try {
        res.status(200).json({
            leveragePairs: await cryptoFetcher.getBybitPairsWithLeverage(),
        })
    } catch (error) {
        console.error(error)
        res.status(500).json({ error: 'Error fetching health data' })
    }
});


app.post('/api/fetchHistoricalDataForPair', async (req: Request, res: Response) => {
    const { pairSymbol, timeframe } = req.body
    const result = (await bot.fetchAllHistoricalDataForPair(pairSymbol, timeframe))()

    console.log("🚀 ~ file: backend-server.ts:211 ~ result:", await result);

    res.status(200).json({ message: 'Started to populate database with historical data' })
})
app.post('/getAllHistoricalData', async (req: Request, res: Response) => {
    bot.fetchAllHistoricalData()
    res.status(200).json({ message: 'Started to populate database with historical data' })
})



app.get('/health', (req, res) => {
    try {
        res.status(200).json({
            refreshRate: bot.refreshRate,
        })
    } catch (error) {
        console.error(error)
        res.status(500).json({ error: 'Error fetching health data' })
    }
})

server.listen(PORT, () => {
    global.logger.info(`Server is running on http:`)

})



bot.populateDataStoreParallel()
// bot.fetchAllHistoricalData()


