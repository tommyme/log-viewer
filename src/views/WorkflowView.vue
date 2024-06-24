<template>
  <el-row>
    <el-col :span="4">
      <el-menu :default-active="'0'" 
        class="el-menu-vertical-demo" style="height: 100vh;display: flex;flex-direction: column;"
        @select="handleProfileSelect"
      >
        <el-input v-model="profileFilter" style="width: 240px" placeholder="filter" />
        <el-menu-item v-for="(profile, index) in filteredProfiles" :key="index" :index="String(index)">
          <div>
            {{ profile.name }}
          </div>
          <delIcon></delIcon>
        </el-menu-item>
        <el-menu-item v-if="creating_profile">
          <el-input v-model="new_profile_name" @keyup.enter="create_profile"></el-input>
        </el-menu-item>
        <el-button type="primary" @click="creating_profile = !creating_profile" class="add-button">{{creating_profile ? "cancel": "new"}}</el-button>
      </el-menu>
    </el-col>
    <el-col :span="6" class="steps-region">
      <el-steps class="steps" :active="currStepIdx" finish-status="success" align-center direction="vertical">
        <el-step v-for="item, idx in workflow_steps" :status="workflow_steps[idx].status">
          <template #title>
            {{ item.name }}
          </template>
          <template #description>
            <el-button-group class="step-btn-group">
              <el-button plain class="btn-slim" type="primary" :icon="ArrowLeft" @click="addStep(idx)"></el-button>
              <el-button plain class="btn-pad" type="primary" :icon="Edit" @click="stepToggleDialog(idx)"></el-button>
              <el-button plain class="btn-pad" type="primary" :icon="CaretRight" @click="run_step(idx)"></el-button>
              <el-button plain class="btn-pad" type="primary" :icon="Delete" :disabled="workflow_steps.length === 1" @click="delStep(idx)"></el-button>
              <el-button plain class="btn-slim" type="primary" :icon="ArrowRight" @click="addStep(idx+1)"></el-button>
            </el-button-group>
          </template>
        </el-step>
      </el-steps>
      <div style="padding: 12px;">
        <el-button @click="next_step" :disabled="control.next_step_dis" >Next step</el-button>
        <el-button @click="dialogVisible = true">show dialog</el-button>
        <el-button @click="save_workflow_steps">save</el-button>
        <el-button @click="reset_status">reset</el-button>
        <span>{{ currStepIdx }}</span>
      </div>
    </el-col>
    <el-col :span="14" style="height: 100vh;">
      <el-row style="height: 50vh; max-height: 50vh;max-width: 100%">
        <LogViewer :log="logs" :loading="false" style="flex-grow: 1;"/>
      </el-row>
      <el-row></el-row>
    </el-col>
  </el-row>
  <el-dialog v-model="dialogVisible" title="create new step">
    <el-form>
      <el-form-item label="name">
        <el-input v-model="workflow_steps[currStepIdx].name"></el-input>
      </el-form-item>
      <el-form-item label="type">
        <el-select v-model="workflow_steps[currStepIdx].type">
          <el-option v-for="opt in type_opts" :key="opt.value" :label="opt.label" :value="opt.value"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="conn profile" v-if="show_ssh_profile">
        <el-select v-model="workflow_steps[currStepIdx].ssh">
          <el-option v-for="item in sshProfiles" :key="item.name" :label="item.name" :value="item.id"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="src" v-if="show_ssh_profile">
        <el-input v-model="workflow_steps[currStepIdx].src"></el-input>
      </el-form-item>
      <el-form-item label="dst" v-if="show_ssh_profile">
        <el-input v-model="workflow_steps[currStepIdx].dst"></el-input>
      </el-form-item>
      <el-form-item label="input" v-show="show_script_board">
        <scriptEditor v-model="workflow_steps[currStepIdx].cmd" @save="saveScript"></scriptEditor>
      </el-form-item>
    </el-form>
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="dialogVisible = false">Cancel</el-button>
        <el-button type="primary" @click="dialogVisible = false">
          Confirm
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup>
import { computed, ref, onMounted } from 'vue'
import scriptEditor from '../components/script-editor.vue';
import { Edit, ArrowLeft, ArrowRight, Delete, CaretRight } from '@element-plus/icons-vue';
import axios from '../req';
import { ElMessage } from 'element-plus';
import delIcon from '../components/del-icon.vue';
import logViewer from '../components/log-viewer.vue';
const logs = ref([])
//#region profile
const PROFILES = ref([
  // {name: 'example', id: 1, workflow: [{name: "exec script"}]},
  // {name: 'example 2', id: 2, workflow: []},
])
window.PROFILES = PROFILES
const creating_profile = ref(false)
const new_profile_name = ref("")
const create_profile = () => {
  if (new_profile_name.value === "") {
    ElMessage.error("name can't be empty")
    return
  }
  let payload = {name: new_profile_name.value, workflow: JSON.stringify([{name: "example step"}]), id: null}
  axios.post_json('/workflow/save', payload, (resp) => {}).then(() => {
    ElMessage.success("create done")
    loadWorkflows()
    new_profile_name.value = ""
    creating_profile.value = false
  })
}

const profileFilter = ref("")
const filteredProfiles = computed(() => {
  return PROFILES.value.filter(i => i.name.includes(profileFilter.value))
})
const currProfile = ref(undefined)
window.currProfile = currProfile
const handleProfileSelect = (index) => {
  let idx = Number(index)
  currProfile.value = PROFILES.value[idx]
  workflow_steps.value = currProfile.value.workflow
}
//#endregion

const sshProfiles = ref([])
const loadSshProfiles = () => {
  axios.post_json('/script/allProfiles', {}, (resp) => {sshProfiles.value = resp.data})
}
onMounted(() => {
  loadSshProfiles()
  loadWorkflows()
})
const step_status = {
  empty: '',
  wait: 'wait',
  process: 'process',
  finish: 'finish',
  error: 'error',
  succ: 'success'
}

//#region workflow
const loadWorkflows = () => {
  axios.post_json('/workflow/all', {}, (resp) => {
    PROFILES.value = resp.data
    handleProfileSelect(0)
  })
}
const stepToggleDialog = (idx) => {
  currStepIdx.value = idx
  dialogVisible.value = true
}
const run_step = (idx) => {
  workflow_steps.value[idx].status = step_status.wait
  return axios.post_json('/workflow/run', workflow_steps.value[idx], (resp) => {
    workflow_steps.value[idx].status = resp.data.status
    logs.value = [resp.data.res]
  })
}

const workflow_steps = ref([])
window.workflow_steps = workflow_steps
const currStepIdx = ref(0)
window.currStepIdx = currStepIdx
const currStep = computed(() => workflow_steps.value[currStepIdx.value])
const addStep = (idx) => { workflow_steps.value.splice(idx, 0, { name: `new step name ${idx}` }) }
const delStep = (idx) => { workflow_steps.value.splice(idx, 1) }
const show_ssh_profile  = computed(() => currStep.value.type != 'local exec')
const show_script_board = computed(() => ['local exec', 'ssh exec'].includes(currStep.value.type))
const type_opts = [
  { value: "local exec",  label: "local exec" },
  { value: "ssh exec",  label: "ssh exec" },
  { value: "sftp upload",  label: "sftp upload" },
  { value: "sftp download", label: "sftp download" },
]
const save_workflow_steps = () => {
  let processedSteps = workflow_steps.value.map(item => {
    // 不保存status 使用对象展开运算符复制对象，避免直接修改原始数据
    let { status, ...rest } = item;
    return rest;
  });

  let payload = {
    id: currProfile.value.id,
    name: currProfile.value.name,
    workflow: JSON.stringify(processedSteps)
  }
  axios.post_json('/workflow/save', payload, (resp) => {
    ElMessage.success("save done")
  })
}
const reset_status = () => {
  workflow_steps.value.forEach((step) => step.status = step_status.empty)
  currStepIdx.value = 0
}

const saveScript = () => {
  console.log("save")
}
const dialogVisible = ref(false)
const control = ref({
  next_step_dis: false,
})
const next_step = () => {
  control.value.next_step_dis = true
  run_step(currStepIdx.value).then(() => {
    currStepIdx.value += 1
    if (currStepIdx.value >= workflow_steps.value.length) {
      currStepIdx.value = 0
    }
    control.value.next_step_dis = false
  })
}
//#endregion


</script>

<style lang="scss" scoped>
.step-btn-group > .el-button.btn-slim {
  padding: 0 4px;
}
.step-btn-group > .el-button.btn-pad {
  padding: 0 16px
}
.el-menu-item {
  justify-content: space-between
}
.steps {
  max-height: calc(100vh - 56px);
  overflow: auto;
  padding: 20px;
  .el-step {
    // min-width: 250px;
    min-height: 100px;
  }
}
.steps-region {
  max-height: 100vh;
}
</style>