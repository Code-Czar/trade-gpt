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
        this.init();
    }

    async init() {
        const positions = await this.getOpenPositionsFromBackend();
        positions.forEach(positionData => {
            const { id, symbol, buyPrice, sellPrice, quantity, type, status } = positionData;
            const position = new Position(id, symbol, buyPrice, sellPrice, quantity, type, status);
            this.positions[id] = position;
        });
        this.startPnLCheck();
    }

    startPnLCheck() {
        setInterval(() => {
            this.checkPnL();
        }, 10 * 1000);
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
            let pnl = this.calculatePnL(id, currentPrice);
            pnl = parseFloat(pnl.toFixed(5));

            // Update the PnL in the Django backend
            const response = await fetch(`${this.backendUrl}/positions/${id}/`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    PnL: pnl,
                }),
            });

            if (!response.ok) {
                const responseBody = await response.text();
                console.error(`Failed to update PnL for position ${id}: ${response.status} ${response.statusText} - ${responseBody}`);
                continue;
            }

            if (position.type === PositionType.LONG) {
                console.log(`PnL for position LONG ${position.id} (${position.symbol}): ${pnl} - Current price: ${currentPrice}`);
            }
            else if (position.type === PositionType.SHORT) {
                console.log(`PnL for position SHORT ${position.id} (${position.symbol}): ${pnl} - Current price: ${currentPrice}`);
            }
        }
    }

    async getOpenPositionsFromBackend() {
        const url = `${this.backendUrl}/positions/open_positions/`;
        console.log("🚀 ~ file: positionManager.ts:53 ~ PositionManager ~ getOpenPositionsFromBackend ~ url:", url)
        const response = await axios.get(url);
        const positions = response.data;
        return positions;
    }

    async createPosition(positionProps: PositionProps): Promise<Position> {
        let position: Position;
        const { symbol, buyPrice, sellPrice, quantity, type } = positionProps;
        if (type === PositionType.LONG) {
            if (!buyPrice) {
                throw new Error('A buyPrice is required to create a long position');
            }
            position = await this.createLongPosition(symbol, buyPrice, quantity);
        } else if (type === PositionType.SHORT) {
            if (!sellPrice) {
                throw new Error('A sellPrice is required to create a short position');
            }
            position = await this.createShortPosition(symbol, sellPrice, quantity);
        } else {
            throw new Error(`Invalid position type: ${type}. Allowed values are 'long' and 'short'`);
        }
        this.positions[position.id] = position;



        return position;
    }


    async createLongPosition(symbol: string, buyPrice: number, quantity: number): Promise<Position> {
        const position = new Position(uuidv4(), symbol, buyPrice, null, quantity, PositionType.LONG, PositionStatus.OPEN);


        // Create the position in the Django backend
        const response = await fetch(`${this.backendUrl}/positions/`, {
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

        const data = await response.json();
        position.id = data.id;
        console.log("🚀 ~ file: positionManager.ts:127 ~ PositionManager ~ createLongPosition ~ data:", data)
        this.positions[position.id] = position;
        return data;
    }

    async createShortPosition(symbol: string, sellPrice: number, quantity: number): Promise<Position> {
        const position = new Position(uuidv4(), symbol, null, sellPrice, quantity, PositionType.SHORT, PositionStatus.OPEN);


        // Create the position in the Django backend
        const response = await fetch(`${this.backendUrl}/positions/`, {
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

        const data = await response.json();
        console.log("🚀 ~ file: positionManager.ts:153 ~ PositionManager ~ createShortPosition ~ data:", data)
        position.id = data.id;
        this.positions[position.id] = position;
        return data;
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
