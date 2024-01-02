import { VersatileLogger, REMOTE_URL } from 'trading-shared'
import { stringifyMap, convertPairToJSON } from './utils/convertData'
import { PAIR_TYPES } from './types/consts'
import { DataController } from './controllers'

const express = require('express')
const http = require('http')
const https = require('https')
const fs = require('fs')

global.logger = new VersatileLogger('BackendServer', process.argv, true)

const app = express()
const cors = require('cors')
const bodyParser = require('body-parser')

app.use(bodyParser.json())
app.use(cors())

let server
if (!REMOTE_URL.includes('localhost') && !REMOTE_URL.includes('127.0.0.1')) {
  // Use the paths from your Apache SSL configuration
  const privateKey = fs.readFileSync(
    '/etc/letsencrypt/live/infinite-opportunities.pro/privkey.pem',
    'utf8',
  )
  const certificate = fs.readFileSync(
    '/etc/letsencrypt/live/infinite-opportunities.pro/fullchain.pem',
    'utf8',
  )

  const credentials = { key: privateKey, cert: certificate }
  server = https.createServer(credentials, app)
} else {
  server = http.createServer(app)
}

server.listen(3000, () => {
  console.log('BACKEND STARTED')
})

const PORT = 3000
const CLEAR_DATABASE = false

const dataController = new DataController(app, server)
dataController.init()

// app.get(
//   '/api/leverage/:symbol/:subdata',
//   async (req: Request, res: Response) => {
//     let { symbol, subdata } = req.params
//     try {
//       const symbolData = await convertPairToJSON(
//         bot.dataStore.get(PAIR_TYPES.leveragePairs).get(symbol),
//       )
//       res.status(200).json(symbolData[subdata])
//     } catch (error) {
//       console.error(error)
//       res
//         .status(500)
//         .json({ error: '/api/leverage/fullData : Error fetching data' })
//     }
//   },
// )

// app.get('/api/lastRsi/bulk', async (req: Request, res: Response) => {
//   const leveragePairsResult = await stringifyMap(
//     bot.dataStore.get(PAIR_TYPES.leveragePairs),
//   )
//   const result = {}
//   Object.entries(leveragePairsResult).forEach(([symbol, pair]) => {
//     result[symbol] = { rsi: {}, details: pair.details }

//     Object.entries(pair.rsi).forEach(([timeFrameKey, data]) => {
//       const lastRSI = data.rsiData

//       if (data.rsiData.length > 0) {
//         result[symbol].rsi[timeFrameKey] =
//           data.rsiData[data.rsiData.length - 1].value
//       } else {
//         result[symbol].rsi[timeFrameKey] = null
//       }
//     })
//   })

//   return res.status(200).json(result)
// })
// app.get('/api/getDataStore', async (req: Request, res: Response) => {
//   const leveragePairsResult = await stringifyMap(
//     bot.dataStore.get(PAIR_TYPES.leveragePairs),
//   )
//   return res.status(200).json(leveragePairsResult)
// })
