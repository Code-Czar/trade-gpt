import { convertTimeFrameToByBitStandard } from "../utils/convertData";


const WEB_SOCKETS_URLS = {
    FUTURES: 'wss://stream.bybit.com/v5/public/linear',
    SPOT: 'wss://stream.bybit.com/v5/public/spot',
    PRIVATE: 'wss://stream.bybit.com/v5/private'
}

const crypto = require('crypto');
const WebSocket = require('ws');

const apiKey = "T6mYLquMbR2vRU3ukL";
const apiSecret = "3PBXd8rPDs3uju8N3t1gOrH08TezVfFw0YmB";

// Generate expires.
const expires = Math.round((new Date().getTime() + 1000));

const PONG_TIMEOUT = 40000; // 10 seconds, adjust this value as needed

let pongTimeout;


export const publicClient = new WebSocket(WEB_SOCKETS_URLS.FUTURES);
const privateClient = new WebSocket(WEB_SOCKETS_URLS.PRIVATE);

const callbacks = {
    OHLCVsUpdateCallback: null,
};

function setupPingPongHandlers(client, url) {
    client.on('ping', function () {
        console.log("ping sent");
    });

    client.on('pong', function () {
        console.log("pong received");
        clearTimeout(pongTimeout);
    });

    setInterval(() => {
        client.ping();
        pongTimeout = setTimeout(() => {
            console.log("Pong not received");
            // client.terminate(); // This will trigger the close event and your reconnection logic
        }, PONG_TIMEOUT);
    }, 30000); // Send ping every 30 seconds
}


privateClient.on('open', function () {
    console.log('"open" PRIVATE event!');
    console.log('WebSocket PRIVATE Client Connected');
    const expires = new Date().getTime() + 10000;
    const signature = crypto.createHmac("sha256", apiSecret).update("GET/realtime" + expires).digest("hex");
    const payload = {
        op: "auth",
        args: [apiKey, expires.toFixed(0), signature],
    }
    console.log("🚀 ~ file: ByBitWebSocket.ts:34 ~ payload:", payload)
    privateClient.send(JSON.stringify(payload));
    privateClient.send(JSON.stringify({ op: 'wallet' }));
    setupPingPongHandlers(privateClient, WEB_SOCKETS_URLS.PRIVATE);

});
privateClient.on('message', function (data) {
    console.log('"message" event! %j', JSON.parse(Buffer.from(data).toString()));
});
privateClient.on('ping', function (data, flags) {
    console.log("ping received");
});
privateClient.on('pong', function (data, flags) {
    console.log("pong received");
});


publicClient.on('open', function () {
    console.log('"open" event!');
    console.log('WebSocket Client Connected');
    const expires = new Date().getTime() + 10000;
    const signature = crypto.createHmac("sha256", apiSecret).update("GET/realtime" + expires).digest("hex");

    setupPingPongHandlers(publicClient, WEB_SOCKETS_URLS.FUTURES);

});

publicClient.on('ping', function (data, flags) {
    console.log("ping received");
});
publicClient.on('pong', function (data, flags) {
    console.log("pong received");
});
export const webSocketSetOHLCVsUpdateCallback = (callback) => {
    callbacks.OHLCVsUpdateCallback = callback;
    publicClient.on('message', function (data) {
        const message = JSON.parse(Buffer.from(data).toString())
        // console.log("🚀 ~ file: ByBitWebSocket.ts:73 ~ message:", message)
        if (message.topic?.includes('kline')) {
            callbacks.OHLCVsUpdateCallback(message)
        }

    });
}

export const webSocketRegisterToOHLCVDataForPair = async (symbolName, timeframe, newOHLCVDataCallback) => {

    publicClient.send(JSON.stringify({ "op": "subscribe", "args": [`kline.${convertTimeFrameToByBitStandard(timeframe)}.${symbolName}`] }));

};

export const webSocketRegisterToAllOHLCVDataUpdates = async (symbolNames, timeframes, newOHLCVDataCallback) => {
    callbacks.OHLCVsUpdateCallback = newOHLCVDataCallback;
    publicClient.on('message', function (data) {
        const message = JSON.parse(Buffer.from(data).toString())
        // console.log("🚀 ~ file: ByBitWebSocket.ts:73 ~ message:", message)
        if (message.topic?.includes('kline')) {
            callbacks.OHLCVsUpdateCallback?.(message)
        }

    });

    symbolNames.forEach(symbolName => {
        timeframes.forEach(timeframe => {
            publicClient.send(JSON.stringify({ "op": "subscribe", "args": [`kline.${convertTimeFrameToByBitStandard(timeframe)}.${symbolName}`] }));
        })
    });


    // publicClient.send(JSON.stringify({ "op": "subscribe", "args": ['kline.1.BTCUSDT', 'kline.5.BTCUSDT', 'kline.60.BTCUSDT', 'kline.1.FITFIUSDT'] }));


};

export default {
    webSocketRegisterToAllOHLCVDataUpdates,
    webSocketRegisterToOHLCVDataForPair,
    webSocketSetOHLCVsUpdateCallback
}