// globalTypes.ts
declare global {
    type DataStore = {}

    type Object = {
        [key: string]: any;
    };
    type BasicObject = Object;

    type OHLCV = Array<[timestamp: number, open: number, high: number, low: number, close: number, volume: number]>;
}

export { };
