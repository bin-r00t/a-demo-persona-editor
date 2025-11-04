<template>
  <div class="demo-container" ref="editorRef">
    <div class="editor-content" ref="contentRef" @input="handleInput" @paste="handlePaste" @keydown="handleKeydown"></div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted } from "vue";

const props = defineProps({
  value: {
    type: String,
    default: "",
  },
});

const emit = defineEmits(["paste", "update"]);

// Refs
const editorRef = ref(null);
const contentRef = ref(null);

// Parsed model - will store the structure of the document
const parsedModel = ref([]);

// Function to parse markdown with InputSlot syntax into parsedModel format
function parseToModel(markdown) {
  const model = [];
  const inputSlotRegex = /\{#InputSlot\s+([^#]*?)#\}\{#\/InputSlot\}/g;

  let lastIndex = 0;
  let match;

  while ((match = inputSlotRegex.exec(markdown)) !== null) {
    // Add text before the input slot
    const textBefore = markdown.slice(lastIndex, match.index);
    if (textBefore) {
      model.push(textBefore);
    }

    // Parse attributes
    const attributes = match[1];
    const attrs = {};
    const attrRegex = /(\w+)="([^"]*)"/g;
    let attrMatch;

    while ((attrMatch = attrRegex.exec(attributes)) !== null) {
      attrs[attrMatch[1]] = attrMatch[2];
    }

    const placeholder = attrs.placeholder || "Enter text here...";
    const mode = attrs.mode || "input";
    const value = attrs.value || "";

    // Add input slot to model
    model.push({
      type: "input",
      placeholder,
      mode,
      value
    });

    lastIndex = match.index + match[0].length;
  }

  // Add remaining text after last input slot
  const remainingText = markdown.slice(lastIndex);
  if (remainingText) {
    model.push(remainingText);
  }

  return model;
}

// Initial render function
function renderInitial() {
  let html = "";
  let inputIndex = 0;

  for (const item of parsedModel.value) {
    if (typeof item === "string") {
      // Process markdown in text
      let processed = item.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
      const lines = processed.split("\n");

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        if (line.match(/^##\s+/)) {
          html += line.replace(/^##\s+(.+)$/, '<span class="header-two">## $1</span>') + "<br>";
        } else if (line.match(/^#\s+/) && !line.match(/^##/)) {
          html += line.replace(/^#\s+(.+)$/, '<span class="header-one"># $1</span>') + "<br>";
        } else if (line) {
          html += line + "<br>";
        }
        if (i < lines.length - 1) {
          html += "<br>";
        }
      }
    } else if (item.type === "input") {
      // Render input slot with unique data-index attribute
      const value = item.value || "";
      const placeholder = item.placeholder || "Enter text here...";
      html += `&#8203;<span class="input-slot ${item.mode === "textarea" ? "multiline" : ""}" data-placeholder="${placeholder}" data-index="${inputIndex}" contenteditable="true">${value}</span>&#8203;`;
      inputIndex++;
    }
  }

  renderedContent.value = html;
}

// Function to generate markdown from parsedModel
function generateMarkdown(model) {
  return model.map(item => {
    if (typeof item === "string") {
      return item;
    } else if (item.type === "input") {
      const attrs = [];
      if (item.placeholder) attrs.push(`placeholder="${item.placeholder}"`);
      if (item.mode && item.mode !== "input") attrs.push(`mode="${item.mode}"`);
      if (item.value) attrs.push(`value="${item.value}"`);

      return `{#InputSlot ${attrs.join(" ")}#}{#/InputSlot}`;
    }
    return "";
  }).join("");
}

// Function to generate plain text for LLM consumption
function generatePlainText(model) {
  return model.map(item => {
    if (typeof item === "string") {
      return item;
    } else if (item.type === "input") {
      return item.value || "";
    }
    return "";
  }).join("");
}

// Watch for value changes and update the model
watch(
  () => props.value,
  (newValue) => {
    console.log("value change...");
    parsedModel.value = parseToModel(newValue);
    renderInitial();
  },
  { immediate: true }
);

onMounted(() => {
  // Initialize with the prop value
  parsedModel.value = parseToModel(props.value);
  renderInitial();
});

// Initial render function
function renderInitial() {
  if (!contentRef.value) return;

  let html = "";
  let inputIndex = 0;

  for (const item of parsedModel.value) {
    if (typeof item === "string") {
      // Process markdown in text
      let processed = item.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
      const lines = processed.split("\n");

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        if (line.match(/^##\s+/)) {
          html += line.replace(/^##\s+(.+)$/, '<span class="header-two">## $1</span>') + "<br>";
        } else if (line.match(/^#\s+/) && !line.match(/^##/)) {
          html += line.replace(/^#\s+(.+)$/, '<span class="header-one"># $1</span>') + "<br>";
        } else if (line) {
          html += line + "<br>";
        }
        if (i < lines.length - 1) {
          html += "<br>";
        }
      }
    } else if (item.type === "input") {
      // Render input slot with unique data-index attribute
      const value = item.value || "";
      const placeholder = item.placeholder || "Enter text here...";
      html += `&#8203;<span class="input-slot ${item.mode === "textarea" ? "multiline" : ""}" data-placeholder="${placeholder}" data-index="${inputIndex}" contenteditable="true">${value}</span>&#8203;`;
      inputIndex++;
    }
  }

  // Set the innerHTML directly (not reactive)
  contentRef.value.innerHTML = html;
}

// Handle input changes when users type in input slots
function handleInput(event) {
  const target = event.target;

  // Check if the input is inside an input-slot
  if (target.classList.contains("input-slot")) {
    const index = parseInt(target.getAttribute('data-index'));
    if (index >= 0 && index < parsedModel.value.length && parsedModel.value[index].type === "input") {
      // Update the model with the new value
      parsedModel.value[index].value = target.innerText;

      // Emit the updated template and plain text WITHOUT re-rendering
      emit("update", {
        template: generateMarkdown(parsedModel.value),
        content: generatePlainText(parsedModel.value)
      });
    }
  }
}

function handleKeydown(event) {
  // Check if Enter key is pressed
  if (event.key === "Enter") {
    const selection = window.getSelection();
    const focusNode = selection.focusNode;

    // Check if cursor is inside an input-slot
    let inputSlot = null;
    if (focusNode) {
      let node =
        focusNode.nodeType === Node.TEXT_NODE
          ? focusNode.parentElement
          : focusNode;
      while (node) {
        if (node.classList && node.classList.contains("input-slot")) {
          inputSlot = node;
          break;
        }
        if (node.classList && node.classList.contains("demo-container")) {
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
      newInputSlot.setAttribute("contenteditable", "true");

      // Create a br element for line break
      const br = document.createElement("br");

      // Insert after the current input slot
      const afterSpace = inputSlot.nextSibling;
      if (
        afterSpace &&
        afterSpace.nodeType === Node.TEXT_NODE &&
        afterSpace.textContent === "\u200B"
      ) {
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
