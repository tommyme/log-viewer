<template>
  <div>
    <div
      class="hover-area"
      @mouseover="showNav"
    ></div>
    <FloatingNav />
    <main>
      <router-view />
    </main>
  </div>
</template>

<script setup>
import FloatingNav from '../components/float-nav.vue';
import { ref } from 'vue';

const showNav = () => {
  const nav = document.querySelector('.floating-nav');
  if (nav) {
    nav.classList.add('is-visible');
  }
};
</script>

<style scoped>
.hover-area {
  position: fixed;
  left: 0;
  top: 0;
  height: 100vh;
  width: 20px;
  z-index: 999;
}
</style>