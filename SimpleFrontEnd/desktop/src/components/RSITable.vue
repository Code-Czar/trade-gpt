<template>
  <q-layout>
    <q-tabs v-model="tab">
      <q-tab name="table" label='Sortable Table' />
    </q-tabs>

    <q-separator />

    <q-tab-panels v-model="tab">
      <q-tab-panel name="table">
        <q-table :rows="tableData" :columns="columns" row-key='id' :rows-per-page-options="[200, 500, 1000]"
          v-model:pagination="pagination">
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
import { ref, onMounted, onBeforeUnmount } from 'vue';
import { RSIFetcher } from '@/models';

const tab = ref('table');
const tableData = ref([]);
const pagination = ref({
  sortBy: 'rsi_1d',
  ascending: true,
  rowsPerPage: 200
});

const columns = [
  { name: 'name', label: 'Name', align: 'left', field: 'name', sortable: true },
  { name: 'rsi_1d', label: 'RSI 1d', align: 'center', field: 'rsi_1d', sortable: true },
  { name: 'rsi_1h', label: 'RSI 1h', align: 'center', field: 'rsi_1h', sortable: true },
  { name: 'rsi_5m', label: 'RSI 5m', align: 'center', field: 'rsi_5m', sortable: true },
  { name: 'view', label: 'ByBit', align: 'center', field: row => row.name, sortable: false }
];

const openByBit = (pairName) => {
  window.open(`https://www.bybit.com/trade/usdt/${pairName}`, '_blank');
};

const fetchRSIData = async () => {
  try {
    const pairs = await RSIFetcher.get_bybit_pairs_with_leverage();
    console.log("Fetched pairs:", pairs);

    for (const pair of pairs) {
      const dataEntry = { name: pair };
      let hasRSIValue = false; // Flag to check if the pair has any RSI value

      for (const interval of ["1d", "1h", "5m"]) {
        try {
          const prices = await RSIFetcher.get_historical_data(pair, interval);
          console.log(`Prices for ${pair} (${interval}):`, prices);
          const rsi = RSIFetcher.calculate_rsi(prices);
          if (rsi) {
            dataEntry[`rsi_${interval}`] = rsi;
            hasRSIValue = true;
          }
        } catch (error) {
          console.error(`Error fetching data for ${pair} with interval ${interval}:`, error.message);
        }
      }

      if (hasRSIValue) {
        tableData.value.push(dataEntry); // Update table only if there's at least one RSI value
      }
    }

  } catch (error) {
    console.error("Error fetching pairs:", error.message);
  }
};


const startFetching = () => {
  fetchRSIData();
};

const stopFetching = () => {
  if (timer.value) {
    clearInterval(timer.value);
    timer.value = null;
  }
};

const sortTable = () => {
  pagination.value.descending = !pagination.value.descending;
};

onBeforeUnmount(() => {
  stopFetching();
});

onMounted(() => {
  fetchRSIData();
});
</script>
