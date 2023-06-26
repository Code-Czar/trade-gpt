const fetch = require('node-fetch');

import { sendSignalEmail } from './email';
const positionManagerAPI = 'http://localhost:3005'; // adjust to your setup

const generateBuySignal = (data) => {
    const { ohlcvData, bbData, rsi, macd } = data;
    // Identify if the last candlestick's price touched the lower Bollinger Band
    const lastCandle = ohlcvData[ohlcvData.length - 1];
    const lastBB = bbData[bbData.length - 1];
    const isPriceTouchedLowerBand = lastCandle.low <= lastBB.lower;

    // Check if RSI is below 30
    const lastRSI = rsi[rsi.length - 1];
    const isRSIOverSold = lastRSI.value < 30;

    // Check if MACD crossed above the signal line
    const lastMACD = macd[macd.length - 1];
    const previousMACD = macd[macd.length - 2];
    const isMACDBullish = previousMACD.macd <= previousMACD.signal && lastMACD.macd > lastMACD.signal;

    return isPriceTouchedLowerBand && isRSIOverSold && isMACDBullish;
}

const generateSellSignal = (data) => {
    const { ohlcvData, bbData, rsi, macd } = data;
    // Identify if the last candlestick's price touched the upper Bollinger Band
    const lastCandle = ohlcvData[ohlcvData.length - 1];
    const lastBB = bbData[bbData.length - 1];
    const isPriceTouchedUpperBand = lastCandle.high >= lastBB.upper;

    // Check if RSI is above 70
    const lastRSI = rsi[rsi.length - 1];
    const isRSIOverBought = lastRSI.value > 70;

    // Check if MACD crossed below the signal line
    const lastMACD = macd[macd.length - 1];
    const previousMACD = macd[macd.length - 2];
    const isMACDBearish = previousMACD.macd >= previousMACD.signal && lastMACD.macd < lastMACD.signal;

    return isPriceTouchedUpperBand && isRSIOverBought && isMACDBearish;
}
function analyzeRSI(data) {
    // console.log("🚀 ~ file: strategyAnalyzer.ts:41 ~ analyzeRSI ~ data:", data)
    const { rsi } = data;
    const { ohlcvData } = data;
    const length = rsi.length;
    const latestRSI = rsi[length - 1];

    const signals = {
        buySignal: false,
        sellSignal: false
    }

    if (latestRSI < 30) {
        signals.buySignal = {
            price: ohlcvData[length - 1][5],
            time: ohlcvData[length - 1][0],
            indicatorValue: latestRSI,
            signal: 'Buy',
        }
    } else if (latestRSI > 70) {
        signals.sellSignal = {
            price: ohlcvData[length - 1][5],
            time: ohlcvData[length - 1][0],
            indicatorValue: latestRSI,
            signal: 'Sell',
        }
    }

    return signals;
}

async function fetchData(symbol, timeframe) {
    try {
        const responses = await Promise.all([
            fetch(`http://localhost:3000/api/data/${symbol}/${timeframe}`),
            fetch(`http://localhost:3000/bollinger-bands/${symbol}/${timeframe}`),
            fetch(`http://localhost:3000/rsi/${symbol}/${timeframe}`),
            fetch(`http://localhost:3000/macd/${symbol}/${timeframe}`),
        ]);

        const data = await Promise.all(responses.map(response => response.json()));

        const [ohlcvData, bbData, rsi, macd] = data;

        return {
            ohlcvData,
            bbData,
            rsi,
            macd
        };
    } catch (error) {
        console.error(`Failed to fetch data for ${symbol} on ${timeframe}:`, error);
    }
}


async function completeAnalysis(symbol, timeframe) {
    const data = await fetchData(symbol, timeframe);
    const buySignal = generateBuySignal(data);
    const sellSignal = generateSellSignal(data);
    return [data, { buySignal, sellSignal }];
}


async function openLongPosition(symbol, price) {
    try {
        const res = await fetch(`${positionManagerAPI}/position`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                symbol: symbol,
                buyPrice: price,
                quantity: 1, // TODO: adjust the quantity based on your strategy
                type: 'long' // this is a long position
            })
        });

        const data = await res.json();

        console.log(`Opened new long position with ID ${data.id}`);
    } catch (err) {
        console.error(`Failed to open long position: ${err}`);
    }
}

async function openShortPosition(symbol, price) {
    try {
        const res = await fetch(`${positionManagerAPI}/position`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                symbol: symbol,
                sellPrice: price,
                quantity: 1, // TODO: adjust the quantity based on your strategy
                type: 'short' // this is a short position
            })
        });

        const data = await res.json();
        console.log("🚀 ~ file: strategyAnalyzer.ts:146 ~ openShortPosition ~ data:", data)

        console.log(`Opened new short position with ID ${data.id}`);
    } catch (err) {
        console.error(`Failed to open short position: ${err}`);
    }
}

export async function analyzeData(symbol, timeframe, analysisType, signalStatus) {
    // Fetch data
    const data = await fetchData(symbol, timeframe);
    let analysisResult;
    let key = `${analysisType}_${symbol}_${timeframe}`;

    switch (analysisType) {
        case 'RSI':
            analysisResult = analyzeRSI(data);
            if (analysisResult.buySignal && !signalStatus[key]?.buySignal) {
                await sendSignalEmail(symbol, timeframe, 'RSI', 'Buy');
                if (!signalStatus[key]) signalStatus[key] = {};
                signalStatus[key].buySignal = true;
                // Open a new long position
                openLongPosition(symbol, data?.ohlcvData[data?.ohlcvData.length - 1][4]);

            } else if (analysisResult.sellSignal && !signalStatus[key]?.sellSignal) {
                await sendSignalEmail(symbol, timeframe, 'RSI', 'Sell');
                if (!signalStatus[key]) signalStatus[key] = {};
                signalStatus[key].sellSignal = true;
                // Open a new short position
                openShortPosition(symbol, data?.ohlcvData[data?.ohlcvData.length - 1][4]);
            } else {
                if (!signalStatus[key]) signalStatus[key] = {};
                signalStatus[key].buySignal = analysisResult.buySignal;
                signalStatus[key].sellSignal = analysisResult.sellSignal;
            }
            break;

        // Add cases for other analysis types here...

        case "COMPLETE_ANALYSIS":
            analysisResult = await completeAnalysis(symbol, timeframe);
            if (analysisResult.buySignal && !signalStatus[key]?.buySignal) {
                await sendSignalEmail(symbol, timeframe, 'Complete', 'Buy');
                if (!signalStatus[key]) signalStatus[key] = {};
                signalStatus[key].buySignal = true;
                openLongPosition(symbol, data?.ohlcvData[data?.ohlcvData.length - 1][4]);
            } else if (analysisResult.sellSignal && !signalStatus[key]?.sellSignal) {
                await sendSignalEmail(symbol, timeframe, 'Complete', 'Sell');
                if (!signalStatus[key]) signalStatus[key] = {};
                signalStatus[key].sellSignal = true;
                openShortPosition(symbol, data?.ohlcvData[data?.ohlcvData.length - 1][4]);
            } else {
                if (!signalStatus[key]) signalStatus[key] = {};
                signalStatus[key].buySignal = analysisResult.buySignal;
                signalStatus[key].sellSignal = analysisResult.sellSignal;
            }
            break;

        default:
            console.log(`Unknown analysis type: ${analysisType}`);
            return;
    }

    return [data, analysisResult];
}



