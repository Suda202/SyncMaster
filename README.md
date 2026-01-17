# AI SyncMaster

Chrome 扩展 - 多平台 AI 同步查询工具

---

## 文件结构

```
SyncMaster/
├── core/                  # 核心文件（加载插件必须）
│   ├── manifest.json      # 扩展配置
│   ├── popup.html         # 弹窗页面
│   ├── popup.css          # 样式
│   ├── popup.js           # 主逻辑
│   ├── platforms.js       # 平台配置
│   └── content.js         # 自动填单脚本
├── icons/                 # 图标文件
│   ├── icon16.png
│   ├── icon48.png
│   └── icon128.png
├── docs/                  # 开发文档
│   ├── PRD.md             # 产品需求文档
│   ├── ARCHITECTURE.md    # 架构文档
│   └── DEVLOG.md          # 开发日志
└── README.md              # 本文件
```

**加载插件**：使用 `core/` 目录下的文件 + `icons/` 图标

---

## 功能特性

- **多平台同步**：同时向多个 AI 平台发起查询
- **智能分屏**：根据选中数量自动分屏
- **快捷键**：`Cmd+Shift+S` / `Ctrl+Shift+S`

## 支持平台

| 平台 | 文本 | 图片 | 文件 |
|------|------|------|------|
| ChatGPT | ✅ | ✅ | ✅ |
| Claude | ✅ | ✅ | ✅ |
| Gemini | ✅ | ✅ | ✅ |
| Google | ✅ | - | - |
| Perplexity | ✅ | ✅ | - |
| Grok | ✅ | ✅ | - |

## 安装方式

1. 打开 Chrome，访问 `chrome://extensions/`
2. 开启右上角「开发者模式」
3. 点击「加载已解压的扩展程序」
4. 选择本项目的 `core` 文件夹

---

## 快捷键

- **Mac**: `Cmd+Shift+S`
- **Windows/Linux**: `Ctrl+Shift+S`

---

Made with Neo-Brutalism
