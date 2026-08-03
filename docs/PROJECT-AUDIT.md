# Sksir New 当前项目审计与维护说明

> 本文是项目当前状态的汇总文档。技术约束以根目录 `AGENTS.md` 为准，用户使用与日常命令以 `README.md` 为准。

审计日期：2026-08-03  
本地版本：`2026.08.03.9`
审计基准：发布提交 `55c2636`（基于 `bdb5788`）

## 1. 当前结论

- 工作区开始审计时干净，没有待保留的用户修改。
- `node scripts\check.js` 通过，当前检查项全部通过。
- `git diff --check` 通过。
- `data/sites.json` 可正常解析，包含 6 个分组、86 个站点；校验报告中的 11 个跨分组重复网址属于允许的重复入口，不是错误。
- `data/changelog.js` 为生成文件，当前包含 264 条有效记录；不得手工修改。
- 本轮新增浏览器扩展本地适配层，并调整共用运行时以支持本地资源基址、扩展 API 地址和 favicon 缓存；扩展首屏搜索框保持稳定，并对本地壁纸增加首屏预加载。

浏览器扩展是独立的 Manifest V3 交付物：源码在 `extension/`，构建产物默认在项目同级的 `sksir-new-extension/`，不混入网站部署目录。

## 2. 文档边界

项目只保留三类维护入口：

| 文件 | 用途 | 维护方式 |
| --- | --- | --- |
| `AGENTS.md` | AI 与维护者必须遵守的技术、安全、性能、移动端和发布约束 | 规则变化时更新 |
| `README.md` | 用户使用、收藏维护和常用命令 | 面向日常操作更新 |
| `docs/PROJECT-AUDIT.md` | 当前架构、审计结论、发布状态和历史摘要 | 每次结构性审计更新 |

`docs/baseline/` 中的 PNG 是历史视觉基线证据，不再配套维护阶段说明；它们不是首屏资源，也不作为真实 iPhone Safari 或安卓验收的替代品。

## 3. 当前架构

### 页面入口与首屏

- `index.html` 负责页面骨架、早期性能模式、iOS 高度变量、壁纸占位和版本显示。
- 主样式、图标字体和 MiSans UI 子集从当前版本 OSS 路径加载。
- 当前入口包含 9 个外部 `defer` JavaScript 模块：jQuery、主流程、存储、快捷入口数据、搜索引擎、设置/搜索基础逻辑、快捷入口交互、搜索 UI 和启动调度。
- 收藏运行时数据 `data/sites.js`、收藏渲染器、状态检测样式/脚本、远程图标和更新日志不加入首页首屏资源链，按需或分批加载。
- `bootstrap.js` 负责首屏揭示，以及首屏完成后的低优先级任务调度。

### JavaScript 职责

| 区域 | 入口文件 | 责任 |
| --- | --- | --- |
| 启动与首页 | `js/main.js`, `js/bootstrap.js` | 时间、首页布局、提示、更新检查和启动调度 |
| 存储与配置 | `js/storage.js`, `js/set.js` | Cookie/localStorage、搜索、壁纸、设置入口 |
| 搜索 | `js/search-engines.js`, `js/search-ui.js` | 搜索引擎配置、建议、本地收藏匹配和面板交互 |
| 快捷入口 | `js/quick-launch-data.js`, `js/quick-launch.js` | 数据清洗、排序、数量设置、自定义入口和拖动 |
| 收藏中心 | `js/bookmarks.js`, `js/nav-render.js` | 分组筛选、搜索、卡片渲染、延迟图标和工具栏 |
| 设置中心 | `js/settings.js` | 设置分组、关于、更新日志延迟加载和收藏显示行数 |
| 壁纸与状态 | `js/wallpaper.js`, `js/status-dot.js` | 壁纸切换、iOS 同图变量、按需状态检测 |

jQuery 仍保留在生产依赖中，当前采用渐进迁移，不为删除依赖进行高风险集中重写。

### 数据与维护工具

- `data/sites.json` 是收藏的规范化源数据。
- `data/sites.js` 是线上兼容运行时产物；修改收藏后必须由脚本重新生成。
- `scripts/manage-sites.js` 启动本地收藏管理器，服务只监听 `127.0.0.1`。
- `scripts/migrate-sites.js` 负责迁移、生成和兼容性校验。
- `scripts/generate-changelog.js` 根据 Git 历史生成 `data/changelog.js`；更新日志只在设置中心打开相关分栏时加载。

### 接口与发布

- `api/check.js` 只允许检测收藏数据中的域名，并拦截 localhost、内网、link-local、metadata 等地址。
- `api/bing.js` 仅按需获取必应壁纸地址。
- Vercel 提供 HTML、版本文件和 API；OSS 提供 CSS、JavaScript、字体、收藏数据、更新日志、图标和壁纸。
- OSS 资源使用不可覆盖的版本目录和长期缓存。当前仓库内 `assets/oss/` 的本地内置资源目录为 `2026.07.30.6`，它只用于本地预览补齐资源，不能证明当前版本 OSS 已上传完整。
- 本轮扩展搜索过渡修复尚未提交；目标版本为 `2026.08.03.9`。上一轮已成功上传、验证 `2026.08.03.8` OSS 版本目录，共 106 个资源；本轮尚未触发 OSS 上传、Vercel 推送或网站生产部署。

### 浏览器扩展

- `extension/manifest.json` 使用 `chrome_url_overrides.newtab` 接管新建标签页；不声明非法的 `chrome_settings_overrides.startup_pages`，浏览器启动页需在 Chrome 中选择“打开新标签页”，随后由扩展接管为本地导航页。
- `npm run build:extension` 从现有 `index.html`、CSS、JavaScript、字体、数据和本地 UI 资源生成独立本地新标签页，不使用 iframe 或线上页面 HTML/脚本。
- 扩展保留网页端的 `localStorage`、Cookies、设置数据导入/导出和懒加载边界；内置站点图标在构建时改写为扩展内本地资源，不访问远程 favicon。
- 默认壁纸、字体、图标字体、核心 CSS、延迟加载脚本和更新日志均打包到扩展；状态检测和每日壁纸 API 继续使用线上接口。
- 构建脚本默认输出到项目外的 `D:\导航站和博客文件\sksir-new-extension`，并拒绝项目目录内的自定义输出路径。

## 4. 当前功能边界

- 首页搜索、搜索引擎切换、搜索建议和快捷入口保持原有兼容键。
- 收藏中心采用玻璃工具栏，支持分组、分类、搜索、测速、设置、关闭、延迟图标和内容区滚动。
- 收藏中心显示行数合法范围为 1 至 6，键名为 `sksir-bookmark-visible-rows`，损坏或缺失时回退 6 行。
- 设置中心使用统一玻璃分类工具栏；关于页包含本站信息和按需加载的更新日志。
- 壁纸、性能模式、iOS Safari 高度/安全区规则和 `sw.js` 退役策略属于稳定边界，修改前必须先阅读 `AGENTS.md`。
- `奖励` 只是前端隐藏分组，不是安全隔离，未经确认不得移动到公开分组。

## 5. 历史实施摘要

旧阶段文档已经合并为以下事实摘要，后续不再按旧阶段“下一步”重复施工：

| 时间 | 已落地内容 |
| --- | --- |
| 2026-07-25 | 完成视觉基础、页面骨架、收藏数据规范化和本地收藏管理器；保留首屏延迟加载边界。 |
| 2026-07-25 至 2026-07-26 | 完成收藏中心、设置中心和 JavaScript 职责拆分；搜索、快捷入口、壁纸及启动调度模块接入。 |
| 2026-07-26 至 2026-07-29 | 完成搜索建议容错、搜索引擎面板、设置中心关于页和生成式更新日志。 |
| 2026-08-02 | 完成收藏/设置悬浮工具栏、卡片密度、拖动落点、设置中心滚动和收藏显示行数调整。当前版本为 `2026.08.02.14`。 |
| 2026-08-03 | 完成 Chromium 扩展本地化构建、启动接管、浏览器启动页适配、favicon 本地缓存、首屏搜索框稳定渲染、本地壁纸预加载、搜索聚焦态白色背景/深色图标、搜索进出状态类及首次加载取消过渡优先级修复。当前版本为 `2026.08.03.9`。 |

历史阶段说明、重复的发布说明和旧的重构实施手册已删除；用户可见的更新历史仍由 `data/changelog.js` 生成并在设置中心展示。

## 6. 发布前检查

文档或纯维护改动如果不部署，可不更新版本和 OSS。任何会进入生产部署的功能改动必须：

1. 完成功能和数据修改。
2. 使用 `node scripts\update-version.js YYYY.MM.DD.N` 生成新版本。
3. 使用 `node scripts\generate-changelog.js --pending "具体变化" --detail "用户结果"` 生成本轮日志。
4. 运行 `node scripts\check.js` 和 `git diff --check`。
5. 提交全部改动。
6. 提交后运行 `node scripts\upload-oss-assets.js` 并确认关键资源状态码、MIME 和字体 CORS。
7. OSS 验证成功后才推送或触发 Vercel 部署。
8. 部署后核对 HTML、`data/app-version.json`、页脚和 OSS 版本目录一致，并抽查 CSS、JavaScript、字体、`data/sites.js`、`data/changelog.js`。

真实设备验收仍需在发布前由维护者完成：PC 核心交互、iPhone Safari 键盘/背景/安全区、standalone、安卓输入框/建议/分类滚动，以及离线和资源失败场景。静态检查通过不等于这些设备场景已通过。

## 7. 本次文档清理记录

已删除并整合：

- `docs/REFACTOR_PLAN.md`
- `docs/phase2-data-model.md`
- `docs/phase3-bookmark-editor.md`
- `docs/phase4-bookmark-center.md`
- `docs/phase5-settings-center.md`
- `docs/phase6-javascript-modules.md`
- `docs/phase7-device-checklist.md`
- `docs/phase7-release-audit.md`
- `docs/release-notes-2026.07.26.25.md`
- `docs/release-notes-2026.07.29.1.md`
- `docs/release-notes-2026.08.02.9.md`
- `docs/baseline/README.md`
- `docs/baseline/phase1/README.md`

以后新增结构性审计时更新本文；不要重新创建按 Phase、版本或单次发布拆分的重复说明文件。
