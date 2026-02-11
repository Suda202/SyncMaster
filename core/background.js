/**
 * AI SyncMaster - Background Service Worker
 * 监听标签关闭事件，自动关闭由插件创建的空窗口
 */

chrome.tabs.onRemoved.addListener(async (tabId, removeInfo) => {
  // 窗口本身正在关闭，无需处理
  if (removeInfo.isWindowClosing) return;

  const windowId = removeInfo.windowId;

  try {
    const { syncmaster_window_ids: ids = [] } =
      await chrome.storage.local.get('syncmaster_window_ids');

    if (!ids.includes(windowId)) return;

    // 检查窗口剩余标签
    const tabs = await chrome.tabs.query({ windowId });
    const allBlank = tabs.every(
      (t) => !t.url || t.url === 'chrome://newtab/' || t.url === 'about:blank'
    );

    if (tabs.length === 0 || allBlank) {
      await chrome.windows.remove(windowId);
      // 从追踪列表中移除
      const updated = ids.filter((id) => id !== windowId);
      await chrome.storage.local.set({ syncmaster_window_ids: updated });
    }
  } catch {
    // 窗口可能已关闭，忽略
  }
});
