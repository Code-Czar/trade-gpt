// Import the necessary modules

import supertest = require('supertest');
import * as chai from 'chai';
import app from '@/strategyAnalyzerServer'; // Import your app
import { fetchRSI, checkRSIThresholds } from '@/strategyAnalyzer'
// const app = require('../../backend-server'); // Import your app


console.log("🚀 ~ file: app.test.ts:6 ~ app:", app)

// Destructure the expect function from Chai
const { expect } = chai;

// Use your app with Supertest
const request = supertest(app);

// Write the tests
describe('GET /', () => {
    it('should respond with json and 200 status code', async () => {
        const response = await request.get('/')
            .send()
            .expect(200);
    });
});

describe('Notification test', () => {
    it('should send notification on threshold', async () => {
        const { rsiValues, symbols, timeframes } = await fetchRSI()
        const singleRSI = {}
        singleRSI['BTCUSDT'] = rsiValues['BTCUSDT']
        singleRSI['BTCUSDT']['5m'] = [0]

        let notificationsSent = await checkRSIThresholds(singleRSI, symbols, timeframes)
        expect(notificationsSent['BTCUSDT']['5m']).to.equal(true);

        singleRSI['BTCUSDT']['5m'] = [50]
        notificationsSent = await checkRSIThresholds(singleRSI, symbols, timeframes)
        expect(notificationsSent['BTCUSDT']['5m']).to.equal(false);

        singleRSI['BTCUSDT']['5m'] = [0]
        notificationsSent = await checkRSIThresholds(singleRSI, symbols, timeframes)
        expect(notificationsSent['BTCUSDT']['5m']).to.equal(true);
    });
});

