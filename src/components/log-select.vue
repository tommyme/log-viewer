<template>
  <el-cascader
    v-model="selectedOptions"
    :options="options"
    :props="props"
    @change="handleChange"
    @expand-change="handleExpandChange"
    @focus="handleFocus">
  </el-cascader>
</template>

<script setup>
import { ref } from 'vue'
import { ElCascader } from 'element-plus'
import axios from '../req'

const selectedOptions = ref([])
const options = ref([
  // {
  //   value: 'option1',
  //   label: 'Option 1',
  //   children: [],
  // },
  // {
  //   value: 'option2',
  //   label: 'Option 2',
  //   children: [],
  // },
])

const mylog = (...content) => {
  console.log("log-sel", ...content)
}
const props = {
  lazy: true,
  lazyLoad(node, resolve) {
    mylog(node)
    // 模拟异步加载数据
    setTimeout(() => {
      const { level } = node
      const nodes = []

      if (level === 0) {
        nodes.push(
          { value: 'sub1', label: 'Sub Option 1' },
          { value: 'sub2', label: 'Sub Option 2' }
        )
      } else if (level === 1) {
        nodes.push(
          { value: 'sub1-1', label: 'Sub Option 1-1' },
          { value: 'sub1-2', label: 'Sub Option 1-2' }
        )
      }

      // 返回子节点数据
      resolve(nodes)
    }, 1000)
  }
}

const handleChange = (value) => {
  mylog('Selected options:', value)
}

const handleExpandChange = (value) => {
  mylog('Expanded options:', value)
}

const handleFocus = () => {
  mylog("handle focus")
  axios.post('/sel', {}, {
    headers: {
    'Content-Type': 'application/json'
  }
  }).then(resp => {
    data = resp.data
    for (key in data) {
      vals = data[key]
      vals.forEach(val => {
        options.value.push({
          value: val,
          label: val,
          children: []
        })
      });
    }
    mylog(resp.data)
  }).catch(err => {
    mylog(err)
  })

}
</script>

<style>
/* 你可以根据需要添加样式 */
</style>
