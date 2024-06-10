<template>
  <div class="container">
    <div class="col">
      <div class="cas_selecter">
        <el-cascader v-model="selectedOptions" placeholder="select case iteration" :props="props" @change="handleChange"
          @expand-change="handleExpandChange" @focus="handleFocus" style="width: 450px;" filterable>
          <template #default="{ node, data }" style="position: relative;">
            <span>{{ data.label }}</span>
            <span v-if="!node.isLeaf"> ({{ node.children.length }}) </span>
            <el-button @click="handleDelete($event, node)" type="danger" circle
              style="width: 10px; height: 10px; position: absolute; right: 12px; top: 8px">x</el-button>
          </template>
        </el-cascader>
      </div>
      <div class="cas_selecter">
        <el-cascader v-model="selectedLogger" placeholder="select logger" :props="loggerProps"
          :disabled="selectedOptions.length == 0" filterable>
          <template #default="{ node, data }">
            <span>{{ data.label }}</span>
            <!-- <el-button @click="mylog(node)">x</el-button> -->
            <span v-if="!node.isLeaf"> ({{ node.children.length }}) </span>
          </template>
        </el-cascader>
      </div>
      <div class="query_btn">
        <el-button @click="clickbtn" :disabled="!socketEnable" type="primary" :icon="Search">query</el-button>
      </div>
    </div>

    <div class="col">
      <div class="radio_btn">
        <el-radio-group v-model="logLevelRadio" text-color="#fff" >
          <el-radio-button v-for="opt in logLevelRadioOpts"  :class="opt" :key="opt" :label="opt" :value="opt" />
        </el-radio-group>
      </div>
    </div>
  </div>
</template>

<script setup>
import { Search } from '@element-plus/icons-vue';
import { computed, ref } from 'vue'
import { ElCascader } from 'element-plus'
import axios from '../req'
const emit = defineEmits(['ready'])
const mylog = (...content) => {
  console.log("log-sel", ...content)
}
const selectedOptions = ref([])
const selectedLogger = ref([])
const logLevelRadio = ref("ALL")
const logLevelRadioOpts = ["ALL", "INFO", "DEBUG", "WARNING", "ERROR"]
const socketEnable = computed(() => {
  return selectedOptions.value.length > 0 && selectedLogger.value.length > 0
})
const handleDelete = (event, node) => {
  event.stopPropagation();
  mylog(concat_objs(node.pathValues))
}
const socket_payload = computed(() => {
  if (selectedLogger.value.length == 2) {
    const b = selectedLogger.value[1] === "ALL" ? {} : selectedLogger.value[1]
    const c = logLevelRadio.value === "ALL" ? {} : { level: logLevelRadio.value }
    const d = [...selectedOptions.value, b, c].reduce((acc, obj) => {
      return { ...acc, ...obj };
    }, {});
    return d
  }
})
const props = {
  lazy: true,
  lazyLoad(node, resolve) {
    // 模拟异步加载数据
    const path_values = concat_objs(node.pathValues)
    const { level } = node
    const nodes = []
    axios.post('/sel', path_values, {
      headers: {
        'Content-Type': 'application/json'
      },
    }).then(resp => {
      nodes.push(
        ...resp.data.map((item, index) => {
          return { ...item, leaf: level == 4 }
        }),
      )
      resolve(nodes)
    }).catch(err => {
      mylog(err)
    })

    // 返回子节点数据
  }
}

const loggerProps = {
  lazy: true,
  lazyLoad(node, resolve) {
    // 模拟异步加载数据
    const path_values = concat_objs(selectedOptions.value)

    const { level } = node
    if (level == 0) {
      resolve([{ value: "logger", label: "logger" }])
      return
    } else {
      const nodes = []
      axios.post('/sel', path_values, {
        headers: {
          'Content-Type': 'application/json'
        },
      }).then(resp => {
        nodes.push(
          ...resp.data.map((item, index) => {
            return { ...item, leaf: true }
          }),
        )
        nodes.push(
          { value: "ALL", label: "ALL", leaf: true }
        )
        mylog("nodes", nodes)
        resolve(nodes)
      }).catch(err => {
        mylog(err)
      })
    }
  }
}

const concat_objs = (objs) => {
  return objs.reduce((acc, obj) => {
    return { ...acc, ...obj };
  }, {});
}
const clickbtn = () => {
  mylog("selected", selectedOptions.value)
  mylog("selected logger", selectedLogger.value)
  mylog("selected log level", logLevelRadio.value)
  mylog("payload", socket_payload)
  emit('ready', socket_payload.value)
}
const handleChange = (value) => {
  mylog('Selected options:', value)
}

const handleExpandChange = (value) => {
  mylog('Expanded options:', value)
}

const handleFocus = () => {
  mylog("handle focus")
}

</script>

<style lang="less" scoped>
.container {
  margin: 15px 0;
}

.col {
  display: flex;
  margin: 10px 0;

  .cas_selecter {
    margin: 0 20px;
  }

  .query_btn {
    margin: 0 20px;
  }

  .radio_btn {
    margin: 0 20px;
  }
}
.ALL{
  :deep(.el-radio-button__original-radio:checked+.el-radio-button__inner){
    background-color: blue;
    border-color:blue;
    box-shadow: -1px 0 0 0 blue;
  }
}
.INFO{
  :deep(.el-radio-button__original-radio:checked+.el-radio-button__inner){
    background-color: green;
    border-color:green;
    box-shadow: -1px 0 0 0 green;
  }
}
.DEBUG{
  :deep(.el-radio-button__original-radio:checked+.el-radio-button__inner){
    background-color: gray;
    border-color:gray;
    box-shadow: -1px 0 0 0 gray;
  }
}
.WARNING{
  :deep(.el-radio-button__original-radio:checked+.el-radio-button__inner){
    background-color: orange;
    border-color:orange;
    box-shadow: -1px 0 0 0 orange;
  }
}
.ERROR{
  :deep(.el-radio-button__original-radio:checked+.el-radio-button__inner){
    background-color: red;
    border-color:red;
    box-shadow: -1px 0 0 0 red;
  }
}

/* 你可以根据需要添加样式 */
</style>
