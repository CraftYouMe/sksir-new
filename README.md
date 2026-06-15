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
- 移动端适配，包含 iOS Safari 首屏高度与字体稳定处理
- 欢迎提示、访问统计、版权信息
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
├── scripts/update-version.js # 统一更新版本号和 SW 缓存号
├── sw.js                     # Service Worker 缓存
├── index.html                # 页面入口
└── AI_PROJECT_BRIEF.md       # 给 AI 接手用的项目简介
```

## 日常维护

### 更新收藏

主要改 `data/sites.js`。

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

### 更新版本

不要手动只改 `data/app-version.json` 或只改 `sw.js`。

使用脚本统一更新：

```powershell
node scripts\update-version.js 2026.06.15.9
```

它会同时更新：

- `data/app-version.json` 的 `version`
- `sw.js` 里的 `CACHE_VERSION`

## 开发注意

- 文件中有中文注释和中文 UI 文案，读写请使用 UTF-8。
- iOS Safari 的背景和首屏高度比较敏感，修改前要确认不会改变壁纸裁切效果。
- PC 端样式尽量不要被移动端修复影响，移动修复优先写在 `css/mobile.css` 或 `html.ios-safari` 作用域下。
- Service Worker 会缓存静态资源，手机端测试时如果“看起来没变”，先确认缓存版本是否已更新。
- `api/check.js` 会请求传入 URL，后续如果公开使用，建议增加 URL 白名单/内网地址拦截/限流。
- 前端隐藏分组密码只是 UI 隐藏，不是真正安全隔离。

## 给 AI 接手

让 AI 先阅读：

```text
AI_PROJECT_BRIEF.md
```

里面记录了项目目标、关键文件、编码要求、版本更新方式、iOS Safari 注意事项和后续优化计划。

## 后续计划

- 给 `data/sites.js` 增加结构校验，避免漏填 URL、分类或图标
- 将搜索引擎和壁纸配置从 `js/set.js` 进一步拆出
- 增加访客统计开关或延迟加载策略
- 强化 `/api/check` 的安全限制
- 继续清理历史遗留代码

## 使用到的组件

- [jQuery](https://jquery.com/)
- [Iconfont](https://www.iconfont.cn/)
- iziToast 风格的本地 toast fallback

## 来源

本站是个人魔改项目，早期参考：

- [Snavigation](https://github.com/imsyy/Snavigation/)
