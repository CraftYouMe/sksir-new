# Sksir New

一个自用的导航起始页，用来放日常网页收藏、搜索入口、常用工具、影视/动漫站点、开发资源和临时隐藏分组。

项目目标很简单：打开快、入口清楚、移动端能用，平时维护收藏不要太麻烦。

## 在线地址

- [sksir.top](https://sksir.top/)

## 当前功能

- 多分类导航卡片，数据集中维护在 `data/sites.js`
- 常用搜索引擎切换、自定义、重置
- 百度搜索建议、输入防抖和键盘上下选择
- `Esc` 可快速关闭搜索、书签和设置层
- 书签数据和标签渲染在首屏后按需加载，状态检测仅在打开书签时加载
- 移动端首屏绘制后优先预热书签标签，面板快速显现后再分批加载远程图标
- 分类指示器和搜索建议框的高频位置更新按动画帧合并，减少连续输入、键盘和窗口变化造成的布局抖动
- 随机预设壁纸、每日必应、自定义远程壁纸
- 远程图标延迟加载，失败时回退到本地图标
- 手动检测当前分类下网站存活状态
- Service Worker 静态缓存和版本更新提示
- 性能模式：自动/完整/轻量，低配设备可减少动效
- 首屏非关键任务延后，目标 PC/手机 0.5 秒内主体内容可见
- 首屏启动遮罩会短暂覆盖组装过程，并以轻量过渡显现完整页面
- 首屏壁纸提前高优先级预加载，完成下载和解码后再交给启动遮罩显现
- 搜索框使用轻量毛玻璃，进入和退出搜索状态均保持平滑位移，展开后自动隐藏占位提示
- 每日一言页脚：桌面端使用左下角轻量引语标记，手机端隐藏引语，仅保留版本号和更新入口
- 通用动画关键帧和图标字体映射已合并到主样式，减少独立的首屏阻塞样式请求
- 移动端与 iOS Safari 规则已合并到主样式，首屏同步样式请求精简为 1 个
- 主样式和首屏图标字体提前预加载，减少冷启动时的资源发现等待
- 使用约 75 KiB 的本地 MiSans UI 子集，保留字体观感并避免远程大字体和后置换字
- 本地提示框兜底并入主脚本，减少一个首屏 defer 脚本请求
- Cookies 依赖并入设置脚本，首屏 defer 脚本请求进一步精简为 3 个
- 移动端适配，包含 iOS Safari 首屏高度与字体稳定处理
- 欢迎提示、访问统计、每日一言页脚
- 简单的前端密码隐藏分组

## 目录说明

```text
.
├── api/check.js              # 网站状态检测接口
├── css/                      # 样式文件
├── data/sites.js             # 导航站点数据
├── data/app-version.json     # 当前版本号
├── font/MiSans-UI.woff2      # 本地 MiSans 页面字符子集
├── font/MiSans-UI.characters.txt # 字体子集字符清单
├── js/main.js                # 首屏任务、更新检测、分类交互等
├── js/set.js                 # Cookies、搜索、壁纸、设置面板逻辑
├── js/nav-render.js          # 根据 data/sites.js 渲染导航
├── js/status-dot.js          # 网站状态检测交互
├── scripts/check.js          # 本地统一检查入口
├── scripts/build-font-subset.js # 生成/校验 MiSans UI 子集
├── scripts/preflight.js      # 兼容旧检查入口
├── scripts/validate-sites.js # 内部收藏数据校验
├── scripts/update-version.js # 统一更新版本号和 SW 缓存号
├── sw.js                     # Service Worker 缓存
├── vercel.json               # Vercel 缓存和基础安全响应头
├── index.html                # 页面入口
├── OPTIMIZATION_PLAN.md      # 优化计划清单
└── AI_PROJECT_BRIEF.md       # 给 AI 接手用的项目简介
```

## 日常维护

### 更新收藏

主要改 `data/sites.js`。

当前导航分组：

- `常用`：高频入口，按 AI、影音、开发、工具、社区排列。
- `影音`：番剧动漫、在线影视、漫画阅读。
- `工具`：图片处理、文件处理、图标素材、音乐工具。
- `收藏`：软件服务、AI 工具、开发部署、游戏账号、社区学习、快捷下载。
- `装机`：装机必备、硬件检测、驱动下载、系统修复。
- `奖励`：密码隐藏分组，不要随手移动到公开分组。

每个站点通常包含：

```js
{
  "className": "quicks",
  "name": "站点名称",
  "url": "https://example.com/",
  "category": "分类名",
  "icon": "https://example.com/favicon.ico",
  "desc": "一句说明",
  "target": "_blank",
  "rel": "noopener noreferrer"
}
```

如果某个站点不适合检测存活状态，可以加：

```js
"skipCheck": "true"
```

新增分类时要同步改对应 tab 的 `categories`，并保证每个公开站点都有 `category`、`icon` 和简短 `desc`。改完运行 `node scripts\check.js`。

### 统一检查

改完收藏、样式或脚本后，只需要运行这一条：

```powershell
node scripts\check.js
```

它会校验收藏数据、MiSans UI 字符清单，并对主要前端脚本、Service Worker、Vercel API 和维护脚本做语法检查。

### 更新字体子集

日常检查不需要安装字体工具。只有新增页面文案或站点文字后，`node scripts\check.js` 提示字符清单过期时，才需要使用完整 MiSans 源字体重新生成：

```powershell
python -m pip install fonttools brotli
node scripts\build-font-subset.js path\to\MiSans-Regular.woff2
```

完整源字体不存入仓库，生成完成后再运行统一检查。

### 更新版本

不要手动只改 `data/app-version.json` 或只改 `sw.js`。

每轮优化完成后都要使用脚本统一更新版本：

```powershell
node scripts\update-version.js YYYY.MM.DD.N
```

它会同时更新：

- `data/app-version.json` 的 `version`
- `sw.js` 里的 `CACHE_VERSION`
- `index.html` 页脚显示的当前版本号

## 开发注意

- 文件中有中文注释和中文 UI 文案，读写请使用 UTF-8。
- iOS Safari 的背景和首屏高度比较敏感，修改前要确认不会改变壁纸裁切效果。
- iOS Safari 壁纸铺满逻辑位于 `css/style.css` 末尾的移动端区域，核心选择器是 `html.ios-safari .bg-all`，通过最大可视高度和同图 CSS 背景兜底覆盖安全区和地址栏收放高度。
- PC 端样式尽量不要被移动端修复影响，移动修复应继续放在 `css/style.css` 末尾，并限制在移动媒体查询或 `html.ios-safari` 作用域下。
- 首屏目标是 0.5 秒内完成主体结构和当前首屏内容；远程图标、访客统计、状态检测和更新检查都不应阻塞这个窗口。
- `index.html` 会在内联启动脚本前预加载 `css/style.css`、`font/iconfont.woff2` 和 `font/MiSans-UI.woff2`；实际 stylesheet 必须继续放在启动脚本之后，避免 CSS 下载阻塞启动类、性能模式和 iOS 高度初始化。
- 书签卡片不是首屏必需内容，`data/sites.js` 和 `js/nav-render.js` 会在首屏后空闲加载；用户提前打开书签时则立即加载。
- `js/status-dot.js` 和 `css/status-dot.css` 只在用户打开书签时并行加载，不跟随标签预热，也不进入 Service Worker 预缓存；加载慢或失败不能阻塞书签标签和卡片显示。
- 书签资源就绪后只同步渲染默认分组，其他分组会在空闲时间或首次点击对应标签时补齐。
- 宽度不超过 768px 时，书签核心资源会在首屏绘制后约 120ms 开始预热；面板打开延迟约 70ms，远程图标在显现动画后每批 4 个加载，避免移动端图片解码卡住标签动画。
- PC 端仍保持 load 后空闲加载和原有面板打开节奏，不跟随移动端预热策略。
- 分类栏的窗口尺寸刷新和搜索建议框的聚焦、输入、尺寸刷新会通过 `requestAnimationFrame` 合帧，同一帧只执行一次布局读写。
- 页脚在桌面端固定为左下角轻量样式；手机端取消外层玻璃背景，使用底部安全区定位版本号和更新入口。
- 壁纸会在 `set.js` 执行时立即高优先级预加载，不再额外等待首屏后的两帧；图片完成加载和异步解码后才进入可见状态，解码异常时最多等待约 180ms 自动回退。
- 启动遮罩会短暂等待壁纸 `load/error` 或整体超时后再淡出，避免露出灰色底色。
- 首屏启动遮罩用于遮住页面组装过程，当前由 CSS 光环和遮罩淡出完成过渡；主体会在遮罩下提前完成合成，避免搜索框毛玻璃从透明状态突然跳出。
- 通用 `fade`、`fadenum` 关键帧、图标字体映射、移动端和 iOS Safari 规则都保存在 `css/style.css`；原独立 `css/animation.css`、`css/font.css`、`css/mobile.css` 已删除，不要重新拆回首屏阻塞样式。
- Service Worker 预缓存图标字体的 `woff2` 和本地 MiSans UI 子集；图标字体的 `woff`、`ttf` 仍作为 CSS 兼容回退并在实际需要时按需缓存。
- 原远程 MiSans 文件约 3.9 MiB，现已替换为 76,764 字节、633 个字符的本地子集。子集使用 `font-display: optional`，慢网络下回退系统字体，不允许首屏后再替换整页文字。
- OSS 的 `preconnect` 用于壁纸和站点图标，已经包含连接预热；不要再为同一域名重复添加 `dns-prefetch`。
- 本地 `iziToast` 风格提示框兜底位于 `js/main.js` 开头，原 `js/toast-loader.js` 已删除。
- JavaScript Cookie v2.2.1 已原样并入 `js/set.js` 顶部，原 `js/js.cookie.js` 已删除；必须保留其 MIT 许可，并确保 Cookies 初始化始终位于设置逻辑之前。
- HTML 当前只保留 jQuery、主脚本和设置脚本 3 个 defer 请求。
- 页面会在首屏绘制后写入 `window.__sksirFirstScreenMs`，用于本地调试首屏耗时。
- Service Worker 会缓存静态资源，手机端测试时如果“看起来没变”，先确认缓存版本是否已更新。
- 页脚里隐藏的 `#app-version` 会被更新检测读取，不要随手删掉。
- `api/check.js` 只允许检测 `data/sites.js` 里出现过的域名，并会拦截内网、本地和 metadata 地址。
- `vercel.json` 控制 `data/app-version.json`、`sw.js`、`/api/check` 的缓存策略和基础安全响应头。
- 前端隐藏分组密码只是 UI 隐藏，不是真正安全隔离。

## 给 AI 接手

让 AI 先阅读：

```text
AI_PROJECT_BRIEF.md
OPTIMIZATION_PLAN.md
```

里面记录了项目目标、关键文件、编码要求、版本更新方式、首屏策略、iOS Safari 注意事项和当前优化进度。

## 后续计划

- 继续观察 iOS Safari 壁纸铺满和键盘收起稳定性
- 继续压低首次启动耗时，缓存后稳定低于 0.5 秒
- 打磨启动遮罩、分类切换、卡片交互等轻量动效
- 复测移动端搜索、键盘、分类栏在连续交互时的流畅度
- 继续观察冷启动，优先拆首屏外的样式、脚本、DOM、图片和网络任务
- 收藏变多后，再考虑拆分搜索引擎和壁纸配置

## 使用到的组件

- [jQuery](https://jquery.com/)
- [Iconfont](https://www.iconfont.cn/)
- iziToast 风格的本地 toast fallback

## 来源

本站是个人魔改项目，早期参考：

- [Snavigation](https://github.com/imsyy/Snavigation/)
