"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PositionManager = void 0;
const position_1 = require("./position");
const uuid_1 = require("uuid");
class PositionManager {
    constructor() {
        this.positions = {};
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
    calculatePnL(id) {
        const position = this.positions[id];
        if (!position) {
            throw new Error(`Position ${id} does not exist.`);
        }
        if (position.type === position_1.PositionType.LONG) {
            return (position.sellPrice - position.buyPrice) * position.quantity;
        }
        else {
            return (position.buyPrice - position.sellPrice) * position.quantity;
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
