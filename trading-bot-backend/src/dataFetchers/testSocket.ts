var url = require('url');
var WebSocket = require('ws');
var crypto = require('crypto');
var endpoint = "wss://stream.bybit.com/v5/private"
global.logger.info('attempting to connect to WebSocket %j', endpoint);
var client = new WebSocket(endpoint);
const apiKey = "UZNt3P7CRJZBKtMH4X";
const apiSecret = "jBqfnoA4ggi0m2JsWpgDH8rwwHg9aFuoOO2h";
client.on('open', function () {
    global.logger.info('"open" event!');
    global.logger.info('WebSocket Client Connected');
    const expires = new Date().getTime() + 10000;
    const signature = crypto.createHmac("sha256", apiSecret).update("GET/realtime" + expires).digest("hex");
    const payload = {
        op: "auth",
        args: [apiKey, expires.toFixed(0), signature],
    }
    client.send(JSON.stringify(payload));
    setInterval(() => { client.ping() }, 30000);
    client.ping();
    client.send(JSON.stringify({ "op": "subscribe", "args": ['order'] }));
});

client.on('message', function (data) {
    global.logger.info('"message" event! %j', JSON.parse(Buffer.from(data).toString()));
});
client.on('ping', function (data, flags) {
    global.logger.info("ping received");
});
client.on('pong', function (data, flags) {
    global.logger.info("pong received");
});