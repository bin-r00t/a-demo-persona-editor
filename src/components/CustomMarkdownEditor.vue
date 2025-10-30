<template>
  <div class="demo-container">{{ cm_render(value) }}</div>
</template>

<script setup>
const props = defineProps({
  value: {
    type: String,
    default: "This is a demo component",
  },
});

function cm_render(custom_markdown) {
  // needs implementation of custom markdown parsing logic
  return custom_markdown;
}
</script>

<style>
.demo-container {
  border: 1px solid #ccc;
  padding: 16px;
  border-radius: 8px;
}
</style>
