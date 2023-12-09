<template>
    <div>
        <q-page padding>
            <div class="accordion-grid">
                <!-- RSI Below Threshold -->
                <div class="accordion-card">
                    <q-expansion-item label="RSI Below Threshold" icon="trending_down" class="q-flex q-flex-column"
                        :expanded="true">
                        <q-toggle v-model="rsiAlertEnabled" label="Enable Alert" />
                        <q-select v-model="selectedPairsRsi" :options="pairOptions" use-input input-debounce="300" multiple
                            label="Select Pairs" placeholder="Type to search pairs" @filter="filterPairs">
                            <template v-slot:append>
                                <q-btn flat label="Select All" @click.stop="selectAllPairs" />
                                <q-btn flat label="Clear" @click.stop="clearSelection" />
                            </template>
                        </q-select>
                        <div class="timeframe-selector">
                            <q-select v-model="selectedTimeframes" :options="timeframeOptions" use-input
                                input-debounce="300" multiple label="Select Timeframes" placeholder="Choose timeframes">
                                <template v-slot:append>
                                    <q-btn flat label="Select All" @click.stop="selectAllTimeframes" />
                                    <q-btn flat label="Clear" @click.stop="clearTimeframeSelection" />
                                </template>
                            </q-select>
                        </div>
                        <div class="q-mb-md sliders-container">
                            <div class="slider-container">
                                Lower threshold :
                                <q-slider v-model="rsiThresholdLower" :min="0" :max="100" label-always />
                                <q-btn flat icon="add"
                                    @click="addNotification('RSI_Low_Alert', rsiThresholdLower, selectedPairsRsi)" />
                            </div>
                            <div class="slider-container">
                                Higher threshold :
                                <q-slider v-model="rsiThresholdHigher" :min="0" :max="100" label-always />
                                <q-btn flat icon="add"
                                    @click="addNotification('RSI_High_Alert', rsiThresholdHigher, selectedPairsRsi)" />
                            </div>
                        </div>

                        <!-- Notifications List -->
                        <div class="notifications-list">
                            <q-btn v-if="notifications.length > 0" class="q-flex" style="display:flex; margin-left:auto"
                                flat @click="clearAllNotifications"> Clear </q-btn>
                            <div class="notifications-container">
                                <div v-for="(notif, index) in notifications" :key="index" class="notification-item">
                                    <!-- {{ notif.type }} - Threshold: {{ notif.parameters.threshold }} - Pairs: {{
                                        notif.pairName
                                    }} -->
                                    {{ notif.pairName }}
                                    <q-btn flat icon="remove" @click="removeNotification(index)" />
                                </div>
                            </div>
                        </div>
                        <q-btn class="q-flex" style="display:flex; margin-left:auto" flat @click="saveNotifications"> Save
                        </q-btn>

                    </q-expansion-item>
                </div>

                <!-- Mark Price Alert -->
                <div class="accordion-card">
                    <q-expansion-item label="Mark Price Alert" icon="attach_money" :expanded="true">
                        <q-input v-model="markPrice" label="Mark Price" type="number" />
                        <q-toggle v-model="markPriceAlertEnabled" label="Enable Alert" />
                    </q-expansion-item>
                </div>

                <!-- Price on/under EMA -->
                <div class="accordion-card">
                    <q-expansion-item label="Price on/under EMA" icon="show_chart" :expanded="true">
                        <!-- Additional UI elements for EMA settings go here -->
                    </q-expansion-item>
                </div>

                <!-- Price Breaking EMA -->
                <div class="accordion-card">
                    <q-expansion-item label="Price Breaking EMA" icon="multiline_chart" :expanded="true">
                        <!-- Additional UI elements for EMA settings go here -->
                    </q-expansion-item>
                </div>

                <!-- EMA Crossing Another EMA -->
                <div class="accordion-card">
                    <q-expansion-item label="EMA Crossing Another EMA" icon="swap_calls" :expanded="true">
                        <!-- Additional UI elements for EMA crossing settings go here -->
                    </q-expansion-item>
                </div>

                <!-- Trend Reversal -->
                <div class="accordion-card">
                    <q-expansion-item label="Trend Reversal" icon="trending_up" :expanded="true">
                        <q-toggle v-model="trendReversalEnabled" label="Enable Alert" />
                    </q-expansion-item>
                </div>
            </div>
        </q-page>
    </div>
</template>

  
<script lang="ts" setup>
import { ref, onMounted } from 'vue';
import { apiConnector, RSINotifDescription, CENTRALIZATION_API_URLS } from 'trading-shared';
import { getLeveragePairNames } from "@/models"
import { userStore } from '@/stores/userStore'

const accordion = ref([1, 2, 3, 4, 5, 6]); // Keeping all accordions open
const rsiThresholdLower = ref(30);
const rsiThresholdHigher = ref(70);
const rsiAlertEnabled = ref(false);
const markPrice = ref(null);
const markPriceAlertEnabled = ref(false);
const trendReversalEnabled = ref(false);
const selectedPairsRsi = ref([]);
const pairOptions = ref(['BTC/USD', 'ETH/USD', 'XRP/USD']); // Example pair options
const notifications = ref([]);
const selectedTimeframes = ref([]);
const timeframeOptions = ref(['1d', '1h', '5m']);

let fetchedPairs = null

// Function to filter pairs in q-select
const filterPairs = (val, update) => {
    update(() => {
        if (val === '') {
            pairOptions.value = fetchedPairs; // Replace with actual fetching logic
        } else {
            const needle = val.toLowerCase();
            pairOptions.value = pairOptions.value.filter(v => v.toLowerCase().indexOf(needle) > -1);
        }
    });
};
const selectAllPairs = () => {
    selectedPairsRsi.value = [...pairOptions.value];
};
const clearSelection = () => {
    selectedPairsRsi.value = [];
};



function addNotification(type, threshold, pairs) {
    const pairsText = Array.isArray(pairs) ? pairs.join(', ') : '';
    console.log("🚀 ~ file: alertsPanel.vue:119 ~ pairsText:", pairsText, typeof pairsText, selectedPairsRsi);

    pairs.forEach((pair) => {

        console.log("🚀 ~ file: alertsPanel.vue:143 ~ pair:", pair);
        notifications.value.push({
            ...RSINotifDescription,
            pairName: pair,
            type,
            parameters: {
                threshold,
            },
            // preferences: { ... } // Set preferences as needed
        });
    })

}

function removeNotification(index) {
    notifications.value.splice(index, 1);
}

async function fetchUserNotifications() {
    const user = userStore().user;
    const userUrl = `${CENTRALIZATION_API_URLS.USERS}/${user.id}`;

    try {
        const response = await apiConnector.get(userUrl);
        if (response.status !== 200) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const userData = await response.data;
        notifications.value = userData.notifications['RSI'] || [];
        console.log("🚀 ~ file: alertsPanel.vue:165 ~ notifications.value:", notifications.value);
    } catch (error) {
        console.error("Error fetching user notifications:", error);
    }
}

async function saveNotifications() {
    const user = userStore().user;
    const userFetchUrl = `${CENTRALIZATION_API_URLS.USERS}/${user.id}/`;

    try {
        // Fetch current user data
        const userResponse = await apiConnector.get(userFetchUrl);
        if (!userResponse.status !== 200) {
            throw new Error(`HTTP error! status: ${userResponse.status}`);
        }
        const userData = await userResponse.data;

        // Merge existing notifications with new RSI notifications
        const updatedNotifications = {
            ...userData.notifications
        };
        updatedNotifications['RSI'] = notifications.value.map((notification) => {
            return {
                [notification.pairName]: {
                    notification,
                    userID: userStore().user.id
                }
            }
        });
        console.log("🚀 ~ file: alertsPanel.vue:185 ~ updatedNotifications:", updatedNotifications);

        // Update user with merged notifications
        const userUpdateUrl = userFetchUrl;
        const updateResponse = await apiConnector.get(userUpdateUrl, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ notifications: updatedNotifications }),
        });

        if (!updateResponse.ok) {
            throw new Error(`HTTP error! status: ${updateResponse.status}`);
        }

        const updatedUser = await updateResponse.data;
        console.log("Updated user:", updatedUser);
    } catch (error) {
        console.error("Error updating user:", error);
    }
}
const selectAllTimeframes = () => {
    selectedTimeframes.value = [...timeframeOptions.value];
};

const clearTimeframeSelection = () => {
    selectedTimeframes.value = [];
};

const clearAllNotifications = async () => {
    console.log("🚀 ~ file: alertsPanel.vue:199 ~ clearAllNotifications:", clearAllNotifications);
    notifications.value = []
}

onMounted(async () => {
    fetchedPairs = await getLeveragePairNames()
    pairOptions.value = fetchedPairs
    console.log("🚀 ~ file: alertsPanel.vue:184 ~ pairOptions.value:", pairOptions.value);
    // await fetchUserNotifications()
}
);


</script>
  
<style lang="scss" scoped>
.q-expansion-item__content {
    display: flex;
    flex-direction: column;
}

.accordion-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 20px;
}

/* Adjust grid layout to fit maximum 3 cards per row */
@media (min-width: 900px) {
    .accordion-grid {
        grid-template-columns: repeat(3, 1fr);
    }
}

/* Style each accordion item as a card */
.accordion-card {
    border: 1px solid #e0e0e0;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    padding: 15px;
}


/* Adding styles for the slider container */
.sliders-container {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    gap: 10px;
    margin-top: 2rem;

}

.slider-container {
    display: flex;
    flex-direction: row;
}

.q-slider {
    display: flex;
    justify-content: center;
}

.notifications-container {
    display: flex;
    flex-direction: column;
    max-height: 20vh;
    overflow-y: auto;
}

.notifications-list {
    margin-top: 1rem;
}

.notification-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 0.5rem;
    background: #f5f5f5;
    padding: 0.5rem;
    border-radius: 4px;
}

.timeframe-selector {
    margin-top: 1rem;
}
</style>
