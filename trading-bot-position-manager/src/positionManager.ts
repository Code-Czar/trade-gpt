import { Position, PositionProps, PositionStatus, PositionType } from './position';
import { v4 as uuidv4 } from 'uuid';
import fetch from 'node-fetch';
import axios from 'axios';

import ccxt from 'ccxt';
let exchange = new ccxt.binance();

export class PositionManager {
    private positions: { [key: string]: Position };
    private backendUrl = 'http://127.0.0.1:8000';  // URL of your Django backend

    constructor() {
        this.positions = {};
        this.startPnLCheck();
        this.getOpenPositionsFromBackend().then(positions => {
            positions.forEach(positionData => {
                const { id, symbol, buyPrice, sellPrice, quantity, type, status } = positionData;
                const position = new Position(id, symbol, buyPrice, sellPrice, quantity, type, status);
                this.positions[id] = position;
            });
        });
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
            const currentPrice = await this.getCurrentPrice(position.symbol);
            const pnl = this.calculatePnL(id, currentPrice);
            if (position.type === PositionType.LONG) {
                console.log(`PnL for position LONG ${position.id} (${position.symbol}): ${pnl} - Current price: ${currentPrice}`);
            }
            else if (position.type === PositionType.SHORT) {
                console.log(`PnL for position SHORT ${position.id} (${position.symbol}): ${pnl} - Current price: ${currentPrice}`);
            }
        }
    }

    // Get all open positions from the Django backend
    // async getOpenPositionsFromBackend() {
    //     const url = `${this.backendUrl}/positions/open_positions/`;
    //     console.log("🚀 ~ file: positionManager.ts:53 ~ PositionManager ~ getOpenPositionsFromBackend ~ url:", url)
    //     const response = await fetch(`${url}`);
    //     const positions = await response.json();
    //     return positions;
    // }

    async getOpenPositionsFromBackend() {
        const url = `${this.backendUrl}/positions/open_positions/`;
        console.log("🚀 ~ file: positionManager.ts:53 ~ PositionManager ~ getOpenPositionsFromBackend ~ url:", url)
        const response = await axios.get(url);
        const positions = response.data;
        return positions;
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

        // Create the position in the Django backend
        fetch(`${this.backendUrl}/positions/`, {
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

        return position;
    }

    createLongPosition(symbol: string, buyPrice: number, quantity: number): Position {
        const position = new Position(uuidv4(), symbol, buyPrice, null, quantity, PositionType.LONG);
        this.positions[position.id] = position;
        return position;
    }

    createShortPosition(symbol: string, sellPrice: number, quantity: number): Position {
        const position = new Position(uuidv4(), symbol, null, sellPrice, quantity, PositionType.SHORT, PositionStatus.OPEN);
        this.positions[position.id] = position;

        // Create the position in the Django backend
        fetch(`${this.backendUrl}/positions/`, {
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

        return position;
    }


    closePosition(id: string, closingPrice: number) {
        const position = this.positions[id];
        if (!position) {
            throw new Error(`Position with id ${id} does not exist`);
        }
        if (position.type === PositionType.LONG) {
            position.sellPrice = closingPrice;
        } else if (position.type === PositionType.SHORT) {
            position.buyPrice = closingPrice;
        }
        position.status = PositionStatus.CLOSED;

        // Close the position in the Django backend
        fetch(`${this.backendUrl}/positions/${id}/close/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                sellPrice: position.sellPrice,
                buyPrice: position.buyPrice,
                status: PositionStatus.CLOSED,
            }),
        });

        return position;
    }

    calculatePnL(id: string, currentPrice: number): number {
        const position = this.positions[id];
        if (!position) {
            throw new Error(`Position with id ${id} does not exist`);
        }
        let pnl = 0;
        if (position.type === PositionType.LONG) {
            pnl = (currentPrice - position.buyPrice!) * position.quantity;
        } else if (position.type === PositionType.SHORT) {
            pnl = (position.sellPrice! - currentPrice) * position.quantity;
        }
        return pnl;
    }
}
