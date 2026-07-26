# Phase 7 发布审计

审计日期：2026-07-26  
代码版本：`2026.07.26.25`  
状态：静态与自动审计完成，浏览器和真实设备验收待完成

## 自动检查

- `node scripts/check.js`：26 项通过。
- `git diff --check`：通过。
- 收藏数据：6 个分组、86 个站点、0 错误、0 警告。
- `data/app-version.json` 与页脚版本一致。
- `api/check.js` 与 `sw.js` 语法检查通过。
- 未新增第三方依赖或构建工具。

新增的 `scripts/test-frontend-modules.js` 覆盖：

- 损坏的搜索引擎 Cookie 回退；
- 历史默认搜索引擎别名规范化；
- 默认引擎不存在时的安全回退；
- 快捷入口非法协议和重复 URL 清洗；
- 无效点击计数与手动顺序修复；
- 点击计数递增和数量上限。

新增的 `scripts/validate-runtime-boundaries.js` 固化：

- 早期启动脚本、主样式和 defer 模块的顺序；
- 收藏数据、渲染、筛选和状态检测不得由 `index.html` 直接加载；
- `main.js` 必须保留对应的按需加载入口；
- 页脚版本节点与分隔符结构；
- Service Worker 只能清理旧缓存并注销；
- `/api/check` 必须保留收藏域名白名单、主机名/IP 拦截和 DNS 解析后复检。

## 资源与加载边界

以下大小均为仓库内未压缩文件大小，不代表线上压缩传输量。

| 分类 | 大小 | 加载策略 |
|---|---:|---|
| `index.html` | 42,762 bytes | 文档入口 |
| `css/style.css` | 87,648 bytes | 早期启动脚本后加载的唯一主样式 |
| `font/MiSans-UI.woff2` | 76,764 bytes | 本地 UI 子集 |
| 首屏 defer 脚本合计 | 216,653 bytes | 不阻塞 HTML 解析，按文档顺序执行 |
| 收藏数据、渲染和筛选 | 46,141 bytes | 首屏后调度加载 |
| 状态检测样式与脚本 | 9,513 bytes | 打开收藏且需要检测时加载 |

首屏加载顺序保持：

1. HTML 内早期性能、壁纸和 iOS 高度初始化；
2. 主样式；
3. jQuery 与主入口；
4. 存储、数据服务和各交互模块；
5. `bootstrap.js` 启动首屏揭示及非关键任务调度。

收藏数据仍由 `main.js` 在首屏后加载；状态检测资源仍为按需加载。`bootstrap.js` 没有接管或改写 iOS 早期高度与背景逻辑。

## 安全与兼容边界

- `/api/check` 仍只允许收藏数据中的域名，并继续拦截 localhost、内网、环回、link-local 和 metadata 地址。
- `sw.js` 仅删除旧 `nav-cache-*` 缓存并注销自身，没有离线缓存或安装逻辑。
- `#app-version` 与 `.footer-separator` 保留。
- MiSans UI 字符清单已覆盖新增模块。
- jQuery 仍有 159 处生产调用，未达到安全删除条件，依赖继续保留。
- 搜索引擎 Cookie 与快捷入口 localStorage 键均保持兼容。

## 尚未完成

当前执行环境没有可用浏览器实例，因此以下项目不能标记为通过：

- PC 首页、搜索、快捷入口、收藏和设置交互；
- 浏览器控制台错误、长任务、布局偏移和实际首屏耗时；
- 离线、壁纸失败、图标失败和远程联想失败模拟；
- iPhone Safari 地址栏、键盘、背景和安全区；
- standalone 模式；
- 安卓输入框、建议位置和分类横向滚动。

Phase 7 在完成上述浏览器和真实设备验收前保持“进行中”。

真实设备执行表见 `docs/phase7-device-checklist.md`。表中包含 PC、iPhone Safari、
iPhone standalone、安卓、故障模拟和发布判定，并要求记录 iOS 聚焦前后的
`innerHeight`、`scrollY`、`visualViewport` 与活动元素数据。

候选版本说明见 `docs/release-notes-2026.07.26.25.md`。在设备验收完成前，
其发布状态保持“候选版本”。
