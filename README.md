<div align="center">

<img src="public/icon/128.png" width="96" height="96" alt="AI 搭子 · Dazi" />

# AI 搭子 · Dazi

**一枚悬浮球，随时唤起浏览器原生侧栏里的 AI 对话。**

ChatGPT、DeepSeek、Gemini、Claude……10 个 AI 服务共用一个常驻侧栏，
切换标签页、跳转新页面都不会重载，当前对话原样保留。

[![Manifest V3](https://img.shields.io/badge/manifest-v3-4f46e5)](https://developer.chrome.com/docs/extensions/develop/migrate)
[![Chrome](https://img.shields.io/badge/chrome-116%2B-4285F4?logo=googlechrome&logoColor=white)](https://www.google.com/chrome/)
[![WXT](https://img.shields.io/badge/built%20with-WXT-0ea5e9)](https://wxt.dev)
[![React](https://img.shields.io/badge/react-19-61DAFB?logo=react&logoColor=white)](https://react.dev)
[![Tailwind CSS](https://img.shields.io/badge/tailwind%20css-4-38BDF8?logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![License](https://img.shields.io/badge/license-MIT-22c55e)](LICENSE)

[功能](#功能特性) · [安装](#安装) · [使用](#使用) · [原理](#工作原理) · [开发](#本地开发) · [常见问题](#常见问题)

</div>

---

> ### ⭐ 喜欢这个项目？点个 Star 支持一下
>
> 如果 AI 搭子帮你省下了「切标签页找 AI」的时间，欢迎在 GitHub 上点一颗 **Star**——
> 它是最直接的鼓励，也能让更多需要它的人看到这个项目。
>
> [![Star this repo](https://img.shields.io/github/stars/WarnerHooh/AI-Dazi?style=for-the-badge&logo=github&label=Star%20this%20repo)](https://github.com/WarnerHooh/AI-Dazi)
> [![Fork this repo](https://img.shields.io/github/forks/WarnerHooh/AI-Dazi?style=for-the-badge&logo=github&label=Fork)](https://github.com/WarnerHooh/AI-Dazi/fork)
>
> 也欢迎 [提 Issue](https://github.com/WarnerHooh/AI-Dazi/issues) 反馈问题、[开 PR](https://github.com/WarnerHooh/AI-Dazi/pulls) 一起完善。

---

## 为什么做这个

在浏览器里用 AI，最常见的动作是：新开一个标签页 → 打开 AI 网站 → 问问题 → 回到原页面 → 一会儿又切回去。标签页越开越多，对话也散落各处。

侧边栏能解决「不离开当前页面」，但**页面内的侧边栏面板一刷新就没了**，对话跟着一起消失。AI 搭子基于 Chrome 原生 `sidePanel`：侧栏属于窗口而不是页面，**换标签、跳页面、前进后退都不会重载**；再配一枚随手可拖的悬浮球，让唤起 AI 的成本降到一次点击。

## 功能特性

| | 特性 | 说明 |
|---|---|---|
| 🟣 | **悬浮球启动器** | 任意网页常驻一枚小球：可自由拖动、松手靠边自动吸附（<70px）、吸附后收成 32×34 的贴边把手；侧栏打开时自动隐藏 |
| 🗂 | **原生侧栏常驻** | 每个窗口一个面板实例；访问过的 AI 服务保持挂载，切换标签页 / 跳转页面都不丢对话、草稿和滚动位置 |
| 🧩 | **10 个 AI 服务开箱即用** | ChatGPT、DeepSeek、Gemini、Claude、Kimi、豆包、通义千问、智谱清言、Grok、Perplexity，可自由增删、改名、换色、拖动排序 |
| 🖼 | **自定义图标** | 上传 PNG / JPG / WebP / **GIF（保留动画）**；显示时按中心裁切铺满圆形；内置默认图标 `ms.gif` |
| 🌐 | **中英双语** | 所有界面文案支持中文 / English，弹窗内即时切换，无需重装 |
| 🚫 | **按站点开关** | 当前站点一键隐藏悬浮球；AI 服务自己的页面默认不显示，避免遮挡 |
| 🔒 | **纯本地运行** | 无后端、无账号、无统计埋点；设置只存在 `chrome.storage.local` |

<div align="center">
<sub>侧栏结构示意</sub>

```
   ●  点击悬浮球
    └──→  浏览器原生侧栏（窗口级，不随页面刷新）
          ┌──────────────────────┐
          │  ● ● ●    ↺  ↗  ⚙   │  ← 服务徽标可拖动排序
          │    AI 对话页面        │  ← 切换标签页 / 跳转页面均不重载
          └──────────────────────┘
```
</div>

## 安装

### 方式一：下载安装包（推荐）

1. 打开 [Releases](https://github.com/WarnerHooh/AI-Dazi/releases)，下载最新的 `dazi-<version>-chrome.zip`；
2. 解压到任意固定目录（**不要删除**，Chrome 会从该目录加载）；
3. 地址栏打开 `chrome://extensions`，右上角开启「开发者模式」；
4. 点击「加载已解压的扩展程序」，选择解压后的目录。

> 首次安装后，悬浮球出现在页面右下角（距边缘约 100px，不吸附）；在任意网页刷新一次即可看到。

### 方式二：从源码构建

```bash
git clone https://github.com/WarnerHooh/AI-Dazi.git
cd AI-Dazi
npm install          # 安装依赖（postinstall 自动执行 wxt prepare）
npm run build        # 生产构建 → .output/chrome-mv3
```

然后在 `chrome://extensions` 中「加载已解压的扩展程序」，选择 `.output/chrome-mv3`。

## 使用

| 操作 | 效果 |
|---|---|
| 点击悬浮球 | 打开当前窗口的 AI 侧栏（已打开则聚焦） |
| 拖动悬浮球 | 任意位置移动；开启吸附时，靠近左右边缘 70px 内松手会贴边 |
| 拖动侧栏徽标 | 调整 AI 服务的顺序（会自动保存） |
| 弹窗（点扩展图标） | 语言切换、当前站点开关、图标上传、吸附开关、打开侧栏、GitHub 入口 |
| 设置页「管理 AI 服务」 | 增删服务、修改名称 / 网址 / 颜色、拖动或键盘排序 |

> 侧栏在左还是在右，由浏览器设置决定（`设置 → 外观 → 侧栏位置`），扩展只能读取、无法指定。当悬浮球所在侧与侧栏不一致时，点击会给出提示。

## 工作原理

```
┌─────────────────────────┐        ┌─────────────────────────────┐
│  任意网页（content）     │        │  侧边栏（sidepanel.html）     │
│  悬浮球 · closed Shadow │ 消息   │  iframe 池：访问过的服务常驻   │
│  DOM，不污染页面样式     │ ─────► │  非激活的仅隐藏、不卸载        │
└───────────┬─────────────┘        └──────────────┬──────────────┘
            │ chrome.runtime.sendMessage            │
            ▼                                       ▼
┌─────────────────────────────────────────────────────────────────┐
│  Service Worker（background.js）                                 │
│  · declarativeNetRequest：对已配置服务域名移除 X-Frame-Options /  │
│    CSP 响应头，使其可在 iframe 中嵌入（仅 sub_frame，仅白名单）    │
│  · 侧栏端口跟踪 → 广播「侧栏开/关」给所有页面 → 悬浮球显隐          │
│  · 安装/更新时向已打开的标签页注入悬浮球                           │
└─────────────────────────────────────────────────────────────────┘
```

几个关键取舍：

- **为什么用原生侧栏而不是页面内浮层**：页面内浮层随导航销毁，对话必然丢失；原生侧栏属于窗口，才能做到「换页面不重载」。
- **为什么 iframe 只隐藏不卸载**：卸载即丢状态。未激活的服务以 `visibility: hidden` 保活，且 DOM 顺序只追加、不重排，避免 iframe 重新加载。
- **为什么自己实现 i18n**：`chrome.i18n` 的语言在安装时按浏览器语言固定，无法运行时切换；因此用 `lib/i18n.js` + `lang` 设置实现即时切换。

## 项目结构

```
entrypoints/
  background.js        Service Worker：DNR 规则、注入、侧栏状态广播
  content.jsx          内容脚本：悬浮球（React + closed Shadow DOM）
  popup/               工具栏弹窗：语言、站点开关、图标、入口
  options/             设置页：服务管理、图标、吸附、语言
  sidepanel/           侧栏：服务切换 + iframe 保活
components/            FloatingBall / ServiceTabs / ServiceFrames / Switch …
hooks/                 useSettings / useI18n / useServiceFrames / usePointerReorder …
lib/                   defaults（默认服务与设置）、storage、i18n、image、icons
public/
  icon/                16 / 32 / 48 / 128 图标
  image/ms.gif         悬浮球默认图标
assets/tailwind.css    Tailwind CSS 4 入口
scripts/gen-icons.mjs  图标生成脚本
legacy/                历史版本实现（仅存档）
```

## 权限说明

| 权限 | 用途 |
|---|---|
| `sidePanel` | 打开并承载 AI 侧栏 |
| `storage` | 保存服务列表、悬浮球位置、语言等设置 |
| `declarativeNetRequest` | 对白名单域名移除 `X-Frame-Options` / CSP 响应头，使 AI 站点可被嵌入 |
| `scripting` + `activeTab` | 安装/更新后向已打开页面注入悬浮球；读取当前标签页地址用于站点开关 |
| 主机权限 `<all_urls>` | 悬浮球需要出现在任意网页 |
| `web_accessible_resources` | 允许页面加载扩展内的默认图标 `image/ms.gif` |

**隐私**：项目不含任何后端与统计服务，所有数据留在本机 `chrome.storage.local`；网络请求只发生在你打开的 AI 站点自身。DNR 规则仅作用于「设置中已配置的服务域名」的 `sub_frame` 请求，不修改其它站点。

## 常见问题

<details>
<summary><b>为什么某些网站没有悬浮球？</b></summary>

`chrome://`、Chrome 应用商店等浏览器内置页面禁止注入脚本；本地文件页面需要在扩展详情里开启「允许访问文件网址」。AI 服务自己的页面默认隐藏（可在设置页关闭该行为）。
</details>

<details>
<summary><b>侧栏能在左侧吗？</b></summary>

位置由浏览器设置决定：`设置 → 外观 → 侧栏位置`。扩展只能通过 `sidePanel.getLayout()`（Chrome 140+）读取，无法按调用指定。
</details>

<details>
<summary><b>为什么某个 AI 站点在侧栏里显示空白或无法登录？</b></summary>

侧栏内是 iframe，部分站点依赖第三方 Cookie 或额外的 `frame-ancestors` 限制。可尝试：在 Chrome 设置中允许该站点的第三方 Cookie；或在设置页把该服务换成可嵌入的镜像/入口地址。若仍不可用，属于站点策略限制。
</details>

<details>
<summary><b>自定义 GIF 有大小限制吗？</b></summary>

上限 1.5MB。GIF 以原图 data URL 存储以保留动画，静态图会被裁成 128×128 PNG。GIF 越大，每个页面加载时传给内容脚本的数据越多，建议控制在 500KB 以内。
</details>

<details>
<summary><b>侧栏开久了内存占用高？</b></summary>

访问过的服务都会保活（每个都是完整的 Web 应用）。点侧栏的 ↺ 可重载当前服务释放状态，关闭侧栏则全部卸载。
</details>

<details>
<summary><b>会收集我的对话内容吗？</b></summary>

不会。扩展不读取 iframe 内容，也不上报任何数据；对话只存在于你与对应 AI 服务之间。
</details>

## Roadmap



## 本地开发

```bash
npm install      # 安装依赖
npm run dev      # 开发模式：自动拉起带插件的 Chrome，改代码热更新
npm run build    # 生产构建 → .output/chrome-mv3
npm run zip      # 打包 → .output/dazi-<version>-chrome.zip
npm run icons    # 生成渐变占位图标（⚠️ 会覆盖 public/icon/*，正式图标由 assets/logo-source.jpg 导出）
```

技术栈：**WXT** + **React 19** + **Tailwind CSS 4**（Manifest V3，Chrome 116+）。
修改代码后请至少执行一次 `npm run build`，确认构建与类型检查通过再提交 PR。

## 贡献

1. 如果你有什么想法或建议，欢迎 [提 Issue](https://github.com/WarnerHooh/AI-Dazi/issues)
2. Fork 本仓库并从 `main` 切出分支：`feat/xxx`、`fix/xxx`；
3. 保持现有代码风格（中文注释、组件按职责拆分、样式走 Tailwind）；
4. 提交前跑 `npm run build`；
5. 发起 PR，说明动机、改动点与验证方式（附截图更佳）。

发现问题请先搜一下 [Issues](https://github.com/WarnerHooh/AI-Dazi/issues)，避免重复。

## License

[MIT](LICENSE) © [WarnerHooh](https://github.com/WarnerHooh)


<div align="center">
<sub>如果这个项目帮到了你，别忘了回顶部点个 ⭐ Star</sub>
</div>
