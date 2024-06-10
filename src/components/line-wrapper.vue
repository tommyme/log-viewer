<template>
  <div class="line-wrapper">
    <line-number :number="source.id"></line-number>
    <slot>
      <line-content :content="source"></line-content>
    </slot>
  </div>
</template>
<script setup>
import LineContent from './line-content.vue'
import LineNumber from './line-number.vue'
import { computed, defineProps } from 'vue';

const props = defineProps({
  source: {
    type: Object,
    default: () => {}
  }
})

</script>
<style lang="less">
.line-wrapper {
  display: flex;
  color: #f1f1f1;
  line-height: 20px;
  height: 20px;
  white-space: pre;
  // word-break: break-all;
  box-sizing: border-box;
  padding-left: 16px;

  &:hover {
    background-color: #444;
  }

  .line-number {
    min-width: 40px;
    text-align: right;
    color: #666;
    padding-right: 10px;
    -webkit-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    user-select: none;
  }
}
</style>
