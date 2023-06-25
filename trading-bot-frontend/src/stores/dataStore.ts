import { defineStore } from 'pinia';

interface OHLCV {
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
    date: string; // ISO 8601 date string, e.g. "2023-06-25T00:00:00Z"
}


interface DataState {
    data: OHLCV[];
    supportData: number[];
    resistanceData: number[];
}

export const useDataStore = defineStore('data', {
    state: (): DataState => ({
        data: [],
        supportData: [],
        resistanceData: [],
    }),
    actions: {
        addData(newData: OHLCV[]) {
            this.data = newData;
        },
        addSupportData(newSupportData: number[]) {
            this.supportData.push(newSupportData);
            this.supportData.flat();
        },
        addResistanceData(newResistanceData: number[]) {
            this.resistanceData.push(newResistanceData);
            this.resistanceData.flat();
        },
    },
});
