<template>
    <q-page class="video-background">
        <!-- Video Background -->
        <video playsinline autoplay muted loop class="absolute-position full-width full-height">
            <source src="@/assets/stocks_1.mp4" type="video/mp4">
        </video>

        <!-- Two-Column Layout -->
        <div class="row items-center full-height">
            <!-- Left Column (2/3 width) -->
            <div class="col-8">
                <!-- You can add content here if needed -->
            </div>

            <!-- Right Column (1/3 width) with Login Component -->

            <div class="col-4" style="height: 100%">
                <q-card class="q-ma-md" style=" height:100%;  background-color: rgba(255,255,255,0.6); margin:0">
                    <q-card-section class="row items-center justify-center" style="height: 100%; margin:0">
                        <div style="margin:0">
                            <div class="text-h2 q-mb-md" style="text-align:center">Opportunities</div>

                            <q-btn label="Login with Google" @click="login('google')" color="primary"
                                class="full-width q-mb-sm" />
                            <q-btn label="Login with GitHub" @click="login('github')" color="secondary"
                                class="full-width q-mb-sm" />
                            <!-- Add more buttons for other providers as needed -->
                        </div>
                    </q-card-section>
                </q-card>
            </div>
        </div>
    </q-page>
</template>


<script lang="ts" setup>
import { Platform } from 'quasar';

import { createClient } from '@supabase/supabase-js';
import { useRouter } from 'vue-router';
import { userStore } from '@/stores/userStore';
console.log("🚀 ~ file: LoginPage.vue:42 ~ userStore:", userStore);


const SUPABASE_URL = "https://yhotbknfiebbflhovpws.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlob3Ria25maWViYmZsaG92cHdzIiwicm9sZSI6ImFub24iLCJpYXQiOjE2OTQ4NzE5MTEsImV4cCI6MjAxMDQ0NzkxMX0.LmJKiQhg09gO0YHKcHeRLU-T3mcbIaNbebYSrmsCXmM";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
console.log("🚀 ~ file: LoginPage.vue:28 ~ supabase:", supabase)
const router = useRouter();

const mobileURLScheme = 'opportunities://auth'

const login = async (provider: 'google' | 'github') => {
    // Determine the redirect URI based on the platform
    let redirectUri = null;
    if (Platform.is.android) {
        redirectUri = mobileURLScheme
    } else if (window.location.origin.includes('localhost') || window.location.origin.includes('127.0.0.1')) {
        // redirectUri = window.location.origin
        redirectUri = '/auth'
        console.log("🚀 ~ file: LoginPage.vue:62 ~ redirectUri:", window.location.origin, redirectUri);
    } else {
        redirectUri = window.location.origin + 'auth';
    }

    // let redirectUri = window.location.origin + '/auth';


    const { user, session, error } = await supabase.auth.signInWithOAuth({
        provider,
        options: { redirectTo: redirectUri }
    }
        // { provider },
        // {
        //     redirectTo: redirectUri,
        // },
    );

    if (user) {
        // Redirect to index page after successful login
        console.log("🚀 ~ session:", session);
        console.log("🚀 ~ user:", user);
        await userStore.setUserCredentials(user, session);
        // Optionally, navigate to a different route
        // router.push("/index");
    } else {
        console.error("Login error:", error?.message);
    }
};
</script>

<style scoped>
.relative-position {
    position: relative;
}

.absolute-position {
    position: absolute;
    top: 0;
    left: 0;
    z-index: -1;
    /* Ensure the video plays behind your content */
}

.full-width {
    width: 100%;
}

.full-height {
    height: 100%;
}

.video-background {
    position: relative;
    overflow: hidden;
    width: 100%;
    height: 100vh;
    /* or adjust as needed */
}

.video-background video {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.centered-content {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
}
</style>




