<!-- App.vue -->
<template>
  <div class="hex-editor">
    <el-upload
      class="upload-demo"
      drag
      action="#"
      :before-upload="handleBeforeUpload"
      :show-file-list="false"
    >
      <i class="el-icon-upload"></i>
      <div class="el-upload__text">Drag the file here, or <em>click to upload</em></div>
    </el-upload>

    <el-select v-model="bytesPerLine" placeholder="Bytes per line" style="margin-bottom: 20px;">
      <el-option label="8" :value="8"></el-option>
      <el-option label="16" :value="16"></el-option>
      <el-option label="32" :value="32"></el-option>
    </el-select>

    <div class="hex-editor-container">
      <div class="hex-grid" :style="gridStyle">
        <div
          v-for="(byte, index) in formattedHex"
          :key="index"
          :class="['hex-cell', { 'selected': isSelected(index) }]"
          @click="selectCell(index)"
        >
          <span class="hex-byte">{{ byte }}</span>
        </div>
      </div>
      <div class="preview" :style="gridStyle">
        <div v-for="(preview, index) in formattedPreview" :key="index" class="preview-char">{{ preview }}</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';

const fileContent = ref([]);
const bytesPerLine = ref(16);
const selectedCells = ref([]);

const handleBeforeUpload = (file) => {
  const reader = new FileReader();
  reader.onload = (e) => {
    const arrayBuffer = e.target.result;
    fileContent.value = new Uint8Array(arrayBuffer);
    console.log("loaded")
  };
  reader.readAsArrayBuffer(file);
  return false;
};

const formattedHex = computed(() => {
  console.log("compute")
  return Array.from(fileContent.value).map(byte => byte.toString(16).padStart(2, '0'));

});

const formattedPreview = computed(() => {
  const previewArray = Array.from(fileContent.value).map(byte => {
    const char = String.fromCharCode(byte);
    return /[ -~]/.test(char) ? char : '.';
  });
  return previewArray;
});

const gridStyle = computed(() => {
  return {
    'grid-template-columns': `repeat(${bytesPerLine.value}, 1fr)`
  };
});

const selectCell = (index) => {
  if (selectedCells.value.includes(index)) {
    selectedCells.value = selectedCells.value.filter(i => i !== index);
  } else {
    selectedCells.value.push(index);
  }
};

const isSelected = (index) => {
  return selectedCells.value.includes(index);
};
</script>

<style scoped>
.hex-editor {
  padding: 20px;
}
.upload-demo {
  margin-bottom: 20px;
}
.hex-editor-container {
  display: flex;
  align-items: flex-start;
}
.hex-grid {
  display: grid;
  gap: 0; /* 去掉空隙 */
  flex-grow: 0;
}
.hex-cell {
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid #ddd;
  cursor: pointer;
  text-align: center;
  position: relative;
  user-select: none; /* 禁止选中文本 */
  padding: 0; /* 去除padding */
  margin: 0; /* 去除margin */
  font-size: x-small;
}
.hex-byte {
  display: block;
}
.preview {
  display: grid;
  gap: 0; /* 去掉空隙 */
  flex-grow: 0;
  flex-shrink: 0;
  margin-left: 20px;
  font-family: monospace;
}
.preview-char {
  white-space: pre;
  height: 20px;
  border: 1px solid rgba(0,0,0, 0.1)
}
.hex-cell.selected {
  background-color: #409EFF;
  color: white;
}
</style>
