<template>
    <q-layout>
        <q-header>
            <!-- Header content goes here -->
        </q-header>

        <q-page-container>
            <q-page>
                Monitoring
                <div v-if="healthData">
                    Refresh rate: {{ healthData.refreshRate }} ms
                </div>
                <div v-else>
                    Loading health data...
                </div>
                <q-tab-panels v-model="tab">
                    <q-tab-panel name="backend">
                        <!-- Content goes here -->
                    </q-tab-panel>
                </q-tab-panels>
            </q-page>
        </q-page-container>

        <q-footer>
            <!-- Footer content goes here -->
        </q-footer>
    </q-layout>
</template>
  
<script setup lang="ts">
import { ref, onMounted } from 'vue';
// import fetch from 'node-fetch';
import { BACKEND_URL } from '@/models';
import { apiConnector } from 'trading-shared';

const tab = ref('table');
const healthData = ref(null);

const fetchHealthData = async () => {
    while (true) {
        try {
            const response = await apiConnector.get(BACKEND_URL + `/health`);
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            healthData.value = await response.data;
        } catch (error) {
            console.error('Fetch error: ', error);
        }
        await new Promise(resolve => setTimeout(resolve, 1000));
    }

};

onMounted(() => {
    fetchHealthData();
});
</script>
