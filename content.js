/**
 * Content Script - 自动填入查询内容
 * 注入到各 AI 平台页面
 */

(function() {
  // 从 URL 获取查询参数
  const urlParams = new URLSearchParams(window.location.search);
  const query = urlParams.get('syncmaster_query');

  // 清理 URL 中的参数
  if (query) {
    let cleanUrl = window.location.href;
    cleanUrl = cleanUrl.replace(/[?&]syncmaster_query=[^&]+/, '');
    cleanUrl = cleanUrl.replace(/\?$/, '');
    window.history.replaceState({}, document.title, cleanUrl);
  }

  const host = window.location.hostname;

  /**
   * 模拟用户输入（适用于 React/Vue 等框架）
   */
  function simulateInput(element, text) {
    // 聚焦元素
    element.focus();

    // 对于 contenteditable 元素
    if (element.contentEditable === 'true' || element.isContentEditable) {
      const selection = window.getSelection();
      const range = document.createRange();
      range.selectNodeContents(element);
      selection.removeAllRanges();
      selection.addRange(range);

      document.execCommand('insertText', false, text);

      const inputEvent = new InputEvent('input', {
        bubbles: true,
        cancelable: true,
        inputType: 'insertText',
        data: text
      });
      element.dispatchEvent(inputEvent);
      return true;
    }

    // 对于 textarea/input 元素
    if (element.tagName === 'TEXTAREA' || element.tagName === 'INPUT') {
      const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
        element.tagName === 'TEXTAREA' ? window.HTMLTextAreaElement.prototype : window.HTMLInputElement.prototype,
        'value'
      ).set;
      nativeInputValueSetter.call(element, text);

      element.dispatchEvent(new Event('input', { bubbles: true }));
      element.dispatchEvent(new Event('change', { bubbles: true }));
      return true;
    }

    return false;
  }

  /**
   * 尝试填入内容
   */
  function fillContent() {
    // ChatGPT - ProseMirror 编辑器
    if (host.includes('chat.openai.com') || host.includes('chatgpt.com')) {
      const editor = document.querySelector('#prompt-textarea') ||
                     document.querySelector('[data-id="root"]') ||
                     document.querySelector('.ProseMirror') ||
                     document.querySelector('[contenteditable="true"]');
      if (editor) {
        return simulateInput(editor, query);
      }
    }

    // Claude - contenteditable
    if (host.includes('claude.ai')) {
      const editor = document.querySelector('[contenteditable="true"]') ||
                     document.querySelector('.ProseMirror') ||
                     document.querySelector('textarea');
      if (editor) {
        return simulateInput(editor, query);
      }
    }

    // Gemini - Quill 编辑器
    if (host.includes('gemini.google.com')) {
      const editor = document.querySelector('.ql-editor') ||
                     document.querySelector('[role="textbox"]') ||
                     document.querySelector('[contenteditable="true"]') ||
                     document.querySelector('rich-textarea textarea');
      if (editor) {
        return simulateInput(editor, query);
      }
    }

    // Grok - tiptap/ProseMirror 编辑器
    if (host.includes('grok.com')) {
      const editor = document.querySelector('.tiptap.ProseMirror') ||
                     document.querySelector('.ProseMirror') ||
                     document.querySelector('[contenteditable="true"]');
      if (editor) {
        editor.focus();
        const p = editor.querySelector('p');
        if (p) {
          p.innerHTML = query;
          p.classList.remove('is-empty', 'is-editor-empty');
        } else {
          editor.innerHTML = `<p>${query}</p>`;
        }

        editor.dispatchEvent(new InputEvent('input', {
          bubbles: true,
          cancelable: true,
          inputType: 'insertText',
          data: query
        }));
        return true;
      }
    }

    // Perplexity
    if (host.includes('perplexity.ai')) {
      const editor = document.querySelector('textarea') ||
                     document.querySelector('[contenteditable="true"]');
      if (editor) {
        return simulateInput(editor, query);
      }
    }

    return false;
  }

  // 尝试多次填入文本
  let attempts = 0;
  const maxAttempts = 30;

  const tryFill = () => {
    attempts++;
    if (fillContent()) {
      console.log('[SyncMaster] 内容已填入');
      return;
    }
    if (attempts < maxAttempts) {
      setTimeout(tryFill, 500);
    } else {
      console.log('[SyncMaster] 未能找到输入框');
    }
  };

  // 页面加载后开始尝试
  if (document.readyState === 'complete') {
    if (query) setTimeout(tryFill, 1000);
  } else {
    window.addEventListener('load', () => {
      if (query) setTimeout(tryFill, 1000);
    });
  }
})();
