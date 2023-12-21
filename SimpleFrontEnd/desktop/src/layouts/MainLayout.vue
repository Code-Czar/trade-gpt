<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated>
      <q-toolbar>
        <q-btn id="navMenuDrawer-toggleButton" flat dense round icon="menu" aria-label="Menu" @click="toggleLeftDrawer" />
        <q-toolbar-title>
          Opportunities
        </q-toolbar-title>
      </q-toolbar>
    </q-header>

    <q-drawer v-model="leftDrawerOpen" show-if-above bordered>
      <q-list>
        <q-item-label header>
          Navigation
        </q-item-label>

        <!-- Link to Monitoring Page -->
        <q-item v-if="isDev" clickable>
          <q-item-section avatar>
            <q-icon name="Admin" />
          </q-item-section>
          <q-item-section @click="goToAdminPage">
            <q-item-label>
              <span >Dev Panel</span>
            </q-item-label>
          </q-item-section>
        </q-item>
        <q-item v-if="isDev" clickable>
          <q-item-section avatar>
            <q-icon name="alert" />
          </q-item-section>
          <q-item-section id="navMenu-alertPanel-link" @click="gotToAlertsPage">
            <q-item-label>
              <span >Alerts Panel</span>
            </q-item-label>
          </q-item-section>
        </q-item>
        <q-item v-if="isDev" clickable>
          <q-item-section avatar>
            <q-icon name="Admin" />
          </q-item-section>
          <q-item-section @click="goToCheckout">
            <q-item-label>
              <span >Checkout</span>
            </q-item-label>
          </q-item-section>
        </q-item>
        <q-item clickable>
          <q-item-section avatar>
            <q-icon name="monitor" />
          </q-item-section>
          <q-item-section @click="gotToMonitoringPage">
            <q-item-label>
              <span >Monitoring</span>
            </q-item-label>
          </q-item-section>
        </q-item>
      </q-list>
    </q-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useUserRole } from '@/composables/useUserRoles';

const { isAdmin, isUser, isDev } = useUserRole();


const router = useRouter();
const leftDrawerOpen = ref(false);

function toggleLeftDrawer() {
  leftDrawerOpen.value = !leftDrawerOpen.value;
}
const gotToMonitoringPage = () => {
  router.push('/monitoring');
}
const goToCheckout = () => {
  router.push('/checkout');
}
const goToAdminPage = () => {
  router.push('/devOnly');
}
const gotToAlertsPage = () => {
  router.push('/premiumAlerts');
}
</script>
