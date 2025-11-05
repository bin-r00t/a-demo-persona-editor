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
// import { TemplateRow } from "../../utils/TemplateRow";
import "../../utils/styles.css";
import { InputSlot, InputSlotElement } from "../../utils/InputSlotV2";
import { HTMLElementWithTemplateRowAST } from "../../utils/TemplateRow";

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
  // console.log('[TemplateRow]', new TemplateRow(props.templateRaw))
});

const editorRef = ref<HTMLDivElement | null>(null);

const handleInput = (e: InputEvent) => {
  const selection = window.getSelection();
  if (!selection || selection.rangeCount === 0) return;

  // Get the node where the cursor is
  const focusNode = selection.focusNode;

  // If it's a text node, get its parent element
  let activeElement =
    focusNode?.nodeType === Node.TEXT_NODE
      ? focusNode.parentElement
      : (focusNode as HTMLElement);

  console.log("Actually typing in:", activeElement);
  // Check if typing in an input-slot
  if (activeElement?.classList?.contains("input-slot")) {
    if ((activeElement as unknown as InputSlotElement)._s_rel) {
      // console.log("Typing directly in input-slot 1:", activeElement);
      (activeElement as unknown as InputSlotElement)._s_rel!.updateContent(
        activeElement.textContent || "",
      );
    } else {
      // 这个分支应该永远不会进入
      console.log("新创建的 input slot ");
    }
  } else {
    // Find the closest input-slot ancestor
    const inputSlot = activeElement?.closest(".input-slot");
    if (inputSlot) {
      // wouldn't fire when typing in input-slot directly
      console.log("Typing inside input-slot 2:", inputSlot);
      // Access the InputSlot instance
      const slotElement = inputSlot as any;
      if (slotElement._s_rel) {
        console.log("InputSlot instance:", slotElement._s_rel);
        slotElement._s_rel.updateContent(inputSlot.textContent || "");
      }
    } else {
      /** cm-line element */
      let el = activeElement as unknown as HTMLElementWithTemplateRowAST;
      console.log(
        "Typing in demo-container itself or other element:",
        el,
        el._s_rel,
      );
      el._s_rel!.update();
    }
  }
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
      const newInputSlot2 = new InputSlot("", {
        placeholder,
      });

      // Put the new input slot inside its parent's templateRow AST
      (
        inputSlot.parentElement as unknown as HTMLElementWithTemplateRowAST
      )._s_rel!.appendNewInputSlot(
        newInputSlot2,
        inputSlot as InputSlotElement,
      );

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
        br.parentNode?.insertBefore(newInputSlot2.el, br.nextSibling);
        br.parentNode?.insertBefore(
          document.createTextNode("\u200B"),
          newInputSlot2.el.nextSibling,
        );
      } else {
        inputSlot.parentNode?.insertBefore(br, inputSlot.nextSibling);
        br.parentNode?.insertBefore(
          document.createTextNode("\u200B"),
          br.nextSibling,
        );
        br.parentNode?.insertBefore(newInputSlot2.el, br.nextSibling);
        br.parentNode?.insertBefore(
          document.createTextNode("\u200B"),
          newInputSlot2.el.nextSibling,
        );
      }

      // Move cursor to the new input slot
      const range = document.createRange();
      range.setStart(newInputSlot2.el, 0);
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
