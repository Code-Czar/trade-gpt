import { Position, PositionProps, PositionStatus, PositionType } from './position';
import { v4 as uuidv4 } from 'uuid';
import fetch from 'node-fetch';
import ccxt from 'ccxt';
let exchange = new ccxt.binance();



export class PositionManager {
    private positions: { [key: string]: Position };

    constructor() {
        this.positions = {};
        this.startPnLCheck();
    }

    startPnLCheck() {
        setInterval(() => {
            this.checkPnL();
        }, 1000);
    }

    async getCurrentPrice(symbol: string): Promise<number> {
        symbol = symbol.replace('-', '/');
        let ticker = await exchange.fetchTicker(symbol);
        return ticker.last;
    }

    async checkPnL() {
        for (let id in this.positions) {
            const position = this.positions[id];
            const currentPrice = await this.getCurrentPrice(position.symbol); // This function is to be implemented
            const pnl = this.calculatePnL(id, currentPrice);
            if (position.type === PositionType.LONG) {
                console.log(`PnL for position LONG ${position.id} (${position.symbol}): ${pnl} - Current price: ${currentPrice}`);
            }
            else if (position.type === PositionType.SHORT) {
                console.log(`PnL for position SHORT ${position.id} (${position.symbol}): ${pnl} - Current price: ${currentPrice}`);
            }
        }
    }



    createPosition(positionProps: PositionProps): Position {
        let position: Position;
        const { symbol, buyPrice, sellPrice, quantity, type } = positionProps;

        if (type === PositionType.LONG) {
            if (!buyPrice) {
                throw new Error('A buyPrice is required to create a long position');
            }
            position = this.createLongPosition(symbol, buyPrice, quantity);
        } else if (type === PositionType.SHORT) {
            if (!sellPrice) {
                throw new Error('A sellPrice is required to create a short position');
            }
            position = this.createShortPosition(symbol, sellPrice, quantity);
        } else {
            throw new Error(`Invalid position type: ${type}. Allowed values are 'long' and 'short'`);
        }

        return position;
    }


    createLongPosition(symbol: string, buyPrice: number, quantity: number): Position {
        const position = new Position(uuidv4(), symbol, buyPrice, null, quantity, PositionType.LONG);
        this.positions[position.id] = position;
        return position;
    }

    createShortPosition(symbol: string, sellPrice: number, quantity: number): Position {
        const position = new Position(uuidv4(), symbol, null, sellPrice, quantity, PositionType.SHORT);
        this.positions[position.id] = position;
        return position;
    }

    closePosition(id: string, closingPrice: number) {
        const position = this.positions[id];
        if (!position) {
            throw new Error(`Position ${id} does not exist.`);
        }
        if (position.type === PositionType.LONG) {
            position.sellPrice = closingPrice;
        } else {
            position.buyPrice = closingPrice;
        }
        position.status = PositionStatus.CLOSED;
        return position;
    }

    calculatePnL(id: string, currentPrice: number) {
        const position = this.positions[id];
        if (!position) {
            console.log(`Position ${id} does not exist.`);
            return null;
        }
        if (position.type === PositionType.LONG) {
            return (currentPrice - position.buyPrice) * position.quantity;
        } else {
            return (position.sellPrice - currentPrice) * position.quantity;
        }
    }

    getPosition(id: string) {
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
        return Object.values(this.positions).filter(position => position.status === PositionStatus.OPEN);
    }

    getClosedPositions() {
        return Object.values(this.positions).filter(position => position.status === PositionStatus.CLOSED);
    }

}
