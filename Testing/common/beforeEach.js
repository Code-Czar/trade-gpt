const { apiConnector, sleep } = require('trading-shared');
const { startBackend, startStrategyAnalyzer, startCentralizationServer } = require('./startServers');
const { expect } = require('chai');

// Function to check if the server is up and running
async function waitForServerToBeReady(url, maxRetries = 5) {
  let retries = 0;
  while (retries < maxRetries) {
    try {
      const result = await apiConnector.get(url);
      await expect(await result.status).to.equal(200);
      return; // Server is ready, exit the function
    } catch (error) {
      retries++;
      console.log(`Waiting for server to be ready... Attempt ${retries}`, error);
      await new Promise((resolve) => setTimeout(resolve, 2000)); // Wait for 1 second before retrying
    }
  }

  throw new Error('Server did not become ready in time');
}

async function startAllServices(hook) {
  hook.timeout(60000); // Increase timeout to 10 seconds
  await startCentralizationServer();
  const backendProcess = await startBackend();
  await sleep(7000);
  const strategyAnalyzerProcess = await startStrategyAnalyzer();
  await sleep(5000);
  return {
    backendProcess,
    strategyAnalyzerProcess,
  };
}

module.exports = {
  waitForServerToBeReady,
  startAllServices,
};
