<!-- Layout.vue -->

<template>
    <q-layout>
        <PublicHeader />
        <q-page-container>
            <router-view />
        </q-page-container>
    </q-layout>
</template>
  
<script setup>
import PublicHeader from '@/components/publicPages/PublicHeader.vue';
</script>
  
<style scoped>
/* Add any styles specific to the layout component */
</style>
  