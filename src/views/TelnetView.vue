<template>
  <el-container style="width: 600px;">
    <el-header>
      <el-row :gutter="10">
        <el-col :span="6">
          <el-cascader v-model="selectedScript" placeholder="select script" :props="props" filterable clearable @change="scriptChange" />
        </el-col>
        <el-col :span="6">
          <el-input v-model="address" placeholder="Enter address"></el-input>
        </el-col>
        <el-col :span="6">
          <el-input v-model="port" placeholder="Enter port"></el-input>
        </el-col>
        <el-col :span="6">
          <el-button type="primary" @click="connect" :icon="Connection" >Connect</el-button>
        </el-col>
      </el-row>
    </el-header>
    <div>
      <div v-if="connected">
        <LogViewer :height="500" :log="log" :loading="false" />
        <div class="input" style="display: flex">
          <el-input v-model="input" @keyup.enter="sendMessage" placeholder="Enter command"></el-input>
          <el-cascader v-model="line_break_sel" :options="line_breaks_ops"/>
        </div>
        <el-button @click="telnetview_log(log)" >check log</el-button>
      </div>
      
      <script-editor ref="scriptEditorRef" @sendcmd="handleSendCmd($event)"></script-editor>
      <el-button @click="telnetview_log(selectedScript)" >check script</el-button>
    </div>
  </el-container>
</template>

<script setup>
import {Connection} from '@element-plus/icons-vue';
import { computed, ref } from 'vue'
import { ElMessage } from 'element-plus'
import 'element-plus/dist/index.css'
import LogViewer from '../components/log-viewer.vue';
import scriptEditor from '../components/script-editor.vue';
import axios from '../req'
const line_break_sel = ref("\r\n")
const scriptEditorRef = ref()
const line_breaks_ops = [
  { value: '\r\n',label: '\\r\\n' },
  { value: '\r',label: '\\r' },
  { value: '\n',label: '\\n' },
]
const scriptChange = (val) => {
  // 清空的时候 初始化
  if (val === undefined) {
    selectedScript.value = [{
      content: "",
      host: "",
      port: "",
      name: ""
    }]
  }
  // 改code
  scriptEditorRef.value.code = selectedScript.value[0].content
}

const selectedScript = ref([{
  content: "",
  host: "",
  port: "",
  name: ""
}])
const address = computed(() => selectedScript.value[0].host)
const port = computed(() => selectedScript.value[0].port)
const input = ref('')
const connected = ref(false)
const log = ref([])
let socket = null
const telnetview_log = (...content) => {
  console.log('telnetview', ...content)
  console.log('script', scriptEditorRef.value.code)
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

const props = {
  lazy: true,
  lazyLoad(node, resolve) {
    // 模拟异步加载数据
    const { level } = node
    const nodes = []
    axios.post('/script/all', {}, {
      headers: {
        'Content-Type': 'application/json'
      },
    }).then(resp => {
      console.log("here")
      nodes.push(
        ...resp.data.map((item, index) => {
          return { ...item, leaf: true }
        }),
      )
      resolve(nodes)
    }).catch(err => {
      mylog(err)
    })

    // 返回子节点数据
  }
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

<style>
.log-viewer {
  height: 500px
}
</style>