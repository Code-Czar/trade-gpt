
<script setup>
import { onUnmounted } from 'vue';

const APP_ID = "c9f90795-f921-4717-92b2-3dd1e9405b30";



window.OneSignal.init({
    appId: APP_ID,
    safari_web_id: "web.onesignal.auto.613528e9-2930-4b07-a098-5a9518822d98",
    notifyButton: {
        enable: true,
    },
    allowLocalhostAsSecureOrigin: true,
});
onUnmounted(() => {
    // window.OneSignal.removeEventListener('subscriptionChange');
    window.OneSignal.PushSubscription.optOut();
});
</script>
  