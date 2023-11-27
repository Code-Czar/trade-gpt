<template>
    <div>
        Node backend panel
        <div>
            Database
            <q-btn label="Get leverage pairs" @click="getLeveragePairs" />
            <q-btn label="Fetch All historical data" @click="getAllHistoricalData" />
        </div>
        <div v-for="(pair, index) in leveragePairs" :key="index">
            {{ pair.name }}
            <q-btn label="Fetch historical data" @click="() => getHistoricalDataForPair(pair.name)" />
        </div>

    </div>
</template>
<script lang="ts" setup>
import { ref } from "vue";
import { PROJECT_URLS, BACKEND_ENDPOINTS } from 'trading-shared'

const leveragePairs = ref(null)

const getLeveragePairs = async () => {
    console.log("🚀 ~ file: NodeBackendPanel.vue:24 ~ PROJECT_URLS.BACKEND_URL:", PROJECT_URLS.BACKEND_URL);
    const pairsResult = await fetch(PROJECT_URLS.BACKEND_URL + BACKEND_ENDPOINTS.LEVERAGE_ENDPOINTS.getLeverageSymbols)
    leveragePairs.value = await pairsResult.json()
    console.log("🚀 ~ file: NodeBackendPanel.vue:23 ~ leveragePairs:", leveragePairs.value);
};

const getAllHistoricalData = async () => {
    return;
}
const getHistoricalDataForPair = async (pairName) => {
    console.log("🚀 ~ file: NodeBackendPanel.vue:33 ~ pairName:", pairName);
    const pairsResult = await fetch(PROJECT_URLS.BACKEND_URL + BACKEND_ENDPOINTS.LEVERAGE_ENDPOINTS.getHistoricalDataForPair, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            pairSymbol: pairName,
            timeframe: '5m'
        })

    })

}

</script>
<style lang="scss"></style>