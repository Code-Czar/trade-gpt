<template>
    <div>
        Checkout component
        <!-- <div id="card-element"></div> -->
        <q-btn label="Subscribe" @click="handleSubscribe" />
        <!-- <q-btn label="Subscribe" @click="handleSubscribe" /> -->
    </div>
</template>
  


<script lang="ts" setup>
import { apiConnector, CENTRALIZATION_API_URLS } from 'trading-shared'
import { userStore } from '@/stores/userStore'


const userStore_ = userStore();
const user = userStore_.user;
const userEmail = user.details.email;
const subscriptionProductID = "price_1OGcM6J5PV7GuigY8TduVpNv"


async function getStripeConfig() {
    const config = await apiConnector.get(`${CENTRALIZATION_API_URLS.STRIPE_CONFIG}`)


    return config.data
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


async function redirectToCheckout(priceId = subscriptionProductID) {
    try {
        const response = await apiConnector.post(`${CENTRALIZATION_API_URLS.STRIPE_CHECKOUT_SESSION}/`,
            JSON.stringify({
                priceId,
                // TODO: change URL
                successURL: 'http://localhost:9000',
                cancelURL: 'http://google.com',
                email: userEmail
            }),
            {
                'Content-Type': 'application/json',
            },
        );

        console.log("🚀 ~ file: SrCheckout.vue:48 ~ response:", response);
        if (response.status !== 200) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const responseData = await response.data;  // Parse the JSON from the response
        const sessionId = responseData.sessionId;    // Get the session ID
        console.log("🚀 ~ file: SrCheckout.vue:82 ~ sessionId:", sessionId);

        const stripe = await loadStripe();  // Ensure you have loaded Stripe.js
        return stripe.redirectToCheckout({ sessionId });
    } catch (error) {
        console.error('Error:', error);
    }
}


const handleSubscribe = async () => {
    const customerResult = await apiConnector.post(`${CENTRALIZATION_API_URLS.STRIPE_CREATE_CUSTOMER}/`,
        {
            email: userEmail,
        },

    )
    console.log("🚀 ~ file: SrCheckout.vue:79 ~ customerResult:", customerResult);
    const customerData = await customerResult.data
    console.log("🚀 ~ file: SrCheckout.vue:83 ~ customerData:", customerData);
    const customerEmail = customerData.customer.email
    const customerDetails = customerData
    const customerID = customerDetails.id
    console.log("🚀 ~ file: SrCheckout.vue:45 ~ customerResult:", customerDetails, customerEmail, customerID);


    const subscriptionResult = await apiConnector.post(`${CENTRALIZATION_API_URLS.STRIPE_CREATE_CUSTOMER}/`,
        JSON.stringify({
            email: customerEmail,
        }),
        {
            'Content-Type': 'application/json',
        },
    )
    await redirectToCheckout(subscriptionProductID)

};

</script>
