# AI SyncMaster 开发日志

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

## 2025-01-17 | 模块一扩展：文件上传功能

### 开发目标
实现文件上传到各 AI 平台（图片/文档）

### 开发计划
1. [x] 研究各平台文件上传 DOM 结构
2. [x] 实现文件上传功能
3. [ ] 自测

### 研究发现

**各平台文件输入选择器：**
- **ChatGPT**: `input[type="file"]:not(#upload-camera)` - 有多个 file input
- **Gemini**: `input[type="file"][name="Filedata"]` - 支持多文件，无类型限制
- **Grok**: `input[type="file"].hidden[multiple]` - 隐藏的多文件 input
- **Claude/Perplexity**: `input[type="file"]` - 标准 file input

**技术要点：**
- 可使用 DataTransfer API 程序化设置文件
- 需要 chrome.storage.local 在 popup 和 content script 间传递文件数据
- 各平台 file input 都是隐藏的，需要通过 JavaScript 触发

### 实现方案
1. **background.js**: 新增 Service Worker，处理 popup 与 content script 间的消息传递
2. **popup.js**: 将文件转为 base64，通过 background 发送给对应 tab
3. **content.js**: 接收文件数据，转回 File 对象，使用 DataTransfer API 注入到 file input

### 更新记录

#### v0.1.0 - 基础框架搭建
- **状态**: 待测试
- **更新内容**:
  - 创建 manifest.json（Manifest V3）
  - 创建 popup.html/css/js 基础 UI
  - 实现 6 个平台配置（ChatGPT、Claude、Gemini、Google、Perplexity、Grok）
  - 实现文件上传（拖拽+点击）
  - 实现平台能力检测（根据文件类型自动禁用不支持的平台）
  - 实现多 tab 打开功能
  - 实现平台选择记忆（chrome.storage）
- **文件列表**:
  - manifest.json - 扩展配置
  - popup.html - 弹窗 HTML
  - popup.css - 样式
  - popup.js - 主逻辑
  - platforms.js - 平台配置
  - icons/*.png - 图标
- **遇到的问题**:
  - （待自测后填写）
- **下一步**:
  - 在 Chrome 中加载扩展进行测试
  - 验证各平台 URL 是否正确打开
  - 验证文件类型检测是否生效

---

## 待开发模块

- [ ] 模块二：智能分屏
- [ ] 模块三：新标签页替换
