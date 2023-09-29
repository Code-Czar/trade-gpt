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
const backend_server_1 = __importDefault(require("@/../backend-server")); // Import your app
// Destructure the expect function from Chai
const { expect } = chai;
// Use your app with Supertest
const request = supertest(backend_server_1.default);
// Write the tests
describe('POST /set-rsi', () => {
    it('should respond with json and 200 status code', () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield request.post('/set-rsi')
            .send({
            pair: '1INCHUSDT',
            timeframe: '1d',
            rsiValues: [70, 30]
        })
            .expect('Content-Type', /json/)
            .expect(200);
        // Assert the response body
        expect(response.body).to.be.an('object');
        expect(response.body.message).to.equal('RSI values updated successfully');
    }));
    it('should respond with json and 400 status code for invalid request body', () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield request.post('/set-rsi')
            .send({
            pair: '1INCHUSDT',
            timeframe: '1d'
            // missing rsiValues
        })
            .expect('Content-Type', /json/)
            .expect(400);
        // Assert the response body
        expect(response.body).to.be.an('object');
        expect(response.body.error).to.equal('Invalid request body');
    }));
});
//# sourceMappingURL=app.test.js.map