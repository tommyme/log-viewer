<!-- src/components/FloatingNavItem.vue -->
<template>
  <li>
    <router-link :to="route.path">{{ route.name }}</router-link>
    <ul v-if="route.children && route.children.length">
      <FloatingNavItem
        v-for="child in route.children"
        :key="child.path"
        :route="child"
      />
    </ul>
  </li>
</template>

<script setup>
import { defineProps } from 'vue';
import FloatingNavItem from './FloatingNavItem.vue';

const props = defineProps({
  route: Object
});
</script>

<style scoped>
ul {
  padding-left: 20px;
}
a {
  color: white;
  text-decoration: none;
}

a:hover {
  text-decoration: underline;
}
</style>
