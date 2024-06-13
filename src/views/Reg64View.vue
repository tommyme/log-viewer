<template>
  <div>
    <el-radio-group v-model="inputMode" @change="handleModeChange">
      <el-radio-button label="hex">16进制</el-radio-button>
      <el-radio-button label="dec">十进制</el-radio-button>
    </el-radio-group>
    <el-input v-model="inputValue" @input="handleInput" placeholder="请输入一个数字"></el-input>
    <div class="bits-container">
      <div class="bits-row" v-for="row in 2" :key="row">
        <div class="bit-item" v-for="index in 32" :key="(row-1)*32 + index - 1">
          <div class="bit-index">{{ (3-row)*32 - index }}</div>
          <span
            @click="toggleBit((row-1)*32 + index - 1)"
            :class="{'bit-on': bits[(row-1)*32 + index - 1] === 1, 'bit-off': bits[(row-1)*32 + index - 1] === 0}"
          >
            {{ bits[(row-1)*32 + index - 1] }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue';
import { ElInput, ElRadioGroup, ElRadioButton } from 'element-plus';

// 引入Element Plus组件
const inputMode = ref('hex');
const inputValue = ref('');
const bits = ref(Array(64).fill(0));

// 监听输入框的变化
const handleInput = () => {
  let num;
  try {
    if (inputMode.value === 'hex') {
      if (!inputValue.value.startsWith('0x')) {
        inputValue.value = '0x' + inputValue.value;
      }
      num = BigInt(inputValue.value);
    } else {
      num = BigInt(inputValue.value);
    }
    bits.value = num.toString(2).padStart(64, '0').split('').map(Number);
  } catch (e) {
    // 输入无效时，将bits重置为全0
    bits.value = Array(64).fill(0);
  }
};

// 切换bit位的值
const toggleBit = (index) => {
  bits.value[index] = bits.value[index] === 1 ? 0 : 1;
  const newNum = BigInt('0b' + bits.value.join(''));
  if (inputMode.value === 'hex') {
    inputValue.value = '0x' + newNum.toString(16);
  } else {
    inputValue.value = newNum.toString();
  }
};

// 处理输入模式切换
const handleModeChange = () => {
  const newNum = BigInt('0b' + bits.value.join(''));
  if (inputMode.value === 'hex') {
    inputValue.value = '0x' + newNum.toString(16);
  } else {
    inputValue.value = newNum.toString();
  }
};

// 监听输入框的值变化
watch(inputValue, handleInput);
</script>

<style>
.bits-container {
  display: flex;
  flex-direction: column;
  margin-top: 20px;
}
.bits-row {
  display: flex;
  justify-content: center;
}
.bit-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: 2px;
  user-select: none;

}
.bit-item:nth-child(4n) {
  margin-right: 10px;
}
.bit-index {
  font-size: 12px;
  color: #999;
}
.bits-container span {
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  border: 1px solid #ccc;
}
.bit-on {
  background-color: #409eff;
  color: white;
}
.bit-off {
  background-color: #fff;
  color: black;
}
</style>
