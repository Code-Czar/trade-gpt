// cypress/plugins/index.js
const { createClient } = require('@supabase/supabase-js');

module.exports = (on, config) => {
    const url = config.env.SUPABASE_URL;
    const apiKey = config.env.SUPABASE_API_KEY;

    const supabase = createClient(url, apiKey);

    // cache session data for each user name
    const sessions = {};

    async function getUserSession({ user }) {
        // Create a session for the user if it doesn't exist already.
        if (!sessions[user]) {
            const { data } = await supabase.auth.signInWithPassword({
                email: `${user}@example.com`,
                password: `${user}-password`,
            });

            sessions[user] = data.session;
        }

        return sessions[user];
    }

    // You can expose this function to your tests using Cypress tasks
    on('task', {
        getUserSession
    });

    // Return the updated config object
    return config;
};
