<!-- <template   >
    <div>
        fetcher
    </div>
</template> -->

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import axios from 'axios';
import { useDataStore } from '../stores/dataStore';

// const dataStore = useDataStore();

let intervalId;

onMounted(() => {
    const dataStore = useDataStore();
    intervalId = setInterval(async () => {
        try {
            const response = await axios.get('http://localhost:3000/api/data');
            dataStore.addData(response.data);
            console.log("🚀 ~ file: FetchData.vue:22 ~ intervalId=setInterval ~ response.data:", response.data)
        } catch (error) {
            console.error(error);
        }
    }, 1 * 1000);
});

onUnmounted(() => {
    clearInterval(intervalId);
});
</script>
