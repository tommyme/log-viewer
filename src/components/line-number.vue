<template>
  <div class="line-number">{{ number }}</div>
</template>
<script setup>
import { defineProps } from 'vue';
defineProps({
  number: {required: true},
})

</script>
