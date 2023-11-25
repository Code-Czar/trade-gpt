import { defineStore } from 'pinia';
import { PROJECT_URLS, CENTRALIZATION_ENDPOINTS } from 'trading-shared';

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
        console.log("🚀 ~ file: userStore.ts:26 ~ CENTRALIZATION_ENDPOINTS:", CENTRALIZATION_ENDPOINTS, PROJECT_URLS);
        const checkResponse = await fetch(`${PROJECT_URLS.CENTRALIZATION_URL}${CENTRALIZATION_ENDPOINTS.USERS}/${user.id}`, {
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
        const response = await fetch(`${PROJECT_URLS.CENTRALIZATION_URL}${CENTRALIZATION_ENDPOINTS.USERS}${method === 'PATCH' ? '/' + user.id : ''}`, {
          method: method,
          headers: {
            'Content-Type': 'application/json',
            // Include authorization headers if needed
          },
          body: JSON.stringify(user)
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log("User data pushed to backend:", data);
      } catch (error) {
        console.error("Error pushing user data to backend:", error);
      }
    }

  },
});
