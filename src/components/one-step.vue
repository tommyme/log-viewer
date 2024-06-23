<template>
  <el-step>
    <template #title>
      {{ props.name }}
    </template>
    <template #description>
      <el-button-group>
        <el-button type="primary" :icon="ArrowLeft" @click=""></el-button>
        <el-button type="primary" :icon="Edit"></el-button>
        <el-button type="primary" :icon="ArrowRight"></el-button>
      </el-button-group>
    </template>
  </el-step>
</template>

<script setup>
import { ArrowRight, ArrowLeft, Edit } from '@element-plus/icons-vue';

const props = defineProps({
  name: {
    type: String
  },
})
</script>

<style scoped>
</style>