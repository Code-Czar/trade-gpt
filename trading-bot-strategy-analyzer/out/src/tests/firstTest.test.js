"use strict";
// Import the necessary modules
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const supertest = require("supertest");
const chai = __importStar(require("chai"));
const strategyAnalyzerServer_1 = __importDefault(require("@/strategyAnalyzerServer")); // Import your app
const strategyAnalyzer_1 = require("@/strategyAnalyzer");
// const app = require('../../backend-server'); // Import your app
console.log("🚀 ~ file: app.test.ts:6 ~ app:", strategyAnalyzerServer_1.default);
// Destructure the expect function from Chai
const { expect } = chai;
// Use your app with Supertest
const request = supertest(strategyAnalyzerServer_1.default);
// Write the tests
describe('GET /', () => {
    it('should respond with json and 200 status code', () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield request.get('/')
            .send()
            .expect(200);
        // Assert the response body
        // expect(response.body).to.be.an('object');
        // expect(response.body.message).to.equal('RSI values updated successfully');
    }));
});
describe('Notification test', () => {
    it('should sent notification on threshold', (done) => __awaiter(void 0, void 0, void 0, function* () {
        const { rsiValues, symbols, timeframes } = yield (0, strategyAnalyzer_1.fetchRSI)();
        const firstKey = Object.keys(rsiValues)[0];
        const firstValue = Object.values(rsiValues)[0];
        const singleRSI = {};
        singleRSI['BTCUSDT'] = rsiValues['BTCUSDT'];
        singleRSI['BTCUSDT']['5m'] = [0];
        // const singleRSI = rsiValues.slice(1);
        // console.log("🚀 ~ file: firstTest.test.ts:36 ~ it ~ singleRSI:", typeof rsiValues, singleRSI)
        let notificationsSent = yield (0, strategyAnalyzer_1.checkRSIThresholds)(singleRSI, symbols, timeframes);
        expect(notificationsSent['BTCUSDT']['5m']).to.equal(true);
        singleRSI['BTCUSDT']['5m'] = [50];
        notificationsSent = yield (0, strategyAnalyzer_1.checkRSIThresholds)(singleRSI, symbols, timeframes);
        expect(notificationsSent['BTCUSDT']['5m']).to.equal(false);
        console.log("🚀 ~ file: firstTest.test.ts:43 ~ it ~ notificationsSent:", notificationsSent['BTCUSDT']);
        singleRSI['BTCUSDT']['5m'] = [0];
        notificationsSent = yield (0, strategyAnalyzer_1.checkRSIThresholds)(singleRSI, symbols, timeframes);
        expect(notificationsSent['BTCUSDT']['5m']).to.equal(true);
        console.log("🚀 ~ file: firstTest.test.ts:45 ~ it ~ notificationsSent:", notificationsSent['BTCUSDT']);
        done();
    }));
});
//# sourceMappingURL=firstTest.test.js.map