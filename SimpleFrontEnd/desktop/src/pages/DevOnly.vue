<template>
    <q-layout>
        <q-header>
            <!-- Header content goes here -->
        </q-header>

        <q-page-container>
            <q-page>
                Dev Panel

                <!-- Tabs for different sections -->
                <q-tabs v-model="tab">
                    <q-tab name="backend" label="Node Backend" />
                    <q-tab name="strategy-analyzer" label="Strategy Analyzer" />
                    <q-tab name="centralization-api" label="Centralization API" />
                </q-tabs>

                <!-- Tab Panels -->
                <q-tab-panels v-model="tab">
                    <q-tab-panel name="backend">
                        <!-- Buttons for Node Backend actions -->
                        <q-btn label="Action 1" @click="performBackendAction1" />
                        <q-btn label="Action 2" @click="performBackendAction2" />
                        <!-- Add more buttons as needed -->
                    </q-tab-panel>

                    <q-tab-panel name="strategy-analyzer">
                        <!-- Buttons for Strategy Analyzer actions -->
                        <q-btn label="Action 1" @click="performStrategyAnalyzerAction1" />
                        <q-btn label="Action 2" @click="performStrategyAnalyzerAction2" />
                        <!-- Add more buttons as needed -->
                    </q-tab-panel>

                    <q-tab-panel name="centralization-api">
                        <!-- Buttons for Centralization API actions -->
                        <q-btn label="Action 1" @click="performCentralizationApiAction1" />
                        <q-btn label="Action 2" @click="performCentralizationApiAction2" />
                        <!-- Add more buttons as needed -->
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
import { ref } from 'vue';

// State for the selected tab
const tab = ref('backend');

// Define methods for your actions
const performBackendAction1 = () => {
    // Logic for Backend Action 1
};

const performBackendAction2 = () => {
    // Logic for Backend Action 2
};

const performStrategyAnalyzerAction1 = () => {
    // Logic for Strategy Analyzer Action 1
};

const performStrategyAnalyzerAction2 = () => {
    // Logic for Strategy Analyzer Action 2
};

const performCentralizationApiAction1 = () => {
    // Logic for Centralization API Action 1
};

const performCentralizationApiAction2 = () => {
    // Logic for Centralization API Action 2
};
</script>
  