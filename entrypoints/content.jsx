import { defineContentScript } from 'wxt/utils/define-content-script';
import { createRoot } from 'react-dom/client';
import FloatingBall from '@/components/FloatingBall.jsx';
import { hostOf, readSettings } from '@/lib/storage.js';
import { resolveLang } from '@/lib/i18n.js';
import tailwindCss from '@/assets/tailwind.css?inline';

/**
 * AI 搭子 - 内容脚本入口（React）
 *
 * 页面启动器：在任意 http/https/file 页面注入悬浮球（默认右侧）。
 * - 点击悬浮球 → 打开浏览器原生侧栏（侧边栏），会话跨标签页/跨页面保持
 * - 侧栏打开期间自动隐藏悬浮球，关闭后自动恢复（按窗口生效，见后台广播）
 * - 页面内不渲染任何 AI 面板；UI 挂在 closed Shadow DOM 中，与页面样式完全隔离
 */
export default defineContentScript({
  matches: ['http://*/*', 'https://*/*', 'file://*/*'],
  async main() {
    const supported = location.protocol === 'file:' || /^https?:$/.test(location.protocol);
    if (!supported || !document.documentElement || !document.body) return;

    // 清理扩展更新后可能残留在页面上的旧实例
    for (const stale of document.querySelectorAll('[data-dazi-host]')) stale.remove();

    const host = document.createElement('div');
    host.setAttribute('data-dazi-host', '1');
    host.style.cssText = 'position:fixed;top:0;left:0;width:0;height:0;z-index:2147483647;';
    document.documentElement.appendChild(host);

    const shadow = host.attachShadow({ mode: 'closed' });

    // Tailwind 编译结果内联进 Shadow DOM（页面样式无法穿透，也不影响页面）
    const styleEl = document.createElement('style');
    styleEl.textContent = tailwindCss;
    shadow.appendChild(styleEl);

    const mount = document.createElement('div');
    mount.className = 'font-sans';
    shadow.appendChild(mount);

    const root = createRoot(mount);

    /** 当前页面是否应隐藏悬浮球（站点停用 / 位于 AI 服务页面自身） */
    const isHiddenHere = (settings) => {
      if ((settings.disabledHosts || []).includes(location.hostname)) return true;
      if (settings.hideOnServiceSites !== false) {
        const here = location.hostname.replace(/^www\./, '');
        return (settings.services || []).some((s) => hostOf(s.url) === here);
      }
      return false;
    };

    let current = null; // 最近一次设置
    let panelOpen = false; // 侧边栏是否已打开（后台按窗口广播）

    const apply = (settings) => {
      current = settings;
      const hidden = panelOpen || !settings.services?.length || isHiddenHere(settings);
      root.render(
        <FloatingBall
          ballPos={settings.ballPos}
          ballSnap={settings.ballSnap}
          ballIcon={settings.ballIcon}
          lang={resolveLang(settings.lang)}
          hidden={hidden}
        />,
      );
    };

    // 初始状态：向后台取设置（含“侧栏是否已打开”），失败则回退本地读取
    let initial = null;
    try {
      initial = await chrome.runtime.sendMessage({ type: 'get-settings' });
    } catch {
      initial = null;
    }
    if (initial && typeof initial.panelOpen === 'boolean') panelOpen = initial.panelOpen;
    apply(initial || (await readSettings()));

    // 侧栏打开/关闭：后台在该窗口的标签页间广播
    chrome.runtime.onMessage.addListener((msg) => {
      if (!msg || msg.type !== 'sidepanel-state') return;
      panelOpen = !!msg.open;
      if (current) apply(current);
    });

    // 设置变化（左右侧、站点开关、服务列表等）
    chrome.storage.onChanged.addListener(async (changes, area) => {
      if (area !== 'local') return;
      if (!['ballPos', 'ballSnap', 'ballIcon', 'lang', 'services', 'disabledHosts', 'hideOnServiceSites'].some((k) => k in changes)) return;
      apply(await readSettings());
    });
  },
});
