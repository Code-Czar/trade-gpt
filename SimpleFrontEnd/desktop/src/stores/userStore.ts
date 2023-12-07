import { defineStore } from 'pinia';
import { CENTRALIZATION_API_URLS } from 'trading-shared';

export const userStore = defineStore('user', {
  state: () => ({
    user: null,
    session: null,
    persist: true
  }),
  getters: {

  },
  actions: {


    async setUserCredentials(user, session) {  // From backend structure
      console.log("🚀 ~ file: userStore.ts:14 ~ session:", session);
      console.log("🚀 ~ file: userStore.ts:14 ~ user:", user);
      this.user = user;
      this.session = session;

    },
    async pushUserToBackend(user) {
      try {
        // Check if user exists
        const checkResponse = await fetch(`http://${CENTRALIZATION_API_URLS.USERS}/${user.id}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            // Include authorization headers if needed
          }
        });

        let method = 'POST';
        if (checkResponse.ok) {
          // User exists, update the user
          method = 'PATCH';
        }

        // POST or PATCH request based on user existence
        const response = await fetch(`${CENTRALIZATION_API_URLS.USERS}${method === 'PATCH' ? '/' + user.id + '/' : '/'}`, {
          method: method,
          headers: {
            'Content-Type': 'application/json',
            // Include authorization headers if needed
          },

          body: JSON.stringify({ id: user.id, details: user })
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log("User data pushed to backend:", data);
        this.user = data;
        console.log("🚀 ~ file: userStore.ts:57 ~ this.user:", this.user);
      } catch (error) {
        console.error("Error pushing user data to backend:", error);
      }
    }

  },
});
