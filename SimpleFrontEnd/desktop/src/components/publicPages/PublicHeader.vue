<template>
  <q-header class="bg-transparent" style="position: absolute; top: 0; left: 0">
    <q-toolbar>
      <q-toolbar-title>
        Opportunities
      </q-toolbar-title>

      <!-- Flex Container for Navigation Items -->
      <div class="flex-container">
        <span class="nav-menu-item">{{ $t('navigationMenu.homeHeader.home') }}</span>
        <q-btn flat rounded dense class="nav-menu-item" @click="goToLogin"> {{ $t('buttons.login') }} </q-btn>
        <I18nProvider>
          <LanguageSwitchButton />
        </I18nProvider>
      </div>
    </q-toolbar>
  </q-header>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import LanguageSwitchButton from '@/components/LanguageSwitchButton.vue';

const router = useRouter();

const goToLogin = () => {
  router.push('/login');
};

const toggleDrawer = () => {
  // Logic for toggling the drawer (if any)
};
</script>

<style >
.bg-transparent {
  background-color: transparent !important;
  box-shadow: unset !important;
}

.nav-menu-item {
  margin-right: 1rem;
  /* Adjust as needed */
}

.flex-container {
  display: flex;
  align-items: center;
  flex-wrap: nowrap;
  /* Align items vertically */
  /* Add any additional styling as needed */
}
</style>
