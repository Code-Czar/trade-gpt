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
Object.defineProperty(exports, "__esModule", { value: true });
const supertest = require("supertest");
const chai = __importStar(require("chai"));
// import app from '../../backend-server'; // Import your app
const app = require('../../backend-server'); // Import your app
console.log("🚀 ~ file: app.test.ts:6 ~ app:", app);
// Destructure the expect function from Chai
const { expect } = chai;
// Use your app with Supertest
const request = supertest(app);
// Write the tests
describe('POST /set-rsi', () => {
    let server;
    before((done) => {
        console.log('Starting server...');
        server = app.listen(3000, done);
        console.log("🚀 ~ file: app.test.ts:23 ~ before ~ server:", server);
    });
    after((done) => {
        console.log('Stopping server...');
        server.close(done);
    });
    it('should respond with json and 200 status code', () => {
        request.post('/set-rsi')
            .send({
            pair: '1INCHUSDT',
            timeframe: '1d',
            rsiValues: [70, 30]
        })
            .expect('Content-Type', /json/)
            .expect(200).then((response) => {
            // Assert the response body
            expect(response.body).to.be.an('object');
            expect(response.body.message).to.equal('RSI values updated successfully');
        });
    });
    // it('should respond with json and 400 status code for invalid request body', () => {
    //     const response = await request.post('/set-rsi')
    //         .send({
    //             pair: '1INCHUSDT',
    //             timeframe: '1d'
    //             // missing rsiValues
    //         })
    //         .expect('Content-Type', /json/)
    //         .expect(400);
    //     // Assert the response body
    //     expect(response.body).to.be.an('object');
    //     expect(response.body.error).to.equal('Invalid request body');
    // });
});
//# sourceMappingURL=app.test.js.map