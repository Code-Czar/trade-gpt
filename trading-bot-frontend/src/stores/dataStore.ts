import { defineStore } from 'pinia';

export const useDataStore = defineStore('data', {
    state: () => ({
        data: [],
    }),
    actions: {
        addData(newData) {
            this.data = newData;
        },
    },
});
