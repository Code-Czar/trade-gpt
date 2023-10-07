// main.js or a boot file

import { createApp } from 'vue'
import App from './App.vue'
import OneSignalVue from 'onesignal-vue'

const app = createApp(App)
console.log("🚀 ~ file: main.ts:8 ~ app:", app)
// const app = new Vue({
//     render: h => h(App),
//     beforeMount() {
//       this.$OneSignal.init({ appId: 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx' });
//     }
//   }).$mount('#app')

// Install the Vue plugin
const ONE_SIGNAL_APP_ID = '96d52203-d7fa-4174-a9c9-85a0fb84afc7';

app.$oneSignal.setup(process.env.ONESIGNAL_APP_ID)
app.use(OneSignalVue, { appId: ONE_SIGNAL_APP_ID })


app.mount('#app')


// Listen for notifications
OneSignalVue.$on('notification', (notification) => {
    console.log('Received notification:', notification)
})
