<script setup>
import { ref } from 'vue';
import LogViewer from '../components/log-viewer.vue';
import LogSelect from '../components/log-select.vue'
const loading = ref(false)
const log = ref(
  Array(20).fill(
    "first line\nhello \x1b[1;31mred bold text\x1b[0m my world"
  )
)
let curr_socket = null
// setInterval(() => {
//   log.value.push(Date())
// }, 1000);
socket_get_data()
function socket_get_data() {
  let lock = false;
  let offset = 0;
  let len = 500;
  let intervalId;
  curr_socket = new WebSocket('ws://127.0.0.1:8000/websocket');

  const sendRequest = () => {
    if (lock) {
      // 如果锁定状态，则不发送请求
      return;
    }
    lock = true;
    let args = {
      chip: "1712",
      version: "b300",
      exectime: "2024-06-05 23:06:46",
      case: "tc_bsbc_mainflow_02",
      iter: 0,
      logger: "Executor",
      // level: "info",
      __offset: offset,
      __len: len,
    };
    console.log('Sending request with offset:', offset);
    curr_socket.send(JSON.stringify(args));
  };

  curr_socket.onopen = function(event) {
    console.log('WebSocket connection established.');
    // 定时发送请求
    intervalId = setInterval(sendRequest, 1000);
  };

  curr_socket.onmessage = function(event) {
    console.log('Message from server:', event.data);
    const data = JSON.parse(event.data);
    
    // 根据返回的数据调整 offset
    if (data && data.length) {
      offset += data.length;
      log.value = log.value.concat(data)
      console.log(log.value)
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
    console.log('WebSocket connection closed.', event);
    // 连接关闭时清除定时器
    clearInterval(intervalId);
  };
}

</script>
<template>
  <div>
    <LogSelect></LogSelect>
    <LogViewer :log="log" :loading="loading"></LogViewer>
  </div>
</template>