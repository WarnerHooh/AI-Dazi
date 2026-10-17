import { defineConfig } from 'wxt';
import tailwindcss from '@tailwindcss/vite';

/**
 * WXT 配置：清单字段在这里声明，入口页面/脚本由 entrypoints/ 目录自动发现。
 * - React 19 + Tailwind CSS 4（Vite 插件）
 * - 悬浮球启动器：entrypoints/content.jsx
 * - 后台（DNR 嵌入规则、安装注入、侧栏状态跟踪）：entrypoints/background.js
 * - 弹窗 / 选项页 / 侧边栏：entrypoints/{popup,options,sidepanel}/index.html
 */
export default defineConfig({
  modules: ['@wxt-dev/module-react'],
  vite: () => ({
    plugins: [tailwindcss()],
  }),
  manifestVersion: 3,
  manifest: {
    name: 'AI 搭子',
    description:
      'AI 搭子：点击悬浮球即可在浏览器原生侧栏中使用 ChatGPT / DeepSeek / Gemini 等 AI 对话：跨标签页、跨页面保持会话；侧栏打开时悬浮球自动隐藏。',
    minimum_chrome_version: '116',
    permissions: ['storage', 'declarativeNetRequest', 'scripting', 'activeTab', 'sidePanel'],
    host_permissions: ['<all_urls>'],
    icons: {
      16: 'icon/16.png',
      32: 'icon/32.png',
      48: 'icon/48.png',
      128: 'icon/128.png',
    },
    action: {
      default_title: 'AI 搭子',
      default_icon: {
        16: 'icon/16.png',
        32: 'icon/32.png',
        48: 'icon/48.png',
        128: 'icon/128.png',
      },
    },
    side_panel: { default_path: 'sidepanel.html' },
    options_ui: { page: 'options.html', open_in_tab: true },
    // 页面内的悬浮球需要用扩展内的默认图标（GIF），需声明为网页可访问资源
    web_accessible_resources: [{ resources: ['image/ms.gif'], matches: ['<all_urls>'] }],
  },
  hooks: {
    // WXT 默认将选项页嵌在扩展管理页中，这里改为整页打开（与页面布局一致）
    'build:manifestGenerated': (_wxt, manifest) => {
      if (manifest.options_ui) manifest.options_ui.open_in_tab = true;
    },
  },
});
