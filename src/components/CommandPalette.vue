<template>
  <div v-if="visible" class="command-palette">
    <input
      v-model="query"
      @keydown.enter="runCommand"
      @keydown.esc="hide"
      ref="commandInput"
      placeholder="Type a command..."
    />
    <ul>
      <li v-for="cmd in filteredCommands" :key="cmd" @click="runCommand(cmd)">
        {{ cmd }}
      </li>
    </ul>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue';
import { getAllCommands, executeCommand } from '../utils/commands';

const visible = ref(false);
const query = ref('');
const commandInput = ref(null);

const show = () => {
  visible.value = true;
  query.value = '';
  nextTick(() => commandInput.value.focus());
};

const hide = () => {
  visible.value = false;
};

const filteredCommands = computed(() => {
  const allCommands = getAllCommands();
  if (!query.value) {
    return allCommands;
  }
  return allCommands.filter(cmd => cmd.toLowerCase().includes(query.value.toLowerCase()));
});

const runCommand = (cmd = null) => {
  if (!cmd) {
    cmd = filteredCommands.value[0];
  }
  if (cmd) {
    executeCommand(cmd);
    hide();
  }
};

const onKeydown = (e) => {
  if (e.ctrlKey && e.key === 'p') {
    e.preventDefault();
    show();
  }
};

onMounted(() => {
  window.addEventListener('keydown', onKeydown);
});

onBeforeUnmount(() => {
  window.removeEventListener('keydown', onKeydown);
});
</script>

<style scoped>
.command-palette {
  position: fixed;
  top: 20%;
  left: 50%;
  transform: translateX(-50%);
  background: white;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  padding: 1rem;
  z-index: 1000;
}

.command-palette input {
  width: 100%;
  padding: 0.5rem;
  margin-bottom: 0.5rem;
}

.command-palette ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.command-palette li {
  padding: 0.5rem;
  cursor: pointer;
}

.command-palette li:hover {
  background: #eee;
}
</style>
