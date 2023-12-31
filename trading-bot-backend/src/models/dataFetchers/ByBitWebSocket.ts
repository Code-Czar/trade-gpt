import { convertTimeFrameToByBitStandard } from '../../utils/convertData'

const WebSocket = require('ws')
const crypto = require('crypto')

interface WebSocketURLs {
  FUTURES: string
  SPOT: string
  PRIVATE: string
}

interface Callbacks {
  OHLCVsUpdateCallback: ((message: any) => void) | null
  restartCallback: (() => void) | null
}

const WEB_SOCKETS_URLS: WebSocketURLs = {
  FUTURES: 'wss://stream.bybit.com/v5/public/linear',
  SPOT: 'wss://stream.bybit.com/v5/public/spot',
  PRIVATE: 'wss://stream.bybit.com/v5/private',
}

const apiKey = 'T6mYLquMbR2vRU3ukL'
const apiSecret = '3PBXd8rPDs3uju8N3t1gOrH08TezVfFw0YmB'
const expires = Math.round(new Date().getTime() + 1000)
const PONG_TIMEOUT = 40000
const PONG_TIMEOUT_COUNT = 4

export class ByBitWebSocket {
  publicClient: WebSocket
  privateClient: WebSocket = new WebSocket(WEB_SOCKETS_URLS.PRIVATE)
  pongTimeoutCount: number = 0
  pongTimeout = null
  pingPongInterval = null
  callbacks: Callbacks = {
    OHLCVsUpdateCallback: null,
    restartCallback: null,
  }

  constructor(callbacks) {
    this.publicClient = new WebSocket(WEB_SOCKETS_URLS.FUTURES)
    this.privateClient = new WebSocket(WEB_SOCKETS_URLS.PRIVATE)

    this.initPublicClient(callbacks)
    this.initPrivateClient(callbacks)
  }

  private initPublicClient(callbacks): void {
    this.publicClient.on('open', () => {
      global.logger.info('"open" event!')
      global.logger.info('WebSocket Client Connected')
      const expires = new Date().getTime() + 10000
      callbacks?.onPublicClientReady?.(true)
    })
    this.setupPingPongHandlers(this.publicClient, WEB_SOCKETS_URLS.FUTURES)
  }
  private initPrivateClient(callbacks): void {
    this.privateClient.on('open', () => {
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
      this.privateClient.send(JSON.stringify(payload))
      this.privateClient.send(JSON.stringify({ op: 'wallet' }))
      callbacks?.onPrivateClientReady?.(true)
    })
    this.privateClient.on('message', function (data) {
      global.logger.info(
        '"message" event! %j',
        JSON.parse(Buffer.from(data).toString()),
      )
    })
    this.privateClient.on('ping', function (data, flags) {
      global.logger.info('ping received')
    })
    this.privateClient.on('pong', function (data, flags) {
      global.logger.info('pong received')
    })

    this.setupPingPongHandlers(this.privateClient, WEB_SOCKETS_URLS.PRIVATE)
  }

  private setupPingPongHandlers(client: WebSocket, url: string): void {
    client.on('ping', () => {
      global.logger.info('ping sent')
    })

    client.on('pong', () => {
      global.logger.info('pong received')
      clearTimeout(this.pongTimeout)
    })

    this.pingPongInterval = setInterval(() => {
      client.ping()
      this.pongTimeout = setTimeout(async () => {
        global.logger.info('Pong not received')
        this.pongTimeoutCount++
        if (this.pongTimeoutCount >= PONG_TIMEOUT_COUNT) {
          console.error('Pong not received, reconnecting')
          try {
            await this.reconnectClient()
            this.callbacks.restartCallback?.()
            this.pongTimeoutCount = 0
            clearInterval(this.pingPongInterval)
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

  // ... existing class code ...

  private async reconnectClient(): Promise<void> {
    try {
      this.publicClient.close() // Close the existing connection
      this.publicClient = new WebSocket(WEB_SOCKETS_URLS.FUTURES) // Reinitialize WebSocket
      this.initPublicClient(this.callbacks) // Set up the client again

      // Wait until the WebSocket is open before resubscribing
      await new Promise((resolve) => {
        this.publicClient.on('open', resolve)
      })

      // Resubscribe to the necessary topics
      // Example: this.webSocketRegisterToAllOHLCVDataUpdates(...);
    } catch (error) {
      global.logger.error('Error during WebSocket reconnection:', error)
    }
  }

  public setReconnectCallback(restartCallback: () => void): void {
    this.callbacks.restartCallback = restartCallback
  }

  public webSocketSetOHLCVsUpdateCallback(
    callback: (message: any) => void,
  ): void {
    this.callbacks.OHLCVsUpdateCallback = callback
    this.publicClient.on('message', (data) => {
      const message = JSON.parse(Buffer.from(data).toString())
      // global.logger.info("🚀 ~ file: ByBitWebSocket.ts:73 ~ message:", message)
      if (message.topic?.includes('kline')) {
        this.callbacks.OHLCVsUpdateCallback?.(message)
      }
    })
  }

  public async webSocketRegisterToOHLCVDataForPair(
    symbolName: string,
    timeframe: string,
  ): Promise<void> {
    // global.logger.debug(
    //   '🚀 ~ file: ByBitWebSocket.ts:163 ~ timeframe:',
    //   timeframe,
    // )
    // global.logger.debug(
    //   '🚀 ~ file: ByBitWebSocket.ts:163 ~ symbolName:',
    //   symbolName,
    // )
    try {
      this.publicClient.send(
        JSON.stringify({
          op: 'subscribe',
          args: [
            `kline.${convertTimeFrameToByBitStandard(timeframe)}.${symbolName}`,
          ],
        }),
      )
    } catch (error) {
      global.logger.error('🚀 ~ file: ByBitWebSocket.ts:129 ~ error:', {
        error,
        symbolName,
      })
    }
  }

  public async webSocketRegisterToAllOHLCVDataUpdates(
    symbolNames: string[],
    timeframes: string[],
    newOHLCVDataCallback: (message: any) => void,
  ): Promise<void> {
    this.callbacks.OHLCVsUpdateCallback = newOHLCVDataCallback
    this.publicClient.on('message', (data) => {
      const message = JSON.parse(Buffer.from(data).toString())
      // global.logger.info("🚀 ~ file: ByBitWebSocket.ts:73 ~ message:", message)
      if (message.topic?.includes('kline')) {
        this.callbacks.OHLCVsUpdateCallback?.(message)
      }
    })

    symbolNames.forEach((symbolName) => {
      timeframes.forEach((timeframe) => {
        global.logger.debug(
          '🚀 ~ file: ByBitWebSocket.ts:199 ~ symbolName:',
          symbolName,
          timeframe,
        )
        this.publicClient.send(
          JSON.stringify({
            op: 'subscribe',
            args: [
              `kline.${convertTimeFrameToByBitStandard(
                timeframe,
              )}.${symbolName}`,
            ],
          }),
        )
      })
    })
  }
}
export default ByBitWebSocket
