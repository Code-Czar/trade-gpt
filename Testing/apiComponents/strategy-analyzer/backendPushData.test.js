const { expect } = require('chai');
const { spawn } = require('child_process');
const {apiConnector} = require('trading-shared')


function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

const path = "./apiComponents/strategy-analyzer"
const strategyAnalyzerPath='../trading-bot-strategy-analyzer'

function startMockBackend() {
    const mockBackendPath = './mockBackendServer.js'; // Relative path from this script to mockBackendServer.js
    return new Promise((resolve, reject) => {
        const analyzerProcess = spawn('node', [mockBackendPath], {
            cwd: path, // Set the current working directory to the directory of this script
            shell: true,
            stdio: ['inherit', 'inherit', 'pipe']
        });

        analyzerProcess.stderr.on('data', (data) => {
            console.error(`stderr: ${data}`);
            reject(data);
        });

        analyzerProcess.on('close', (code) => {
            if (code !== 0) {
                console.error(`Mock backend process exited with code ${code}`);
                reject(`Exit code: ${code}`);
            } else {
                resolve();
            }
        });
    });
}

function startStrategyAnalyzer() {
    const mockBackendPath = './mockBackendServer.js'; // Relative path from this script to mockBackendServer.js
    return new Promise((resolve, reject) => {
        const analyzerProcess = spawn('yarn dev', [], {
            cwd: strategyAnalyzerPath, // Set the current working directory to the directory of this script
            shell: true,
            stdio: ['inherit', 'inherit', 'pipe']
        });

        analyzerProcess.stderr.on('data', (data) => {
            console.error(`stderr: ${data}`);
            reject(data);
        });

        analyzerProcess.on('close', (code) => {
            if (code !== 0) {
                console.error(`Mock backend process exited with code ${code}`);
                reject(`Exit code: ${code}`);
            } else {
                resolve();
            }
        });
    });
}

describe.only('Mock Backend Server', function() {
    this.timeout(150000);
    before(async () => {
          startMockBackend();
          await sleep(200); // Wait 10 seconds for the server to start
          startStrategyAnalyzer();
        await sleep(2000); // Wait 10 seconds for the server to start
    });

    it('should send data to the mock backend server', async () => {
        const url = 'http://localhost:3000/sendDataToStrategyAnalyzer'; // Updated to port 3000
        const dataToSend = { topic: 'getRealTimeData' };
    
        const result = await apiConnector.post(url, dataToSend);
        console.log("🚀 ~ file: backendPushData.test.js:49 ~ result:", await result.data);
    
        // You can add assertions here to verify the result
        expect(result.status).to.equal(200);
        // expect(result.data).to.deep.equal(/* Expected response data */);
    });
    

    // Additional tests...
});
