<template>
  <div class="app">
    <div class="editor-wrapper">
      <button @click="copyToClipboard">Copy</button>
      <CustomMarkdownEditor :key="editorKey" ref="editorRef" :value="currentPayload" @paste="handlePaste"
        @update="handleUpdate" />
    </div>
    <div class="status">
      <p><strong>Latest Template:</strong></p>
      <pre>{{ latestState.template }}</pre>
      <p><strong>Latest Plain Text Content:</strong></p>
      <pre>{{ latestState.content }}</pre>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import CustomMarkdownEditor from "./components/CustomMarkdownEditor.vue";

const editorRef = ref(null);
const editorKey = ref(0);

const payload = `# 角色：{#InputSlot placeholder="角色名称" mode="input"#}{#/InputSlot}
{#InputSlot placeholder="角色概述和主要职责的一句话描述" mode="input" value="你是一个讲故事的小行家"#}{#/InputSlot}

## 目标：
{#InputSlot placeholder="角色的工作目标，如果有多目标可以分点列出，但建议更聚焦1-2个目标" mode="input"#}{#/InputSlot}

## 技能：
1. {#InputSlot placeholder="为了实现目标，角色需要具备的技能1" mode="input"#}{#/InputSlot}
2. {#InputSlot placeholder="为了实现目标，角色需要具备的技能2" mode="input"#}{#/InputSlot}
3. {#InputSlot placeholder="为了实现目标，角色需要具备的技能3" mode="input"#}{#/InputSlot}

## 工作流：
1. {#InputSlot placeholder="描述角色工作流程的第一步" mode="input"#}{#/InputSlot}
2. {#InputSlot placeholder="描述角色工作流程的第二步" mode="input"#}{#/InputSlot}
3. {#InputSlot placeholder="描述角色工作流程的第三步" mode="input"#}{#/InputSlot}

## 输出格式：
{#InputSlot placeholder="如果对角色的输出格式有特定要求，可以在这里强调并举例说明想要的输出格式" mode="input"#}{#/InputSlot}

## 限制：
- {#InputSlot placeholder="描述角色在互动过程中需要遵循的限制条件1" mode="input"#}{#/InputSlot}
- {#InputSlot placeholder="描述角色在互动过程中需要遵循的限制条件2" mode="input"#}{#/InputSlot}
- {#InputSlot placeholder="描述角色在互动过程中需要遵循的限制条件3" mode="input"#}{#/InputSlot}`;

const currentPayload = ref(payload);

const copyToClipboard = () => {
  // Use the latest template from the editor state
  navigator.clipboard.writeText(latestState.value.template).then(() => {
    alert("Copied to clipboard!");
  });
};

const handlePaste = (pastedContent) => {
  // Replace the current payload with the pasted content and force re-render
  currentPayload.value = pastedContent;
  editorKey.value++;
};

// Store the latest state from the editor
const latestState = ref({
  template: payload, // save modified template to database (no need to implement)
  content: '', // for llm consuming (no need to implement)
});

const handleUpdate = (updatedContent) => {
  // Update the latest state with the new template and content
  latestState.value.template = updatedContent.template;
  latestState.value.content = updatedContent.content;
};
</script>

<style>
body {
  margin: 0;
  padding: 20px;
  background: #f5f5f5;
}

.app {
  max-width: 800px;
  margin: 0 auto;
}

.editor-wrapper {
  margin-bottom: 20px;
}

.status {
  background: white;
  padding: 16px;
  border-radius: 8px;
  border: 1px solid #ccc;
}

.status pre {
  background: #f5f5f5;
  padding: 12px;
  border-radius: 4px;
  overflow-x: auto;
  white-space: pre-wrap;
  word-wrap: break-word;
}

nav {
  border: 1px solid #ccc;
  border-radius: 8px;
  margin: 0;
  padding: 0;
  overflow: hidden;
  margin-bottom: 12px;
}

ul {
  display: flex;
}

ul,
li {
  margin: 0;
  padding: 0;
  list-style: none;
}

li {
  padding: 0;
  flex: 1;
}

button {
  padding: 12px 0;
  appearance: none;
  background: none;
  border: none;
  width: 100%;
  height: 100%;
  text-align: center;
}

button.active,
button:hover {
  cursor: pointer;
  background: #264a84;
  color: #fff;
}
</style>
