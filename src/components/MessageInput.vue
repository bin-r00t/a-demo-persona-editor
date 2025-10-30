<template>
  <div class="message-input-container">
    <!-- 卡片选择区 -->
    <div class="card-section">
      <div 
        v-for="card in cards" 
        :key="card.id"
        class="card-item"
        @click="selectTemplate(card)"
      >
        <div class="card-icon" :class="card.type">
          <i :class="card.icon"></i>
        </div>
        <div class="card-title">{{ card.title }}</div>
        <div class="card-desc">{{ card.description }}</div>
      </div>
    </div>

    <!-- 消息编辑区 -->
    <div class="editor-section">
      <div
        ref="editorRef"
        class="editor-content"
        contenteditable="true"
        @paste="handlePaste"
        @keydown="handleKeydown"
        @input="handleInput"
        @cut="handleCut"
        :placeholder="placeholder"
      ></div>
      
      <!-- 添加发送按钮 -->
      <div class="editor-footer">
        <button class="send-button" @click="handleSend">
          发送
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const editorRef = ref(null)
const placeholder = '请输入内容或从上方选择模板'

// 卡片数据
const cards = [
  {
    id: 2,
    type: 'report',
    title: '总结汇报',
    description: '凝练你的工作成效',
    icon: 'report',
    template: '这是一份工作总结，时间范围是 <span class="editable" data-placeholder="请输入时间范围" contenteditable="true"></span>，主要内容包括<span class="editable" data-placeholder="请输入内容概要" contenteditable="true">项目进展、团队协作、技术创新</span>。'
  }
]

/**
 * 创建并配置一个 MutationObserver 实例，用于监听编辑器内容的变化。
 * 当检测到子节点列表发生变化时，检查新增的节点是否为可编辑元素（.editable），
 * 如果是，则调用 wrapWithPlaceholder 方法为其添加占位符。
 */
const observer = new MutationObserver((mutations) => {
  mutations.forEach((mutation) => {
    // 只处理子节点列表变化的 mutation
    if (mutation.type === 'childList') {
      mutation.addedNodes.forEach(node => {
        // 检查新增节点是否为元素节点且具有 .editable 类
        if (node.nodeType === Node.ELEMENT_NODE && node.matches('.editable')) {
          wrapWithPlaceholder(node)
        }
      })
    }
  })
})

// 初始化时检查现有可编辑区域
onMounted(() => {
  if (editorRef.value) {
    observer.observe(editorRef.value, { childList: true, subtree: true })
  }
})

/**
 * 独立包裹方法，用于在指定元素周围添加占位符
 * @param {Element} element - 需要被占位符包裹的目标元素
 */
const wrapWithPlaceholder = (element) => {
  // 移除元素的文本内容前后空格，并检查是否为空
  const text = element.textContent.trim()
  // 如果元素的文本内容不为空
  if (text !== '') {
    // 检查元素前一个兄弟节点是否为占位符，如果不是，则在元素前插入占位符
    if (!element.previousElementSibling?.matches('span[contenteditable="false"]')) {
      element.parentNode.insertBefore(createPlaceholder(), element)
    }
    // 检查元素后一个兄弟节点是否为占位符，如果不是，则在元素后插入占位符
    if (!element.nextElementSibling?.matches('span[contenteditable="false"]')) {
      element.parentNode.insertBefore(createPlaceholder(), element.nextSibling)
    }
  } else {
    // 如果元素的文本内容为空，移除周围的占位符
    const prev = element.previousElementSibling
    const next = element.nextElementSibling
    // 如果前一个兄弟节点为占位符，则移除它
    if (prev?.matches('span[contenteditable="false"]')) prev.remove()
    // 如果后一个兄弟节点为占位符，则移除它
    if (next?.matches('span[contenteditable="false"]')) next.remove()
  }
}

/**
 * 选择模板
 * 将给定的卡片模板应用到编辑器中，并准备编辑区域以进行内容编辑
 * @param {Object} card 包含模板属性的卡片对象
 */
const selectTemplate = (card) => {
  // 确保编辑器引用存在
  if (editorRef.value) {
    // 将卡片模板内容设置为编辑器的内容
    editorRef.value.innerHTML = card.template
    
    // 自动包裹所有可编辑区域
    const editables = editorRef.value.querySelectorAll('.editable')
    editables.forEach(span => {
      const text = span.textContent.trim()
      // 仅为非空的 span 添加唯一标识和占位符
      if (text !== '') {
        // 为每个非空的 span 添加唯一标识
        span.dataset.id = `editable-${Date.now()}-${Math.random()}`
        
        // 添加属于自己的占位符
        const prevPlaceholder = createPlaceholder()
        const nextPlaceholder = createPlaceholder()
        prevPlaceholder.dataset.owner = span.dataset.id
        nextPlaceholder.dataset.owner = span.dataset.id
        
        // 在 span 周围插入占位符
        span.parentNode.insertBefore(prevPlaceholder, span)
        span.parentNode.insertBefore(nextPlaceholder, span.nextSibling)
      }
    })

    // 找到第一个可编辑的 span
    const firstEditableSpan = editorRef.value.querySelector('.editable')
    if (firstEditableSpan) {
      // 创建一个范围并设置光标位置
      const range = document.createRange()
      const selection = window.getSelection()
      
      // 根据 span 内容的存在与否来调整光标位置
      if (firstEditableSpan.textContent) {
        range.selectNodeContents(firstEditableSpan)
        range.collapse(false) // false 表示折叠到末尾
      } else {
        range.selectNodeContents(firstEditableSpan)
        range.collapse(true) // true 表示折叠到开始
      }
      
      // 清除现有选择并应用新的选择
      selection.removeAllRanges()
      selection.addRange(range)
      
      // 聚焦到编辑区域
      firstEditableSpan.focus()
    }
  }
}

// 修改创建占位符的方法
const createPlaceholder = () => {
  const ph = document.createElement('span')
  ph.setAttribute('contenteditable', 'false')
  ph.style.verticalAlign = 'top'
  ph.style.fontSize = '0px'
  ph.style.userSelect = 'none'
  ph.innerHTML = '&nbsp;'
  return ph
}

// 提取获取可编辑 span 的方法
const getEditableSpan = (element) => {
  if (!element) return null
  return element.classList?.contains('editable')
    ? element
    : element.parentElement?.classList?.contains('editable')
      ? element.parentElement
      : null
}

// 提取移除占位符的方法
const removePlaceholders = (span) => {
  const prev = span.previousElementSibling
  const next = span.nextElementSibling
  if (prev?.matches('span[contenteditable="false"]')) prev.remove()
  if (next?.matches('span[contenteditable="false"]')) next.remove()
}

// 提取清空内容的方法
const clearSpanContent = (span) => {
  span.textContent = ''
  removePlaceholders(span)
}

/**
 * 修改剪切事件处理函数
 * @param {Event} e 剪切事件对象
 */
const handleCut = (e) => {
  // 获取当前选中的文本范围
  const selection = window.getSelection()
  const range = selection.getRangeAt(0)

  // 获取可编辑的span元素
  const editableSpan = getEditableSpan(range.startContainer.parentElement)

  // 确保找到了可编辑的span元素
  if (editableSpan) {
    // 获取span元素中的文本内容
    const text = editableSpan.textContent
    // 判断当前选中的文本是否与span中的全部文本一致
    const isAllSelected = selection.toString() === text

    // 如果全部文本被选中，则阻止默认剪切行为并执行复制后清空span内容
    if (isAllSelected) {
      e.preventDefault()
      document.execCommand('copy')
      clearSpanContent(editableSpan)
    }
  }
}

/**
 * 处理键盘事件的函数
 * @param {KeyboardEvent} e 键盘事件对象
 */
const handleKeydown = (e) => {
  if (e.key === 'Enter') {
    e.preventDefault()
    handleSend()
    return
  }

  // 获取当前选中的文本范围
  const selection = window.getSelection()
  const range = selection.getRangeAt(0)
  // 获取可编辑的span元素
  const editableSpan = getEditableSpan(range.startContainer.parentElement)

  // 如果可编辑的span存在且按下的是Backspace或Delete键
  if (editableSpan && (e.key === 'Backspace' || e.key === 'Delete')) {
    const text = editableSpan.textContent
    // 判断当前选中的文本是否与可编辑span中的全部文本相同
    const isAllSelected = selection.toString() === text
    
    // 如果全部文本被选中或文本内容只有一个字符，则阻止默认事件并清空span内容
    if (isAllSelected || text.length === 1) {
      e.preventDefault()
      clearSpanContent(editableSpan)
    }
  }
}

// 修改处理输入事件
const handleInput = (e) => {
  // 获取所有可编辑的 span 元素
  const editables = editorRef.value.querySelectorAll('.editable')
  
  // 遍历每个可编辑的 span 元素
  editables.forEach(span => {
    // 移除前后空格，获取 span 的文本内容
    const text = span.textContent.trim()
    
    // 获取当前 span 的前后相邻元素
    const prev = span.previousElementSibling
    const next = span.nextElementSibling
    
    // 如果文本内容为空
    if (text === '') {
      // 如果前一个元素是占位符且属于当前 span，移除它
      if (prev?.matches('span[contenteditable="false"]') && 
          prev.dataset.owner === span.dataset.id) {
        prev.remove()
      }
      // 如果后一个元素是占位符且属于当前 span，移除它
      if (next?.matches('span[contenteditable="false"]') && 
          next.dataset.owner === span.dataset.id) {
        next.remove()
      }
    } else {
      // 如果 span 没有 ID，生成并赋值一个唯一的 ID
      if (!span.dataset.id) {
        span.dataset.id = `editable-${Date.now()}-${Math.random()}`
      }
      
      // 检查前后是否有属于自己的占位符
      const hasPrev = prev?.matches('span[contenteditable="false"]') && 
                     prev.dataset.owner === span.dataset.id
      const hasNext = next?.matches('span[contenteditable="false"]') && 
                     next.dataset.owner === span.dataset.id
      
      // 如果没有前占位符，则添加
      if (!hasPrev) {
        const placeholder = createPlaceholder()
        placeholder.dataset.owner = span.dataset.id
        span.parentNode.insertBefore(placeholder, span)
      }
      // 如果没有后占位符，则添加
      if (!hasNext) {
        const placeholder = createPlaceholder()
        placeholder.dataset.owner = span.dataset.id
        span.parentNode.insertBefore(placeholder, span.nextSibling)
      }
    }
  })
}

// 处理粘贴，去除格式
const handlePaste = (e) => {
  e.preventDefault()
  // 获取粘贴的纯文本数据
  const text = e.clipboardData.getData('text/plain')
  // 使用获取的纯文本数据执行插入文本的命令
  document.execCommand('insertText', false, text)
}

// 修改发送处理函数
const handleSend = () => {
  if (editorRef.value) {
    // 使用 textContent 获取纯文本内容
    console.log(editorRef.value.textContent)
  }
}
</script>

<style lang="less" scoped>
.message-input-container {
  width: 100%;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

  .card-section {
    display: flex;
    flex-wrap: wrap;
    padding: 16px;
    gap: 16px;

    .card-item {
      flex: 1;
      min-width: 200px;
      padding: 16px;
      border-radius: 8px;
      background: #f8f9fa;
      cursor: pointer;
      transition: all 0.3s;

      &:hover {
        background: #f0f1f2;
      }

      .card-icon {
        width: 40px;
        height: 40px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-bottom: 8px;

        &.essay {
          background: #e8f5e9;
          color: #4caf50;
        }
        
        &.report {
          background: #e3f2fd;
          color: #2196f3;
        }
        
        &.article {
          background: #fff3e0;
          color: #ff9800;
        }
      }

      .card-title {
        font-size: 16px;
        font-weight: 500;
        margin-bottom: 4px;
      }

      .card-desc {
        font-size: 12px;
        color: #666;
      }
    }
  }

  .editor-section {
    padding: 16px;
    border-top: 1px solid #eee;
    
    .editor-content {
      min-height: 120px;
      padding: 12px;
      border: 1px solid #ddd;
      border-radius: 8px;
      outline: none;
      font-size: 14px;
      line-height: 1.6;

      &:empty:before {
        content: attr(placeholder);
        color: #999;
      }

      &:focus {
        border-color: #1a73e8;
      }

      :deep(.editable) {
        display: inline-block;
        min-width: 0;
        height: auto;
        min-height: 22px;
        padding: 0 8px;
        margin: 0 2px;
        background: #f0f7ff;
        border: 1px solid #d0e3ff;
        border-radius: 4px;
        color: #1a73e8;
        position: relative;
        vertical-align: middle;
        white-space: normal;
        word-break: break-all;
        word-wrap: break-word;
        max-width: 100%;

        &:empty {
          &:before {
            content: attr(data-placeholder);
            color: #94a3b8;
            position: static;
            display: inline-block;
            white-space: nowrap;
          }
        }

        &:focus {
          outline: none;
          border-color: #1a73e8;
          box-shadow: 0 0 0 2px rgba(26,115,232,0.1);
        }
      }
    }

    .editor-footer {
      display: flex;
      justify-content: flex-end;
      padding-top: 12px;

      .send-button {
        background: #1a73e8;
        color: white;
        border: none;
        padding: 8px 24px;
        border-radius: 4px;
        font-size: 14px;
        cursor: pointer;
        transition: all 0.3s;

        &:hover {
          background: #1557b0;
        }

        &:active {
          transform: translateY(1px);
        }
      }
    }
  }
}
</style>