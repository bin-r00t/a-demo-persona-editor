<template>
  <div class="app">
    <!-- <button @click="copyToClipboard">Copy</button> -->
    <div class="editor-wrapper">
      <PersonaEditor
        :key="editorKey"
        ref="editorRef"
        :template-raw="currentPayload"
        @update="handleUpdate"
        @paste="handlePaste"
        @save-llm="handleSaveLLM"
        @save-db="handleSaveDB"
      />
    </div>
    <div class="status">
      <p><strong>数据库保存:</strong></p>
      <pre>{{ displayedContent.template }}</pre>
      <p><strong>大模型使用:</strong></p>
      <pre>{{ displayedContent.content }}</pre>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import PersonaEditor from "./components/PersonaEditor.vue";
import { template as payload } from "../utils/example.js";

const editorRef = ref(null);
const editorKey = ref(0);

const currentPayload = ref(payload);

// needs re-do
const handlePaste = (pastedContent) => {
  currentPayload.value = pastedContent;
  editorKey.value++;
};

// Store the latest state from the editor
const latestState = ref({
  template: payload, // save modified template to database (no need to implement)
  content: "", // for llm consuming (no need to implement)
});

const handleUpdate = (updatedContent) => {
  // Update the latest state with the new template and content
  latestState.value.template = updatedContent.template;
  latestState.value.content = updatedContent.content;
};

const displayedContent = ref({
  template: "", // save modified template to database (no need to implement)
  content: "", // for llm consuming (no need to implement)
});
const handleSaveLLM = (v) => {
  // Implement save to LLM logic here
  displayedContent.value.content = v;
};

const handleSaveDB = (v) => {
  // Implement save to database logic here
  displayedContent.value.template = v;
};
</script>

<style>
html {
  height: 100%;
  margin: 0;
}

#app,
body {
  margin: 0;
  background: #f5f5f5;
  height: 100%;
}

.app {
  border: 1px solid #ccc;
  margin: 0 auto;
  padding: 20px;
  display: flex;
  gap: 20px;
}

.editor-wrapper {
  flex: 1;
}

.status {
  flex: 1;
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
