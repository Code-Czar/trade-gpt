<template>
    <q-page>
        <q-card class="q-ma-md" style="max-width: 400px">
            <q-card-section>
                <div class="text-h6">Welcome to My App</div>
            </q-card-section>

            <q-card-section>
                <q-btn label="Login with Google" @click="login('google')" color="primary" class="full-width q-mb-sm" />

                <q-btn label="Login with GitHub" @click="login('github')" color="secondary" class="full-width q-mb-sm" />

                <!-- Add more buttons for other providers as needed -->
            </q-card-section>
        </q-card>
    </q-page>
</template>

<script lang="ts" setup>
import { ref, defineProps, defineEmits } from 'vue';
import { createClient } from '@supabase/supabase-js';
import { useRouter } from 'vue-router';

const SUPABASE_URL = "https://yhotbknfiebbflhovpws.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlob3Ria25maWViYmZsaG92cHdzIiwicm9sZSI6ImFub24iLCJpYXQiOjE2OTQ4NzE5MTEsImV4cCI6MjAxMDQ0NzkxMX0.LmJKiQhg09gO0YHKcHeRLU-T3mcbIaNbebYSrmsCXmM";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
console.log("🚀 ~ file: LoginPage.vue:28 ~ supabase:", supabase)
const router = useRouter();

const login = async (provider: 'google' | 'github') => {
    const { user, session, error } = await supabase.auth.signInWithOAuth({
        provider: provider,
    });

    if (user) {
        // Redirect to index page after successful login
        router.push("/index");
    } else {
        console.error("Login error:", error?.message);
    }
};
</script>
