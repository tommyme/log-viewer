<script setup>
import { myroutes } from '../router';
import { ref, defineAsyncComponent } from 'vue';
const isVisible = ref(false);

const showNav = () => {
  isVisible.value = true;
};

const hideNav = () => {
  isVisible.value = false;
};
const FloatingNavItem = defineAsyncComponent(() => import('./FloatingNavItem.vue'));
</script>
<!-- src/components/FloatingNav.vue -->
<template>
  <ul
    class="floating-nav"
    :class="{ 'is-visible': isVisible }"
    @mouseover="showNav"
    @mouseleave="hideNav"
  >
    <FloatingNavItem
      v-for="route in myroutes"
      :key="route.path"
      :route="route"
    />
  </ul>
</template>


<style scoped>
.floating-nav {
  position: fixed;
  top: 50%;
  transform: translateY(-50%);
  background-color: rgba(0, 0, 0, 0.3);
  padding: 10px;
  border-radius: 5px;
  z-index: 1000;
  left: -200px; /* 初始状态隐藏在屏幕左侧 */
  transition: left 0.3s ease;
}

.floating-nav.is-visible {
  left: 10px; /* 当导航栏可见时，移到屏幕内 */
}

ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.floating-nav li {
  margin: 10px 0;
}
</style>
