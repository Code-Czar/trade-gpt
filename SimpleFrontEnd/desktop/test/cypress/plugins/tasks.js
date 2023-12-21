import { createClient } from '@supabase/supabase-js';

// const supabaseUrl = process.env?.SUPABASE_URL;
// const apiKey = process.env?.SUPABASE_API_KEY;
const supabaseUrl = "https://yhotbknfiebbflhovpws.supabase.co";
const apiKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlob3Ria25maWViYmZsaG92cHdzIiwicm9sZSI6ImFub24iLCJpYXQiOjE2OTQ4NzE5MTEsImV4cCI6MjAxMDQ0NzkxMX0.LmJKiQhg09gO0YHKcHeRLU-T3mcbIaNbebYSrmsCXmM";

const supabase = createClient(
    supabaseUrl,
    apiKey
);

// cache session data for each user name
const sessions = {};

export async function getUserSession({ user }, provider = 'google') {
    // Create a session for the user if it doesn't exist already.
    if (!sessions[user]) {
        const { user, session, error } = await supabase.auth.signInWithOAuth({
            provider,
            options: { redirectTo: '/' }
        });

        sessions[user] = session;
    }

    return sessions[user];
}