<template>
  <q-header elevated class="bg-transparent" style="position: absolute; top: 0; left: 0">
    <q-toolbar>
      <q-btn flat round dense icon="menu" @click="toggleDrawer" />
      <q-toolbar-title>
        Opportunities
      </q-toolbar-title>
      <I18nProvider>

        <LanguageSwitchButton />
      </I18nProvider>
      <q-btn flat round dense icon="login" @click="goToLogin" />
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
  background-color: transparent;
}
</style>
