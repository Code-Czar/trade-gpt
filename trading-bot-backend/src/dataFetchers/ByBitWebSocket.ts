import { convertTimeFrameToByBitStandard } from '../utils/convertData'

const WEB_SOCKETS_URLS = {
    FUTURES: 'wss://stream.bybit.com/v5/public/linear',
    SPOT: 'wss://stream.bybit.com/v5/public/spot',
    PRIVATE: 'wss://stream.bybit.com/v5/private',
}

const crypto = require('crypto')
const WebSocket = require('ws')

const apiKey = 'T6mYLquMbR2vRU3ukL'
const apiSecret = '3PBXd8rPDs3uju8N3t1gOrH08TezVfFw0YmB'

// Generate expires.
const expires = Math.round(new Date().getTime() + 1000)

const PONG_TIMEOUT = 40000 // 10 seconds, adjust this value as needed
const PONG_TIMEOUT_COUNT = 10 // number of consecutive timeouts before reconnecting

let pongTimeout
let pongTimeoutCount = 0

export let publicClient = new WebSocket(WEB_SOCKETS_URLS.FUTURES)
const privateClient = new WebSocket(WEB_SOCKETS_URLS.PRIVATE)

const callbacks = {
    OHLCVsUpdateCallback: null,
    restartCallback: null,
}
function initPublicClient() {
    publicClient = new WebSocket(WEB_SOCKETS_URLS.FUTURES)
    publicClient.on('open', function () {
        global.logger.info('"open" event!')
        global.logger.info('WebSocket Client Connected')
        const expires = new Date().getTime() + 10000
        const signature = crypto
            .createHmac('sha256', apiSecret)
            .update('GET/realtime' + expires)
            .digest('hex')

        setupPingPongHandlers(publicClient, WEB_SOCKETS_URLS.FUTURES)
    })
}

function setupPingPongHandlers(client, url) {
    client.on('ping', function () {
        global.logger.info('ping sent')
    })

    client.on('pong', function () {
        global.logger.info('pong received')
        clearTimeout(pongTimeout)
    })

    setInterval(() => {
        client.ping()
        pongTimeout = setTimeout(() => {
            global.logger.info('Pong not received')
            pongTimeoutCount++
            if (pongTimeoutCount >= PONG_TIMEOUT_COUNT) {
                console.error('Pong not received, reconnecting')
                try {
                    publicClient.terminate()
                    initPublicClient()
                    callbacks.restartCallback?.()
                    pongTimeoutCount = 0
                } catch (error) {
                    global.logger.info(
                        '🚀 ~ file: ByBitWebSocket.ts:69 ~ pongTimeout=setTimeout ~ error:',
                        error,
                    )
                }
            }
            // client.terminate(); // This will trigger the close event and your reconnection logic
        }, PONG_TIMEOUT)
    }, 30000) // Send ping every 30 seconds
}

function setReconnectCallback(restartCallback) {
    callbacks.restartCallback = restartCallback
}

privateClient.on('open', function () {
    global.logger.info('"open" PRIVATE event!')
    global.logger.info('WebSocket PRIVATE Client Connected')
    const expires = new Date().getTime() + 10000
    const signature = crypto
        .createHmac('sha256', apiSecret)
        .update('GET/realtime' + expires)
        .digest('hex')
    const payload = {
        op: 'auth',
        args: [apiKey, expires.toFixed(0), signature],
    }
    global.logger.info('🚀 ~ file: ByBitWebSocket.ts:34 ~ payload:', payload)
    privateClient.send(JSON.stringify(payload))
    privateClient.send(JSON.stringify({ op: 'wallet' }))
    setupPingPongHandlers(privateClient, WEB_SOCKETS_URLS.PRIVATE)
})
privateClient.on('message', function (data) {
    global.logger.info('"message" event! %j', JSON.parse(Buffer.from(data).toString()))
})
privateClient.on('ping', function (data, flags) {
    global.logger.info('ping received')
})
privateClient.on('pong', function (data, flags) {
    global.logger.info('pong received')
})

export const webSocketSetOHLCVsUpdateCallback = (callback) => {
    callbacks.OHLCVsUpdateCallback = callback
    publicClient.on('message', function (data) {
        const message = JSON.parse(Buffer.from(data).toString())
        // global.logger.info("🚀 ~ file: ByBitWebSocket.ts:73 ~ message:", message)
        if (message.topic?.includes('kline')) {
            callbacks.OHLCVsUpdateCallback(message)
        }
    })
}

export const webSocketRegisterToOHLCVDataForPair = async (
    symbolName,
    timeframe,
) => {
    try {
        publicClient.send(
            JSON.stringify({
                op: 'subscribe',
                args: [
                    `kline.${convertTimeFrameToByBitStandard(timeframe)}.${symbolName}`,
                ],
            }),
        )
    } catch (error) {
        global.logger.error('🚀 ~ file: ByBitWebSocket.ts:129 ~ error:', { error, symbolName })
    }
}

export const webSocketRegisterToAllOHLCVDataUpdates = async (
    symbolNames,
    timeframes,
    newOHLCVDataCallback,
) => {
    callbacks.OHLCVsUpdateCallback = newOHLCVDataCallback
    publicClient.on('message', function (data) {
        const message = JSON.parse(Buffer.from(data).toString())
        // global.logger.info("🚀 ~ file: ByBitWebSocket.ts:73 ~ message:", message)
        if (message.topic?.includes('kline')) {
            callbacks.OHLCVsUpdateCallback?.(message)
        }
    })

    symbolNames.forEach((symbolName) => {
        timeframes.forEach((timeframe) => {
            publicClient.send(
                JSON.stringify({
                    op: 'subscribe',
                    args: [
                        `kline.${convertTimeFrameToByBitStandard(timeframe)}.${symbolName}`,
                    ],
                }),
            )
        })
    })
}
initPublicClient()

export default {
    webSocketRegisterToAllOHLCVDataUpdates,
    webSocketRegisterToOHLCVDataForPair,
    webSocketSetOHLCVsUpdateCallback,
    setReconnectCallback,
}
