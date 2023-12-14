// main.js or a boot file

import { createApp } from 'vue'
import { userStore } from './stores/userStore';
import App from './App.vue'
import OneSignalVue from 'onesignal-vue'
import '@/styles/global.scss';


import { createI18n } from 'vue-i18n';
import { Quasar } from 'quasar/wrappers';
import quasarUserOptions from './quasar-user-options';


const app = createApp(App)
console.log("🚀 ~ file: main.ts:8 ~ app:", app)
const authStore = userStore();


const i18n = createI18n({
    legacy: false, // Use Composition API
    locale: 'en-US', // Default locale
    messages: {
        'en-US': {
            // Your English translations
        },
        'fr': {
            // Your French translations
        },
    },
});
app.use(Quasar, quasarUserOptions).use(i18n)


// Install the Vue plugin
const ONE_SIGNAL_APP_ID = '96d52203-d7fa-4174-a9c9-85a0fb84afc7';

// app.$oneSignal.setup(process.env.ONESIGNAL_APP_ID)



app.$oneSignal.setup(ONE_SIGNAL_APP_ID)
app.use(OneSignalVue, { appId: ONE_SIGNAL_APP_ID })

const handleOpenURL = (url) => {
    console.log("Received URL:", url);
    setTimeout(() => {
        // Assuming Vue 3 and a Pinia store
        const authStore = userStore();
        authStore.handleIncomingUrl(url);
    }, 500);
};

window.handleOpenURL = handleOpenURL

app.mount('#app')



// Listen for notifications
OneSignalVue.$on('notification', (notification) => {
    console.log('Received notification:', notification)
})
