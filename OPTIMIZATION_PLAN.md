# Sksir New 优化计划清单

更新日期：2026-07-14

## 当前目标

- 站点：`https://sksir.top/`
- 项目用途：自用网页收藏、导航、搜索入口。
- 首屏硬指标：PC 和手机都要求 0.5 秒内看到主体结构和当前首屏内容。
- 首屏口径：时间、搜索框、主体布局可见即可；不等待远程壁纸、远程图标、访问统计、状态检测、更新检查全部完成。
- 日常检查命令：`node scripts\check.js`
- 版本号：本计划不自动改版本号，需要发布时再手动运行 `node scripts\update-version.js YYYY.MM.DD.N`。

## 已完成

- [x] 统一检查命令：新增 `scripts/check.js`，一条命令完成收藏数据校验和主要 JS 语法检查。
- [x] 保留兼容入口：`scripts/preflight.js` 继续可用，但日常只推荐 `node scripts\check.js`。
- [x] 收藏数据校验：`scripts/validate-sites.js` 可发现 URL、分类、图标、`target/rel` 等维护问题。
- [x] 版本更新脚本：`scripts/update-version.js` 同步更新 `data/app-version.json`、`sw.js` 和页脚版本号。
- [x] `/api/check` 基础加固：只允许检测 `data/sites.js` 中出现过的域名。
- [x] `/api/check` 安全拦截：阻止本地地址、内网地址、metadata 地址和非收藏域名。
- [x] `/api/check` 超时控制：检测超时从 20 秒缩短到 8 秒。
- [x] `/api/check` 返回收敛：不再返回原始错误详情。
- [x] Vercel 缓存配置：`vercel.json` 已控制 `data/app-version.json`、`sw.js`、`/api/check` 的缓存策略。
- [x] Vercel 基础安全头：已加入 `X-Content-Type-Options`、`Referrer-Policy`、`Permissions-Policy`。
- [x] 性能模式：已有 `auto`、`full`、`lite`，高配保留完整效果，低配减少动效。
- [x] iOS Safari 基础修复：已有高度、键盘、字体稳定处理。
- [x] 首屏非关键任务后移：访问统计、欢迎 toast、更新检查不再挤占 0.5 秒首屏窗口。
- [x] 壁纸加载后移：远程壁纸在首屏绘制后再加载，不阻塞主体结构可见。
- [x] 首屏启动遮罩：短暂显示轻量加载动画，遮住页面组装过程，然后淡出完整页面。
- [x] 首屏耗时标记：页面会在 `window.__sksirFirstScreenMs` 记录首屏绘制后的本地耗时，方便调试。
- [x] README 与 AI 必读文档同步：已记录当前命令、API 安全、Vercel 配置和第二轮首屏策略。

## 待验证

- [ ] 部署后在 Vercel 生产环境确认 `node scripts\check.js` 本地通过后页面能正常上线。
- [ ] 部署后打开 `https://sksir.top/data/app-version.json`，确认线上版本和页脚版本对应。
- [ ] 部署后在浏览器控制台查看 `window.__sksirFirstScreenMs`，确认 PC 和手机首屏接近或低于 500ms。
- [ ] iPhone 15 Pro Max Safari 复测：背景铺满、搜索框聚焦、键盘收起不抖动。
- [ ] 低配电脑复测：轻量模式下分类切换、搜索框、书签面板不卡顿。
- [ ] Vercel 日志观察 `/api/check` 是否有异常请求量。

## 未完成

- [ ] 给 `/api/check` 增加真正的外部限流。当前已做 allowlist 和内网拦截，只有发现滥用时才建议继续做。
- [ ] 增加访客统计开关。当前已延后加载，但还不能在设置里关闭。
- [ ] 搜索引擎配置从 `js/set.js` 拆到独立数据文件。
- [ ] 壁纸配置从 `js/set.js` 拆到独立数据文件。
- [ ] 更完整的线上发布 checklist。
- [ ] Service Worker 检测到新版本后自动刷新缓存。需要确认是否接受自动刷新体验。
- [ ] 更严格的 CSP 安全策略。当前远程图标、壁纸、inline script 较多，暂不建议立刻做。

## 不建议现在做

- [ ] 不建议重构成 React/Vue/Vite，当前静态页更轻。
- [ ] 不建议全局删除动画，应该继续用性能模式分层。
- [ ] 不建议大改 iOS 壁纸裁切和安全区逻辑，之前这块容易影响手机端效果。

## 下一轮建议

1. 先做线上实测：PC、iPhone 15 Pro Max、低配电脑。
2. 如果首屏仍超过 500ms，下一步再拆延迟加载 `data/sites.js` 和书签渲染。
3. 如果 `/api/check` 日志有异常，再接外部限流。
4. 如果维护收藏变频繁，再拆搜索引擎和壁纸配置。
