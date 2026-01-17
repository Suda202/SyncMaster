# 技术架构文档: AI SyncMaster

**版本**: v1.0
**更新日期**: 2025-11-06

---

## 1. 技术栈

- **扩展框架**: Chrome Extension Manifest V3
- **前端**: HTML + CSS + Vanilla JavaScript（MVP 阶段保持简单）
- **API**: chrome.windows, chrome.tabs, chrome.storage

---

## 2. 项目结构

```
SyncMaster/
├── manifest.json          # 扩展配置文件
├── newtab.html            # 新标签页 UI
├── newtab.css             # 样式
├── newtab.js              # 主逻辑
├── background.js          # Service Worker（窗口管理）
├── icons/
│   ├── icon16.png
│   ├── icon48.png
│   └── icon128.png
└── PRD.md                 # 产品需求文档
```

---

## 3. 核心模块设计

### 3.1 manifest.json

```json
{
  "manifest_version": 3,
  "name": "AI SyncMaster",
  "version": "1.0.0",
  "description": "多模型 AI 同步查询与分屏对比工具",
  "permissions": [
    "storage"
  ],
  "chrome_url_overrides": {
    "newtab": "newtab.html"
  },
  "background": {
    "service_worker": "background.js"
  },
  "icons": {
    "16": "icons/icon16.png",
    "48": "icons/icon48.png",
    "128": "icons/icon128.png"
  }
}
```

### 3.2 支持的 AI 平台配置

```javascript
const AI_PLATFORMS = {
  chatgpt: {
    name: 'ChatGPT',
    url: 'https://chat.openai.com/',
    queryParam: null,  // 需要通过 content script 注入
    capabilities: {
      text: true,
      image: true,
      file: true,
    },
  },
  claude: {
    name: 'Claude',
    url: 'https://claude.ai/new',
    queryParam: null,
    capabilities: {
      text: true,
      image: true,
      file: true,
    },
  },
  gemini: {
    name: 'Gemini',
    url: 'https://gemini.google.com/app',
    queryParam: null,
    capabilities: {
      text: true,
      image: true,
      file: true,
    },
  },
  google: {
    name: 'Google',
    url: 'https://www.google.com/search',
    queryParam: 'q',  // 支持 URL 参数
    capabilities: {
      text: true,
      image: false,  // 仅支持文本搜索
      file: false,
    },
  },
  perplexity: {
    name: 'Perplexity',
    url: 'https://www.perplexity.ai/',
    queryParam: 'q',
    capabilities: {
      text: true,
      image: true,
      file: false,
    },
  },
  grok: {
    name: 'Grok',
    url: 'https://grok.com/',
    queryParam: null,
    capabilities: {
      text: true,
      image: true,
      file: false,
    },
  }
};
```

**平台能力说明：**
- Google 搜索仅支持文本，上传图片/文件时该选项会被禁用或提示
- 其他 AI 平台均支持图片上传
- 文件上传能力各平台不同，需根据实际测试调整

### 3.3 输入类型处理

```javascript
/**
 * 输入数据结构
 */
const userInput = {
  text: '',           // 文本内容
  images: [],         // 图片文件列表 (File[])
  files: [],          // 其他文件列表 (File[])
};

/**
 * 检查目标平台是否支持当前输入类型
 * @param {string} platformId - 平台 ID
 * @param {Object} input - 用户输入
 * @returns {Object} { supported: boolean, reason: string }
 */
function checkPlatformSupport(platformId, input) {
  const platform = AI_PLATFORMS[platformId];
  const hasImages = input.images.length > 0;
  const hasFiles = input.files.length > 0;

  if (hasImages && !platform.capabilities.image) {
    return {
      supported: false,
      reason: `${platform.name} 不支持图片上传`,
    };
  }

  if (hasFiles && !platform.capabilities.file) {
    return {
      supported: false,
      reason: `${platform.name} 不支持文件上传`,
    };
  }

  return { supported: true, reason: '' };
}

/**
 * 过滤出支持当前输入的平台
 * @param {Array} selectedPlatforms - 用户选中的平台
 * @param {Object} input - 用户输入
 * @returns {Object} { valid: [], invalid: [] }
 */
function filterSupportedPlatforms(selectedPlatforms, input) {
  const valid = [];
  const invalid = [];

  selectedPlatforms.forEach(platformId => {
    const check = checkPlatformSupport(platformId, input);
    if (check.supported) {
      valid.push(platformId);
    } else {
      invalid.push({ platformId, reason: check.reason });
    }
  });

  return { valid, invalid };
}
```

**UI 交互逻辑：**
- 当用户上传图片/文件时，实时检查已勾选的平台是否支持
- 不支持的平台显示警告图标，hover 显示原因
- 或者：不支持的平台自动取消勾选并提示用户

### 3.4 窗口布局算法

```javascript
/**
 * 计算窗口布局
 * @param {number} count - 目标数量
 * @returns {Array} 窗口配置数组
 */
function calculateWindowLayout(count) {
  const screenWidth = screen.availWidth;
  const screenHeight = screen.availHeight;
  const screenLeft = screen.availLeft || 0;
  const screenTop = screen.availTop || 0;

  // 窗口数量：最多 3 个
  const windowCount = Math.min(count, 3);
  const windowWidth = Math.floor(screenWidth / windowCount);

  const layouts = [];
  for (let i = 0; i < windowCount; i++) {
    layouts.push({
      left: screenLeft + (i * windowWidth),
      top: screenTop,
      width: windowWidth,
      height: screenHeight,
    });
  }

  return layouts;
}
```

### 3.5 目标分配算法（N > 3）

```javascript
/**
 * 将目标分配到窗口
 * @param {Array} targets - 选中的目标列表
 * @returns {Array} 每个窗口的目标数组
 */
function distributeTargets(targets) {
  const windowCount = Math.min(targets.length, 3);
  const windows = Array.from({ length: windowCount }, () => []);

  // 轮流分配
  targets.forEach((target, index) => {
    const windowIndex = index % windowCount;
    windows[windowIndex].push(target);
  });

  return windows;
}

// 示例：6 个目标
// 输入: ['chatgpt', 'claude', 'gemini', 'google', 'perplexity', 'grok']
// 输出: [
//   ['chatgpt', 'google'],      // 窗口 1
//   ['claude', 'perplexity'],   // 窗口 2
//   ['gemini', 'grok']          // 窗口 3
// ]
```

### 3.6 窗口创建流程

```javascript
/**
 * 创建分屏窗口
 * @param {Array} targets - 选中的目标
 * @param {string} query - 用户输入的内容
 */
async function createSplitWindows(targets, query) {
  const count = targets.length;

  // 单兵模式：直接在当前窗口开 tab
  if (count === 1) {
    const url = buildUrl(targets[0], query);
    chrome.tabs.create({ url });
    return;
  }

  // 分屏模式
  const layouts = calculateWindowLayout(count);
  const distribution = distributeTargets(targets);

  // 创建窗口
  for (let i = 0; i < layouts.length; i++) {
    const layout = layouts[i];
    const windowTargets = distribution[i];

    // 第一个 tab 的 URL
    const firstUrl = buildUrl(windowTargets[0], query);

    // 创建窗口
    const window = await chrome.windows.create({
      url: firstUrl,
      left: layout.left,
      top: layout.top,
      width: layout.width,
      height: layout.height,
      focused: i === 0,  // 只聚焦第一个窗口
    });

    // 如果该窗口有多个目标，创建额外的 tabs
    for (let j = 1; j < windowTargets.length; j++) {
      const url = buildUrl(windowTargets[j], query);
      await chrome.tabs.create({
        windowId: window.id,
        url: url,
        active: false,  // 不激活，保持第一个 tab 在前台
      });
    }
  }
}
```

---

## 4. 数据流

```
用户输入 → newtab.js 收集数据
                ↓
        发送消息到 background.js
                ↓
        background.js 计算布局
                ↓
        调用 chrome.windows.create()
                ↓
        创建窗口和 tabs
```

---

## 5. 关键 API 说明

### 5.1 chrome.windows.create()

```javascript
chrome.windows.create({
  url: string | string[],  // 要打开的 URL
  left: number,            // 窗口左边缘位置（像素）
  top: number,             // 窗口上边缘位置（像素）
  width: number,           // 窗口宽度（像素）
  height: number,          // 窗口高度（像素）
  focused: boolean,        // 是否聚焦
  type: 'normal',          // 窗口类型
});
```

### 5.2 屏幕尺寸获取

```javascript
screen.availWidth   // 可用屏幕宽度（排除任务栏）
screen.availHeight  // 可用屏幕高度（排除任务栏）
screen.availLeft    // 可用区域左边缘（多显示器场景）
screen.availTop     // 可用区域上边缘
```

---

## 6. 异常处理

### 6.1 弹窗拦截检测

```javascript
async function createWindowWithCheck(options) {
  try {
    const window = await chrome.windows.create(options);
    return window;
  } catch (error) {
    // 如果被拦截，提示用户
    showPopupBlockedWarning();
    return null;
  }
}
```

### 6.2 多显示器适配

使用 `screen.availLeft` 和 `screen.availTop` 确保窗口创建在当前显示器上。

---

## 7. MVP 开发顺序（按模块）

### 模块一：多平台同步发送（核心功能）

**目标**：实现同时发送文本+图片/文件到多个大模型

1. 创建基础 Chrome 扩展框架（manifest.json + popup）
2. 实现 UI：输入框 + 文件上传区 + 平台选择
3. 实现平台能力检测（根据输入类型过滤平台）
4. 实现多 tab 打开（先不管布局，只管能打开）
5. 测试各平台 URL 构建和打开

### 模块二：智能分屏

**目标**：自动计算屏幕布局，并排显示多个窗口

1. 实现窗口布局算法
2. 将 tabs 改为 windows
3. 实现 N>3 时的 tab 分配逻辑
4. 添加弹窗拦截检测

### 模块三：新标签页替换

**目标**：将插件设为 Chrome 默认新标签页

1. 修改 manifest.json 添加 chrome_url_overrides
2. 将 popup 页面迁移为 newtab 页面
3. 优化加载速度
4. UI 美化

---

## 8. 注意事项

1. **Manifest V3 限制**: Service Worker 是事件驱动的，不能保持持久连接
2. **权限最小化**: 只申请必要的权限（storage），不需要 tabs 权限因为 chrome.windows.create 自带创建 tab 能力
3. **内容注入**: 对于不支持 URL 参数的 AI 平台，后续可考虑 content script 注入输入内容
