<template>
    <div>
        Checkout component
        <!-- <div id="card-element"></div> -->
        <q-btn label="Subscribe" @click="handleSubscribe" />
        <!-- <q-btn label="Subscribe" @click="handleSubscribe" /> -->
    </div>
</template>
  


<script lang="ts" setup>
import { onMounted, ref } from 'vue';
import { PROJECT_URLS, CENTRALIZATION_ENDPOINTS } from 'trading-shared'
import { userStore } from '@/stores/userStore'

const stripe = ref(null);
const card = ref(null);
const userStore_ = userStore();
const user = userStore_.user;
const userEmail = user.details.email;
const subscriptionProductID = "price_1OGcM6J5PV7GuigY8TduVpNv"

// const config = await fetch(`${PROJECT_URLS.CENTRALIZATION_URL}${CENTRALIZATION_ENDPOINTS.STRIPE_CONFIG}`)

// console.log("🚀 ~ file: SrCheckout.vue:22 ~ config:", (await config).json(), userEmail, CENTRALIZATION_ENDPOINTS);

async function getStripeConfig() {
    const config = await fetch(`${PROJECT_URLS.CENTRALIZATION_URL}${CENTRALIZATION_ENDPOINTS.STRIPE_CONFIG}`)
    // console.log("🚀 ~ file: SrCheckout.vue:30 ~ config:", await config.json());


    return config.json()
}

async function loadStripe() {
    if (!window.Stripe) {
        const script = document.createElement('script');
        script.src = 'https://js.stripe.com/v3/';
        script.async = true;
        document.head.appendChild(script);
        await new Promise((resolve) => script.onload = resolve);
    }
    const config = await getStripeConfig()
    console.log("🚀 ~ file: SrCheckout.vue:44 ~ config:", config);
    return window.Stripe(config.publishableKey); // Replace with your Stripe publishable key
}

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
async function redirectToCheckout(priceId = subscriptionProductID) {
    try {
        const response = await fetch(`${PROJECT_URLS.CENTRALIZATION_URL}${CENTRALIZATION_ENDPOINTS.STRIPE_CHECKOUT_SESSION}/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                priceId,
                successURL: 'http://localhost:9000',
                cancelURL: 'http://google.com',
                email: userEmail
            }),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const responseData = await response.json();  // Parse the JSON from the response
        const sessionId = responseData.sessionId;    // Get the session ID
        console.log("🚀 ~ file: SrCheckout.vue:82 ~ sessionId:", sessionId);

        const stripe = await loadStripe();  // Ensure you have loaded Stripe.js
        return stripe.redirectToCheckout({ sessionId });
    } catch (error) {
        console.error('Error:', error);
    }
}


const handleSubscribe = async () => {
    const customerResult = await fetch(`${PROJECT_URLS.CENTRALIZATION_URL}${CENTRALIZATION_ENDPOINTS.STRIPE_CREATE_CUSTOMER}/`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            email: userEmail,
        }),
    })
    const customerDetails = (await customerResult.json()).customer
    const customerID = customerDetails.id
    console.log("🚀 ~ file: SrCheckout.vue:45 ~ customerResult:", customerDetails, customerID);


    const subscriptionResult = await fetch(`${PROJECT_URLS.CENTRALIZATION_URL}${CENTRALIZATION_ENDPOINTS.STRIPE_CREATE_CUSTOMER}/`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            email: userEmail,
        }),
    })
    await redirectToCheckout(subscriptionProductID)

};

const sendTokenToBackend = async (token) => {
    // Send token to your backend via an API call
    // ...
};

onMounted(() => {
    // const script = document.createElement('script');
    // script.src = 'https://js.stripe.com/v3/';
    // script.onload = initializeStripe;
    // document.head.appendChild(script);
    // loadStripe();
});

const initializeStripe = () => {
    // stripe.value = Stripe('pk_test_51OGQQoJ5PV7GuigYwTYVEmyl3e1kT9jh6Oh859hcIQo6xDFh21HMWfUJexNE4oZ9bwtlfctUSbWXw0wdmX4srovX00jEAc9PgN'); // Replace with your Stripe publishable key
    // const elements = stripe.value.elements();
    // card.value = elements.create('card');
    // card.value.mount('#card-element');
};

// Add your form submission logic here
</script>
