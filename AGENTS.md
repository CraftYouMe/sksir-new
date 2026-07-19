# Sksir New 开发约定

本文件是维护者和 AI 修改项目时的唯一技术说明。用户使用、收藏维护和常用命令见 `README.md`。

## 项目目标

这是一个静态个人导航与搜索起始页。按以下顺序取舍：

1. 首屏加载速度
2. 稳定性与兼容性
3. 移动端体验，尤其是 iPhone Safari
4. 不影响桌面布局
5. 轻量、自然的动画
6. 日常维护简单

不要引入 React、Vue、Vite、大型 UI 框架或不必要的依赖。优先做小范围 CSS/原生 JavaScript 修改。

## 修改流程

- 先查看 `git status` 和相关文件，保留用户已有修改。
- 所有文本按 UTF-8 读写，项目包含大量中文。
- 首选 `apply_patch` 做手工修改。
- 修改后运行：

```powershell
node scripts\check.js
git diff --check
```

- 正式功能改动需要同步版本：

```powershell
node scripts\update-version.js YYYY.MM.DD.N
```

该命令同步更新 `data/app-version.json` 和 `index.html` 页脚版本。不要只改其中一个。

## 关键文件

- `index.html`：页面结构、关键资源加载、早期性能模式和 iOS 高度初始化。
- `css/style.css`：全部基础、桌面、移动端和 iOS 样式。
- `js/main.js`：首屏流程、提示、导航交互、更新检测。
- `js/set.js`：Cookies、搜索、搜索建议、壁纸和设置。
- `data/sites.js`：收藏与分类的唯一数据源。
- `js/nav-render.js`：收藏卡片渲染。
- `js/status-dot.js`、`api/check.js`：按需状态检测。
- `scripts/check.js`：统一检查入口。

## 必须保持的架构

- 首屏目标约 0.5 秒。时间、搜索框、布局和壁纸优先；远程图标、访客信息、状态检测和更新检查不得阻塞首屏。
- `index.html` 的真实 stylesheet 链接保持在早期启动脚本之后；关键 CSS 和字体可继续 preload。
- 收藏数据和渲染在首屏后加载；状态检测资源仅在打开收藏时加载。
- 隐藏收藏面板按需渲染，远程图标延迟、分批加载。
- 移动端和 iOS 覆盖规则放在 `css/style.css` 末尾，并用媒体查询、`html.ios-safari` 或 `html.ios-standalone` 限定。
- 不要恢复已删除的 `css/mobile.css`、`css/animation.css`、`css/font.css`、`js/toast-loader.js` 或 `js/js.cookie.js`。
- 保留本地 MiSans UI 子集；不要换回约 3.9 MiB 的完整远程字体。字符检查由 `scripts/check.js` 完成。
- 保留页脚 `#app-version` 和它前面的 `.footer-separator`，更新检测依赖它们。
- `奖励` 分组只是前端隐藏，不是真正的安全隔离；未经用户确认不要移入公开分组。

## 搜索与移动端注意事项

- `.all-search` 的基础规则必须保留明确的 `translateY(0)` 和 transform 过渡，否则退出搜索态会跳动。
- 搜索态必须隐藏 placeholder。
- 搜索建议和分类指示器的高频布局更新继续通过 `requestAnimationFrame` 合帧。
- 搜索建议失败不能清空本地收藏结果；离线时不要请求百度联想。
- 输入框字号不得低于 16px，避免 iOS 自动缩放。
- 当前手机端将时间和搜索区域预先上移约 36–56px，以减少键盘聚焦造成的视觉视口平移。

### iOS 键盘：不要重复的方案

以下方案曾在真实 iPhone 上造成跳动、灰黑区域或搜索失效：

- 根据 `visualViewport.offsetTop` 反向移动整个 `section`。
- 聚焦后反复执行 `window.scrollTo(0, 0)`。
- 新增强制滚动锁来对抗键盘动画。
- 在 `touchstart` 提前切换搜索态。
- 把移动搜索框改成顶部 fixed 搜索栏。
- 在键盘动画期间持续写入中间态 `visualViewport.height`。

如仍需处理键盘问题，优先在真实设备采集聚焦前后 `innerHeight`、`scrollY`、`visualViewport.height/offsetTop`、活动元素和 standalone 状态，再做局部调整。不要猜测性变换整页。

## iOS 背景与安全区

- `index.html` 会写入 `--app-height`、`--ios-bg-height` 和 `--ios-standalone-bg-height`。
- `css/style.css` 使用 `html.ios-safari` / `html.ios-standalone` 规则覆盖地址栏和安全区。
- `js/set.js` 将壁纸同步到 `--ios-wallpaper-image` 作为同图兜底。
- 不要随意改变壁纸 `object-fit`、背景缩放、fixed 定位或安全区扩展。
- 设置按钮、Toast、访客信息和页脚需要继续尊重 safe-area inset。
- `sw.js` 仅用于注销历史 Service Worker 和清理旧 `nav-cache-*` 缓存，不得重新加入离线缓存或安装能力。

## 性能与安全边界

- 高配设备默认保留完整视觉效果，降级放在 `html.perf-lite` 或 `prefers-reduced-motion` 下。
- 不要仅根据 iOS 的 `hardwareConcurrency` 判断低性能。
- `/api/check` 只能检测 `data/sites.js` 中的域名，并必须继续拦截本地、内网和 metadata 地址。
- 当前不做复杂后台、严格 CSP、外部限流或认证，除非线上出现实际需求。

## 发布前检查

- `node scripts\check.js` 通过。
- `git diff --check` 通过。
- `data/app-version.json` 与 `index.html` 页脚版本一致。
- PC 首页、搜索、收藏和设置正常。
- iPhone Safari 检查搜索键盘、背景铺满和安全区。
- 安卓手机检查输入框、建议列表和分类横向滚动。
