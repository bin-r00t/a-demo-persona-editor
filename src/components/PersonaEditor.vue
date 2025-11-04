<template>
  <div
    class="demo-container"
    ref="editorRef"
    contenteditable="true"
    @input="handleInput"
    @paste="handlePaste"
    @keydown="handleKeydown"
  ></div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from "vue";
import { LLMTemplate } from "../../utils/LLMTemplate";
import '../../utils/styles.css'

const props = defineProps<{
  templateRaw: string;
}>();

const template = ref<LLMTemplate | null>(null);

onMounted(() => {
  if (!editorRef.value) {
    alert("Editor not found");
    return;
  }
  template.value = new LLMTemplate(editorRef.value, props.templateRaw);
});

const editorRef = ref<HTMLDivElement | null>(null);

const handleInput = (e: InputEvent) => {
  console.log("Input event:", e.target);
};
const handlePaste = (e: ClipboardEvent) => {
  //   console.log("Paste event:", e.clipboardData.getData("text/plain"));
};
const handleKeydown = (event: KeyboardEvent) => {
  // Check if Enter key is pressed
  if (event.key === "Enter") {
    const selection = window.getSelection();
    if (!selection || !editorRef.value) {
      return;
    }
    const focusNode = selection?.focusNode;

    // Check if cursor is inside an input-slot
    let inputSlot = null;
    if (focusNode) {
      // Check if the focusNode itself is an input-slot or a child of one
      let node =
        focusNode.nodeType === Node.TEXT_NODE
          ? focusNode.parentElement
          : focusNode;
      while (node && node !== editorRef.value) {
        if (
          node instanceof Element &&
          node.classList &&
          node.classList.contains("input-slot")
        ) {
          inputSlot = node;
          break;
        }
        node = node.parentElement;
      }
    }

    if (inputSlot) {
      event.preventDefault();

      // Get the placeholder and mode from the current input slot
      const placeholder =
        inputSlot.getAttribute("data-placeholder") || "Enter text here...";

      // Create a new input slot element
      const newInputSlot = document.createElement("span");
      newInputSlot.className = `input-slot`;
      newInputSlot.setAttribute("data-placeholder", placeholder);

      // Create a br element for line break
      const br = document.createElement("br");

      // Insert after the current input slot
      const afterSpace = inputSlot.nextSibling;
      if (
        afterSpace &&
        afterSpace.nodeType === Node.TEXT_NODE &&
        afterSpace.textContent === "\u200B"
      ) {
        // Insert after the zero-width space
        afterSpace.parentNode?.insertBefore(br, afterSpace.nextSibling);
        br.parentNode?.insertBefore(
          document.createTextNode("\u200B"),
          br.nextSibling,
        );
        br.parentNode?.insertBefore(newInputSlot, br.nextSibling);
        br.parentNode?.insertBefore(
          document.createTextNode("\u200B"),
          newInputSlot.nextSibling,
        );
      } else {
        inputSlot.parentNode?.insertBefore(br, inputSlot.nextSibling);
        br.parentNode?.insertBefore(
          document.createTextNode("\u200B"),
          br.nextSibling,
        );
        br.parentNode?.insertBefore(newInputSlot, br.nextSibling);
        br.parentNode?.insertBefore(
          document.createTextNode("\u200B"),
          newInputSlot.nextSibling,
        );
      }

      // Move cursor to the new input slot
      const range = document.createRange();
      range.setStart(newInputSlot, 0);
      range.collapse(true);
      selection.removeAllRanges();
      selection.addRange(range);
    }
  }
};
</script>

<style>
.demo-container {
  border: 1px solid #ccc;
  padding: 16px;
  border-radius: 8px;
  line-height: 1.2;
}

.demo-container br {
  display: block;
  content: "";
  margin: 0;
  line-height: 0;
}

.editor-content {
  min-height: 150px;
  outline: none;
  white-space: pre-wrap;
  word-break: break-word;
}

.header-one,
.header-two {
  color: blue;
  font-weight: bold;
  display: inline;
}

.input-slot {
  display: inline-block;
  margin: 2px 4px;
  padding: 10px 14px;
  background-color: #e3f2fd;
  color: #1565c0;
  border-radius: 8px;
  min-width: 200px;
  min-height: 20px;
  outline: none;
  vertical-align: middle;
  cursor: text;
}

.input-slot.multiline {
  min-height: 60px;
  min-width: 100%;
  display: block;
  margin: 8px 0;
}

.input-slot:empty:before {
  content: attr(data-placeholder);
  color: #64b5f6;
  opacity: 0.7;
  cursor: text;
}

.input-slot:focus {
  background-color: #bbdefb;
  box-shadow: 0 0 0 2px #2196f3;
}

/* Ensure input slots don't prevent editing */
.input-slot * {
  pointer-events: auto;
}
</style>
