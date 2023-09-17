<template>
  <q-page class="home-page">
    <!-- Top Menu -->
    <q-header elevated class="bg-transparent" style="position:absolute; top:0;left:0">
      <q-toolbar>
        <q-btn flat round dense icon="menu" @click="toggleDrawer" />
        <q-toolbar-title>
          My App
        </q-toolbar-title>
      </q-toolbar>
    </q-header>

    <!-- Video Section -->
    <section class="video-section">
      <video id="videoBg2" autoplay loop muted playsinline width="250">
        <source src="@/assets/stocks_1.webm" type="video/webm" />
        Your browser does not support the video tag.
      </video>
      <div class="overlay-content">
        <div class="text-h2">Headline</div>
        <div class="text-subtitle1 q-my-md">Sub-Headline</div>
        <q-btn label="Call to Action" color="primary" @click="playVideo" />
      </div>
    </section>

    <!-- Other Sections -->
    <section class="bg-primary text-white">
      Content for section 1...

    </section>

    <section class="bg-secondary text-white">
      Content for section 2...
      <q-btn label="Open App" color="primary" @click="goToApp" />

      <q-btn label="Login" color="primary" @click="goToLogin" />
    </section>

    <!-- ... Add more sections as needed ... -->

    <!-- Footer -->
    <footer class="bg-dark text-white text-center q-py-md">
      © 2023 by My App. All Rights Reserved.
    </footer>
  </q-page>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';


const router = useRouter();

const playVideo = () => {

  document.querySelector("#videoBg")?.play();
  document.querySelector("#videoBg2")?.play();
}
const goToApp = () => {

  router.push('/app');
}
const goToLogin = () => {

  router.push('/login');
}

// document.querySelector("#videoBg")?.addEventListener("click", playVideo);
// document.querySelector("#videoBg")?.click();


const toggleDrawer = () => {
  // Logic for toggling the drawer (if any)
}
</script>

<style scoped>
.home-page {
  display: flex;
  flex-direction: column;
}

.video-section {
  position: relative;
  height: calc(2/3 * 100vh);
  overflow: hidden;
}

.video-section video {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.overlay-content {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
}

/* Styles for other sections */
section {
  min-height: 400px;
  /* adjust as needed */
  padding: 20px;
}

footer {
  margin-top: auto;
  /* Push footer to the bottom */
}
</style>
