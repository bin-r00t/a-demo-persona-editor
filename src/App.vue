<template>
  <div class="app">
    <nav>
      <ul>
        <li>
          <button
            :class="[show === 'ori' ? 'active' : '']"
            @click="show = 'ori'"
          >
            原版
          </button>
        </li>
        <li>
          <button
            :class="[show === 'demo' ? 'active' : '']"
            @click="show = 'demo'"
          >
            demo
          </button>
        </li>
      </ul>
    </nav>
    <MessageInput v-if="show === 'ori'" />
    <div class="editor-wrapper" v-if="show === 'demo'">
      <!-- copy button  -->
      <button @click="copyToClipboard">Copy</button>
      <CustomMarkdownEditor :key="editorKey" ref="editorRef" :value="currentPayload" @paste="handlePaste" />
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import MessageInput from "./components/MessageInput.vue";
import CustomMarkdownEditor from "./components/CustomMarkdownEditor.vue";

const show = ref("ori");
const editorRef = ref(null);
const editorKey = ref(0);

const payload = `# 角色：{#InputSlot placeholder="角色名称" mode="input"#}{#/InputSlot#}
{#InputSlot placeholder="角色概述和主要职责的一句话描述" mode="input"#}{#/InputSlot#}

## 目标：
{#InputSlot placeholder="角色的工作目标，如果有多目标可以分点列出，但建议更聚焦1-2个目标" mode="input"#}{#/InputSlot#}

## 技能：
1.  {#InputSlot placeholder="为了实现目标，角色需要具备的技能1" mode="input"#}{#/InputSlot#}
2. {#InputSlot placeholder="为了实现目标，角色需要具备的技能2" mode="input"#}{#/InputSlot#}
3. {#InputSlot placeholder="为了实现目标，角色需要具备的技能3" mode="input"#}{#/InputSlot#}

## 工作流：
1. {#InputSlot placeholder="描述角色工作流程的第一步" mode="input"#}{#/InputSlot#}
2. {#InputSlot placeholder="描述角色工作流程的第二步" mode="input"#}{#/InputSlot#}
3. {#InputSlot placeholder="描述角色工作流程的第三步" mode="input"#}{#/InputSlot#}

## 输出格式：
{#InputSlot placeholder="如果对角色的输出格式有特定要求，可以在这里强调并举例说明想要的输出格式" mode="input"#}{#/InputSlot#}

## 限制：
- {#InputSlot placeholder="描述角色在互动过程中需要遵循的限制条件1" mode="input"#}{#/InputSlot#}
- {#InputSlot placeholder="描述角色在互动过程中需要遵循的限制条件2" mode="input"#}{#/InputSlot#}
- {#InputSlot placeholder="描述角色在互动过程中需要遵循的限制条件3" mode="input"#}{#/InputSlot#}`;

const currentPayload = ref(payload);

const copyToClipboard = () => {
  navigator.clipboard.writeText(payload).then(() => {
    alert("Copied to clipboard!");
  });
};

const handlePaste = (pastedContent) => {
  // Replace the current payload with the pasted content and force re-render
  currentPayload.value = pastedContent;
  editorKey.value++;
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
