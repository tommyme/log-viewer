<template>
  <div style="position: relative;">
    <virtual-list
      style="height: 360px; overflow-y: auto;"
      class="log-viewer"
      ref="virturalList"
      v-bind="virtualAttrs"
      :data-component="LineWrapper"
      :data-sources="lines"
      data-key="id"
      :keeps="30"
    >
    </virtual-list>
    <div style="position: absolute;bottom: 4px;right: 24px;">
      <el-switch v-model="toBottom" />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick, onMounted, onUnmounted } from 'vue'
import VirtualList from 'vue3-virtual-scroll-list'
import LineWrapper from './line-wrapper.vue'
import LogLoading from './loading.vue'
import parse from '../utils'

const props = defineProps({
  /**
   * VirtualList original props
   * Reference: https://github.com/tangbc/vue-virtual-scroll-list
   */
  virtualAttrs: {
    type: Object,
    default: () => ({})
  },
  /**
   * A fixed row height in pixels. Controls how tall a line is, as well as the lineHeight style of the line's text.
   * Defaults to 20.
   */
  rowHeight: {
    type: Number,
    default: 20
  },
  /**
   * The log-viewer container height
   * Defaults to 0,and the component is 30 * rowHeight
   */
  height: {
    type: Number,
    default: 0
  },
  /**
   * The orginal log text shuold be shown
   */
  log: {
    type: Array,
    required: true
  },
  /**
   * Loading Status flag
   */
  loading: {
    type: Boolean,
    required: true
  },
  /**
   * Auto scroll to the bottom when the logs update. Defaults to be true
   */
  autoScroll: {
    type: Boolean,
    default: true
  },
  /**
   * Has number line if hasNumber is true. Defaults to be true.
   */
  hasNumber: {
    type: Boolean,
    default: true
  },
  /**
   * Auto scroll to bottom's time duration(ms), defaults to 0 means to no duration.
   */
  scrollDuration: {
    type: Number,
    default: 0
  }
})
const toBottom = ref(false)
const virturalList = ref(null)
console.log(virturalList)
const start = ref(0)
const scrollStart = ref(0)
const animate = ref(null)

const remain = computed(() => {
  if (typeof +props.height === 'number') {
    return props.height > 0 ? Math.floor(props.height / props.rowHeight) : 30
  }
  if (props.height.indexOf('px') > 0) {
    return Math.floor(props.height.split('px')[0] / props.rowHeight)
  }
  return 30
})
const lines = computed(() => {
  const res = []
  let index = 0
  props.log.forEach((onetime_log) => {
    let list_of_lines = parse(onetime_log)
    list_of_lines.forEach((list_of_sections) => {
      res.push({id: index, val: list_of_sections})
      index += 1
    })
  })
  return res
})
const linesCount = computed(() => lines.value.length + (props.loading ? 1 : 0))

watch(
  lines,
  (lines) => {
    if (toBottom.value) {
      virturalList.value.scrollToBottom()
    }
  },
  // { immediate: true }
)

function forceRender() {
  virturalList.value.forceRender()
}

function getLineWrapperProps(index) {
  const height = props.rowHeight
  const props = {
    height,
    hasNumber: props.hasNumber,
    numberData: {
      number: index + 1
    }
  }
  lineWrapperStyle &&
    (props.comStyle = lineWrapperStyle(index + 1))
  if (props.loading && index === linesCount.value - 1) {
    return {
      props,
      scopedSlots: {
        default: () => h(LogLoading)
      }
    }
  }
  props.data = lines.value[index]
  return {
    props
  }
}

function setScrollTop(line) {
  if (props.scrollDuration === 0) {
    nextTick(() => {
      // 在nextick外面执行会导致自动滚动到上一次的位置
      start.value = linesCount.value
    })
    return
  }
  if (animate.value) {
    cancelAnimationFrame(animate.value)
  }
  let i = scrollStart.value
  let step = 0
  step =
    Math.abs(line - scrollStart.value) / ((props.scrollDuration * 60) / 1e3)
  step = step < 1 ? 1 : step
  const animation = () => {
    animate.value = requestAnimationFrame(() => {
      // 从起始行开始滚动，若起始行小于目标行时，每帧逐渐增加行数（向下滚），直到目标行
      // 同理，若起始行大于目标行时，每帧减少行数（向上滚），直到目标行
      // 若当前行在目标行范围内[line-step,line+step], 直接滚到目标行
      if (i < line - step || i > line + step) {
        start.value = i
        i = Math.floor(i < line - step ? i + step : i - step)
        animation()
      } else {
        start.value = line
        scrollStart.value = start.value
      }
    })
  }
  animation()
}

function onscroll(event, data) {
  scrollStart.value = Math.ceil(data.offset / props.rowHeight)
}
</script>

<style lang="less">
.log-viewer {
  font-size: 12px;
  background-color: #222;
  overflow-x: auto;
  padding: 20px 0;
}
</style>