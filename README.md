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
├── README.md                 # 使用与日常维护说明
└── AGENTS.md                 # 开发约定与敏感区域说明
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
- 首屏性能、移动端、iOS Safari、缓存和安全边界等技术约定统一维护在 `AGENTS.md`。
- 修改敏感区域前先阅读 `AGENTS.md`，不要在 README 中重复维护同一套规则。

## 给 AI 接手

让 AI 先阅读根目录的：

```text
AGENTS.md
```

里面集中记录了项目目标、关键文件、修改流程、首屏策略、iOS Safari 经验和发布检查。

## 使用到的组件

- [jQuery](https://jquery.com/)
- [Iconfont](https://www.iconfont.cn/)
- iziToast 风格的本地 toast fallback

## 来源

本站是个人魔改项目，早期参考：

- [Snavigation](https://github.com/imsyy/Snavigation/)
