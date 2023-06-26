<template>
    <div>
        <!-- fetcher -->
    </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import axios from 'axios';
import { useDataStore } from '../stores/dataStore';

let intervalId;
let symbol = 'BTC-USDT'; // Change to your default symbol
let timeframe = '1m'; // Change to your default timeframe

onMounted(() => {
    const dataStore = useDataStore();
    intervalId = setInterval(async () => {
        try {
            const response = await axios.get(`http://localhost:3000/api/data/${symbol}/${timeframe}`);
            const supportResponse = await axios.get(`http://localhost:3000/api/support/${symbol}/${timeframe}`);
            const resistanceResponse = await axios.get(`http://localhost:3000/api/resistance/${symbol}/${timeframe}`);

            dataStore.addData(response.data.slice(0, 500));
            dataStore.addSupportData(supportResponse.data.support);
            dataStore.addResistanceData(resistanceResponse.data.resistance);

            console.log("🚀 ~ file: FetchData.vue ~ intervalId=setInterval ~ data:", response.data);
            console.log("🚀 ~ file: FetchData.vue ~ intervalId=setInterval ~ support data:", supportResponse.data);
            console.log("🚀 ~ file: FetchData.vue ~ intervalId=setInterval ~ resistance data:", resistanceResponse.data);
        } catch (error) {
            console.error(error);
        }
    }, 10 * 1000);
});

onUnmounted(() => {
    clearInterval(intervalId);
});
</script>
