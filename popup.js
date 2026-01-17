/**
 * AI SyncMaster - 主逻辑
 */

// 状态
const state = {
  selectedPlatforms: new Set(),
  query: '',
};

// DOM 元素
let elements = {};

/**
 * 初始化
 */
function init() {
  // 获取 DOM 元素
  elements = {
    queryInput: document.getElementById('queryInput'),
    platformGrid: document.getElementById('platformGrid'),
    sendBtn: document.getElementById('sendBtn'),
  };

  // 渲染平台列表
  renderPlatforms();

  // 绑定事件
  bindEvents();

  // 从 storage 恢复上次选择
  restoreSelection();
}

/**
 * 渲染平台列表
 */
function renderPlatforms() {
  const grid = elements.platformGrid;
  grid.innerHTML = '';

  Object.values(AI_PLATFORMS).forEach(platform => {
    const item = document.createElement('div');
    item.className = 'platform-item';
    item.dataset.id = platform.id;
    item.innerHTML = `
      <span class="platform-icon">${platform.icon}</span>
      <span class="platform-name">${platform.name}</span>
    `;
    grid.appendChild(item);
  });
}

/**
 * 绑定事件
 */
function bindEvents() {
  // 文本输入
  elements.queryInput.addEventListener('input', (e) => {
    state.query = e.target.value;
    updateUI();
  });

  // 平台选择
  elements.platformGrid.addEventListener('click', (e) => {
    const item = e.target.closest('.platform-item');
    if (!item) return;

    const id = item.dataset.id;
    if (state.selectedPlatforms.has(id)) {
      state.selectedPlatforms.delete(id);
    } else {
      state.selectedPlatforms.add(id);
    }

    saveSelection();
    updateUI();
  });

  // 发送按钮
  elements.sendBtn.addEventListener('click', handleSend);
}

/**
 * 更新 UI 状态
 */
function updateUI() {
  const hasInput = state.query.trim();
  const selectedCount = state.selectedPlatforms.size;

  // 更新平台状态
  document.querySelectorAll('.platform-item').forEach(item => {
    const id = item.dataset.id;
    item.classList.toggle('selected', state.selectedPlatforms.has(id));
  });

  // 更新按钮状态
  elements.sendBtn.disabled = !hasInput || selectedCount === 0;
}

/**
 * 构建 URL
 */
function buildUrl(platformId, query) {
  const platform = AI_PLATFORMS[platformId];
  let url = platform.url;

  // 如果平台支持原生查询参数
  if (platform.queryParam && query) {
    url = `${platform.url}?${platform.queryParam}=${encodeURIComponent(query)}`;
  }

  // 对于 AI 平台，添加自定义参数供 content script 使用
  if (!platform.queryParam && query) {
    const separator = url.includes('?') ? '&' : '?';
    url = `${url}${separator}syncmaster_query=${encodeURIComponent(query)}`;
  }

  return url;
}

/**
 * 获取屏幕尺寸
 */
function getScreenInfo() {
  return {
    width: window.screen.width,
    height: window.screen.height,
    availLeft: window.screen.availLeft || 0,
    availTop: window.screen.availTop || 0,
  };
}

/**
 * 处理发送 - 单屏模式 (N=1)
 */
async function handleSingleMode(platformId, query) {
  const url = buildUrl(platformId, query);
  await chrome.tabs.create({ url });
}

/**
 * 处理发送 - 分屏模式 (N=2,3)
 * 每个平台一个独立窗口
 */
async function handleSplitMode(platformIds, query, count) {
  const screen = getScreenInfo();
  const winWidth = Math.floor(screen.width / count);
  const urls = platformIds.map(id => buildUrl(id, query));

  // 为每个平台创建独立窗口
  for (let i = 0; i < urls.length; i++) {
    const left = screen.availLeft + Math.floor(i * winWidth);
    const focused = i === 0; // 第一个窗口聚焦
    const win = await chrome.windows.create({
      url: urls[i],
      left: left,
      top: screen.availTop,
      width: winWidth,
      height: screen.height,
      focused: focused,
      type: 'normal',
    });

    // 强制设置窗口位置
    if (win && win.id) {
      await chrome.windows.update(win.id, {
        left: left,
        top: screen.availTop,
        width: winWidth,
        height: screen.height,
        state: 'normal'
      });
    }

    await new Promise(r => setTimeout(r, 100));
  }
}

/**
 * 处理发送 - 扩展模式 (N>3)
 * 固定 3 个窗口，每个窗口用 Tab 承载多个目标
 */
async function handleExtendedMode(platformIds, query) {
  const screen = getScreenInfo();
  const windowCount = 3;
  const winWidth = Math.floor(screen.width / windowCount);

  // 按顺序分配到 3 个窗口
  const windowGroups = [[], [], []];
  platformIds.forEach((id, index) => {
    windowGroups[index % windowCount].push(buildUrl(id, query));
  });

  // 创建 3 个窗口
  for (let i = 0; i < windowCount; i++) {
    const urls = windowGroups[i];
    if (urls.length === 0) continue;

    const left = screen.availLeft + Math.floor(i * winWidth);

    const win = await chrome.windows.create({
      url: urls[0],
      left: left,
      top: screen.availTop,
      width: winWidth,
      height: screen.height,
      focused: i === 0,
      type: 'normal',
    });

    // 强制设置窗口位置
    if (win && win.id) {
      await chrome.windows.update(win.id, {
        left: left,
        top: screen.availTop,
        width: winWidth,
        height: screen.height,
        state: 'normal'
      });

      // 在窗口中打开其他 URL（作为 Tab）
      for (let j = 1; j < urls.length; j++) {
        await chrome.tabs.create({ windowId: win.id, url: urls[j], active: false });
      }
    }

    await new Promise(r => setTimeout(r, 100));
  }
}

/**
 * 处理发送
 */
async function handleSend() {
  const platformIds = Array.from(state.selectedPlatforms);
  if (platformIds.length === 0) return;

  const query = state.query.trim();
  if (!query) return;

  const count = platformIds.length;

  try {
    if (count === 1) {
      await handleSingleMode(platformIds[0], query);
    } else if (count === 2 || count === 3) {
      await handleSplitMode(platformIds, query, count);
    } else {
      await handleExtendedMode(platformIds, query);
    }
  } catch (err) {
    console.error('[SyncMaster] 发送失败:', err);
    alert('打开窗口失败，请确保允许插件管理弹出窗口');
  }
}

/**
 * 保存选择到 storage
 */
function saveSelection() {
  chrome.storage.local.set({
    selectedPlatforms: Array.from(state.selectedPlatforms),
  });
}

/**
 * 从 storage 恢复选择
 */
function restoreSelection() {
  chrome.storage.local.get(['selectedPlatforms'], (result) => {
    if (result.selectedPlatforms) {
      state.selectedPlatforms = new Set(result.selectedPlatforms);
      updateUI();
    }
  });
}

// 启动
document.addEventListener('DOMContentLoaded', init);
