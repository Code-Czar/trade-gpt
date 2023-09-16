<template>
  <q-layout>
    <q-tabs v-model="tab">
      <q-tab name="table" label='Sortable Table' />
    </q-tabs>

    <q-separator />

    <q-tab-panels v-model="tab">
      <q-tab-panel name="table">
        <q-table :rows="tableData" :columns="columns" row-key="id" :rows-per-page-options="[200, 500, 1000]"
          v-model:pagination="pagination" :sort-method="customSort">

          <template v-slot:top>
            <q-space />
            <q-btn flat dense round @click="sortTable" icon='swap_vert' />
            <q-btn flat dense round @click="fetchRSIData" label="Refresh Data" />
            <q-btn flat dense round @click="startFetching" label="Start" />
            <q-btn flat dense round @click="stopFetching" label="Stop" />
          </template>
          <template v-slot:body-cell-view="props">
            <q-td :props="props">
              <q-btn @click="openByBit(props.row.name)" label="View on ByBit" />
            </q-td>
          </template>
        </q-table>
      </q-tab-panel>
    </q-tab-panels>
  </q-layout>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch } from 'vue';
import { RSIFetcher } from '@/models';

const tab = ref('table');
const tableData = ref([]);
const pagination = ref({
  sortBy: 'maxLeverage',
  ascending: true,
  rowsPerPage: 200
});

const columns = [
  { name: 'name', label: 'Name', align: 'left', field: 'name', sortable: true },
  { name: 'rsi_1d', label: 'RSI 1d', align: 'center', field: 'rsi_1d', sortable: true },
  { name: 'rsi_1h', label: 'RSI 1h', align: 'center', field: 'rsi_1h', sortable: true },
  { name: 'rsi_5m', label: 'RSI 5m', align: 'center', field: 'rsi_5m', sortable: true },
  { name: 'leverage', label: 'Leverage', align: 'center', field: 'maxLeverage', sortable: true },
  { name: 'view', label: 'ByBit', align: 'center', field: row => row.name, sortable: false }
];
let fetching = false;
const REFRESH_RATE = 1000

const openByBit = (pairName) => {
  window.open(`https://www.bybit.com/trade/usdt/${pairName}`, '_blank');
};

const fetchRSIData = async () => {
  try {
    const pairs = await RSIFetcher.get_bybit_pairs_with_leverage();
    console.log("Fetched pairs:", pairs);

    // while (fetching) {
    // setTimeout(async () => {
    const symbols = pairs.map(pair => pair.name);
    const timeframes = ["1d", "1h", "5m"];

    const bulkRSI = await RSIFetcher.calculate_rsi_bulk(symbols, timeframes);
    console.log("🚀 ~ file: RSITable.vue:70 ~ //setTimeout ~ bulkRSI:", bulkRSI)

    for (const pair of pairs) {
      if (!fetching) return;
      const dataEntry = {
        name: pair.name,
        maxLeverage: pair.leverage_filter ? pair.leverage_filter.max_leverage : 0
      };

      let hasRSIValue = false; // Flag to check if the pair has any RSI value

      for (const interval of timeframes) {
        try {
          const rsi = bulkRSI[pair.name][interval];
          if (rsi) {
            dataEntry[`rsi_${interval}`] = rsi[rsi.length - 1];
            dataEntry[`maxLeverage`] = pair.leverage_filter.max_leverage;
            hasRSIValue = true;
          }
        } catch (error) {
          console.error(`Error fetching data for ${pair.name} with interval ${interval}:`, error.message);
        }
      }

      if (hasRSIValue) {
        const existingIndex = tableData.value.findIndex(p => p.name === pair.name);

        if (existingIndex !== -1) {
          // If the symbol exists, update the existing entry
          tableData.value[existingIndex] = dataEntry;
        } else {
          // If the symbol doesn't exist, push a new entry
          tableData.value.push(dataEntry);
        }

        tableData.value.sort(customSort);  // Resort the tableData
      }


    }

  } catch (error) {
    console.error("Error fetching pairs:", error.message);
  }
};




function customSort(a, b) {
  // Check if the data entries are defined
  if (!a || !b) return 0;

  // Prioritize by 1d RSI first
  if (a.rsi_1d !== b.rsi_1d) {
    return a.rsi_1d - b.rsi_1d; // Lowest 1d RSI first
  }

  // Check and prioritize maxLeverage next
  if (a.maxLeverage !== b.maxLeverage) {
    return b.maxLeverage - a.maxLeverage; // Highest leverage second
  }

  // Prioritize by 1h RSI next
  if (a.rsi_1h !== b.rsi_1h) {
    return a.rsi_1h - b.rsi_1h; // Lowest 1h RSI third
  }

  // Finally, prioritize by 5m RSI
  return a.rsi_5m - b.rsi_5m; // Lowest 5m RSI fourth
}




const descendingCompare = (aValue, bValue) => {
  if (aValue === bValue) return 0;
  return bValue - aValue;  // Sort in descending order by default
};

// watch(tableData, (newVal) => {
//   tableData.value = [...newVal].sort(customSort);
// }, { deep: true });


const startFetching = () => {
  fetching = true
  setInterval(() => {
    fetchRSIData();
  }, REFRESH_RATE)
};

const stopFetching = () => {
  fetching = false
};

const sortTable = () => {
  pagination.value.descending = !pagination.value.descending;
};

onBeforeUnmount(() => {
  stopFetching();
});

onMounted(() => {
  fetching = true
  fetchRSIData();
});




</script>
