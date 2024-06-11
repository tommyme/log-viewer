<template>
  <prism-editor
    class="my-editor"
    v-model="code"
    :highlight="highlighter"
    line-numbers
  ></prism-editor>
  <el-button @click="sendCurrLine">curr</el-button>
  <el-button @click="sendCurrLineMove">next</el-button>
</template>

<script setup>
import { ref } from "vue";
import { PrismEditor } from "vue-prism-editor";
// import { expose } from 'vue';
import "vue-prism-editor/dist/prismeditor.min.css"; // import the styles somewhere
const mylog = (...content) => {
  console.log("editor", ...content);
};
const emit = defineEmits(["sendcmd"]);
// import highlighting library (you can use any library you want just return html string)
import { highlight, languages } from "prismjs/components/prism-core";
// import "prismjs/components/prism-clike";
// import "prismjs/components/prism-javascript";
import "prismjs/components/prism-bash";
import "prismjs/themes/prism-tomorrow.css"; // import syntax highlighting styles
const highlighter = (code) => highlight(code, languages.bash); //returns html

const code = ref("")
defineExpose({
  code
})
// const currLine = editor_textarea.selectionStart
function getLineNumber() {
  const editor_textarea = document.querySelector(".prism-editor__textarea");
  if (editor_textarea) {
    return (
      editor_textarea.value
        .substr(0, editor_textarea.selectionStart)
        .split("\n").length - 1
    );
  } else {
    return null;
  }
}
function selectNextLineEnd() {
  const editor_textarea = document.querySelector(".prism-editor__textarea");
  if (editor_textarea) {
    const currentLine = getLineNumber();
    const allLines = editor_textarea.value.split("\n");

    // 如果当前行是最后一行，则不进行选择
    if (currentLine === allLines.length) {
      return;
    }

    // 获取下一行的末尾位置
    let nextLineEndPos = 0;
    for (let i = 0; i <= currentLine; i++) {
      nextLineEndPos += allLines[i].length + 1; // 加 1 是因为换行符的长度
    }

    // 设置光标位置并选中文本
    editor_textarea.selectionStart = nextLineEndPos;
    editor_textarea.selectionEnd = nextLineEndPos;
    console.log(editor_textarea.selectionStart, editor_textarea.selectionEnd);
    editor_textarea.focus();
  } else {
    return null;
  }
}
function getCursorLineContent() {
  const editor_textarea = document.querySelector(".prism-editor__textarea");
  if (editor_textarea) {
    const currentLine = getLineNumber(editor_textarea);
    const allLines = editor_textarea.value.split("\n");

    if (currentLine >= 0 && currentLine <= allLines.length) {
      return allLines[currentLine];
    } else {
      return null;
    }
  } else {
    return null;
  }
}
function sendCurrLine() {
  const line = getCursorLineContent();
  console.log(line);
  emit("sendcmd", line);
}
function sendCurrLineMove() {
  sendCurrLine();
  selectNextLineEnd();
}
</script>

<style lang="less">
.my-editor {
  background: #2d3436;
  color: #ccc;

  font-family:
    Fira code,
    Fira Mono,
    Consolas,
    Menlo,
    Courier,
    monospace;
  font-size: 14px;
  line-height: 1.5;
  padding: 5px;
  height: 400px;
  width: 98%;
  margin: 10px auto;
  border-radius: 14px;
  border: 4px solid #fff;
  box-shadow: #999999 0 0 8px;
}

.prism-editor__textarea:focus {
  outline: none;
}
</style>
