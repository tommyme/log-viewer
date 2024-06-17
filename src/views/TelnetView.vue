<template>
  <div>
    <div style="display: flex;justify-content: space-between;height: 100vh" :style="{'flex-direction': direction?'column':'row'}">
      <TelnetBoard v-for="id in board_ids" :key="id" class="item" :style="mystyle" :direction="direction" :class="{'sp-border': currKey == id}"></TelnetBoard>
    </div>
    <TelnetBoardFooter v-model="board_ids" v-model:direction="direction" v-model:currKey="currKey" />
    <div class="hover-area" @mouseover="showNav"></div>
  </div>
</template>

<script setup>
import TelnetBoard from '../components/telnet-board.vue'
import TelnetBoardFooter from '../components/telnet-board-footer.vue'
import { ref, watch, computed } from 'vue';
const board_ids = ref([1])
const currKey = ref(-1)
const getNum = () => {
  for (let i = 1; i <= 10; i++) {
    if (!board_ids.value.includes(i)) {
      return i
    }
  }
}
const direction = ref(false)
const STORE_KEY = "telnet-board-num"
let num_items = localStorage.getItem(STORE_KEY)  // 如果没定义就是null
if (num_items === null) {
  localStorage.setItem(STORE_KEY, 1)  // 默认设置成1
} else {
  let val = Number(num_items)
  for (let i = 1; i < val; i++) {
    board_ids.value.push(getNum())
  }
}
watch(board_ids, (value) => {
  localStorage.setItem(STORE_KEY, value.length)
})
// localStorage.setItem()
const showNav = () => {
  const nav = document.querySelector('.telnet-board-footer');
  if (nav) {
    nav.classList.add('is-visible');
  }
};
const mystyle = computed(() => {
  let res = direction.value ? {'max-height': `calc(100%/${board_ids.value.length})`} : {'max-width': `calc(100%/${board_ids.value.length})`}
  return res
})
</script>

<style scoped>
.item {
  flex-grow: 1;
  padding: 8px 20px
}
.hover-area {
  position: fixed;
  bottom: 0;
  height: 20px;
  width: 50px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 999;
  background-color: coral;
}
.sp-border {
  border: 8px dashed coral;
  border-radius: 10px;
}
</style>