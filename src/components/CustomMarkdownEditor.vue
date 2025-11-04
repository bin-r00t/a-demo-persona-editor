<template>
  <div
    class="demo-container"
    contenteditable="true"
    ref="editorRef"
    @input="handleInput"
    @keydown="handleKeydown"
    @paste="handlePaste"
    v-html="renderedContent"
  ></div>
</template>

<script setup>
import { ref, computed, watch } from "vue";

const props = defineProps({
  value: {
    type: String,
    default: "This is a demo component",
  },
});

const emit = defineEmits(["paste", "update"]);

const editorRef = ref(null);
const renderedContent = computed(() => cm_render(props.value));

// Watch for value changes and update the editor
watch(
  () => props.value,
  (newValue) => {
    console.log("value change...");
    if (editorRef.value) {
      editorRef.value.innerHTML = cm_render(newValue.trim());
    }
  }
);

function cm_render(custom_markdown) {
  // Replace InputSlot tags with editable div elements
  let rendered = custom_markdown.replace(
    /\{#InputSlot\s+([^#]*?)#\}\{#\/InputSlot#\}/g,
    (match, attributes) => {
      // Parse attributes
      const attrs = {};
      const attrRegex = /(\w+)="([^"]*)"/g;
      let attrMatch;

      while ((attrMatch = attrRegex.exec(attributes)) !== null) {
        attrs[attrMatch[1]] = attrMatch[2];
      }

      const placeholder = attrs.placeholder || "Enter text here...";
      const mode = attrs.mode || "input";

      // Add zero-width spaces before and after input slot to allow cursor positioning
      return `&#8203;<span class="input-slot ${
        mode === "textarea" ? "multiline" : ""
      }" data-placeholder="${placeholder}"></span>&#8203;`;
    }
  );

  // Normalize line endings - handle both \r\n (Windows) and \n (Unix/Mac)
  rendered = rendered.replace(/\r\n/g, "\n").replace(/\r/g, "\n");

  // Process line by line to handle headers correctly
  const lines = rendered.split("\n");
  const processedLines = lines.map((line) => {
    // Check for ## headers first
    if (line.match(/^##\s+/)) {
      return line.replace(
        /^##\s+(.+)$/,
        '<span class="header-two">## $1</span>'
      );
    }
    // Check for single # headers (not ##)
    else if (line.match(/^#\s+/) && !line.match(/^##/)) {
      return line.replace(/^#\s+(.+)$/, '<span class="header-one"># $1</span>');
    }
    return line;
  });

  // Join with <br> tags
  rendered = processedLines.join("<br>");

  return rendered;
}

function handleInput(event) {
  // Handle input changes if needed
  console.log("Content changed:", event.target.innerHTML);
}

function handleKeydown(event) {
  // Check if Enter key is pressed
  if (event.key === "Enter") {
    const selection = window.getSelection();
    const focusNode = selection.focusNode;

    // Check if cursor is inside an input-slot
    let inputSlot = null;
    if (focusNode) {
      // Check if the focusNode itself is an input-slot or a child of one
      let node =
        focusNode.nodeType === Node.TEXT_NODE
          ? focusNode.parentElement
          : focusNode;
      while (node && node !== editorRef.value) {
        if (node.classList && node.classList.contains("input-slot")) {
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
      const isMultiline = inputSlot.classList.contains("multiline");

      // Create a new input slot element
      const newInputSlot = document.createElement("span");
      newInputSlot.className = `input-slot ${isMultiline ? "multiline" : ""}`;
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
        afterSpace.parentNode.insertBefore(br, afterSpace.nextSibling);
        br.parentNode.insertBefore(
          document.createTextNode("\u200B"),
          br.nextSibling
        );
        br.parentNode.insertBefore(newInputSlot, br.nextSibling);
        br.parentNode.insertBefore(
          document.createTextNode("\u200B"),
          newInputSlot.nextSibling
        );
      } else {
        inputSlot.parentNode.insertBefore(br, inputSlot.nextSibling);
        br.parentNode.insertBefore(
          document.createTextNode("\u200B"),
          br.nextSibling
        );
        br.parentNode.insertBefore(newInputSlot, br.nextSibling);
        br.parentNode.insertBefore(
          document.createTextNode("\u200B"),
          newInputSlot.nextSibling
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
}

function handlePaste(event) {
  event.preventDefault();

  // Get pasted text from clipboard
  const pastedText = event.clipboardData.getData("text/plain");

  if (pastedText) {
    // Emit the pasted content to parent
    emit("paste", pastedText.trim());
  }
}
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
