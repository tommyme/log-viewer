<template>
  <div style="height: 100%;">
    <div :class="top_class" style="height: 100%">
      <div class="conn-board" style="display: flex;flex-direction: column">
        <div style="margin: 0px 16px 16px 16px">
          <el-row :gutter="10">
            <el-col :span="6">
              <!-- 这里@clear用来触发computed -->
              <el-select v-model="selectedProfileName" clearable allow-create filterable 
                placeholder="select profile" @change="profileChange" @clear="() => selectedProfileItem"
              >
                <el-option v-for="item in profiles" :key="item.name" :label="item.name" :value="item.name" style="padding-right: 16px;">
                  <div style="display: flex; align-items: center; ">
                    <span style="flex-grow: 1; padding-right: 16px;">{{ item.name }}</span>
                    <delIcon @click="handle_del_profile($event, item)"/>
                  </div>
                </el-option>
              </el-select>
            </el-col>
            <el-col :span="4">
              <el-input v-model="address" placeholder="addr"></el-input>
            </el-col>
            <el-col :span="4">
              <el-input v-model="port" placeholder="port"></el-input>
            </el-col>
            <el-col :span="2">
              <el-button :type="connected?'danger':'primary'" 
                @click="toggle_conn" :icon="connected?Close:Connection"
                :disabled="disableConnBtn"
              ></el-button>
            </el-col>
            <el-col :span="5">
              <el-select 
                v-model="selectedScriptName" clearable allow-create filterable 
                placeholder="select script" @change="scriptChange" :disabled="!selectedProfileItemIsFromDB"
              >
                <el-option v-for="item in scripts" :key="item.sname" :label="item.sname" :value="item.sname"/>
              </el-select>
            </el-col>
            <el-col :span="3">
              <el-select v-model="conn_type" placeholder="type">
                <el-option v-for="tp in ['ssh', 'telnet']" :key="tp" :label="tp" :value="tp"/>
                <template #footer>
                  <el-button bg size="small" @click="dialogVisible = true">
                    credit
                  </el-button>
                </template>
              </el-select>
            </el-col>
          </el-row>
        </div>
        <LogViewer style="flex-grow: 1" :height="700" :log="logFromTelnet" :loading="false" :filter-val="filterWords"/>
        <div class="input" style="display: flex">
          <el-input v-model="commandToSend" @keyup.enter="sendMessage" placeholder="Enter command"></el-input>
          <el-input v-model="filterWords" placeholder="filter"></el-input>
          <el-cascader v-model="line_break_sel" :options="line_breaks_ops"/>
        </div>
      </div>
      
      <div class="script-board">
        <div class="fake"></div>
        <script-editor ref="scriptEditorRef" @sendcmd="handleSendCmd($event)" @save="save_all"></script-editor>
      </div>
    </div>
    <el-dialog
      v-model="dialogVisible"
      title="edit ssh credit"
      width="500"
    >
      <span>This is a dialog</span>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="dialogVisible = false">Cancel</el-button>
          <el-button type="primary" @click="dialogVisible = false">
            Confirm
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import {Close, Connection, Switch} from '@element-plus/icons-vue';
import { computed, ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import 'element-plus/dist/index.css'
import LogViewer from '../components/log-viewer.vue';
import scriptEditor from '../components/script-editor.vue';
import delIcon from "../components/del-icon.vue";
import axios from '../req'
const line_break_sel = ref("\r")
const scriptEditorRef = ref()
const currSshCredit = computed(() => {
  if (sshCredits.value.length > 0) {
    return sshCredits.value[0]
  }
  return undefined
})
const disableConnBtn = computed(() => {
  return conn_type.value === 'ssh' && currSshCredit.value === undefined
})
const dialogVisible = ref(false)
const sshCredits = ref([])
const line_breaks_ops = [
  { value: '\r\n',label: '\\r\\n' },
  { value: '\r',label: '\\r' },
  { value: '\n',label: '\\n' },
  { value: '',label: 'empty' },
]
const props = defineProps({
  direction: {
    type: Boolean,
    default: false
  }
})
const top_class = computed(() => {
  return props.direction ? 'boards-container-row': 'boards-container-col'
})
const filterWords = ref("")
onMounted(() => {
  loadProfiles()
})
const loadProfiles = () => {
  axios.post_json('/script/allProfiles', {}, (resp) => {profiles.value = resp.data})
}
const loadScripts = () => {
  return axios.post_json('/script/allScripts', {name: selectedProfileItem.value.name}, (resp) => {
    scripts.value = resp.data
    console.log("load scripts", scripts.value)
  })
}
const handle_del_profile = (event, item) => {
  event.stopPropagation();
  console.log("handle del", item)
}
const profileChange = (val) => {
  // 清空的时候 初始化
  if (val === undefined) {
    port.value = ''
    address.value = ''
    conn_type.value = ''
    scripts.value = []
    selectedScriptName.value = undefined
    sshCredits.value = []
    // todo: clear code
  } else {
    port.value = selectedProfileItem.value.port
    address.value = selectedProfileItem.value.host
    conn_type.value = selectedProfileItem.value.type
    if (selectedProfileItem.value.type === "telnet") {
      loadScripts().then(() => {
        if (scripts.value.length > 0) {
          let name = scripts.value[0].sname
          selectedScriptName.value = name
          scriptChange(name)  // 模拟触发一下change事件
        }
      })
    } else if (selectedProfileItem.value.type === "ssh") {
      loadSshCredits().then(() => {
        if (sshCredits.value.length === 0) {
          ElMessage.warning("ssh credit empty")
        } else {
          console.log(sshCredits.value[0])
          ElMessage.success("ssh credit loaded")
        }
      })
      loadScripts().then(() => {
        if (scripts.value.length > 0) {
          let name = scripts.value[0].sname
          selectedScriptName.value = name
          scriptChange(name)  // 模拟触发一下change事件
        }
      })
    }
  }
}

const loadSshCredits = () => {
  return axios.post_json('/ssh/credits', {name: selectedProfileItem.value.name}, (resp) => {
    sshCredits.value = resp.data
    console.log("load ssh credits", sshCredits.value)
  })
}
const scriptChange = (val) => {
  if (val === undefined) {
    scriptEditorRef.value.code = ""
  } else {
    scriptEditorRef.value.code = selectedScriptItem.value.content
  }
}
const profiles = ref([])
const scripts = ref([])

const selectedProfileName = ref(undefined)  // 默认值
const selectedProfileItem = computed(() => {
  if (selectedProfileName.value === undefined) {
    selectedProfileItemIsFromDB.value = false
    return {
      id: undefined,
      name: undefined,
      host: "",
      port: "",
      type: "",
    }
  } else {
    let found = profiles.value.find(item => item.name == selectedProfileName.value)
    if (found) {
      selectedProfileItemIsFromDB.value = true
      return found
    } else {
      selectedProfileItemIsFromDB.value = false
      return {
        id: -1,
        name: selectedProfileName.value,
        host: "",
        port: "",
        type: "",
      }
    }
  }
})
const selectedProfileItemIsFromDB = ref(false)
const selectedScriptItemIsFromDB = ref(false)

const selectedScriptName = ref(undefined)
const selectedScriptItem = computed(() => {
  if (selectedScriptName.value === undefined) {   // 清空之后
    selectedScriptItemIsFromDB.value = false
    return {
      sid: undefined,
      sname: undefined,
      content: "",
      profile: selectedProfileItem.value.id,
    }
  } else {
    let found = scripts.value.find(item => item.sname == selectedScriptName.value)
    if (found) {    // 从选择框里面选
      selectedScriptItemIsFromDB.value = true
      return found
    } else {        // 自定义添加的
      selectedScriptItemIsFromDB.value = false
      return {
        sid: -1,
        sname: selectedScriptName.value,
        content: "# new script",
        profile: selectedProfileItem.value.id,
      }
    }
  }
})

const address = ref("")
const port = ref("")
const commandToSend = ref('')
const connected = ref(false)
const logFromTelnet = ref([])
let socket = null
const telnetview_log = (...content) => {
  console.log('telnetview', ...content)
}
const save_profile = () => {
  let payload = {
    ...selectedProfileItem.value,
    port: port.value,
    host: address.value,
    type: conn_type.value,
  }
  axios.post_json('/profile/update', payload, (resp) => {
    loadProfiles()
    ElMessage.success('profile saved')
  })
}
const save_script = () => {
  let payload = {
    ...selectedScriptItem.value,
    ...{
      content: scriptEditorRef.value.code,
      profile: selectedProfileItem.value.id,
    }
  }
  console.log("save", payload)

  axios.post_json('/script/update', payload, (resp) => {
    loadScripts()
    ElMessage.success('script saved')
  })
}
const save_all = () => {
  if (selectedProfileItem.value.id !== undefined) {
    save_profile()
  }
  if (selectedScriptItem.value.sid !== undefined) {
    save_script()
  }
}
const conn_type = ref("telnet")
const toggle_conn = () => {
  if (connected.value) {
    socket.close()
    connected.value = false
  } else if (conn_type.value === "telnet") {
    connect_to_socket()
  } else if (conn_type.value === "ssh") {
    connect_to_ssh()
  }
}
const connect_to_socket = () => {
  if (!address.value || !port.value) {
    ElMessage.error('Please enter both address and port.')
    return
  }
  logFromTelnet.value = []
  if (socket) {
    socket.close()
  }
  socket = new WebSocket(`ws://localhost:8000/telnet`)
  socket.onopen = () => {
    console.log("on open")
    connected.value = true
    socket.send(JSON.stringify({ address: address.value, port: port.value % 65536 }))
  }
  socket.onmessage = (event) => {
    console.log("recv", event, event.data)
    if (logFromTelnet.value.length > 1000) {
      logFromTelnet.value.shift()
    }
    logFromTelnet.value.push(event.data)
  }
  socket.onclose = () => {
    connected.value = false
    ElMessage.info('Connection closed')
  }
  socket.onerror = (error) => {
    ElMessage.error(`WebSocket error: ${error.message}`)
  }
}

const connect_to_ssh = () => {
  logFromTelnet.value = []
  if (socket) {
    socket.close()
  }
  socket = new WebSocket(`ws://localhost:8000/ssh`)
  socket.onopen = () => {
    console.log("on open")
    connected.value = true
    socket.send(JSON.stringify({
      host: selectedProfileItem.value.host,
      port: selectedProfileItem.value.port,
      name: currSshCredit.value.name,
      passwd: currSshCredit.value.passwd
    }))
  }
  socket.onmessage = (event) => {
    console.log("recv", event, event.data)
    if (logFromTelnet.value.length > 1000) {
      logFromTelnet.value.shift()
    }
    logFromTelnet.value.push(event.data)
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
  socket.send(JSON.stringify({ command: commandToSend.value + line_break_sel.value }))
  commandToSend.value = ''
}

const handleSendCmd = (data) => {
  socket.send(JSON.stringify({ command: data + line_break_sel.value }))
}
</script>

<style scoped lang="scss">
.input {
  width: 98%;
  margin: 10px auto;
}

.boards-container-row {
  display: flex;
  justify-content: space-between;
  .script-board {
    .fake {
      height: 48px;
      flex-shrink: 0;
    }
  }
  .script-board, .conn-board {
    max-width: 48%;
    flex-basis: 48%;
  }
}
.boards-container-col {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  .script-board {
    max-height: 40%;
    flex-basis: 40%;
  }
  .conn-board {
    max-height: 58%;
    flex-basis: 58%;
  }
}
.script-board {
  display: flex;
  flex-direction: column;
}

</style>

<style>
.log-viewer {
  box-sizing: border-box;
  height: 100%
}
</style>