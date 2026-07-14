# Sksir New

一个自用的导航起始页，用来放日常网页收藏、搜索入口、常用工具、影视/动漫站点、开发资源和临时隐藏分组。

项目目标很简单：打开快、入口清楚、移动端能用，平时维护收藏不要太麻烦。

## 在线地址

- [sksir.top](https://sksir.top/)

## 当前功能

- 多分类导航卡片，数据集中维护在 `data/sites.js`
- 常用搜索引擎切换、自定义、重置
- 百度搜索建议和键盘上下选择
- 随机预设壁纸、每日必应、自定义远程壁纸
- 远程图标延迟加载，失败时回退到本地图标
- 手动检测当前分类下网站存活状态
- Service Worker 静态缓存和版本更新提示
- 性能模式：自动/完整/轻量，低配设备可减少动效
- 首屏非关键任务延后，目标 PC/手机 0.5 秒内主体内容可见
- 首屏启动遮罩会短暂覆盖组装过程，并等待壁纸结果后淡出
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
├── js/main.js                # 首屏任务、更新检测、分类交互等
├── js/set.js                 # 搜索、壁纸、设置面板逻辑
├── js/nav-render.js          # 根据 data/sites.js 渲染导航
├── js/status-dot.js          # 网站状态检测交互
├── scripts/check.js          # 本地统一检查入口
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

它会校验收藏数据，并对主要前端脚本、Service Worker、Vercel API 和维护脚本做语法检查。

### 更新版本

不要手动只改 `data/app-version.json` 或只改 `sw.js`。

使用脚本统一更新：

```powershell
node scripts\update-version.js 2026.06.16.1
```

它会同时更新：

- `data/app-version.json` 的 `version`
- `sw.js` 里的 `CACHE_VERSION`
- `index.html` 页脚显示的当前版本号

## 开发注意

- 文件中有中文注释和中文 UI 文案，读写请使用 UTF-8。
- iOS Safari 的背景和首屏高度比较敏感，修改前要确认不会改变壁纸裁切效果。
- PC 端样式尽量不要被移动端修复影响，移动修复优先写在 `css/mobile.css` 或 `html.ios-safari` 作用域下。
- 首屏目标是 0.5 秒内完成主体结构和当前首屏内容；远程图标、访客统计、状态检测和更新检查都不应阻塞这个窗口。
- 壁纸会在首屏绘制后立即加载，启动遮罩会短暂等待壁纸 `load/error` 或超时后再淡出，避免露出灰色底色。
- 首屏启动遮罩用于遮住页面组装过程，必须保持轻量，不要引入大图、滤镜、模糊或无上限等待。
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

- 按需给 `/api/check` 增加真正的外部限流
- 将搜索引擎和壁纸配置从 `js/set.js` 进一步拆出
- 增加访客统计开关
- 增加更完整的线上发布 checklist
- 继续清理历史遗留代码

## 使用到的组件

- [jQuery](https://jquery.com/)
- [Iconfont](https://www.iconfont.cn/)
- iziToast 风格的本地 toast fallback

## 来源

本站是个人魔改项目，早期参考：

- [Snavigation](https://github.com/imsyy/Snavigation/)
