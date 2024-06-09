<template>
  <el-cascader
    v-model="selectedOptions"
    placeholder="select case iteration"
    :props="props"
    @change="handleChange"
    @expand-change="handleExpandChange"
    @focus="handleFocus"
    style="width: 450px;">
  </el-cascader>
  <el-cascader
    v-model="selectedLogger"
    placeholder="select logger"
    :props="loggerProps"
    :disabled="selectedOptions.length == 0">
  </el-cascader>
  <el-button @click="clickbtn" :disabled="!socketEnable">query</el-button>
  <el-radio-group v-model="logLevelRadio" size="small">
    <el-radio-button v-for="opt in logLevelRadioOpts" :key="opt" :label="opt" :value="opt" />
  </el-radio-group>
</template>

<script setup>
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

const socket_payload = computed(() => {
  if (selectedLogger.value.length == 2) {
    const b = selectedLogger.value[1] === "ALL" ? {} : selectedLogger.value[1]
    const c = logLevelRadio.value === "ALL" ? {} : {level: logLevelRadio.value}
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
    const path_values = node.pathValues.reduce((acc, obj) => {
      return { ...acc, ...obj };
    }, {});
    const { level } = node
    const nodes = []
    axios.post('/sel', path_values, {
      headers: {
      'Content-Type': 'application/json'
      }, 
    }).then(resp => {
      nodes.push(
        ...resp.data.map((item, index) => {
          return {...item, leaf: level == 4}
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
    const path_values = selectedOptions.value.reduce((acc, obj) => {
      return { ...acc, ...obj };
    }, {});

    const { level } = node
    if (level == 0) {
      resolve([{value: "logger", label: "logger"}])
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
            return {...item, leaf: true}
          }),
        )
        nodes.push(
          {value: "ALL", label: "ALL", leaf: true}
        )
        mylog("nodes", nodes)
        resolve(nodes)
      }).catch(err => {
        mylog(err)
      })
    }
  }
}
const clickbtn = () => {
  mylog("selected",selectedOptions.value)
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

<style>
/* 你可以根据需要添加样式 */
</style>
