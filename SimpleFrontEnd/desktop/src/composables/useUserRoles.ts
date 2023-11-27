// src/composables/useUserRole.js
import { computed } from 'vue';
import { userStore } from 'src/stores/userStore'; // Adjust the path as necessary

export function useUserRole() {
    const userStore_ = userStore();

    // Example computed properties based on user roles
    const isAdmin = computed(() => userStore_.user?.role === 'Admin');
    const isDev = computed(() => userStore_.user?.role === 'Dev');
    const isUser = computed(() => userStore_.user?.role === 'User');
    // ... add more roles as needed

    return {
        isAdmin,
        isUser,
        isDev
        // ... return more roles as needed
    };
}
