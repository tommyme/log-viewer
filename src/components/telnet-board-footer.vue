<template>
  <div class="telnet-board-footer" :class="{ 'is-visible': isVisible }" @mouseover="isVisible = true" @mouseleave="isVisible = false">
    <el-button-group class="ml-4">
      <el-button 
        v-for="id in props.modelValue" :key="id" type="danger" 
        :disabled="props.modelValue.length == 1" :icon="Delete" @click="delNum(id)"
        @mouseover="handleMouseover(id)" @mouseleave="handleMouseleave"
      />
      <el-button type="success" :icon="Plus" @click="addNum" :disabled="props.modelValue.length >= 4"/>
    </el-button-group>
    <el-switch v-model="direction" style="margin: 0 18px;"/>
  </div>
</template>

<script setup>
import { Delete, Plus } from '@element-plus/icons-vue'
import { ref, watch } from 'vue';
const isVisible = ref(false);
const direction = ref(false)
const props = defineProps({
  modelValue: {
    type: Array,
    default: []
  },
  direction: {
    type: Boolean,
    default: false
  },
  currKey: {
    type: Number,
    default: -1
  }
})
const currKey = ref(-1)
const handleMouseover = (id) => {
  currKey.value = id
  emit('update:currKey', currKey.value)
}
const handleMouseleave = () => {
  currKey.value = -1
  emit('update:currKey', currKey.value)
}
const emit = defineEmits(['update:modelValue', 'update:direction', 'update:currKey']);
const getNum = () => {
  for (let i = 1; i <= 10; i++) {
    if (!props.modelValue.includes(i)) {
      return i
    }
  }
}

const addNum = () => {
  emit('update:modelValue', props.modelValue.concat([getNum()]));
  console.log(props.modelValue)
}
const delNum = (id) => {
  emit('update:modelValue', props.modelValue.filter(i => i != id))
}
watch(direction, () => {
  emit('update:direction', direction.value)
})

</script>

<style scoped>
.telnet-board-footer {
  padding: 0px 100px;
  position: fixed;
  right: 50%;
  transform: translateX(50%);
  bottom: -200px;
  margin: 8px;
  transition: bottom 0.3s ease;
  z-index: 1000;
}
.telnet-board-footer.is-visible {
  bottom: 0px; 
}

</style>