import { useEffect } from 'react';

/**
 * 向后台上报侧边栏的打开状态。
 *
 * 侧栏没有“是否打开”的官方查询 API，这里以长连接作为信号：
 * 连接存在 = 面板打开（网页里的悬浮球隐藏）；面板关闭（页面销毁 / 连接断开）
 * 后台即广播恢复。后台重启等原因断开时自动重连。
 */
export function usePanelStateReport() {
  useEffect(() => {
    let port = null;
    let closing = false;
    let retryTimer = 0;

    const connect = () => {
      if (closing) return;
      try {
        port = chrome.runtime.connect({ name: 'sidepanel' });
      } catch {
        port = null; // 扩展上下文已失效：放弃
        return;
      }
      const p = port;

      Promise.resolve()
        .then(() => chrome.windows.getCurrent())
        .then((w) => {
          if (w && Number.isInteger(w.id)) {
            try {
              p.postMessage({ type: 'panel-window', windowId: w.id });
            } catch {
              /* 忽略 */
            }
          }
        })
        .catch(() => {});

      p.onDisconnect.addListener(() => {
        port = null;
        if (closing) return;
        retryTimer = setTimeout(connect, 1500);
      });
    };

    const onVisibility = () => {
      if (!port) return;
      try {
        port.postMessage({ type: 'panel-visible', visible: document.visibilityState !== 'hidden' });
      } catch {
        /* 忽略 */
      }
    };

    const onPageHide = () => {
      closing = true;
    };

    connect();
    document.addEventListener('visibilitychange', onVisibility);
    window.addEventListener('pagehide', onPageHide);

    return () => {
      closing = true;
      clearTimeout(retryTimer);
      document.removeEventListener('visibilitychange', onVisibility);
      window.removeEventListener('pagehide', onPageHide);
      try {
        port?.disconnect();
      } catch {
        /* 忽略 */
      }
    };
  }, []);
}
