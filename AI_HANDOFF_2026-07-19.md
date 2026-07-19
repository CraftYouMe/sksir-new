# AI 交接文档（2026-07-19）

## 先读这里

这是一个个人导航/搜索起始页，首屏速度、稳定性和 iPhone Safari 体验优先。

新对话开始后按顺序阅读：

1. `AI_PROJECT_BRIEF.md`
2. 本文档
3. 与任务相关的 `index.html`、`css/style.css`、`js/main.js`、`js/set.js`


## 当前工作区状态

- 当前对外版本：`2026.07.19.16`
- 当前 Git HEAD：`cc32067`，版本 `.15`
- `.16` 是尚未提交的工作区回退版本。
- 当前修改文件：
  - `css/style.css`
  - `data/app-version.json`
  - `index.html`
  - `js/set.js`
  - `sw.js`
- `node scripts\check.js` 已通过。
- `git diff --check` 已通过。

`.16` 的目的：撤销 `.12` 至 `.15` 对手机键盘/搜索交互的多轮尝试，恢复到 `.10` 的搜索行为，仅保留 `.11` 的设置按钮安全区修复。发布版本必须保持 `.16` 或继续递增，不能真的降回 `.10/.11`，否则已安装 `.15` 的设备不会识别为更新。

## 已实现且应保留的功能

### 搜索体验

- 本地书签搜索与百度网络联想合并。
- 本地书签结果优先显示。
- 空搜索框显示最近使用的 6 个书签。
- 最近记录只存 `localStorage`，不记录搜索词。
- 带锁分组不会进入本地搜索和最近使用。
- 输入域名、URL、IP 或 localhost 可直接打开。
- `Ctrl/Command + Enter` 可按网址打开。
- 快捷键：
  - `/` 聚焦搜索
  - `B` 打开/关闭书签
  - `,` 打开设置
  - `Alt + 1～4` 切换前四个搜索引擎

### 离线与建议状态

- 离线时显示轻量提示。
- 网络恢复后短暂提示。
- 离线时跳过百度联想请求。
- 联想有加载、离线、失败状态。
- 网络联想失败不会清空本地书签结果。

### PWA

- `manifest.webmanifest`
- `img/pwa-icon-192.png`
- `img/pwa-icon-512.png`
- Chromium `beforeinstallprompt` 安装入口。
- iOS Safari 添加到主屏幕提示。
- Service Worker 已缓存 manifest 和 PWA 图标。

### 已确认有效的安全区修复

- 欢迎 Toast 顶部使用 `safe-area-inset-top`。
- 访客计数顶部使用 `safe-area-inset-top`。
- iOS 桌面应用的设置按钮使用顶部/右侧安全区，避免与电量重叠。

## 当前仍未解决的问题

### 1. iOS 键盘会把整个页面大幅上推

设备至少包括 iPhone 15 Pro Max，主屏幕应用模式可复现。点击居中的搜索框后，键盘出现，时间、搜索框、建议列表和背景视觉位置会整体变化。关闭键盘后恢复。

用户明确不接受页面突然上移、下移、闪黑或首次/再次聚焦位置不一致。

### 2. 部分 iPhone 桌面应用背景底部曾露出灰色区域

iPhone 15 Pro Max 和 iPhone 11 报告过。用户反馈手动拖动页面后背景能铺满，说明 iOS 首次绘制的 fixed/viewport 高度可能偏小，交互触发重排后恢复。

当前保留的处理：

- `index.html` 中 `isIosStandaloneMode()`
- `setIosStandaloneBackgroundHeight()` 使用 `screen.width/screen.height` 写入 `--ios-standalone-bg-height`
- `css/style.css` 中 `html.ios-standalone` 背景规则
- `js/set.js` 中 `setIosWallpaperFallback()` 支持 `ios-standalone`

尚未得到用户明确确认是否已经彻底解决。

## 已失败、不要直接重复的方案

以下方案在真实 iPhone 上造成了更糟糕的跳动或交互失效，`.16` 已撤销：

1. 手机端把 `.onsearch .all-search` 强制改成 `translateY(0)`，同时固定时间位置。
2. 根据 `visualViewport.offsetTop` 给整个 `section` 做反向 `translate3d` 补偿。
3. 输入聚焦后多次执行 `window.scrollTo(0, 0)`。
4. 给 `html/body` 强制 `overflow: hidden` 以阻止键盘滚动。
5. 在 `touchstart` 阶段提前进入搜索态。
6. 把手机搜索框改成顶部 fixed 搜索栏。

这些尝试分别造成：

- 页面首次聚焦和再次聚焦位置不同。
- 顶部出现大块灰黑区域后又恢复。
- 页面向下挪再弹回。
- 搜索框无法正常打开。

不要把这些代码从提交 `5163245`、`5eb06cd`、`d64989f`、`cc32067` 重新拷回。

## 相关提交边界

- `3b94fce`：版本 `.10`，手机键盘实验之前的基线。
- `.11` 没有单独提交；其有效内容只有 `html.ios-standalone #menu` 安全区规则，后来混入 `5163245`。
- `5163245`：版本 `.12`，第一次手机搜索位移修改。
- `5eb06cd`：版本 `.13`，VisualViewport 反向补偿。
- `d64989f`：版本 `.14`，滚动归零/锁定。
- `cc32067`：版本 `.15`，顶部 fixed 搜索态，导致搜索框最终无法正常打开。
- 当前工作区 `.16`：恢复 `.10` 搜索行为并保留设置按钮安全区。

## 下一位 AI 建议工作方式

1. 先查看 `git diff`，确认 `.16` 回退仍在。
2. 先部署/验证 `.16` 是否恢复搜索框可打开，不要立刻继续改键盘体验。
3. 如果用户继续要求解决键盘上推，先用 Safari Web Inspector 或临时调试面板采集真实设备数据：
   - `window.innerHeight`
   - `window.scrollY`
   - `visualViewport.height`
   - `visualViewport.offsetTop`
   - `document.activeElement`
   - `navigator.standalone`
   - 聚焦前、键盘动画中、动画完成、失焦后的值
4. 在获得数据前，不要再猜测性修改整页 `transform`、`scrollTo` 或 fixed 布局。
5. 如果需要重做移动搜索 UI，应先向用户展示明确的交互选择或静态示意，并在用户确认后实现，避免再次改变现有视觉习惯。

WebKit 本身存在与 iOS 键盘、VisualViewport、fixed 元素有关的公开问题，因此应尽量减少对键盘动画过程中视口值的实时追踪。

## 常用检查命令

```powershell
node scripts\check.js
git diff --check
git status --short
```

每次正式发布同步版本：

```powershell
node scripts\update-version.js YYYY.MM.DD.N
```

该命令会同步修改：

- `data/app-version.json`
- `sw.js`
- `index.html` 页脚版本

## 给新对话的简短提示词

可以直接告诉新对话：

> 请先完整阅读 `AI_PROJECT_BRIEF.md` 和 `AI_HANDOFF_2026-07-19.md`。当前 `.16` 是未提交的搜索回退版本，不要 reset/restore。先检查工作区并确认回退内容，再继续处理 iOS；不要重复 `.12` 到 `.15` 的键盘方案。
