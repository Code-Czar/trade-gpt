import { defineStore } from 'pinia';
import { apiConnector, CENTRALIZATION_API_URLS } from 'trading-shared';

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
        const checkResponse = await apiConnector.get(`${CENTRALIZATION_API_URLS.USERS}/${user.id}`);

        let method = 'POST';
        if (checkResponse.status === 200) {
          // User exists, update the user
          method = 'PATCH';
        }

        // POST or PATCH request based on user existence
        const response = await apiConnector.patch(`${CENTRALIZATION_API_URLS.USERS}${method === 'PATCH' ? '/' + user.id + '/' : '/'}`,
          { id: user.id, details: user }
        );

        if (!response.status === 200) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.data.json();
        console.log("User data pushed to backend:", data);
        this.user = data;
        console.log("🚀 ~ file: userStore.ts:57 ~ this.user:", this.user);
      } catch (error) {
        console.error("Error pushing user data to backend:", error);
      }
    }

  },
});
