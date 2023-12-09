// src/plugins/pinia-persistence.ts

import { PiniaPluginContext, createPinia } from 'pinia';

const pinia = createPinia();

pinia.use(({ store, state }) => {
    // Define the key to use in localStorage
    const storageKey = 'myStore';

    // Load state from localStorage on plugin initialization
    const storedState = localStorage.getItem(storageKey);
    if (storedState) {
        state.value = JSON.parse(storedState);
    }

    // Subscribe to state changes and persist to localStorage
    store.$subscribe(
        () => {
            localStorage.setItem(storageKey, JSON.stringify(state.value));
        },
        { immediate: true }
    );
});

export default pinia;
