/**
 * 轻量 i18n：自建字典 + 设置项 lang（'auto' | 'zh' | 'en'）。
 * 说明：Chrome 原生 chrome.i18n 只能跟随浏览器语言、无法运行时切换，
 * 所以界面文案用这份字典，点击插件图标即可切换中英文。
 */
export const LANGS = ['zh', 'en'];

/** 偏好 → 实际语言（auto 时按浏览器语言判断，默认中文） */
export function resolveLang(pref) {
  if (pref === 'zh' || pref === 'en') return pref;
  const nl = (typeof navigator !== 'undefined' && (navigator.language || '')) || 'zh';
  return String(nl).toLowerCase().startsWith('zh') ? 'zh' : 'en';
}

const zh = {
  'common.close': '关闭',
  'common.upload': '上传',
  'common.default': '默认',
  'common.untitled': '未命名',
  'common.addService': '＋ 添加服务',
  'common.restoreDefaults': '恢复默认',
  'common.imageFailed': '图片读取失败，请换一张图片重试。',
  'common.gifTooLarge': 'GIF 超过 1.5MB，请压缩后再上传。',

  'popup.lang': '语言',
  'popup.lang.auto': '自动',
  'popup.siteToggle': '在此网站显示悬浮球',
  'popup.ballIcon': '悬浮球图标',
  'popup.snap': '拖到屏幕边缘时自动吸附',
  'popup.openPanel': '打开 AI 侧边栏',
  'popup.manage': '管理 AI 服务 →',
  'popup.unsupported': '当前页面不支持注入悬浮球（仅支持 http/https 页面）。',
  'popup.github': 'GitHub 仓库（AI-Dazi）',
  'popup.openFailed': '打开侧边栏失败：',

  'options.title': 'AI 搭子 · 服务管理',
  'options.closeTitle': '关闭设置页面',
  'options.tip':
    '侧栏中展示的 AI 服务。可修改名称与网址、调整徽标颜色、增删服务；拖动行首 ⠿ 或聚焦它后按 Alt+↑/↓ 可调整展示顺序。改动自动保存，所有已打开页面即时生效。',
  'options.ballSection': '悬浮球',
  'options.uploadImage': '上传图片',
  'options.restoreIcon': '恢复默认图标',
  'options.iconHint': '支持 PNG / JPG / WebP / GIF；GIF 保留动画（≤ 1.5MB），显示时按中心裁切铺满圆形（超出部分不显示），其它格式会裁为 128×128。',
  'options.snap': '拖到屏幕边缘时自动吸附',
  'options.snapHint': '拖到屏幕边缘时自动吸附（距边缘 70px 内松手即变贴边小把手）',
  'options.panelSideNote':
    '注：首次安装时悬浮球停在右下角约 100px 处（不吸附）；拖到屏幕边缘 70px 内松手才会变成贴边小把手。侧栏在左还是右由 Chrome 设置决定（设置 → 外观 → 侧边栏），扩展只能读取、不能按次指定。',
  'options.hideOnServiceSites': '在 AI 服务自己的页面上隐藏悬浮球',
  'options.empty': '暂无服务，点击下方「添加服务」或「恢复默认」。',
  'options.badHint': '存在无法解析的网址（红框行），这些行暂未保存；修正或删除后自动保存。',
  'options.confirmReset': '恢复默认服务列表？当前的自定义修改将被覆盖。',
  'options.note':
    '注：个别站点因登录流程或安全策略无法在面板内完整使用（例如 Google 账号登录流程），此时可用侧栏右上角 ↗ 在新标签页打开；站点本身的限制无法由扩展绕过。',
  'options.rowName': '名称',
  'options.rowColor': '徽标颜色',
  'options.rowDelete': '删除',
  'options.dragHandle': '拖动排序（或 Alt+↑/↓ 移动）',

  'panel.reload': '重新加载当前服务',
  'panel.openTab': '在新标签页打开当前服务',
  'panel.manage': '管理 AI 服务',
  'panel.tabTitle': '{name}（按住拖动可排序）',
  'panel.emptyPrefix': '暂无 AI 服务，',
  'panel.emptyAction': '去选项页添加',
  'panel.emptySuffix': '。',

  'ball.title': 'AI 搭子（点击打开侧栏，拖动可移动；靠近边缘松手会吸附）',
  'ball.aria': 'AI 搭子：点击打开侧边栏，拖动可移动',
  'ball.openFailed': '未能打开侧边栏，请点击工具栏图标打开',
  'ball.panelSide': '侧栏固定在{side}侧打开（Chrome 设置 → 外观 → 侧边栏 可修改）',
  'ball.sideLeft': '左',
  'ball.sideRight': '右',
};

const en = {
  'common.close': 'Close',
  'common.upload': 'Upload',
  'common.default': 'Default',
  'common.untitled': 'Untitled',
  'common.addService': '+ Add service',
  'common.restoreDefaults': 'Restore defaults',
  'common.imageFailed': "Couldn't read the image. Try a different one.",
  'common.gifTooLarge': 'GIF is larger than 1.5MB. Please compress it first.',

  'popup.lang': 'Language',
  'popup.lang.auto': 'Auto',
  'popup.siteToggle': 'Show the floating ball on this site',
  'popup.ballIcon': 'Floating ball icon',
  'popup.snap': 'Auto-snap near screen edges',
  'popup.openPanel': 'Open AI side panel',
  'popup.manage': 'Manage AI services →',
  'popup.unsupported': "This page doesn't support the floating ball (http/https pages only).",
  'popup.github': 'GitHub repository (AI-Dazi)',
  'popup.openFailed': 'Failed to open the side panel: ',

  'options.title': 'Dazi · Services',
  'options.closeTitle': 'Close settings',
  'options.tip':
    'AI services shown in the side panel. Edit names and URLs, change badge colors, add or remove services. Drag the ⠿ handle (or focus it and press Alt+↑/↓) to reorder. Changes save automatically and apply everywhere.',
  'options.ballSection': 'Floating ball',
  'options.uploadImage': 'Upload image',
  'options.restoreIcon': 'Restore default icon',
  'options.iconHint': 'PNG / JPG / WebP / GIF are supported. GIFs keep their animation (≤ 1.5MB) and are center-cropped to fill the circle; other formats are cropped to 128×128.',
  'options.snap': 'Auto-snap near screen edges',
  'options.snapHint': 'Auto-snap near screen edges (release within 70px to dock as a small handle)',
  'options.panelSideNote':
    "Note: on first install the ball sits about 100px from the bottom-right corner (not docked); it only docks when you release within 70px of a screen edge. Which side the panel appears on is a Chrome setting (Settings → Appearance → Side panel); extensions can read it but can't choose it.",
  'options.hideOnServiceSites': 'Hide the floating ball on AI service pages',
  'options.empty': 'No services yet. Use “Add service” or “Restore defaults” below.',
  'options.badHint': "Some URLs can't be parsed (red rows); those rows aren't saved yet. Fix or delete them to save.",
  'options.confirmReset': 'Restore the default service list? Your custom changes will be overwritten.',
  'options.note':
    "Note: some sites can't be used fully inside the panel because of their login flow or security policy (e.g. Google sign-in). Use ↗ in the panel to open them in a new tab; the extension can't bypass site restrictions.",
  'options.rowName': 'Name',
  'options.rowColor': 'Badge color',
  'options.rowDelete': 'Delete',
  'options.dragHandle': 'Drag to reorder (or Alt+↑/↓)',

  'panel.reload': 'Reload current service',
  'panel.openTab': 'Open current service in a new tab',
  'panel.manage': 'Manage AI services',
  'panel.tabTitle': '{name} (drag to reorder)',
  'panel.emptyPrefix': 'No AI services yet. ',
  'panel.emptyAction': 'Add services in Options',
  'panel.emptySuffix': '.',

  'ball.title': 'Dazi (click to open; drag to move; release near an edge to snap)',
  'ball.aria': 'Dazi: click to open the side panel, drag to move',
  'ball.openFailed': "Couldn't open the side panel. Try the toolbar icon.",
  'ball.panelSide': 'The side panel opens on the {side} (change in Chrome Settings → Appearance → Side panel)',
  'ball.sideLeft': 'left',
  'ball.sideRight': 'right',
};

const DICTS = { zh, en };

/** 取文案：缺键回退中文，支持 {var} 插值 */
export function t(lang, key, vars) {
  const dict = DICTS[lang] || zh;
  let s = dict[key] ?? zh[key] ?? key;
  if (vars) {
    for (const [k, v] of Object.entries(vars)) s = s.split(`{${k}}`).join(String(v));
  }
  return s;
}
