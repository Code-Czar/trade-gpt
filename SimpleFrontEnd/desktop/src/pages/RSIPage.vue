<template>
    <q-layout>
        <q-header>
            <!-- Header content goes here -->
        </q-header>

        <q-page-container>
            <q-page>
                <!-- <TradingChart /> -->
                <r-s-i-table />
            </q-page>
        </q-page-container>

        <q-footer>
            <!-- Footer content goes here -->
        </q-footer>
    </q-layout>
</template>
  
  
<script setup lang="ts">
import { Todo, Meta } from 'components/models';
import { ref } from 'vue';
import RSITable from 'src/components/RSITable.vue';
import TradingChart from 'src/components/TradingChart.vue'



</script>
  