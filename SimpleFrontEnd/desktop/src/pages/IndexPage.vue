<template>
  <q-page class="home-page">
    <!-- Video Section -->
    <section class="video-section">
      <video id="videoBg2" autoplay loop muted playsinline width="250">
        <source src="@/assets/stocks_1.webm" type="video/webm" />
        Your browser does not support the video tag.
      </video>
      <div class="video-overlay"></div>


      <div class="overlay-content">
        <div class="text-h2 text-white">
          <h1>{{ $t('healineTitle') }}</h1>
        </div>
        <div class="text-subtitle1 q-my-md text-white">Sub-Headline</div>
        <q-btn color="primary" @click="goToApp">{{ $t('buttons.discover') }}</q-btn>
      </div>
    </section>

    <!-- Other Sections -->
    <section class="bg-primary text-white">
      Purpose

    </section>
    <section class="bg-primary text-white">
      Roadmap

    </section>

    <section class="bg-secondary text-white">
      Content for section 2...
      <div style="display:flex; flex-direction: column">

        <q-btn label="Open App" color="primary" @click="goToApp" />
        <q-btn label="Send test mail" color="primary" @click="sendTestMail" />
        <q-btn label="Send test Notification" color="primary" @click="sendTestNotification" />

        <q-btn label="Login" color="primary" @click="goToLogin" />
      </div>
    </section>

    <!-- ... Add more sections as needed ... -->

    <PublicFooter />
  </q-page>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios';
import { STRATEGY_ANALYZER_URL } from '@/models/consts'
import PublicFooter from '@/components/publicPages/PublicFooter.vue';
// import { userStore } from '../stores/userStore';
// console.log("🚀 ~ file: IndexPage.vue:63 ~ userStore:", userStore);




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
const sendTestMail = async () => {
  try {
    // Perform the POST request to the server
    await axios.post(`${STRATEGY_ANALYZER_URL}/api/test-email`);
    // Notify user of success
    alert('Test email sent successfully!');
  } catch (error) {
    // Handle any errors that occur during the request
    console.error('Error sending test email:', error);
    alert('Failed to send test email.');
  }
}
const sendTestNotification = async () => {
  try {
    // Perform the POST request to the server
    await axios.post(`${STRATEGY_ANALYZER_URL}/api/test-notification`);
    // Notify user of success
    alert('Test email sent successfully!');
  } catch (error) {
    // Handle any errors that occur during the request
    console.error('Error sending test email:', error);
    alert('Failed to send test email.');
  }
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
  position: absolute;
  top: 0;
  left: 0;
  width: 100vw;
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

.video-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  /* Adjust opacity as needed */
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
