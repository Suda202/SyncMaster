# AI SyncMaster 开发日志

---

## 2025-01-18 | v0.2.1 - Color scheme & UX

### 变更内容
1. [x] 配色方案改为 Coral + Indigo
2. [x] CSS 变量统一管理
3. [x] 输入框增大 (160px)
4. [x] 计数器移到 header 旁
5. [x] 按钮改 GO
6. [x] 发送按钮改绿色（视觉区分）

### 配色方案
- `--bg`: #FFE4E1 (珊瑚粉)
- `--primary`: #3B5BDB (靛蓝)
- `--accent`: #F5D547 (明黄)
- `--dark`: #1a1a2e (深色边框)

### 文件变更
- popup.css - 配色 + 布局调整
- popup.html - 计数器移位
- popup.js - 新增 header 行逻辑
- README.md - 新增项目说明

---

## 2025-01-18 | v0.2.0 - UI 改版 + 快捷键

### 开发目标
优化 UI 体验，新增快捷键支持

### 变更内容
1. [x] UI 全面改版为 Neo-Brutalist 风格
2. [x] 新增快捷键 Ctrl+Shift+S 打开 popup
3. [x] 平台图标改为自定义 SVG（Neo-Brutalist 风格）
4. [x] 新增扩展图标（Neo-Brutalist 风格）

### 设计风格 (Neo-Brutalism)
- 粗黑边框 (3-4px)
- 硬阴影 (无模糊)
- 高对比度配色
- 等宽字体 (Space Mono)
- 几何 SVG 图标

### 快捷键
- Windows/Linux: `Ctrl+Shift+S`
- macOS: `Command+Shift+S`

### 文件变更
- popup.css - 全新 Neo-Brutalist 样式
- platforms.js - SVG 图标替换 emoji
- manifest.json - 新增 commands 配置

---

## 2025-11-06 | 模块一：多平台同步发送

### 开发目标
实现同时发送文本+图片/文件到多个大模型

### 开发计划
1. [x] 创建开发日志文档
2. [x] 创建基础 Chrome 扩展框架（manifest.json + popup）
3. [x] 实现 UI：输入框 + 文件上传区 + 平台选择
4. [x] 实现平台能力检测（根据输入类型过滤平台）
5. [x] 实现多 tab 打开功能
6. [x] 自测（文本填充功能完成）

### 待优化
- Grok 光标位置在开头而非末尾

---

## 版本历史

| 版本 | 日期 | 主要变更 |
|------|------|----------|
| v0.2.1 | 2025-01-18 | Coral + Indigo 配色，计数器移到 header，按钮改 GO |
| v0.2.0 | 2025-01-18 | Neo-Brutalist UI + 快捷键 |
| - | 2025-11-06 | 基础框架搭建 |
