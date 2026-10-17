import { defineBackground } from 'wxt/utils/define-background';
import { DEFAULT_SERVICES, DEFAULT_SETTINGS } from '@/lib/defaults.js';

/**
 * AI 搭子 - 后台入口（WXT）
 *
 * 1. 初始化/补全默认配置（chrome.storage.local）
 * 2. 维护 declarativeNetRequest 动态规则（移除嵌入限制，使 AI 站点可进侧栏）
 * 3. 安装/更新时向已打开的标签页注入内容脚本（WXT 产物路径）
 * 4. 消息：读取配置 / 恢复默认服务 / 打开侧边栏
 * 5. 跟踪侧边栏打开状态（长连接），向各标签页广播
 */
export default defineBackground(() => {
  /**
   * AI 搭子 - background service worker
   *
   * 职责：
   * 1. 初始化/补全默认配置（chrome.storage.local）
   * 2. 维护 declarativeNetRequest 动态规则：仅针对「已配置的 AI 服务域名 + sub_frame 请求」
   *    移除 X-Frame-Options / Content-Security-Policy 响应头，使这些站点可被嵌入侧栏 iframe。
   *    不影响这些站点在标签页中正常打开，也不会作用于任何其他域名。
   * 3. 安装/更新时把内容脚本注入已打开的标签页（内容脚本默认不注入安装前已存在的页面）
   * 4. 消息：读取配置 / 恢复默认服务列表
   * 5. 跟踪侧边栏的打开状态（侧栏页面长连接），向各标签页广播，供悬浮球自动隐藏/恢复
   */
  'use strict';

  // 默认服务与设置定义在 @/lib/defaults.js（与 React 界面共用同一份数据）
  const SETTINGS_KEYS = Object.keys(DEFAULT_SETTINGS);

  /** 读取配置；缺失的键写回默认值 */
  async function ensureSettings() {
    const cur = await chrome.storage.local.get(SETTINGS_KEYS);
    const patch = {};
    for (const k of SETTINGS_KEYS) {
      if (cur[k] === undefined) patch[k] = DEFAULT_SETTINGS[k];
    }
    if (Object.keys(patch).length) await chrome.storage.local.set(patch);
    return { ...DEFAULT_SETTINGS, ...cur, ...patch };
  }

  const hostOf = (u) => {
    try {
      return new URL(u).hostname.replace(/^www\./, '');
    } catch {
      return '';
    }
  };

  /* ================= 侧栏打开状态跟踪 =================
   * 侧栏页面加载时建立长连接并上报所在窗口与可见性；面板关闭（页面销毁 / 连接断开）
   * 或不可见时更新状态。据此：侧栏打开期间在对应窗口隐藏网页里的悬浮球，关闭后恢复。
   */
  const panelPorts = new Map();   // key: windowId | 'unknown' -> Set<Port>
  const panelVisible = new Map(); // Port -> boolean（面板文档是否可见）

  function isKeyOpen(key) {
    const set = panelPorts.get(key);
    if (!set) return false;
    for (const p of set) if (panelVisible.get(p) !== false) return true;
    return false;
  }

  function isPanelOpenForWindow(windowId) {
    if (windowId != null && isKeyOpen(windowId)) return true;
    return isKeyOpen('unknown'); // 无法确定窗口时的全局兜底
  }

  function isPanelOpenForSender(sender) {
    const wid = sender && sender.tab ? sender.tab.windowId : undefined;
    return isPanelOpenForWindow(wid);
  }

  async function broadcastPanelState() {
    try {
      const tabs = await chrome.tabs.query({});
      for (const tab of tabs) {
        if (tab.id == null) continue;
        chrome.tabs
          .sendMessage(tab.id, { type: 'sidepanel-state', open: isPanelOpenForWindow(tab.windowId) })
          .catch(() => {}); // 未注入内容脚本的标签页忽略
      }
    } catch {
      /* 忽略 */
    }
  }

  chrome.runtime.onConnect.addListener((port) => {
    if (port.name !== 'sidepanel') return;

    let key = 'unknown';
    let attached = false;
    const timer = setTimeout(() => attach(), 400); // 面板未上报窗口时按“未知窗口”兜底

    function attach() {
      clearTimeout(timer);
      if (!panelPorts.has(key)) panelPorts.set(key, new Set());
      panelPorts.get(key).add(port);
      attached = true;
      broadcastPanelState();
    }

    function moveTo(newKey) {
      const oldSet = panelPorts.get(key);
      if (oldSet) {
        oldSet.delete(port);
        if (!oldSet.size) panelPorts.delete(key);
      }
      key = newKey;
      if (!panelPorts.has(key)) panelPorts.set(key, new Set());
      panelPorts.get(key).add(port);
      broadcastPanelState();
    }

    port.onMessage.addListener((msg) => {
      if (!msg || typeof msg.type !== 'string') return;
      if (msg.type === 'panel-window' && Number.isInteger(msg.windowId)) {
        if (attached) moveTo(msg.windowId);
        else {
          key = msg.windowId;
          attach();
        }
      } else if (msg.type === 'panel-visible') {
        panelVisible.set(port, !!msg.visible);
        if (attached) broadcastPanelState();
      }
    });

    port.onDisconnect.addListener(() => {
      clearTimeout(timer);
      panelVisible.delete(port);
      const set = panelPorts.get(key);
      if (set && set.has(port)) {
        set.delete(port);
        if (!set.size) panelPorts.delete(key);
        broadcastPanelState();
      }
    });
  });

  /**
   * 同步 declarativeNetRequest 动态规则。
   * 规则范围刻意收窄：仅命中「服务列表中的域名」且 resourceTypes 为 sub_frame（即被嵌入的框架文档），
   * 不触碰其他请求，也不影响这些站点的顶层导航。
   */
  async function syncNetRules() {
    try {
      const { services } = await ensureSettings();
      const domains = [...new Set((services || []).map((s) => hostOf(s.url)).filter(Boolean))];
      const existing = await chrome.declarativeNetRequest.getDynamicRules();
      const addRules = domains.length
        ? [{
            id: 1,
            priority: 1,
            action: {
              type: 'modifyHeaders',
              responseHeaders: [
                { header: 'x-frame-options', operation: 'remove' },
                { header: 'content-security-policy', operation: 'remove' },
                { header: 'content-security-policy-report-only', operation: 'remove' },
              ],
            },
            condition: { requestDomains: domains, resourceTypes: ['sub_frame'] },
          }]
        : [];
      await chrome.declarativeNetRequest.updateDynamicRules({
        removeRuleIds: existing.map((r) => r.id),
        addRules,
      });
      console.log(`[AI 搭子] 嵌入规则已同步（${domains.length} 个域名）`);
    } catch (e) {
      console.warn('[AI 搭子] 同步嵌入规则失败：', e);
    }
  }

  /** 安装/更新后向已打开的标签页注入内容脚本（忽略浏览器内部页面等不可注入的标签） */
  async function injectIntoExistingTabs() {
    try {
      const tabs = await chrome.tabs.query({});
      let ok = 0;
      for (const tab of tabs) {
        if (tab.id == null || !tab.url || !/^https?:/i.test(tab.url)) continue;
        try {
          await chrome.scripting.executeScript({ target: { tabId: tab.id }, files: ['content-scripts/content.js'] });
          ok++;
        } catch {
          // 该标签页无法注入（如受保护页面），跳过
        }
      }
      console.log(`[AI 搭子] 已向 ${ok} 个已打开的标签页注入悬浮球`);
    } catch (e) {
      console.warn('[AI 搭子] 注入已打开标签页失败：', e);
    }
  }

  chrome.runtime.onInstalled.addListener(async () => {
    await ensureSettings();
    await syncNetRules();
    await injectIntoExistingTabs();
  });

  // 动态规则本身持久保存，这里做一次幂等同步兜底
  chrome.runtime.onStartup.addListener(() => {
    syncNetRules();
  });

  // 服务列表变化时重建嵌入规则（如用户在 options 增删服务）
  chrome.storage.onChanged.addListener((changes, area) => {
    if (area === 'local' && changes.services) syncNetRules();
  });

  chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
    if (!msg || typeof msg.type !== 'string') return false;
    if (msg.type === 'get-settings') {
      ensureSettings().then((s) => sendResponse({ ...s, panelOpen: isPanelOpenForSender(sender) }));
      return true; // 异步响应
    }
    if (msg.type === 'open-side-panel') {
      // 由浮球/弹窗中的用户手势触发；在发出消息的标签页所在窗口打开侧边栏。
      // 侧边栏每窗口一个实例，切换标签页、跳转页面都不会重载，会话状态原样保持。
      if (sender.tab && sender.tab.id != null) {
        chrome.sidePanel
          .open({ tabId: sender.tab.id })
          .then(() => sendResponse({ ok: true }))
          .catch((e) => sendResponse({ ok: false, error: String((e && e.message) || e) }));
      } else {
        sendResponse({ ok: false, error: 'no-tab' });
      }
      return true;
    }
    if (msg.type === 'reset-services') {
      chrome.storage.local.set({ services: DEFAULT_SERVICES }).then(() => sendResponse({ ok: true }));
      return true;
    }
    return false;
  });
});
