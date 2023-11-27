<template>
    <q-page>
        <div id="card-element"></div>
        <q-btn label="Subscribe" @click="handleSubscribe" />
        <q-btn label="Subscribe" @click="handleSubscribe" />
    </q-page>
</template>
  


<script setup>
import { onMounted, ref } from 'vue';
import { CENTRALIZATION_ENDPOINTS } from 'trading-shared'

const stripe = ref(null);
const card = ref(null);

const subscriptionProductID = "prod_P4ltD2BWYkqCUE"

const config = await fetch(`${CENTRALIZATION_ENDPOINTS.STRIPE_CONFIG}`)

console.log("🚀 ~ file: SrCheckout.vue:22 ~ config:", (await config).json(), CENTRALIZATION_ENDPOINTS);

const createCheckoutSession = (priceId) => {
    return fetch('/create-checkout-session', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            priceId: priceId,
        }),
    }).then(function (result) {
        return result.json();
    });
};

const handleSubscribe = async () => {
    return fetch(`${CENTRALIZATION_ENDPOINTS.STRIPE_CREATE_CUSTOMER}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            priceId: priceId,
        }),
    }).then(function (result) {
        return result.json();
    });
    // if (!stripe.value || !card.value) {
    //     console.error('Stripe.js has not loaded.');
    //     return;
    // }

    // const result = await stripe.value.createToken(card.value);
    // if (result.error) {
    //     console.error('Error:', result.error.message);
    // } else {
    //     // Send the token to your backend for processing
    //     await sendTokenToBackend(result.token);
    // }
};

const sendTokenToBackend = async (token) => {
    // Send token to your backend via an API call
    // ...
};

onMounted(() => {
    const script = document.createElement('script');
    script.src = 'https://js.stripe.com/v3/';
    script.onload = initializeStripe;
    document.head.appendChild(script);
});

const initializeStripe = () => {
    stripe.value = Stripe('pk_test_51OGQQoJ5PV7GuigYwTYVEmyl3e1kT9jh6Oh859hcIQo6xDFh21HMWfUJexNE4oZ9bwtlfctUSbWXw0wdmX4srovX00jEAc9PgN'); // Replace with your Stripe publishable key
    const elements = stripe.value.elements();
    card.value = elements.create('card');
    card.value.mount('#card-element');
};

// Add your form submission logic here
</script>
