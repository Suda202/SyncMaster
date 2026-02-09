/**
 * Content Script - 自动填入查询内容并发送
 * 注入到各 AI 平台页面
 * 通过 chrome.storage.local 获取待发送的查询内容（避免 URL 过长导致 HTTP 414）
 */

(function() {
  const host = window.location.hostname;

  /**
   * 填入内容并触发事件
   */
  function fillInput(element, text) {
    element.focus();

    // contenteditable
    if (element.isContentEditable || element.contentEditable === 'true') {
      element.textContent = text;
    }
    // textarea/input
    else if (element.tagName === 'TEXTAREA' || element.tagName === 'INPUT') {
      const nativeSetter = Object.getOwnPropertyDescriptor(
        element.tagName === 'TEXTAREA' ? window.HTMLTextAreaElement.prototype : window.HTMLInputElement.prototype,
        'value'
      ).set;
      nativeSetter.call(element, text);
    }

    // 触发 input 事件让框架更新状态
    element.dispatchEvent(new Event('input', { bubbles: true }));
    element.dispatchEvent(new Event('change', { bubbles: true }));
  }

  /**
   * 查找并点击发送按钮
   */
  function clickSendButton() {
    // 各平台发送按钮选择器
    const selectors = [
      '.send-button',
      'button[class*="send"]',
      'button[type="submit"]',
      '[data-testid="send-button"]',
      'form button[type="submit"]'
    ];

    for (const selector of selectors) {
      const btn = document.querySelector(selector);
      if (btn && !btn.disabled && btn.offsetParent !== null) {
        btn.click();
        console.log('[SyncMaster] 已点击发送按钮:', selector);
        return true;
      }
    }

    // 备用：查找任意可见按钮点击
    const allBtns = document.querySelectorAll('button');
    for (const btn of allBtns) {
      const cls = btn.className.toLowerCase();
      if (cls.includes('send') && !btn.disabled && btn.offsetParent !== null) {
        btn.click();
        console.log('[SyncMaster] 点击发送按钮:', cls.substring(0, 50));
        return true;
      }
    }

    console.log('[SyncMaster] 未找到发送按钮');
    return false;
  }

  /**
   * 填入并发送
   */
  function fillAndSend(query) {
    let editor = null;

    // ChatGPT
    if (host.includes('chat.openai.com') || host.includes('chatgpt.com')) {
      editor = document.querySelector('#prompt-textarea') ||
               document.querySelector('[data-id="root"]') ||
               document.querySelector('.ProseMirror') ||
               document.querySelector('[contenteditable="true"]');
    }
    // Claude
    else if (host.includes('claude.ai')) {
      editor = document.querySelector('[contenteditable="true"]') ||
               document.querySelector('.ProseMirror') ||
               document.querySelector('textarea') ||
               document.querySelector('[role="textbox"]');
      if (editor) {
        fillInput(editor, query);
        setTimeout(() => {
          // Claude 可能有单独的发送按钮
          const sendBtn = document.querySelector('[aria-label="Send"], [aria-label="发送"], button[type="submit"]');
          if (sendBtn && sendBtn.offsetParent !== null) {
            sendBtn.click();
          } else {
            // 或者直接按 Enter
            editor.dispatchEvent(new KeyboardEvent('keydown', {
              key: 'Enter', code: 'Enter', keyCode: 13, bubbles: true
            }));
          }
        }, 200);
        return true;
      }
    }
    // Gemini
    else if (host.includes('gemini.google.com')) {
      editor = document.querySelector('.ql-editor') ||
               document.querySelector('[role="textbox"]') ||
               document.querySelector('[contenteditable="true"]') ||
               document.querySelector('rich-textarea textarea');
    }
    // Grok
    else if (host.includes('grok.com')) {
      editor = document.querySelector('.tiptap.ProseMirror') ||
               document.querySelector('.ProseMirror') ||
               document.querySelector('[contenteditable="true"]');
      if (editor) {
        const p = editor.querySelector('p') || editor;
        p.innerHTML = query;
        p.classList.remove('is-empty', 'is-editor-empty');
        editor.dispatchEvent(new InputEvent('input', { bubbles: true, cancelable: true }));
        setTimeout(clickSendButton, 200);
        return true;
      }
    }
    // Perplexity
    else if (host.includes('perplexity.ai')) {
      editor = document.querySelector('textarea') ||
               document.querySelector('[contenteditable="true"]');
    }

    if (editor) {
      fillInput(editor, query);
      // 等待按钮显示后点击
      setTimeout(clickSendButton, 200);
      return true;
    }

    return false;
  }

  /**
   * 从 chrome.storage 读取查询内容，然后尝试填入并发送
   * 使用时间戳判断是否为最近的查询（30 秒内有效）
   */
  function startWithQuery() {
    chrome.storage.local.get(['syncmaster_pending_query', 'syncmaster_query_time'], (result) => {
      const query = result.syncmaster_pending_query;
      const queryTime = result.syncmaster_query_time;

      // 检查是否有待发送的查询，且在 30 秒内
      if (!query || !queryTime || (Date.now() - queryTime > 30000)) {
        return;
      }

      console.log('[SyncMaster] 检测到待发送查询，开始填入');

      let attempts = 0;
      const maxAttempts = 30;

      const tryFillAndSend = () => {
        attempts++;
        if (fillAndSend(query)) {
          console.log('[SyncMaster] 内容已填入并发送');
          return;
        }
        if (attempts < maxAttempts) {
          setTimeout(tryFillAndSend, 500);
        } else {
          console.log('[SyncMaster] 未能找到输入框');
        }
      };

      setTimeout(tryFillAndSend, 1000);
    });
  }

  // 页面加载后开始尝试
  if (document.readyState === 'complete') {
    startWithQuery();
  } else {
    window.addEventListener('load', startWithQuery);
  }
})();
