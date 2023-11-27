<template>
    <div>Processing...</div>
</template>
  
<script lang="ts" setup>
import { onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { createClient } from "@supabase/supabase-js";
import { userStore } from '../stores/userStore';


const SUPABASE_URL = "https://yhotbknfiebbflhovpws.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlob3Ria25maWViYmZsaG92cHdzIiwicm9sZSI6ImFub24iLCJpYXQiOjE2OTQ4NzE5MTEsImV4cCI6MjAxMDQ0NzkxMX0.LmJKiQhg09gO0YHKcHeRLU-T3mcbIaNbebYSrmsCXmM";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const router = useRouter();
const store = userStore();

onMounted(() => {
    console.log("🚀 ~ file: CallbackComponent.vue:19 ~ onMounted ~ window.location:", window.location)
    const hashParams = new URLSearchParams(window.location.hash.split('/')[1]);
    const accessToken = hashParams.get("access_token");
    const tokenType = hashParams.get("token_type");
    const expiresAt = hashParams.get("expires_at");

    if (accessToken) {
        // You might want to securely store the accessToken and related data here

        // Set the session in Supabase client
        supabase.auth.setSession({
            access_token: accessToken,
            token_type: tokenType,
            expires_at: expiresAt
        });
        console.log("🚀 ~ file: CallbackComponent.vue:32 ~ accessToken:", accessToken);
        console.log("🚀 ~ file: CallbackComponent.vue:34 ~ tokenType:", tokenType);

        supabase.auth.getUser(accessToken).then(async ({ data: { user } }) => {
            if (user) {
                console.log("User details:", user);

                // Store user details in your user store
                store.setUserCredentials(user, accessToken);
                await store.pushUserToBackend(user);

                // You can access specific details like this:
                console.log("User name:", user.user_metadata.name); // Example for name
                console.log("User avatar UUID:", user.user_metadata.avatar_url); // Example for avatar URL

                // Redirect to the desired page
                router.push('/app');
            }
        })





        // router.push('/app');  // Redirect to the desired page
    } else {
        console.error("No access token found in the callback URL.");
        // Handle this case as needed, possibly redirecting to an error page
    }
});
</script>
  