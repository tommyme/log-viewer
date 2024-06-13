<script lang="ts" setup>
import { Tree } from 'element-plus/es/components/tree-v2/src/types';
import { ref, onMounted, toValue, toRaw } from 'vue'
function parseModuleData(inputStr) {
  const moduleData = {};
  const modulePattern = /<Module (.*?)>/;
  const functionPattern = /<Function (.*?)>/;

  const lines = inputStr.trim().split('\n');
  let currentModule = null;
  for (const line of lines) {
    try {
      if (line.includes('<Module ')) {
        const match = modulePattern.exec(line);
        currentModule = match[1];
        moduleData[currentModule] = {
          value: currentModule,
          label: currentModule,
          children: [],
        };
      } else if (line.includes('<Function ')) {
        const match = functionPattern.exec(line);
        const functionName = match[1];
        const functionValue = `${currentModule}::${functionName}`;
        moduleData[currentModule].children.push({
          value: functionValue,
          label: functionName,
        });
      }
    } catch(error) {
      console.error(error)
    }
  }
  return Object.values(moduleData);
}

// JSON.stringify(moduleData, null, 2)
const valuex = ref()
const textarea = ref("")
const tree_data = ref()
const dialog_show = ref(false)
const store_key = "pytestTree"
const generated_cmd = ref("")
const tree_selected_value = ref([])
const mytree = ref()
onMounted(() => {
  let store_obj
  let store = localStorage.getItem(store_key)

  try {
    store_obj = JSON.parse(store)
  } catch(error) {
    return
  }
  if (Object.keys(store_obj).length) {
    // 有东西
    tree_data.value = store_obj``
    // 弹框提示
  } else {
    return
  }
})

const gen_tree = () => {
  // console.log(value.value)
  if (textarea.value.length === 0) {
    return
  }
  let res = parseModuleData(textarea.value);
  let res_string = JSON.stringify(res, null);
  localStorage.setItem(store_key, res_string);
  tree_data.value = res
}
const gen_cmd = () => {
  let res = tree_selected_value.value.join(" ")
  res = "pytest " + res + " --html=index.html"
  generated_cmd.value = res
  dialog_show.value = true
}
const defaultProps = {
  children: 'children',
  label: 'label',
}
const handleNodeClick = (data: Tree) => {
  console.log(data)
}
const handleCheckChange = (
  data: Tree,
  checked: boolean,
  indeterminate: boolean
) => {
  console.log(data, checked, indeterminate)
  let result = []
  let x = mytree.value.getCheckedNodes(true)
  for(let item of x) {
    result.push(item.value)
  }
  console.log(result)
  tree_selected_value.value = result
}
const copy_text = (text) => {
  navigator.clipboard.writeText(text)
    .then(() => {
      console.log('文本已复制到剪贴板');
    })
    .catch((error) => {
      console.error('无法复制文本:', error);
    });
}
</script>

``
<template>
  <el-input
    v-model="textarea"
    style="width: 800px"
    :rows="2"
    type="textarea"
    placeholder="please input pytest discovery"
  />
  <el-tree
    ref="mytree"
    :data="tree_data"
    :props="defaultProps"
    @node-click="handleNodeClick"
    show-checkbox
    @check-change="handleCheckChange"
  />


  
  <el-button @click="gen_tree">generate tree</el-button>
  <el-button @click="gen_cmd">generate command</el-button>

  <el-dialog
    v-model="dialog_show"
    title="Warning"
    width="500"
    align-center
  >
    <span>{{ generated_cmd }}</span>
    <template #footer>
      <div class="dialog-footer">
        <el-button type="primary" @click="copy_text(generated_cmd);dialog_show = false">copy</el-button>
      </div>
    </template>
  </el-dialog>
</template>