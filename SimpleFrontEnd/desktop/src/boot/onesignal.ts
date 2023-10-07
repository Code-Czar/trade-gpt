// import Vue from 'vue'
import { boot } from 'quasar/wrappers'
import OneSignalVuePlugin from '@onesignal/onesignal-vue3'

const APP_ID = "c9f90795-f921-4717-92b2-3dd1e9405b30";

export default boot((vue) => {
    vue.app.use(OneSignalVuePlugin, {
        appId: APP_ID,
        allowLocalhostAsSecureOrigin: true,
    })
    console.log("🚀 ~ file: onesignal.ts:16 ~ boot ~ app:", vue, window)


    window.OneSignalDeferred = window.OneSignalDeferred || [];
    window.OneSignalDeferred.push(function (OneSignal) {
        OneSignal.init({
            appId: APP_ID,
            safari_web_id: "web.onesignal.auto.613528e9-2930-4b07-a098-5a9518822d98",
            notifyButton: {
                enable: true,
            },
            allowLocalhostAsSecureOrigin: true,
        });
    });
    console.log("🚀 ~ file: onesignal.ts:39 ~ window:", window)
})

