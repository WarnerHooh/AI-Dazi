/** 项目主页（弹窗 GitHub 入口使用） */
export const REPO_URL = 'https://github.com/WarnerHooh/AI-Dazi';

/** 默认内置的 AI 服务（选项页可增删改，存储于 chrome.storage.local.services） */
export const DEFAULT_SERVICES = [
  { id: 'chatgpt', name: 'ChatGPT', url: 'https://chatgpt.com/', color: '#10a37f', abbr: 'GPT' },
  { id: 'deepseek', name: 'DeepSeek', url: 'https://chat.deepseek.com/', color: '#4d6bfe', abbr: 'DS' },
  { id: 'gemini', name: 'Gemini', url: 'https://gemini.google.com/app', color: '#4285f4', abbr: 'GM' },
  { id: 'claude', name: 'Claude', url: 'https://claude.ai/', color: '#d97757', abbr: 'CL' },
  { id: 'kimi', name: 'Kimi', url: 'https://www.kimi.com/', color: '#7c5cff', abbr: 'K' },
  { id: 'doubao', name: '豆包', url: 'https://www.doubao.com/chat/', color: '#00a3ff', abbr: '豆' },
  { id: 'tongyi', name: '通义千问', url: 'https://www.tongyi.com/', color: '#6d5ae0', abbr: '通' },
  { id: 'chatglm', name: '智谱清言', url: 'https://chatglm.cn/', color: '#3b5bfd', abbr: '智' },
  { id: 'grok', name: 'Grok', url: 'https://grok.com/', color: '#1f2937', abbr: 'X' },
  { id: 'perplexity', name: 'Perplexity', url: 'https://www.perplexity.ai/', color: '#20808d', abbr: 'P' },
];

export const DEFAULT_SETTINGS = {
  services: DEFAULT_SERVICES,
  activeServiceId: 'chatgpt',
  disabledHosts: [], // 在这些主机名上不显示悬浮球
  hideOnServiceSites: true, // 在 AI 服务自己的页面上隐藏悬浮球
  /**
   * 悬浮球位置（归一化视口坐标，中心点）：
   * - null：首次安装/未设置 → 默认停在右下角约 100px 处（不吸附）
   * - dock：吸附边（'left' | 'right' | null），非空时贴边渲染为小号圆角把手
   * - x / y：0~1，自由位置用 x；y 在吸附与自由模式下都生效（窗口缩放自适应）
   */
  ballPos: null,
  ballSnap: true, // 拖动松手后是否自动吸附到最近的左右侧边
  ballIcon: null, // 自定义图标（data URL）；null 时用打包的默认图标 image/ms.gif
  lang: 'auto', // 界面语言：'auto' 跟随浏览器 | 'zh' 中文 | 'en' English
};
