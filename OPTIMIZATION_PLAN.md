# Sksir New 公开部署后优化计划书

编写日期：2026-07-13

## 背景

项目已经部署到 Vercel，并通过 `https://sksir.top/` 公开访问。项目定位是个人日常导航页，核心目标仍然是：

- 首屏稳定、打开快。
- PC 端完整保留视觉效果。
- 移动端尤其 iOS Safari 可用且不抖动。
- 收藏数据维护简单，更新版本可追踪。
- 公开访问后避免 API 被滥用。

这份计划以“先稳线上，再做体验，再做自动化”为原则，不建议一次性大改。

## 执行记录

### 2026-07-14 第一轮

已落地：

- 新增 `scripts/check.js`，统一运行收藏数据校验和主要 JS 语法检查；`scripts/preflight.js` 仅保留为旧入口兼容。
- 加固 `api/check.js`：只允许检测 `data/sites.js` 中的域名，拦截内网/本地/metadata 地址，校验 DNS 解析结果，不跟随跳转，超时缩短到 8 秒。
- 新增 `vercel.json`，为 `data/app-version.json`、`sw.js`、`/api/check` 设置缓存策略，并加基础安全响应头。
- 同步更新 README 和 `AI_PROJECT_BRIEF.md`。

## 当前观察

### 已具备的基础

- 本地已经有 `scripts/check.js`，作为日常维护和发布前检查的单一命令入口。
- 版本号由 `data/app-version.json`、`sw.js`、页脚 `#app-version` 共同支撑。
- Service Worker 已经缓存核心静态资源。
- 已有性能模式：`auto`、`full`、`lite`。
- 已有 iOS Safari 高度、键盘、字体稳定相关处理。
- `AI_PROJECT_BRIEF.md` 已经记录项目接手规则。
- 用户已确认当前仓库版本和线上生产站点一致。

### 需要优先处理的问题

- 线上站点和本地仓库当前一致，但后续仍需要固定“本地版本 - Git 提交 - Vercel 生产部署 - 线上版本”的确认流程，避免浏览器缓存、Service Worker 或部署状态造成误判。
- `api/check.js` 已完成第一轮基础加固，后续重点是观察 Vercel 日志，必要时增加真正的外部限流。
- `vercel.json` 已新增基础缓存和安全响应头配置，后续如需更严格安全策略再单独评估 CSP。
- 低配性能优化已有基础，但缺少明确的性能预算和线上验收指标。

## 优先级总览

| 阶段 | 优先级 | 目标 | 建议状态 |
| --- | --- | --- | --- |
| P0 | 必做 | 建立发布检查和线上版本确认流程 | 第一轮已完成 |
| P1 | 必做 | 加固 `/api/check`，避免公开接口被滥用 | 第一轮已完成 |
| P2 | 推荐 | 加 Vercel 缓存和安全头配置 | 第一轮已完成 |
| P3 | 推荐 | 建立性能预算和低配/高配分层验收 | P0 后做 |
| P4 | 可选 | 进一步拆配置、整理旧代码、增强维护体验 | 稳定后做 |

## P0：发布检查与线上版本确认流程

### 目标

当前仓库版本和 `sksir.top` 已确认一致。后续要确保每次发布后都能快速判断用户看到的是不是目标版本，避免 Service Worker、浏览器缓存或 Vercel 部署状态造成误判。

### 建议改动

1. 新增统一检查脚本 `scripts/check.js`。
2. README 增加发布流程：
   - 修改功能或样式。
   - 运行 `node scripts\check.js`。
   - 如需发布给用户，运行 `node scripts\update-version.js YYYY.MM.DD.N`。
   - 提交 Git。
   - 等待 Vercel Production 部署完成。
   - 打开 `https://sksir.top/data/app-version.json` 确认版本。
   - 打开页面页脚确认版本或更新按钮行为。

### 验收标准

- 能用一条命令完成本地发布前检查。
- 线上 `data/app-version.json` 和页面运行版本可对应。
- 手机端出现“看起来没更新”时，有明确排查路径：版本号、Service Worker、浏览器缓存、Vercel 部署记录。

## P1：公开 API 安全加固

### 目标

`/api/check` 只用于检查导航数据里的站点，不作为公开代理接口。

### 原始风险

第一轮加固前，`api/check.js` 接收 `url` 参数后直接 `fetch`。公开后，任何人都可以请求：

```text
/api/check?url=任意地址
```

这可能带来：

- 被当成代理转发器。
- 请求内网地址或云平台元数据地址。
- 被大量慢请求拖住 Vercel Function。
- 错误信息暴露过多。

### 第一轮已完成

1. 根据 `data/sites.js` 生成允许检测的 URL host 列表。
2. `/api/check` 只允许检测这些 host。
3. 拦截内网地址、本地地址、metadata 地址：
   - `127.0.0.0/8`
   - `10.0.0.0/8`
   - `172.16.0.0/12`
   - `192.168.0.0/16`
   - `169.254.0.0/16`
   - `localhost`
   - IPv6 local/link-local
4. 超时从 20 秒降到 8 秒。
5. 返回信息只保留 `alive`、`slow`、`dead`、`time`、`code`，不返回原始错误。
6. 不跟随跳转，避免收藏站点通过 30x 跳到非允许目标。

### 需要你确认

如果希望做真正的限流，需要决定是否引入外部服务，例如 Upstash Redis。当前 allowlist、内网拦截和超时已经解决大部分公开代理风险。

### 验收标准

- `data/sites.js` 里的站点仍可检测。
- 非收藏站点返回拒绝。
- 内网、本地、metadata 地址无法被请求。
- 慢站点不会长时间占用函数。

## P2：Vercel 配置与缓存策略

### 目标

让公开站点的缓存行为更可控，减少 Service Worker 和浏览器缓存造成的误判。

### 建议改动

已新增 `vercel.json`，先只做保守配置：

- `data/app-version.json`：`Cache-Control: no-store`
- `sw.js`：`Cache-Control: no-cache`
- `/api/check`：`Cache-Control: no-store`
- 增加基础安全头：
  - `X-Content-Type-Options: nosniff`
  - `Referrer-Policy: strict-origin-when-cross-origin`
  - `Permissions-Policy` 限制不需要的能力

暂不建议立刻加严格 CSP，因为当前页面有 inline script、远程图标、外部壁纸和第三方访问统计。CSP 可以后续单独做，避免误伤现有功能。

### 验收标准

- Vercel 部署后 `sw.js` 不被长期强缓存。
- `data/app-version.json` 每次能拿到最新版本。
- 页面功能不因安全头失效。

## P3：性能预算与体验分层

### 目标

高配设备保留完整视觉；低配设备减少动效、阴影、模糊和频繁布局计算。

### 建议指标

首屏指标按“主体结构和当前分类内容可见”计算，不等待远程图标、壁纸、访问统计和状态检测全部完成。目标越快越好，最低要求如下：

- PC 首屏主内容可见：0.5 秒内。
- 手机首屏主内容可见：0.5 秒内。
- Lighthouse Performance：移动端 80+，桌面端 90+。
- 低配模式下页面滚动和分类切换不明显掉帧。

### 建议改动

1. 保留现有 `perf-lite`，但补一份测试清单：
   - PC 完整模式。
   - PC 轻量模式。
   - iPhone Safari。
   - Android Chrome。
2. 进一步减少首屏同步任务：
   - 访问统计延迟到首屏稳定后加载。
   - 欢迎 toast 不阻塞更新检查和导航渲染。
   - 非当前分类图标继续延迟加载。
3. 给重动画区域加统一开关：
   - 背景缩放/模糊。
   - 卡片 hover 光效。
   - 分类栏光效。
   - toast 动效。
4. 避免误判高端 iOS：
   - iOS 不根据 `hardwareConcurrency` 单独进入低性能。
   - 用户手动选择完整模式时必须优先。

### 验收标准

- iPhone 15 Pro Max 默认不被误判成低性能。
- 低配模式明显减少动画成本。
- PC 完整模式视觉不被削弱。

## P4：移动端专项稳定

### 目标

减少 iOS Safari 地址栏、键盘、字体加载造成的首屏变化。

### 建议范围

已有 iOS 处理比较敏感，不建议大动。后续只做小步验证：

1. 保持 `viewport-fit=cover`。
2. 保持 iOS Safari 不加载 MiSans 的策略。
3. 不随意改壁纸 `object-fit`、背景尺寸、安全区扩展。
4. 每次移动端修复都用单独 media query 或 `html.ios-safari` 作用域。

### 验收标准

- iPhone 15 Pro Max Safari 首屏背景覆盖稳定。
- 点击搜索框、密码框，页面不突然缩放。
- 键盘收起后页面不缩小再放大。
- PC 端布局无变化。

## P5：维护体验优化

### 目标

降低以后加收藏、改分类、发版本的出错概率。

### 建议改动

1. `scripts/validate-sites.js` 后续可以增加：
   - 检查同一 tab 内重复名称。
   - 检查同一站点跨 tab 重复时是否合理。
   - 检查 `skipCheck` 的站点是否属于常见反检测站点。
2. 把搜索引擎配置从 `js/set.js` 拆到独立数据文件。
3. 把壁纸配置从 `js/set.js` 拆到独立数据文件。
4. 给 README 增加“发布 checklist”。
5. 保持 `AI_PROJECT_BRIEF.md` 与实际实现同步。

### 验收标准

- 新增收藏后能快速知道分类、URL、图标是否漏填。
- 发布流程不依赖记忆。
- 下一次 AI 接手时能快速理解当前状态。

## 不建议现在做的事

- 不建议立刻重构成 Vite/React/Vue。当前是轻量静态页，重构成本高，收益不一定匹配。
- 不建议立刻做很严格的 CSP。现有 inline script 和远程资源较多，容易误伤功能。
- 不建议全局删除动画。应该保留完整模式，把优化集中在 `perf-lite`。
- 不建议大改 iOS 壁纸铺满逻辑。之前这个区域已经出现过回退需求，应小步验证。

## 建议执行顺序

1. 建立 P0 发布检查和线上版本确认流程。
2. 加固 P1 `/api/check`。
3. 增加 P2 `vercel.json` 的缓存和基础安全头。
4. 做 P3 性能预算和测试清单。
5. 视使用情况继续拆配置和清理旧代码。

## 第一轮推荐落地项

如果只做一轮，建议先做这 3 项：

1. `scripts/check.js`：统一本地检查。已完成。
2. `api/check.js` allowlist + 内网拦截 + 缩短超时。已完成。
3. `vercel.json`：控制 `app-version`、`sw.js`、API 缓存。已完成。

这三项对公开站点最关键，改动范围也可控，不会改变页面视觉。
