import { defineStore } from 'pinia';

const pairStructureExample = {
  name: 'BTCUSDT',
  ohlvc: {
    ['1d']: [],
    ['1h']: [],
    ['5m']: [],
  },
  rsi: {
    ['1d']: [],
    ['1h']: [],
    ['5m']: [],
  }
}

export const dataStore = defineStore('data', {
  state: () => ({
    rsiData: new Map(),
    pairs: new Map(),
  }),
  getters: {

  },
  actions: {
    async setAllPairs(pairs) {  // From backend structure
      // console.log("🚀 ~ file: example-store.ts:27 ~ setAllPairs ~ pairs:", pairs)
      // this.pairs = pairs;
      // // Object.keys(pairs).forEach((key) => {
      // //   // this.pairs.set(key, { ...pairs[key], name: key });
      // //   this.pairs.set(key, pairs[key]);
      // // });
      Object.entries(pairs).forEach(([key, value]) => {
        // console.log("🚀 ~ file: example-store.ts:34 ~ Object.entries ~ value:", key, value)
        if (!this.pairs.has(key)) {
          this.pairs.set(key, value)
        } else {
          const existingPair = this.pairs.get(key)

          this.pairs.set(key, { ...existingPair, ...value })
        }
      })

    },
    async setPairsDetails(pairsDetails) {

      pairsDetails.forEach((data) => {
        if (!data) return;
        if (!this.pairs.has(data.name)) {
          this.pairs.set(data.name, { details: data })
        } else {
          const existingPair = this.pairs.get(data.name)
          existingPair.details = data
          this.pairs.set(data.name, existingPair)

        }
      });


    },
    async setPairs(pairs) {
      console.log("🚀 ~ file: example-store.ts:13 ~ setPairs ~ pairs:", pairs)
      // pairs.forEach(async (value, key) => {
      //   this.pairs.set(value.alias, value);
      // });
    },
    async setLastRSIData(data) {
      // data.forEach((value, key) => {
      //   this.pairs.get(value.name)?.set('latestRSI', value);
      // });
      // this.rsiData = data;
    },
  },
});
