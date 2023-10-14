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




const publicClient = new WebSocket(WEB_SOCKETS_URLS.FUTURES);
const privateClient = new WebSocket(WEB_SOCKETS_URLS.PRIVATE);

privateClient.on('open', function () {
    console.log('"open" PRIVATE event!');
    console.log('WebSocket PRIVATE Client Connected');
    const expires = new Date().getTime() + 10000;
    const signature = crypto.createHmac("sha256", apiSecret).update("GET/realtime" + expires).digest("hex");
    const payload={
		op: "auth",
		args: [apiKey, expires.toFixed(0), signature],
	}
    console.log("🚀 ~ file: ByBitWebSocket.ts:34 ~ payload:", payload)
    privateClient.send(JSON.stringify(payload));
    privateClient.send(JSON.stringify({op:'wallet'}));
    setInterval(() => { privateClient.ping() }, 30000);
    privateClient.ping();
    // privateClient.send(JSON.stringify({ "op": "subscribe", "args": ['kline.1.BTCUSDT', 'kline.5.BTCUSDT', 'kline.60.BTCUSDT', 'kline.1.FITFIUSDT'] }));
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


// publicClient.on('open', function () {
//     console.log('"open" event!');
//     console.log('WebSocket Client Connected');
//     const expires = new Date().getTime() + 10000;
//     const signature = crypto.createHmac("sha256", apiSecret).update("GET/realtime" + expires).digest("hex");
   
//     setInterval(() => { publicClient.ping() }, 30000);
//     publicClient.ping();
//     publicClient.send(JSON.stringify({ "op": "subscribe", "args": ['kline.1.BTCUSDT', 'kline.5.BTCUSDT', 'kline.60.BTCUSDT', 'kline.1.FITFIUSDT'] }));
// });

// publicClient.on('message', function (data) {
//     console.log('"message" event! %j', JSON.parse(Buffer.from(data).toString()));
// });
// publicClient.on('ping', function (data, flags) {
//     console.log("ping received");
// });
// publicClient.on('pong', function (data, flags) {
//     console.log("pong received");
// });