import { LeveragePair } from '@/types/globalTypes'
const fs = require('fs')

export class DataStore {
  public pairs: {
    leveragePairs: { [key: string]: LeveragePair }
  }

  constructor() {
    this.pairs = {
      leveragePairs: {},
    }
  }

  async setLeveragePairs(leveragePairs) {
    leveragePairs.forEach((pair) => {
      if (!this.pairs.leveragePairs[pair.name]) {
        this.pairs.leveragePairs[pair.name] = {}
      }
      this.pairs.leveragePairs[pair.name].details = pair
    })
  }
  async getLeveragePairs() {
    return this.pairs.leveragePairs
  }

  async setLeveragePairData(inputData, dumpDataStore = false) {
    const { details, timeframe, data } = inputData
    const leveragePairName = details.name

    if (!this.pairs.leveragePairs[details.name]) {
      this.pairs.leveragePairs[leveragePairName] = {}
    }
    if (!this.pairs.leveragePairs[leveragePairName].details) {
      this.pairs.leveragePairs[leveragePairName].details = {}
    }
    if (!this.pairs.leveragePairs[leveragePairName].data) {
      this.pairs.leveragePairs[leveragePairName].data = {}
    }
    this.pairs.leveragePairs[leveragePairName].data[timeframe] =
      inputData.data[timeframe]
    this.pairs.leveragePairs[leveragePairName].details = details

    if (dumpDataStore) {
      fs.writeFileSync('dataStore.json', JSON.stringify(await this.pairs))
    }
  }
}
