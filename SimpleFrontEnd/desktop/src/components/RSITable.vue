<template>
  <q-layout>
    <q-tabs v-model="tab">
      <q-tab name="table" label='Opportunities' />
    </q-tabs>

    <q-separator />
    <TradingChart v-if="showChart" :input-symbol="symbolToChart" />

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
              <q-btn @click="openChart(props.row.name)" label="Chart" />
            </q-td>
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
import { ref, onMounted, onBeforeUnmount, onUnmounted } from 'vue';
import { dataController } from '@/controllers';
import TradingChart from './TradingChart.vue';

const tab = ref('table');
const tableData = ref([]);
const pagination = ref({
  sortBy: 'maxLeverage',
  ascending: true,
  rowsPerPage: 200
});
const symbolToChart = ref('BTCUSDT')
const showChart = ref(false)

const columns = [
  { name: 'name', label: 'Name', align: 'left', field: 'name', sortable: true },
  { name: 'rsi_1d', label: 'RSI 1d', align: 'center', field: 'rsi_1d', sortable: true },
  { name: 'rsi_1h', label: 'RSI 1h', align: 'center', field: 'rsi_1h', sortable: true },
  { name: 'rsi_5m', label: 'RSI 5m', align: 'center', field: 'rsi_5m', sortable: true },
  { name: 'leverage', label: 'Leverage', align: 'center', field: 'maxLeverage', sortable: true },
  { name: 'view', label: 'ByBit', align: 'center', field: row => row.name, sortable: false }
];
let fetching = false;
const REFRESH_RATE = 20000;

const openByBit = (pairName) => {
  window.open(`https://www.bybit.com/trade/usdt/${pairName}`, '_blank');
};
const openChart = (pairName) => {
  console.log("🚀 ~ file: RSITable.vue:62 ~ openChart ~ pairName: SHOWING CHART", pairName)
  symbolToChart.value = pairName
  showChart.value = true

  // Get a reference to the TradingChart div
  const tradingChartDiv = document.querySelector('#trading-chart');

  // Scroll to the TradingChart div
  if (tradingChartDiv) {
    tradingChartDiv.scrollIntoView({ behavior: 'smooth' });
  }


};

const fetchRSIData = async () => {
  const dataResult = await dataController.getRSILastData()
  tableData.value = dataResult
  tableData.value.sort(customSort);  // Resort the tableData  
};

const fetchAllOHLCS = async () => {
  const dataResult = await dataController.fetchRSIAndOHLCV()
  // Resort the tableData  
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

const startFetching = () => {
  fetching = true
  setInterval(() => {
    fetchAllOHLCS();
    fetchRSIData();
  }, REFRESH_RATE)
};

const stopFetching = () => {
  fetching = false
};

const sortTable = () => {
  pagination.value.descending = !pagination.value.descending;
};

onMounted(() => {
  fetchRSIData();
  fetchAllOHLCS();
  startFetching()
});
onBeforeUnmount(() => {
  stopFetching();
});


onUnmounted(() => {
  stopFetching();
});




</script>
