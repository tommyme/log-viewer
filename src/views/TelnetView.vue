<template>
  <div style="display: flex;justify-content: space-between">
    <TelnetBoard class="item"></TelnetBoard>
    <TelnetBoard class="item"></TelnetBoard>
    <TelnetBoard class="item"></TelnetBoard>
  </div>
</template>

<script setup>
import TelnetBoard from '../components/telnet-board.vue'

</script>

<style scoped>
.item {
  flex-grow: 0;
}
</style>