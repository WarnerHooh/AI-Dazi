import { DEFAULT_SETTINGS } from './defaults.js';

export const SETTINGS_KEYS = Object.keys(DEFAULT_SETTINGS);

/** 读取全部设置（缺失键回退默认值） */
export async function readSettings() {
  try {
    const cur = await chrome.storage.local.get(SETTINGS_KEYS);
    return { ...DEFAULT_SETTINGS, ...cur };
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
}

/** 写入设置（静默失败：扩展上下文失效等） */
export function writeSettings(patch) {
  try {
    return chrome.storage.local.set(patch);
  } catch {
    return Promise.resolve();
  }
}

/** 打开侧边栏（由后台在用户手势下调用 chrome.sidePanel.open） */
export async function openSidePanel() {
  try {
    return await chrome.runtime.sendMessage({ type: 'open-side-panel' });
  } catch {
    return null;
  }
}

/** 打开（或聚焦已打开的）选项页标签页：
 * 从侧栏/弹窗调用时也保证是独立标签页，可用页面内「关闭」或标签页自身关闭。
 */
export async function openOptionsPage() {
  const url = chrome.runtime.getURL('options.html');
  try {
    const tabs = await chrome.tabs.query({});
    const existing = tabs.find((t) => t.url && t.url.split('#')[0] === url);
    if (existing && existing.id != null) {
      await chrome.tabs.update(existing.id, { active: true });
      if (existing.windowId != null) await chrome.windows.update(existing.windowId, { focused: true });
      return;
    }
  } catch {
    /* 查询失败则直接新建 */
  }
  try {
    await chrome.tabs.create({ url });
  } catch {
    /* 忽略 */
  }
}

/** 关闭当前选项页：移除自身标签页，退化到 window.close() */
export async function closeOptionsPage() {
  try {
    const tab = await chrome.tabs.getCurrent();
    if (tab && tab.id != null) {
      await chrome.tabs.remove(tab.id);
      return;
    }
  } catch {
    /* 忽略 */
  }
  window.close();
}

/** 读取浏览器侧栏所在侧（Chrome 140+ 的 getLayout；不支持时返回 null）
 * 注：侧栏位置由浏览器设置决定，扩展只能读、不能指定。
 */
export async function getPanelSide() {
  try {
    const layout = await chrome.sidePanel?.getLayout?.();
    if (layout && (layout.side === 'left' || layout.side === 'right')) return layout.side;
  } catch {
    /* 忽略 */
  }
  return null;
}

/** 默认悬浮球图标（打包在扩展内的 GIF） */
export function defaultBallIcon() {
  try {
    return chrome.runtime.getURL('image/ms.gif');
  } catch {
    return '';
  }
}

/** 取主机名（去 www.），用于站点匹配 */
export const hostOf = (url) => {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return '';
  }
};

export const serviceById = (services, id) => (services || []).find((s) => s.id === id) || null;

/** 名称 → 徽标缩写：中文取首字，拉丁取前两位大写 */
export const abbrOf = (name) => {
  const n = (name || '').trim();
  if (!n) return 'AI';
  if (/[\u4e00-\u9fff]/.test(n)) return n[0];
  return n.replace(/[^a-zA-Z0-9]/g, '').slice(0, 2).toUpperCase() || 'AI';
};

/** 规范化网址：缺协议补 https://，非法返回空串 */
export const normUrl = (raw) => {
  let u = (raw || '').trim();
  if (!u) return '';
  if (!/^[a-z][a-z0-9+.-]*:/i.test(u)) u = 'https://' + u;
  try {
    const x = new URL(u);
    return /^https?:$/.test(x.protocol) ? x.href : '';
  } catch {
    return '';
  }
};

export const uid = () => 'svc-' + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
