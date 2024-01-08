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
    console.log("🚀 ~ file: CallbackComponent.vue:19 ~ onMounted ~ window.location:", window.location);

    // Use a regular expression to extract the part of the hash that starts with 'access_token='
    const hashMatch = window.location.hash.match(/access_token=([^&]+)/);
    let hashParams;
    if (hashMatch) {
        // Create URLSearchParams from the extracted part of the hash
        hashParams = new URLSearchParams(hashMatch[0]);
    } else {
        console.error("No access token found in the callback URL.");
        // Handle error, possibly redirecting to an error page
        return;
    }

    const accessToken = hashParams.get("access_token");
    const tokenType = hashParams.get("token_type");
    const expiresAt = hashParams.get("expires_at");

    if (accessToken) {
        // You might want to securely store the accessToken and related data here

        supabase.auth.setSession({
            access_token: accessToken,
            token_type: tokenType,
            expires_at: expiresAt
        });

        supabase.auth.getUser(accessToken).then(async ({ data: { user } }) => {
            if (user) {
                console.log("User details:", user);

                store.setUserCredentials(user, accessToken);
                await store.pushUserToBackend(user);

                console.log("🚀 ~ file: CallbackComponent.vue:55 ~ user:", user);
                console.log("🚀 ~ file: CallbackComponent.vue:58 ~ store:", store.user, store.user.role);

                if (store.user.role !== "Dev" && store.user.role !== "Admin") {
                    router.push('/beta')
                }
                else {
                    router.push('/app');
                }
            }
        })

        // router.push('/app');  // Redirect to the desired page
    } else {
        console.error("No access token found in the callback URL.", hashParams);
        // Handle this case as needed, possibly redirecting to an error page
    }
});
</script>