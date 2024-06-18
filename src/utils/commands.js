// src/commands.js
import { reactive } from 'vue';

const commands = reactive(new Map());

export function registerCommand(name, action) {
  if (commands.has(name)) {
    throw new Error(`Command "${name}" is already registered.`);
  }
  commands.set(name, action);
}

export function executeCommand(name, ...args) {
  const action = commands.get(name);
  if (!action) {
    throw new Error(`Command "${name}" not found.`);
  }
  action(...args);
}

export function getAllCommands() {
  return Array.from(commands.keys());
}
