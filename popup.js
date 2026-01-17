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
 * 处理发送
 */
function handleSend() {
  const validPlatforms = Array.from(state.selectedPlatforms);
  if (validPlatforms.length === 0) return;

  const query = state.query.trim();
  if (!query) return;

  // 打开所有平台的标签页
  const urls = validPlatforms.map(id => buildUrl(id, query));
  urls.forEach(url => chrome.tabs.create({ url }));
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
