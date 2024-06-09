<script setup>
import { ref } from 'vue';
import LogViewer from '../components/log-viewer.vue';
import LogSelect from '../components/log-select.vue'
const loading = ref(false)
const log = ref([])
const viewlog = (...content) => {
  console.log("home view", ...content)
}
let curr_socket = null

function socket_get_data(payload) {
  let lock = false;
  let offset = 0;
  let len = 500;
  let intervalId;
  if (curr_socket) {
    curr_socket.close()
  }
  curr_socket = new WebSocket('ws://127.0.0.1:8000/websocket');
  log.value = []
  const sendRequest = () => {
    if (lock) {
      // 如果锁定状态，则不发送请求
      return;
    }
    lock = true;
    let args = {
      ...payload,
      __offset: offset,
      __len: len,
    };
    // console.log('Sending request with offset:', offset);
    curr_socket.send(JSON.stringify(args));
  };

  curr_socket.onopen = function(event) {
    // console.log('WebSocket connection established.');
    // 定时发送请求
    sendRequest()
    intervalId = setInterval(sendRequest, 1000);
  };

  curr_socket.onmessage = function(event) {
    // console.log('Message from server:', event.data);
    const data = JSON.parse(event.data);
    
    // 根据返回的数据调整 offset
    if (data && data.length) {
      offset += data.length;
      log.value = log.value.concat(data)
      // console.log(log.value)
    }

    // 解锁以便发送下一次请求
    lock = false;
  };

  curr_socket.onerror = function(event) {
    console.error('WebSocket error observed:', event);
    // 发生错误时也需要解锁以避免锁死
    lock = false;
  };

  curr_socket.onclose = function(event) {
    // console.log('WebSocket connection closed.', event);
    // 连接关闭时清除定时器
    clearInterval(intervalId);
  };
}

</script>
<template>
  <div>
    <LogSelect @ready="payload => socket_get_data(payload)"></LogSelect>
    <LogViewer :log="log" :loading="loading"></LogViewer>
  </div>
</template>
<style lang="less" scoped>
</style>