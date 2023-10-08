<template>
    <span></span>
</template>
<script setup>
import { onUnmounted } from 'vue';
import OneSignalVue from 'onesignal-vue';
// import { IOneSignal } from 'onesignal-vue';
import { useQuasar } from 'quasar'
// console.log("🚀 ~ file: PushNotifications.vue:7 ~ OneSignalVue:", OneSignalVue, IOneSignal)

const $q = useQuasar()
console.log("🚀 ~ file: PushNotifications.vue:12 ~ q:", $q)

const APP_ID = "c9f90795-f921-4717-92b2-3dd1e9405b30";

const OneSignal = window.OneSignal


OneSignal._notificationOpenedCallbacks.push(function (event) {
    console.log("🚀 ~ file: PushNotifications.vue:23 EVEEENT ~ OneSignal.on ~ event:", event)

});
OneSignal.push(() => {
    OneSignal.on('notificationClick', function (event) {
        console.log("🚀 ~ file: PushNotifications.vue:23 EVEEENT ~ OneSignal.on ~ event:", event)

    });
    OneSignal.on('change', function (event) {
        console.log("🚀 ~ file: PushNotifications.vue:23 EVEEENT ~ OneSignal.on ~ event:", event)

    });
    OneSignal.on('notificationDisplay', function (event) {
        console.log("🚀 ~ file: PushNotifications.vue:23 EVEEENT ~ OneSignal.on ~ event:", event)

    });
    OneSignal.on('notificationClick', function (event) {
        console.log("🚀 ~ file: PushNotifications.vue:23 EVEEENT ~ OneSignal.on ~ event:", event)

    });

})

OneSignal.on('notificationClick', function (event) {
    console.log("🚀 ~ file: PushNotifications.vue:23 EVEEENT ~ OneSignal.on ~ event:", event)

});
OneSignal.on('change', function (event) {
    console.log("🚀 ~ file: PushNotifications.vue:23 EVEEENT ~ OneSignal.on ~ event:", event)

});
OneSignal.on('notificationDisplay', function (event) {
    console.log("🚀 ~ file: PushNotifications.vue:23 EVEEENT ~ OneSignal.on ~ event:", event)

});
OneSignal.on('notificationClick', function (event) {
    console.log("🚀 ~ file: PushNotifications.vue:23 EVEEENT ~ OneSignal.on ~ event:", event)

});
window.onmessage = function (event) {
    console.log("🚀 ~ file: PushNotifications.vue:23 EVEEENT ~ OneSignal.on ~ event:", event)

};

window.OneSignal.on('change', function (event) {
    // Access the notification data
    const notificationData = event.notification.data;

    // Log the notification data to the console
    console.log('Incoming Notification:', notificationData);

    // You can also access other properties of the notification if needed
    const notificationTitle = event.notification.title;
    const notificationBody = event.notification.body;

    // Log other notification properties if needed
    console.log('Notification Title:', notificationTitle);
    console.log('Notification Body:', notificationBody);
});

// OneSignal.init({
//     appId: APP_ID,
//     safari_web_id: "web.onesignal.auto.613528e9-2930-4b07-a098-5a9518822d98",
//     notifyButton: {
//         enable: true,
//     },
//     // allowLocalhostAsSecureOrigin: true,
// });


onUnmounted(() => {
    // window.OneSignal.removeEventListener('subscriptionChange');
    // window.OneSignal.PushSubscription.optOut();
});
</script>
  