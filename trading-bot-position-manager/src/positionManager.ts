import { Position, PositionProps, PositionStatus, PositionType } from './position';
import { v4 as uuidv4 } from 'uuid';
import fetch from 'node-fetch';
import axios from 'axios';
import { BybitManager } from './BybitManager';

import ccxt from 'ccxt';
let exchange = new ccxt.binance();

export class PositionManager {
    private positions: { [key: string]: Position };
    private backendUrl = 'http://127.0.0.1:8000'; // URL of your Django backend
    private bybitManager: BybitManager;

    constructor() {
        this.positions = {};
        this.bybitManager = new BybitManager();
        this.init();
    }

    async init() {
        const positions = await this.getOpenPositionsFromBackend();
        positions.forEach((positionData) => {
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
            // console.log("🚀 ~ file: positionManager.ts:45 ~ PositionManager ~ checkPnL ~ this.positions:", id)
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

            if (response.status !== 200) {
                const responseBody = await response.text();
                console.error(
                    `Failed to update PnL for position ${id}: ${response.status} ${response.statusText} - ${responseBody}`,
                );
                continue;
            }

            if (position.type === PositionType.LONG) {
                // console.log(
                // `PnL for position LONG ${position.id} (${position.symbol}): ${pnl} - Current price: ${currentPrice}`,
                // );
            } else if (position.type === PositionType.SHORT) {
                // console.log(
                // `PnL for position SHORT ${position.id} (${position.symbol}): ${pnl} - Current price: ${currentPrice}`,
                // );
            }
        }
    }

    private async createPositionInBackend(position: Position) {
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
                bybitOrderId: position.bybitOrderId,
            }),
        });
        // console.log("🚀 ~ file: positionManager.ts:84 ~ PositionManager ~ createPositionInBackend ~ response:", response)

        if (response.status !== 201) {
            const responseBody = await response.text();
            console.error(
                `Failed to create position in backend: ${response.status} ${response.statusText} - ${responseBody}`,
            );
            throw new Error(responseBody);
        }
        const responseJson = await response.json();
        console.log("🚀 ~ file: positionManager.ts:107 ~ PositionManager ~ createPositionInBackend ~ response.data:", responseJson.data.id)
        return responseJson.data.id
    }

    async getOpenPositionsFromBackend() {
        const url = `${this.backendUrl}/positions/open_positions/`;
        // console.log('🚀 ~ file: positionManager.ts:53 ~ PositionManager ~ getOpenPositionsFromBackend ~ url:', url);
        const response = await axios.get(url);
        const positions = response.data;
        return positions;
    }

    async createPosition(positionProps: PositionProps): Promise<Position> {
        let position: Position;
        const { symbol, buyPrice, sellPrice, quantity, type } = positionProps;
        console.log("🚀 ~ file: positionManager.ts:124 ~ PositionManager ~ createPosition ~ positionProps:", type, type == 'long');

        if (type == 'long') {
            console.log("🚀 ~ file: positionManager.ts:127 ~ PositionManager ~ createPosition ~ type:", type)
            if (!buyPrice) {
                throw new Error('A buyPrice is required to create a long position');
            }
            position = await this.createLongPosition(symbol, buyPrice, quantity);
            console.log("🚀 ~ file: positionManager.ts:131 ~ PositionManager ~ createPosition ~ position:", position)
        } else if (type == 'short') {
            console.log("🚀 ~ file: positionManager.ts:134 ~ PositionManager ~ createPosition ~ type:", type)
            if (!sellPrice) {
                throw new Error('A sellPrice is required to create a short position');
            }
            position = await this.createShortPosition(symbol, sellPrice, quantity);
            console.log("🚀 ~ file: positionManager.ts:137 ~ PositionManager ~ createPosition ~ position:", position)
        } else {
            throw new Error(`Invalid position type: ${type}. Allowed values are 'long' and 'short'`);
        }
        this.positions[position.id] = position;

        return position;
    }

    private async createLongPosition(symbol: string, buyPrice: number, quantity: number): Promise<Position> {

        const position = new Position(uuidv4(), symbol, buyPrice, null, quantity, PositionType.LONG, PositionStatus.OPEN);

        position.bybitOrderId = await this.bybitManager.createOrder('Buy', symbol, buyPrice, quantity, position);

        // Create the position in the Django backend
        const positionID = await this.createPositionInBackend(position);
        console.log("🚀 ~ file: positionManager.ts:148 ~ PositionManager ~ createLongPosition ~ positionID:", positionID)
        position.id = positionID;
        this.positions[positionID] = position;
        // console.log("🚀 ~ file: positionManager.ts:152 ~ PositionManager ~ createLongPosition ~ this.positions[positionID]:", this.positions[positionID])

        return position;
    }

    private async createShortPosition(symbol: string, sellPrice: number, quantity: number): Promise<Position> {
        const position = new Position(uuidv4(), symbol, null, sellPrice, quantity, PositionType.SHORT, PositionStatus.OPEN);

        position.bybitOrderId = await this.bybitManager.createOrder('Sell', symbol, sellPrice, quantity, position);

        // Create the position in the Django backend
        const positionID = await this.createPositionInBackend(position);
        console.log("🚀 ~ file: positionManager.ts:159 ~ PositionManager ~ createShortPosition ~ positionID:", positionID)
        position.id = positionID;
        this.positions[positionID] = position;

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
