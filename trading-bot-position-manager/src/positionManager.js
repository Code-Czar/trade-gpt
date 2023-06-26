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
const ccxt_1 = __importDefault(require("ccxt"));
let exchange = new ccxt_1.default.binance();
class PositionManager {
    constructor() {
        this.positions = {};
        this.startPnLCheck();
    }
    startPnLCheck() {
        setInterval(() => {
            this.checkPnL();
        }, 1000);
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
                const currentPrice = yield this.getCurrentPrice(position.symbol); // This function is to be implemented
                const pnl = this.calculatePnL(id, currentPrice);
                if (position.type === position_1.PositionType.LONG) {
                    console.log(`PnL for position LONG ${position.id} (${position.symbol}): ${pnl} - Current price: ${currentPrice}`);
                }
                else if (position.type === position_1.PositionType.SHORT) {
                    console.log(`PnL for position SHORT ${position.id} (${position.symbol}): ${pnl} - Current price: ${currentPrice}`);
                }
            }
        });
    }
    createPosition(positionProps) {
        let position;
        const { symbol, buyPrice, sellPrice, quantity, type } = positionProps;
        if (type === position_1.PositionType.LONG) {
            if (!buyPrice) {
                throw new Error('A buyPrice is required to create a long position');
            }
            position = this.createLongPosition(symbol, buyPrice, quantity);
        }
        else if (type === position_1.PositionType.SHORT) {
            if (!sellPrice) {
                throw new Error('A sellPrice is required to create a short position');
            }
            position = this.createShortPosition(symbol, sellPrice, quantity);
        }
        else {
            throw new Error(`Invalid position type: ${type}. Allowed values are 'long' and 'short'`);
        }
        return position;
    }
    createLongPosition(symbol, buyPrice, quantity) {
        const position = new position_1.Position((0, uuid_1.v4)(), symbol, buyPrice, null, quantity, position_1.PositionType.LONG);
        this.positions[position.id] = position;
        return position;
    }
    createShortPosition(symbol, sellPrice, quantity) {
        const position = new position_1.Position((0, uuid_1.v4)(), symbol, null, sellPrice, quantity, position_1.PositionType.SHORT);
        this.positions[position.id] = position;
        return position;
    }
    closePosition(id, closingPrice) {
        const position = this.positions[id];
        if (!position) {
            throw new Error(`Position ${id} does not exist.`);
        }
        if (position.type === position_1.PositionType.LONG) {
            position.sellPrice = closingPrice;
        }
        else {
            position.buyPrice = closingPrice;
        }
        position.status = position_1.PositionStatus.CLOSED;
        return position;
    }
    calculatePnL(id, currentPrice) {
        const position = this.positions[id];
        if (!position) {
            console.log(`Position ${id} does not exist.`);
            return null;
        }
        if (position.type === position_1.PositionType.LONG) {
            return (currentPrice - position.buyPrice) * position.quantity;
        }
        else {
            return (position.sellPrice - currentPrice) * position.quantity;
        }
    }
    getPosition(id) {
        const position = this.positions[id];
        if (!position) {
            throw new Error(`Position ${id} does not exist.`);
        }
        return position;
    }
    getPositions() {
        return Object.values(this.positions);
    }
    getOpenPositions() {
        return Object.values(this.positions).filter(position => position.status === position_1.PositionStatus.OPEN);
    }
    getClosedPositions() {
        return Object.values(this.positions).filter(position => position.status === position_1.PositionStatus.CLOSED);
    }
}
exports.PositionManager = PositionManager;
