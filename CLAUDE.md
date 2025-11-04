# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

This is a Vue 3 + Vite application that implements a **custom markdown editor with template-based input slots**. The editor renders markdown with special `{#InputSlot#}` syntax as editable elements, designed for persona/role template creation.

**Purpose**: A message input demo application that allows users to create and edit persona templates with predefined input fields.

## Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Tech Stack

- **Framework**: Vue 3 (Composition API with `<script setup>`)
- **Build Tool**: Vite 4.3
- **Plugins**:
  - `@vitejs/plugin-vue` - Vue SFC support
  - `vite-plugin-vue-devtools` - Vue debugging tools
- **Styling**: CSS-in-JS within Vue SFC `<style>` blocks
- **Language**: JavaScript (no TypeScript)

## Architecture

### Component Structure

```
src/
├── main.js                 # Vue app entry point
├── App.vue                 # Root component with copy button
└── components/
    └── CustomMarkdownEditor.vue  # Core editor component
```

### Core Components

**1. App.vue** (`src/App.vue`)
- Root application component
- Contains the template payload with `{#InputSlot#}` syntax
- Provides "Copy to clipboard" functionality
- Handles paste events to replace content
- Manages editor re-rendering via `editorKey` prop

**2. CustomMarkdownEditor.vue** (`src/components/CustomMarkdownEditor.vue`)
- Implements the custom markdown renderer (`cm_render()` function)
- Converts `{#InputSlot#}` tags into editable `<span>` elements
- Handles Enter key to create new input slots dynamically
- Manages contenteditable behavior for in-place editing
- Supports two modes: `input` (single-line) and `textarea` (multi-line)
- Processes markdown headers (# and ##) with custom styling

### Key Features

**InputSlot Syntax**:
```
{#InputSlot placeholder="Role name" mode="input"#}{#/InputSlot#}
```
- Renders as blue, editable boxes with placeholder text
- Two modes: `input` (default) and `textarea`
- Zero-width spaces inserted before/after for cursor positioning

**Markdown Processing**:
- Custom parser in `cm_render()` function (lines 39-87)
- Converts InputSlot tags to `<span class="input-slot">` elements
- Processes `#` and `##` headers with custom styling
- Handles Windows (`\r\n`) and Unix (`\n`) line endings

**Interactive Behavior**:
- Press Enter inside an input slot to create a new one
- Paste content replaces the entire template
- Real-time rendering via Vue's reactive `computed()` and `watch()`

## Common Development Tasks

### Modifying the Editor

**Customizing InputSlot appearance**:
Edit styles in `CustomMarkdownEditor.vue` lines 209-240:
- `.input-slot` - Base styling (background, colors, padding)
- `.input-slot.multiline` - Multi-line mode styling
- `.input-slot:empty:before` - Placeholder text appearance
- `.input-slot:focus` - Focus state

**Adding new InputSlot modes**:
1. Extend the `mode` attribute parsing in `cm_render()` (lines 46-54)
2. Add corresponding CSS rules
3. Update the mode detection logic (line 123)

**Changing markdown parsing**:
Modify the `cm_render()` function (lines 39-87):
- Line 67-84: Header processing logic
- Line 64: Line ending normalization
- Line 41-61: InputSlot tag replacement

### Template Customization

Edit the `payload` constant in `App.vue` (lines 22-44) to change:
- Default template structure
- InputSlot placeholders
- Markdown formatting

### Build Configuration

Vite config (`vite.config.js`) includes:
- Vue plugin for SFC compilation
- Vue DevTools plugin for debugging

## Important Implementation Details

1. **ContentEditable Handling**:
   - Uses zero-width spaces (`\u200B`) around input slots for cursor positioning
   - DOM manipulation in `handleKeydown()` (lines 94-172) for dynamic input slot creation

2. **Reactive Updates**:
   - `renderedContent` computed property watches `props.value` and calls `cm_render()`
   - `watch()` updates editor DOM when `value` prop changes (lines 29-37)

3. **Paste Handling**:
   - Intercepts paste events to replace entire content (lines 174-184)
   - Emits `paste` event to parent component

4. **Header Styling**:
   - Headers are wrapped in `<span>` elements (not `<h1>`/`<h2>`) to maintain inline editing
   - CSS classes: `.header-one`, `.header-two` (lines 202-207)

## Git Workflow

Standard git commands:
```bash
git add .
git commit -m "Your message"
git push
```

No pre-commit hooks configured. Commit messages follow conventional patterns from recent commits:
- `feat: add feature_name`
- `finish feature_name`
- `init commit`

## Notes

- No tests configured (no test scripts in package.json)
- No linting configured (no ESLint/Prettier files)
- Project uses default Vite configuration with minimal customizations
- Editor is optimized for persona/role template creation workflows
