<template>
    <div>
        Node backend panel
        <q-table :rows="leveragePairs" :columns="columns" row-key="name" v-model:selected="selected" selection="multiple"
            :visible-columns="visibleColumns">
            <template v-slot:top-right>
                <q-btn label="Get leverage pairs" @click="getLeveragePairs" />
                <q-btn label="Fetch All historical data" @click="getAllHistoricalData" />
            </template>

            <template v-slot:header-cell-timeframes="props">
                <q-th :props="props">
                    TimeFrames
                    <div style="display:flex; flex-direction:row">
                        <div v-for="timeframe in timeframes" :key="timeframe">
                            <q-checkbox :label="timeframe" v-model="headerCheckboxes[timeframe]"
                                @update:model-value="updateAllRows(timeframe)" />
                        </div>
                    </div>
                </q-th>
            </template>

            <template v-slot:body-cell-timeframes="props">
                <q-td :props="props">
                    <div style="display:flex; flex-direction:row">
                        <div v-for="timeframe in timeframes" :key="timeframe">
                            <q-checkbox :label="timeframe" v-model="props.row.timeframeSelection[timeframe]" />
                        </div>
                    </div>
                </q-td>
            </template>

            <template v-slot:body-cell-actions="props">
                <q-td :props="props">
                    <q-btn label="Fetch historical data" @click="() => getHistoricalDataForPair(props.row.name)" />
                </q-td>
            </template>
        </q-table>
    </div>
</template>
  
  

<script setup lang="ts">
import { ref } from 'vue';
import { PROJECT_URLS, BACKEND_ENDPOINTS } from 'trading-shared';

const leveragePairs = ref([]);
const selected = ref([]);
const visibleColumns = ref(['symbol', 'timeframes', 'actions']);
const headerCheckboxes = ref({
    '1d': false,
    '1h': false,
    '5m': false,
    '1m': false
});


const columns = [
    {
        name: 'symbol',
        required: true,
        label: 'Symbol',
        align: 'left',
        field: 'name',
        sortable: true
    },
    {
        name: 'timeframes',
        required: true,
        label: 'Timeframes',
        align: 'center',
        sortable: true
    },
    {
        name: 'actions',
        required: true,
        label: 'Actions',
        align: 'center',
    }
];

const timeframes = ['1d', '1h', '5m', '1m'];

const getLeveragePairs = async () => {
    const pairsResult = await fetch(PROJECT_URLS.BACKEND_URL + BACKEND_ENDPOINTS.LEVERAGE_ENDPOINTS.getLeverageSymbols);
    const pairs = await pairsResult.json();
    leveragePairs.value = pairs.map(pair => ({
        ...pair,
        timeframeSelection: timeframes.reduce((acc, tf) => ({ ...acc, [tf]: false }), {})
    }));
};

const getAllHistoricalData = async () => {
    return;
}
const getHistoricalDataForPair = async (pairName) => {
    console.log("🚀 ~ file: NodeBackendPanel.vue: Fetching historical data for pair:", pairName);

    // Find the pair with the matching pairName
    const pair = leveragePairs.value.find(p => p.name === pairName);

    if (pair) {
        for (const timeframe in pair.timeframeSelection) {
            if (pair.timeframeSelection[timeframe]) {
                console.log(`Fetching data for ${pairName} at ${timeframe} timeframe`);

                // Fetch the data for this timeframe
                try {
                    const response = await fetch(PROJECT_URLS.BACKEND_URL + BACKEND_ENDPOINTS.LEVERAGE_ENDPOINTS.getHistoricalDataForPair, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            pairSymbol: pairName,
                            timeframe: timeframe
                        })
                    });

                    if (!response.ok) {
                        throw new Error(`HTTP error! Status: ${response.status}`);
                    }
                    const data = await response.json();
                    console.log(`Data for ${pairName} at ${timeframe}:`, data);
                } catch (error) {
                    console.error("Error fetching historical data:", error);
                }
            }
        }
    } else {
        console.error("Pair not found:", pairName);
    }
};


const updateAllRows = (timeframe) => {
    leveragePairs.value.forEach(pair => {
        pair.timeframeSelection[timeframe] = headerCheckboxes.value[timeframe];
    });
};

</script>




<style lang="scss"></style>