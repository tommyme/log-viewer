<template>
  <el-container>
    <el-header>
      <el-row :gutter="20">
        <el-col :span="8">
          <el-input v-model="address" placeholder="Enter address"></el-input>
        </el-col>
        <el-col :span="8">
          <el-input v-model="port" placeholder="Enter port"></el-input>
        </el-col>
        <el-col :span="8">
          <el-button type="primary" @click="connect" :icon="Connection" >Connect</el-button>
        </el-col>
      </el-row>
    </el-header>
    <div>
      <div v-if="connected">
        <LogViewer :height="500" :log="log" :loading="false" />
        <div class="input">
          <el-input
          v-model="input"
          @keyup.enter="sendMessage"
          placeholder="Enter command"
        ></el-input>
        </div>
        <el-button @click="telnetview_log(log)" >check log</el-button>
        <script-editor @sendcmd="handleSendCmd($event)"></script-editor>
      </div>

    </div>
  </el-container>
</template>

<script setup>
import {Connection} from '@element-plus/icons-vue';
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import 'element-plus/dist/index.css'
import LogViewer from '../components/log-viewer.vue';
import scriptEditor from '../components/script-editor.vue';


const code = ref("console.log('hello world')")
const address = ref('127.0.0.1')
const port = ref('6023')
const input = ref('')
const connected = ref(false)
const log = ref([])
let socket = null
const telnetview_log = (...content) => {
  console.log('telnetview', ...content)
}
const connect = () => {
  if (!address.value || !port.value) {
    ElMessage.error('Please enter both address and port.')
    return
  }
  log.value = []
  if (socket) {
    socket.close()
  }
  socket = new WebSocket(`ws://localhost:8000/telnet`)
  socket.onopen = () => {
    console.log("on open")
    connected.value = true
    socket.send(JSON.stringify({ address: address.value, port: port.value }))
  }
  socket.onmessage = (event) => {
    console.log("recv", event, event.data)
    if (log.value.length > 1000) {
      log.value.shift()
    }
    log.value.push(event.data)
  }
  socket.onclose = () => {
    connected.value = false
    ElMessage.info('Connection closed')
  }
  socket.onerror = (error) => {
    ElMessage.error(`WebSocket error: ${error.message}`)
  }
}

const sendMessage = () => {
  socket.send(JSON.stringify({ command: input.value + "\r\n" }))
  input.value = ''
}

const handleSendCmd = (data) => {
  socket.send(JSON.stringify({ command: data + "\r\n" }))
}
</script>

<style scoped>
.el-container {
  height: 100vh;
}

.messages {
  height: 400px;
  overflow-y: auto;
  margin-bottom: 10px;
}

.message {
  padding: 5px;
  border-bottom: 1px solid #eee;
}

.input {
  width: 98%;
  margin: 10px auto;
}


</style>