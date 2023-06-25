"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Position = exports.PositionType = void 0;
// position.ts
var PositionType;
(function (PositionType) {
    PositionType["LONG"] = "long";
    PositionType["SHORT"] = "short";
})(PositionType || (exports.PositionType = PositionType = {}));
class Position {
    constructor(id, symbol, buyPrice, sellPrice, quantity, type) {
        this.id = id;
        this.symbol = symbol;
        this.buyPrice = buyPrice;
        this.sellPrice = sellPrice;
        this.quantity = quantity;
        this.type = type;
    }
}
exports.Position = Position;
exports.default = Position;
