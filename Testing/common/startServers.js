const { spawn } = require('child_process');
const { exec } = require('child_process');

const path = './apiComponents/strategy-analyzer';
const backendPath = '../trading-bot-backend';
const strategyAnalyzerPath = '../trading-bot-strategy-analyzer';
const centralizationServerPath = '../trading-bot-centralization-server';

function startMockBackend() {
  const mockBackendPath = './mockBackendServer.js'; // Relative path from this script to mockBackendServer.js
  return new Promise((resolve, reject) => {
    const analyzerProcess = spawn('node', [mockBackendPath], {
      cwd: path, // Set the current working directory to the directory of this script
      shell: true,
      stdio: ['inherit', 'inherit', 'pipe'],
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

async function startCentralizationServer() {
  const command = `source env/bin/activate && cd trading_center && python manage.py runserver`;
  const options = {
    cwd: centralizationServerPath, // Set the current working directory to the directory of this script
    shell: true,
    stdio: 'inherit', // Inherit the standard I/O streams,
    detached: true,
  };

  const centralizationServerProcess = spawn(command, options);
  console.log(
    '🚀 ~ file: startCentralizationServer.js:46 ~ centralizationServer PID:',
    centralizationServerProcess.pid,
  );

  centralizationServerProcess.on('error', (err) => {
    console.error(`Error starting backendProcess: ${err.message}`);
    // callback(err, null);
  });

  centralizationServerProcess.on('close', (code) => {
    if (code !== 0) {
      console.error(`backendProcess exited with code ${code}`);
      // callback(`Exit code: ${code}`, null);
    } else {
      // callback(null, 'Strategy Analyzer process completed successfully');
    }
  });
  return centralizationServerProcess;
}

async function startBackend(logLevel = 'INFO') {
  const command = `./startService.sh ${logLevel} --testing`;
  const options = {
    cwd: backendPath, // Set the current working directory to the directory of this script
    shell: true,
    stdio: 'inherit', // Inherit the standard I/O streams,
    detached: true,
  };

  const backendProcess = spawn(command, options);
  console.log('🚀 ~ file: startServers.js:46 ~ backendProcess:', backendProcess.pid);

  backendProcess.on('error', (err) => {
    console.error(`Error starting backendProcess: ${err.message}`);
    // callback(err, null);
  });

  backendProcess.on('close', (code) => {
    if (code !== 0) {
      console.error(`backendProcess exited with code ${code}`);
      // callback(`Exit code: ${code}`, null);
    } else {
      // callback(null, 'Strategy Analyzer process completed successfully');
    }
  });
  return backendProcess;
}

async function startStrategyAnalyzer(logLevel = 'INFO') {
  const command = `ts-node --transpile-only src/strategyAnalyzerServer.ts --loglevel=${logLevel} --testing`;
  const options = {
    cwd: strategyAnalyzerPath, // Set the current working directory to the directory of this script
    shell: true,
    stdio: 'inherit', // Inherit the standard I/O streams,
    detached: true,
  };

  const analyzerProcess = spawn(command, options);
  console.log('🚀 ~ file: startServers.js:46 ~ analyzerProcess:', analyzerProcess.pid);

  analyzerProcess.on('error', (err) => {
    console.error(`Error starting Strategy Analyzer: ${err.message}`);
    // callback(err, null);
  });

  analyzerProcess.on('close', (code) => {
    if (code !== 0) {
      console.error(`Strategy Analyzer process exited with code ${code}`);
      // callback(`Exit code: ${code}`, null);
    } else {
      // callback(null, 'Strategy Analyzer process completed successfully');
    }
  });
  return analyzerProcess;
}
module.exports = {
  startCentralizationServer,
  startMockBackend,
  startStrategyAnalyzer,
  startBackend,
};
