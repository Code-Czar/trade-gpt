"use strict";
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
exports.PositionManager = void 0;
const position_1 = require("./position");
const uuid_1 = require("uuid");
const node_fetch_1 = __importDefault(require("node-fetch"));
const axios_1 = __importDefault(require("axios"));
const ccxt_1 = __importDefault(require("ccxt"));
let exchange = new ccxt_1.default.binance();
class PositionManager {
    constructor() {
        this.backendUrl = 'http://127.0.0.1:8000'; // URL of your Django backend
        this.positions = {};
        this.init();
    }
    init() {
        return __awaiter(this, void 0, void 0, function* () {
            const positions = yield this.getOpenPositionsFromBackend();
            positions.forEach(positionData => {
                const { id, symbol, buyPrice, sellPrice, quantity, type, status } = positionData;
                const position = new position_1.Position(id, symbol, buyPrice, sellPrice, quantity, type, status);
                this.positions[id] = position;
            });
            this.startPnLCheck();
        });
    }
    startPnLCheck() {
        setInterval(() => {
            this.checkPnL();
        }, 10 * 1000);
    }
    getCurrentPrice(symbol) {
        return __awaiter(this, void 0, void 0, function* () {
            symbol = symbol.replace('-', '/');
            let ticker = yield exchange.fetchTicker(symbol);
            return ticker.last;
        });
    }
    checkPnL() {
        return __awaiter(this, void 0, void 0, function* () {
            for (let id in this.positions) {
                const position = this.positions[id];
                const currentPrice = yield this.getCurrentPrice(position.symbol);
                let pnl = this.calculatePnL(id, currentPrice);
                pnl = parseFloat(pnl.toFixed(5));
                // Update the PnL in the Django backend
                const response = yield (0, node_fetch_1.default)(`${this.backendUrl}/positions/${id}/`, {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        PnL: pnl,
                    }),
                });
                if (!response.ok) {
                    const responseBody = yield response.text();
                    console.error(`Failed to update PnL for position ${id}: ${response.status} ${response.statusText} - ${responseBody}`);
                    continue;
                }
                if (position.type === position_1.PositionType.LONG) {
                    console.log(`PnL for position LONG ${position.id} (${position.symbol}): ${pnl} - Current price: ${currentPrice}`);
                }
                else if (position.type === position_1.PositionType.SHORT) {
                    console.log(`PnL for position SHORT ${position.id} (${position.symbol}): ${pnl} - Current price: ${currentPrice}`);
                }
            }
        });
    }
    getOpenPositionsFromBackend() {
        return __awaiter(this, void 0, void 0, function* () {
            const url = `${this.backendUrl}/positions/open_positions/`;
            console.log("🚀 ~ file: positionManager.ts:53 ~ PositionManager ~ getOpenPositionsFromBackend ~ url:", url);
            const response = yield axios_1.default.get(url);
            const positions = response.data;
            return positions;
        });
    }
    createPosition(positionProps) {
        return __awaiter(this, void 0, void 0, function* () {
            let position;
            const { symbol, buyPrice, sellPrice, quantity, type } = positionProps;
            if (type === position_1.PositionType.LONG) {
                if (!buyPrice) {
                    throw new Error('A buyPrice is required to create a long position');
                }
                position = yield this.createLongPosition(symbol, buyPrice, quantity);
            }
            else if (type === position_1.PositionType.SHORT) {
                if (!sellPrice) {
                    throw new Error('A sellPrice is required to create a short position');
                }
                position = yield this.createShortPosition(symbol, sellPrice, quantity);
            }
            else {
                throw new Error(`Invalid position type: ${type}. Allowed values are 'long' and 'short'`);
            }
            this.positions[position.id] = position;
            return position;
        });
    }
    createLongPosition(symbol, buyPrice, quantity) {
        return __awaiter(this, void 0, void 0, function* () {
            const position = new position_1.Position((0, uuid_1.v4)(), symbol, buyPrice, null, quantity, position_1.PositionType.LONG, position_1.PositionStatus.OPEN);
            // Create the position in the Django backend
            const response = yield (0, node_fetch_1.default)(`${this.backendUrl}/positions/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    id: position.id,
                    symbol: position.symbol,
                    buyPrice: position.buyPrice,
                    sellPrice: position.sellPrice,
                    quantity: position.quantity,
                    type: position.type,
                    status: position.status,
                }),
            });
            const data = yield response.json();
            position.id = data.id;
            console.log("🚀 ~ file: positionManager.ts:127 ~ PositionManager ~ createLongPosition ~ data:", data);
            this.positions[position.id] = position;
            return data;
        });
    }
    createShortPosition(symbol, sellPrice, quantity) {
        return __awaiter(this, void 0, void 0, function* () {
            const position = new position_1.Position((0, uuid_1.v4)(), symbol, null, sellPrice, quantity, position_1.PositionType.SHORT, position_1.PositionStatus.OPEN);
            // Create the position in the Django backend
            const response = yield (0, node_fetch_1.default)(`${this.backendUrl}/positions/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    id: position.id,
                    symbol: position.symbol,
                    buyPrice: position.buyPrice,
                    sellPrice: position.sellPrice,
                    quantity: position.quantity,
                    type: position.type,
                    status: position.status,
                }),
            });
            const data = yield response.json();
            console.log("🚀 ~ file: positionManager.ts:153 ~ PositionManager ~ createShortPosition ~ data:", data);
            position.id = data.id;
            this.positions[position.id] = position;
            return data;
        });
    }
    closePosition(id, closingPrice) {
        const position = this.positions[id];
        if (!position) {
            throw new Error(`Position with id ${id} does not exist`);
        }
        if (position.type === position_1.PositionType.LONG) {
            position.sellPrice = closingPrice;
        }
        else if (position.type === position_1.PositionType.SHORT) {
            position.buyPrice = closingPrice;
        }
        position.status = position_1.PositionStatus.CLOSED;
        // Close the position in the Django backend
        (0, node_fetch_1.default)(`${this.backendUrl}/positions/${id}/close/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                sellPrice: position.sellPrice,
                buyPrice: position.buyPrice,
                status: position_1.PositionStatus.CLOSED,
            }),
        });
        return position;
    }
    calculatePnL(id, currentPrice) {
        const position = this.positions[id];
        if (!position) {
            throw new Error(`Position with id ${id} does not exist`);
        }
        let pnl = 0;
        if (position.type === position_1.PositionType.LONG) {
            pnl = (currentPrice - position.buyPrice) * position.quantity;
        }
        else if (position.type === position_1.PositionType.SHORT) {
            pnl = (position.sellPrice - currentPrice) * position.quantity;
        }
        return pnl;
    }
}
exports.PositionManager = PositionManager;
