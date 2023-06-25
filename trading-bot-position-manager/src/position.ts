export interface PositionProps {
    symbol: string;
    buyPrice: number | null;
    sellPrice: number | null;
    quantity: number;
    type: PositionType;
}


// position.ts

export enum PositionType {
    LONG = 'long',
    SHORT = 'short'
}

export class Position {
    id: string;
    symbol: string;
    buyPrice: number;
    sellPrice: number;
    quantity: number;
    type: PositionType;

    constructor(id: string, symbol: string, buyPrice: number, sellPrice: number, quantity: number, type: PositionType) {
        this.id = id;
        this.symbol = symbol;
        this.buyPrice = buyPrice;
        this.sellPrice = sellPrice;
        this.quantity = quantity;
        this.type = type;
    }
}


export default Position;


