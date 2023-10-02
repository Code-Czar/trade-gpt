<template>
    <!-- Your template here -->
    <h1> Push notifications </h1>
</template>
  
<script setup>
import { onMounted } from 'vue';

const ONE_SIGNAL_APP_ID = '96d52203-d7fa-4174-a9c9-85a0fb84afc7';

onMounted(() => {
    window.OneSignal = window.OneSignal || [];
    OneSignal.push(() => {
        OneSignal.init({
            appId: ONE_SIGNAL_APP_ID,
        });
    });

    // Example: To show the user the native prompt, use the following:
    OneSignal.push(() => {
        OneSignal.showNativePrompt();
    });

    // Handle new OneSignal messages
    OneSignal.push(() => {
        OneSignal.on('subscriptionChange', (isSubscribed) => {
            console.log('The user subscription state is now:', isSubscribed);
        });

        OneSignal.on('notificationDisplay', (event) => {
            console.log('OneSignal notification displayed:', event);
        });
    });
});
</script>
  