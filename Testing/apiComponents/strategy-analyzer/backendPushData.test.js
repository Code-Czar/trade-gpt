const { expect } = require('chai');

const { startStrategyAnalyzer } = require('../../common/startServers');
const { loadSamplePair } = require('../../common/loadData');

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
const http = require('http');
const WebSocket = require('ws');

const server = http.createServer();
let response = null;

describe.skip('Mock Backend Server', function () {
  this.timeout(150000);
  let wss = new WebSocket.Server({ server, path: '/ws' });
  let analyzerProcess = null;

  wss.on('connection', (ws) => {
    ws.on('message', (message) => {
      response = JSON.parse(message);
      console.log('Received message from server:', response);
    });
  });

  before(async () => {
    server.listen(3000);
    console.log('Express app listening on port 3000');
    analyzerProcess = await startStrategyAnalyzer();
    console.log('🚀 ~ file: backendPushData.test.js:48 ~ analyzerProcess.pid:', analyzerProcess.pid);
    await sleep(2000);
  });

  it('should send data to the mock backend server via WebSocket', async () => {
    const clients = Array.from(wss.clients);
    const dataToSend = { topic: 'getRealTimeData', data: { storePair: await loadSamplePair() }, shouldRespond: true };

    const receivedResponse = await new Promise((resolve, reject) => {
      clients[0].on('message', (message) => {
        resolve(JSON.parse(message));
      });
      clients[0].send(JSON.stringify(dataToSend));

      setTimeout(() => reject(new Error('No response received')), 4000);
    });

    console.log('🚀 ~ file: backendPushData.test.js:16 ~ receivedResponse:', receivedResponse);

    expect(receivedResponse).to.not.be.null;
  });

  after(() => {
    wss.close();
    console.log('Closing WebSocket server and Strategy Analyzer process');
    console.log('🚀 ~ file: backendPushData.test.js:71 ~ analyzerProcess.pid:', analyzerProcess.pid);

    try {
      if (analyzerProcess) {
        if (analyzerProcess.spawnargs.includes('detached')) {
          process.kill(-analyzerProcess.pid, 'SIGTERM');
        } else {
          analyzerProcess.kill('SIGTERM');
        }
        console.log('Strategy Analyzer process terminated');
      }
    } catch (err) {
      console.error(`Error terminating Strategy Analyzer process: ${err}`);
    }
  });
});
