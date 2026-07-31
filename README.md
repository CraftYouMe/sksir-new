# Sksir New

一个自用的导航起始页，用来放日常网页收藏、搜索入口、常用工具、影视/动漫站点、开发资源和临时隐藏分组。

项目目标很简单：打开快、入口清楚、移动端能用，平时维护收藏不要太麻烦。

## 在线地址

- [sksir.top](https://sksir.top/)

## 当前功能

- 多分类导航卡片，源数据集中维护在 `data/sites.json`
- 常用搜索引擎切换、自定义、重置
- 百度搜索建议、输入防抖和键盘上下选择
- 搜索框下方快捷入口：默认开启，支持自定义添加、显示数量、点击排序和拖动顺序
- `Esc` 可快速关闭搜索、书签和设置层
- 收藏面板打开后再分批加载远程图标，状态检测仅在打开收藏时加载
- 分类指示器和搜索建议框的高频位置更新按动画帧合并，减少连续输入、键盘和窗口变化造成的布局抖动
- 随机预设壁纸、每日必应、自定义远程壁纸
- 远程图标延迟加载，失败时回退到本地图标
- 手动检测当前分类下网站存活状态
- 页面版本更新提示
- 设置中心“关于”页与时间线更新日志，按提交内容整理为用户可读说明
- 性能模式：自动/完整/轻量，低配设备可减少动效
- 首屏非关键任务延后，目标 PC/手机 0.5 秒内主体内容可见
- 首屏启动遮罩会短暂覆盖组装过程，并以轻量过渡显现完整页面
- 首屏内容完成首次绘制后再低优先级加载响应式壁纸，移动端使用小尺寸版本，壁纸失败时自动回退原图
- 设置中心和壁纸管理脚本仅在使用对应功能时加载，不占用首页首屏请求
- CSS、JavaScript、字体、收藏数据、图标与壁纸使用阿里云 OSS 版本目录直连，并使用一年不可变缓存
- 搜索框使用轻量毛玻璃，进入和退出搜索状态均保持平滑位移，展开后自动隐藏占位提示
- 每日一言页脚：桌面端使用左下角轻量引语标记，手机端隐藏引语，仅保留版本号和更新入口
- 通用动画关键帧和图标字体映射已合并到主样式，减少独立的首屏阻塞样式请求
- 移动端与 iOS Safari 规则已合并到主样式，首屏同步样式请求精简为 1 个
- 主样式和首屏图标字体提前预加载，减少冷启动时的资源发现等待
- 使用约 90 KiB 的本地 MiSans UI 子集并启用 `font-display: swap`，避免远程大字体阻塞文字显示
- 带版本号的 CSS、JavaScript、字体和运行时数据脚本使用一年不可变缓存，HTML、版本检查和接口保持及时更新
- 本地提示框兜底并入主脚本，减少一个首屏 defer 脚本请求
- Cookies 依赖并入设置脚本，首屏 defer 脚本请求进一步精简为 3 个
- 移动端适配，包含 iOS Safari 首屏高度与字体稳定处理
- 欢迎提示、访问统计、每日一言页脚
- 简单的前端密码隐藏分组

## 目录说明

```text
.
├── api/check.js              # 网站状态检测接口
├── api/bing.js               # 按需获取必应每日壁纸地址
├── assets/oss/2026.07.30.6/  # 本地化且不可覆盖的内置图标与响应式壁纸
├── css/                      # 样式文件
├── data/sites.json           # 规范化导航站点源数据
├── data/sites.js             # 自动生成的线上兼容数据
├── data/app-version.json     # 当前版本号
├── data/changelog.js         # 从 Git 提交生成的更新日志数据
├── font/MiSans-UI.woff2      # 本地 MiSans 页面字符子集
├── font/MiSans-UI.characters.txt # 字体子集字符清单
├── js/main.js                # 首屏任务、更新检测、分类交互等
├── js/set.js                 # Cookies、搜索、壁纸、设置面板逻辑
├── js/nav-render.js          # 根据 data/sites.js 渲染导航
├── js/status-dot.js          # 网站状态检测交互
├── scripts/check.js          # 本地统一检查入口
├── scripts/preview.js        # 映射版本化 OSS 资源的首页本地预览服务
├── scripts/build-font-subset.js # 生成/校验 MiSans UI 子集
├── scripts/preflight.js      # 兼容旧检查入口
├── scripts/validate-sites.js # 内部收藏数据校验
├── scripts/migrate-sites.js  # 数据迁移和线上兼容文件生成
├── scripts/manage-sites.js   # 启动本地收藏管理器
├── tools/bookmark-editor/    # 本地收藏管理器页面
├── scripts/update-version.js # 同步更新数据文件和页脚版本号
├── scripts/upload-oss-assets.js # 读取 PicGo 配置并上传、验证当前版本 OSS 静态资源
├── scripts/generate-changelog.js # 从 Git 历史生成更新日志
├── sw.js                     # 旧 Service Worker 退役与缓存清理
├── vercel.json               # Vercel 缓存和基础安全响应头
├── docs/REFACTOR_PLAN.md      # 分阶段重构实施手册
├── index.html                # 页面入口
├── README.md                 # 使用与日常维护说明
└── AGENTS.md                 # 开发约定与敏感区域说明
```

## 重构计划

后续页面、收藏维护和代码结构整改统一按
[`docs/REFACTOR_PLAN.md`](docs/REFACTOR_PLAN.md) 分阶段实施。该文档包含每个阶段的范围、步骤、兼容边界、验收标准和交付记录格式。

## 日常维护

### 本地预览首页

先安装依赖，然后启动专用预览服务：

```powershell
npm install
npm run preview
```

打开命令行显示的 `http://127.0.0.1:4173/`。预览服务会在响应阶段把当前版本的 OSS 地址映射到工作区文件，并从 `assets/oss` 的最新内置资源目录补齐图标和响应式壁纸；不需要临时修改 `index.html`，也不需要提前上传 OSS。

端口被占用时可以指定其他端口：

```powershell
npm run preview -- --port=4187
```

测试首屏动画时，在浏览器开发者工具中勾选 `Disable cache` 后硬刷新；完成后取消勾选，以便同时验证一年不可变缓存的正常读取。按 `Ctrl+C` 停止预览服务。

### 更新收藏

推荐启动本地收藏管理器：

```powershell
node scripts\manage-sites.js
```

然后打开命令行显示的 `http://127.0.0.1:4173`。管理器支持：

- 按名称或网址搜索；
- 新增、编辑和删除网站；
- 选择已有分组和分类，或直接输入新分类；
- 上下调整站点顺序；
- 自动建议稳定 ID；
- 自动或自定义图标；
- 保存前显示新增、修改和删除数量；
- 阻止非法 URL、重复 ID 和同组重复网址。

服务只监听 `127.0.0.1`，退出命令后即停止，不会向线上站点添加管理接口。保存会同时更新规范化源数据 `data/sites.json` 和线上兼容文件 `data/sites.js`。

当前导航分组：

- `常用`：高频入口，按 AI、影音、开发、工具、社区排列。
- `影音`：番剧动漫、在线影视、漫画阅读。
- `工具`：图片处理、文件处理、图标素材、音乐工具。
- `收藏`：软件服务、AI 工具、开发部署、游戏账号、社区学习、快捷下载。
- `装机`：装机必备、硬件检测、驱动下载、系统修复。
- `奖励`：密码隐藏分组，不要随手移动到公开分组。

如需手工维护，只修改 `data/sites.json`。每个站点通常包含：

```json
{
  "id": "example",
  "name": "站点名称",
  "url": "https://example.com/",
  "group": "常用",
  "category": "分类名",
  "description": "一句说明",
  "icon": "auto",
  "statusCheck": true
}
```

如果某个站点不适合检测存活状态，可以加：

```json
"statusCheck": false
```

分类会根据站点条目自动生成，不需要维护分类数组。手工修改后运行：

```powershell
node scripts\migrate-sites.js --generate-runtime
node scripts\check.js
```

### 快捷入口

快捷入口显示在搜索框下方，默认开启，桌面端默认显示 8 个，手机端默认显示 6 个：

- 默认根据当前浏览器中的点击次数自动调整顺序。
- 点击收藏卡片或快捷入口都会更新本地点击统计。
- 拖动首页快捷图标后会保存为自定义顺序。
- 在“设置 → 导航 → 快捷入口”中可以分别设置电脑端与手机端数量、关闭显示，或恢复自动顺序；新增入口使用首页末尾的“+”按钮。
- 自定义入口只接受 `http://` 和 `https://` 网址；图标留空时自动尝试站点 `/favicon.ico`，失败时回退到本地图标。
- 点击统计、显示开关、数量、自定义入口和顺序仅保存在浏览器 `localStorage`，不会上传，也不会跨设备同步。
- 启动时会自动清理损坏、重复或不安全的本地快捷入口数据。
- 快捷图标来自 `data/sites.js`；远程图标失败时会回退到本地图标。

### 统一检查

改完收藏、样式或脚本后，只需要运行这一条：

```powershell
node scripts\check.js
```

它会校验收藏数据、MiSans UI 字符清单，并对主要前端脚本、旧 Service Worker 退役脚本、Vercel API 和维护脚本做语法检查。

### 更新字体子集

日常检查不需要安装字体工具。只有新增页面文案或站点文字后，`node scripts\check.js` 提示字符清单过期时，才需要使用完整 MiSans 源字体重新生成：

```powershell
python -m pip install fonttools brotli
node scripts\build-font-subset.js path\to\MiSans-Regular.woff2
```

完整源字体不存入仓库，生成完成后再运行统一检查。

### 更新版本

不要手动只改 `data/app-version.json` 或页脚版本。

每轮优化完成后都要使用脚本统一更新版本：

```powershell
node scripts\update-version.js YYYY.MM.DD.N
```

它会同时更新：

- `data/app-version.json` 的 `version`
- `index.html` 页脚显示的当前版本号
- `index.html` 的静态资源查询参数
- `css/style.css` 的字体查询参数
- HTML、JavaScript 和收藏数据中的 OSS 版本目录

### 发布 OSS 静态资源

当前页面入口和 API 部署在 Vercel，CSS、JavaScript、字体、收藏数据、更新日志、图标和壁纸部署在阿里云 OSS。发布脚本会读取电脑上 PicGo 当前使用的阿里云配置，不需要把 AccessKey 写入项目。

首次使用先安装本地发布依赖：

```powershell
npm install
```

每次功能提交完成后、推送触发 Vercel 部署前运行：

```powershell
node scripts\upload-oss-assets.js
```

脚本将资源上传到当前版本目录，并检查关键文件的状态码、MIME 和字体跨域配置。只有出现以下成功提示后才能推送：

```text
Uploaded and verified ... OSS assets for YYYY.MM.DD.N
```

固定发布顺序：

1. 更新功能与数据。
2. 运行版本更新脚本。
3. 生成待提交更新日志。
4. 运行统一检查。
5. 提交全部修改。
6. 提交后运行 OSS 上传脚本。
7. OSS 验证通过后再推送和部署 Vercel。
8. 部署后确认线上页脚、`data/app-version.json` 和 OSS 路径版本一致。

不要覆盖已经上线的 OSS 版本目录来修复问题。浏览器会长期缓存版本化资源；任何 CSS、JavaScript、数据、字体或图片变更都应递增版本并上传新目录，否则用户可能继续读到旧配置。

### 生成更新日志

设置中心“关于 → 更新日志”的内容来自本地 Git 提交主题和描述。已有内容读取 Git 历史；本轮功能尚未提交时，在提交前把具体变化传给生成器：

```powershell
node scripts\generate-changelog.js --pending "新增收藏标签拖动排序" --detail "每个收藏页面都可以添加自定义内容"
```

这样功能代码与 `data/changelog.js` 可以放在同一个提交中，不需要再创建一次“只更新日志”的提交。没有未提交改动时，仍可直接运行 `node scripts\generate-changelog.js`。

脚本会：

- 从提交主题和正文中拆分具体变化点；
- 将 `--pending` 与一个或多个 `--detail` 作为本轮尚未提交的更新；
- 下一轮生成时将提交中的“本次更新”恢复并关联到真实提交哈希；
- 移除版本号、文档、测试、文件名等内部维护噪声；
- 将英文或技术性描述转换为面向用户的中文说明，不直接展示 Commit Message；
- 自动标记“修复”“新增”“改进”“优化”；
- 忽略“更新”“测试”“修改标签”等无法得出有效内容的提交；
- 忽略只修改 `data/changelog.js` 的历史提交；
- 内容没有变化时不重写文件，避免时间戳产生空差异；
- 合并同一天内容完全相同的记录。

`data/changelog.js` 是生成文件，不要手工修改。它只在用户打开更新日志时加载，不影响首屏资源顺序。

为了得到有意义的日志，提交主题或正文应写清具体对象和结果，例如“桌面端与移动端分别设置快捷入口数量”，不要只写“优化功能”或“更新代码”。

如果工作区只有不需要展示给用户的维护改动，可以显式运行 `node scripts\generate-changelog.js --skip-pending`。生成器发现未提交改动但没有收到 `--pending` 或 `--skip-pending` 时会停止，避免静默漏掉本轮内容。

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
