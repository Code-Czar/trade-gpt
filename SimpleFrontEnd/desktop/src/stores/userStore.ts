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
        console.log("🚀 ~ file: userStore.ts:28 ~ CENTRALIZATION_API_URLS.USERS:", CENTRALIZATION_API_URLS.USERS);
        const checkResponse = await apiConnector.get(`${CENTRALIZATION_API_URLS.USERS}/${user.id}`);

        let response = null
        console.log("🚀 ~ file: userStore.ts:28 ~ checkResponse:", checkResponse, user.id);
        let method = 'POST';
        if (checkResponse.status === 200) {
          // User exists, update the user
          method = 'PATCH';
          response = await apiConnector.patch(`${CENTRALIZATION_API_URLS.USERS}/${user.id}/`,
            { id: user.id, details: user }
          );
        } else {
          console.log("🚀 ~ file: userStore.ts:41 ~ CENTRALIZATION_API_URLS.USERS:", CENTRALIZATION_API_URLS.USERS);
          response = await apiConnector.post(`${CENTRALIZATION_API_URLS.USERS}`,
            { id: user.id, details: user }
          );

        }

        // POST or PATCH request based on user existence


        if (!response.status === 200) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        console.log("🚀 ~ file: userStore.ts:54 ~ response:", response);
        const data = await response.data;
        console.log("User data pushed to backend:", data);
        this.user = data;
        console.log("🚀 ~ file: userStore.ts:57 ~ this.user:", this.user);
      } catch (error) {
        console.error("Error pushing user data to backend:", error);
      }
    }

  },
});
