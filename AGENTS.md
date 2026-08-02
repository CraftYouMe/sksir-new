# AGENTS.md - Sksir New 开发约定

本文件是维护者和 AI 修改项目时的唯一技术说明。

用户使用、收藏维护和常用命令见 `README.md`。

---

# 项目目标

这是一个静态个人导航与搜索起始页。

按以下顺序取舍：

1. 首屏加载速度
2. 稳定性与兼容性
3. 移动端体验，尤其是 iPhone Safari
4. 不影响桌面布局
5. 轻量、自然的动画
6. 日常维护简单
7. 所有设置、新增、编辑功能统一使用 Glassmorphism Modal，不创建独立页面。

不要引入：

- React
- Vue
- Vite
- 大型 UI 框架
- 不必要依赖

优先：

- 小范围 CSS 修改
- 原生 JavaScript 修改
- 保持当前架构

---

# UI 统一设计规范

项目所有新增 UI 必须遵循：

- 现代 Web App 风格
- Glassmorphism（玻璃拟态）
- 极简导航页设计
- 保留壁纸背景沉浸感
- 不创建新的视觉语言

所有新增组件必须继承现有：

- 颜色体系
- 圆角体系
- 阴影体系
- 动画体系
- 交互逻辑

不要每次创建新的 UI 风格。

---

# 弹窗规范（Modal System）

新增、编辑、设置、导入、导出等操作统一使用：

> Glassmorphism Modal Dialog

禁止：

- 跳转新页面
- alert()
- confirm()
- prompt()

---

## Modal 要求

必须：

- 当前页面内打开
- 不刷新页面
- 保留当前页面状态
- 背景页面保持显示
- 添加半透明遮罩
- 支持关闭按钮
- 支持点击遮罩关闭
- 支持 ESC 关闭
- 保留页面滚动位置

---

## 平台表现

桌面端：

使用：

- 居中 Modal

移动端：

优先：

- Bottom Sheet 风格

类似：

- iOS Sheet
- Android Bottom Sheet

---

# UI 视觉规范

## 圆角

统一：

弹窗：

```
20px - 24px
```

普通卡片：

```
12px - 16px
```

大型面板：

```
24px+
```

禁止随意创建不同圆角。

---

## 背景

优先：

- 半透明背景
- backdrop-filter 模糊
- 保留壁纸透出效果

避免：

- 完全不透明大块背景
- 强烈边框

---

## 阴影

使用：

柔和阴影。

避免：

- 硬阴影
- 过强投影

---

## 动画

统一：

进入：

```
opacity:
0 → 1

scale:
0.96 → 1

translateY:
轻微移动
```

时间：

```
200ms - 300ms
```

避免：

- 大幅移动动画
- 复杂 JS 动画
- 阻塞首屏动画

---

# 表单与按钮规范

## 输入框

统一：

- 半透明背景
- 圆角
- 明确 focus 状态
- 字号不得低于 16px

原因：

避免 iOS Safari 自动缩放。

---

## 按钮

必须提供：

- 默认状态
- hover 状态
- active 状态
- disabled 状态

---

# 修改流程

修改前：

必须：

1. 查看 git status
2. 查看相关文件
3. 保留用户已有修改

---

文本：

统一 UTF-8。

---

优先：

使用：

```
apply_patch
```

进行修改。

---

修改后运行：

```powershell
node scripts\check.js
git diff --check
```

---

正式功能改动：

需要同步版本：

```powershell
node scripts\update-version.js YYYY.MM.DD.N
```

该命令同步：

- data/app-version.json
- index.html 页脚版本
- index.html、JavaScript、收藏数据中的 OSS 版本目录
- index.html 与 css/style.css 的资源查询参数

不要只修改其中一个。

---

# OSS 静态资源发布

当前部署架构：

- Vercel：`index.html`、`data/app-version.json`、`/api/check`、`/api/bing`
- 阿里云 OSS：CSS、JavaScript、字体、收藏运行时数据、更新日志、内置图标和壁纸
- OSS 公共前缀：`https://yuanone-blog-picture.oss-cn-beijing.aliyuncs.com/sksir/YYYY.MM.DD.N/`
- OSS 使用版本目录和一年 `immutable` 缓存；已经上线的版本目录不得覆盖

本地发布脚本：

```powershell
npm install
node scripts\upload-oss-assets.js
```

脚本读取当前 PicGo 的阿里云 OSS 配置，不得把 AccessKey 写入仓库、日志或回复。脚本负责：

- 读取 `data/app-version.json` 作为目标 OSS 目录；
- 上传 CSS、JavaScript、字体、运行时数据、更新日志、图标和壁纸；
- 设置正确 `Content-Type` 与一年不可变缓存；
- 上传后验证主样式、主脚本、收藏数据、字体和字体 CORS。

任何会部署到线上的功能提交都必须按以下顺序：

1. 完成功能和数据修改。
2. 运行 `node scripts\update-version.js YYYY.MM.DD.N`，不得复用已经上线的版本号。
3. 生成本轮待提交更新日志。
4. 运行 `node scripts\check.js` 与 `git diff --check`。
5. 提交本轮全部文件。
6. 提交后立即运行 `node scripts\upload-oss-assets.js`，确保上传的是已提交版本。
7. OSS 上传和验证成功后，才允许推送或触发 Vercel 部署。
8. Vercel 部署后确认线上 HTML、`data/app-version.json` 和 OSS 目录使用同一版本。
9. 抽查线上 CSS、JavaScript、字体、`data/sites.js`、`data/changelog.js` 均为 HTTP 200 且 MIME 正确。

失败处理：

- OSS 上传或验证失败：不得推送、不得部署、不得只更新 Vercel。
- Vercel 已上线但 OSS 目录缺失：立即回滚 Vercel，或补齐同版本 OSS 文件后重新验证。
- 浏览器仍读旧配置：先检查线上 HTML 和 `app-version.json` 是否一致，不要通过覆盖旧 OSS 目录解决；任何运行时修复都递增版本。
- 纯文档且不部署的提交可跳过版本与 OSS 上传；一旦该提交会触发生产部署，仍需确认生产运行时版本对应的 OSS 目录完整。

---

# 更新日志维护

用户入口：

```
设置 → 关于 → 更新日志
```

更新日志来源：

- `scripts/generate-changelog.js` 读取已经提交的 Git 历史。
- 本轮功能尚未提交时，使用 `--pending "具体变化"` 和可重复的 `--detail "用户结果"` 在提交前生成，使功能与日志进入同一个提交。
- 下一轮生成时必须从该功能提交中恢复“本次更新”并替换为真实提交哈希，不能丢失已写明的事实。
- 工作区只有无需展示的维护改动时，显式使用 `--skip-pending`。
- `data/changelog.js` 是生成结果，不得手工维护。
- 页面只在打开“更新日志”分栏时加载数据，不得加入首屏脚本链。

功能完成后、提交前优先运行：

```powershell
node scripts\generate-changelog.js --pending "具体变化" --detail "用户结果"
```

生成规则必须保持：

- 不直接展示 Commit Message 或原始英文正文。
- 从主题和正文中提取具体功能、动作与用户影响。
- 自动识别“修复”“新增”“改进”“优化”四类标签。
- 过滤版本号、文档、测试、文件名和内部构建噪声。
- 过滤只修改 `data/changelog.js` 的历史提交。
- 生成内容未变化时不得仅因时间戳重写文件。
- 信息不足的提交不展示，不使用“改进整体体验”一类通用模板补写。
- 同一天内容完全相同的记录合并。

提交信息必须尽量写清：

- 修改对象；
- 具体动作；
- 对用户的结果。

避免只写：

- update
- fix
- 优化功能
- 更新代码

修改生成规则后必须抽查近期和早期记录，确认内容有实际差异，再运行统一检查。

---

# 关键文件

- index.html

页面结构、关键资源加载、早期性能模式、iOS 高度初始化。

- css/style.css

全部基础、桌面、移动端、iOS 样式。

- css/design-system.css

`design-test.html` 的组件视觉基准；收藏中心工具栏和卡片调整后需要同步。

- css/settings.css

设置中心、按需设置组件及其移动端样式。

- js/main.js

首屏流程、提示、导航交互、更新检测。

- js/set.js

Cookies、搜索、搜索建议、壁纸、设置。

- js/settings.js

设置中心分组、“关于”页面、更新日志延迟加载与渲染。

同时维护收藏中心显示行数 `sksir-bookmark-visible-rows`；合法范围为 1 至 6，未设置或损坏值必须回退默认六行，内容超出面板后由收藏内容区承接滚动。

- js/bookmarks.js

收藏中心搜索、筛选、工具栏和面板交互。

- data/sites.js

收藏与分类唯一数据源。

- data/changelog.js

从 Git 历史生成的更新日志运行时数据，不手工编辑。

- js/nav-render.js

收藏卡片渲染。

- js/status-dot.js

状态检测。

- api/check.js

接口检测。

- scripts/check.js

统一检查入口。

- scripts/generate-changelog.js

提取 Git 提交事实、转换用户可读说明、分类并生成更新日志。

---

# 必须保持的架构

首屏目标：

约 0.5 秒。

---

首屏优先：

- 时间
- 搜索框
- 页面布局
- 壁纸

---

不得阻塞首屏：

- 远程图标
- 访客信息
- 状态检测
- 更新检查
- 更新日志数据

---

要求：

- 收藏数据和渲染在首屏后加载
- 状态检测按需加载
- 远程图标延迟加载
- 远程图标分批加载

---

移动端和 iOS 覆盖规则：

统一放：

```
css/style.css
```

末尾。

使用：

- media query
- html.ios-safari
- html.ios-standalone

限制范围。

---

不要恢复：

- css/mobile.css
- css/animation.css
- css/font.css
- js/toast-loader.js
- js/js.cookie.js

---

保留：

- 本地 MiSans UI 子集
- 页脚 #app-version
- footer-separator

---

奖励分组：

只是前端隐藏。

不是安全隔离。

未经确认不要移动到公开分组。

---

# 搜索与移动端注意事项

必须保持：

```
.all-search
```

存在：

```
translateY(0)
```

以及 transform 过渡。

---

搜索：

必须：

- 搜索态隐藏 placeholder
- 高频布局更新使用 requestAnimationFrame
- 搜索建议失败不能清空本地收藏结果
- 离线不要请求百度联想

---

输入框：

不得低于：

```
16px
```

---

# iOS 键盘处理规范

以下方案禁止：

- 根据 visualViewport.offsetTop 反向移动整个页面
- 聚焦后循环 window.scrollTo
- 强制滚动锁
- touchstart 提前切换搜索态
- 改成顶部 fixed 搜索栏
- 键盘动画期间持续写 visualViewport.height

---

处理 iOS 键盘问题：

必须：

先采集真实设备：

- innerHeight
- scrollY
- visualViewport.height
- visualViewport.offsetTop
- activeElement
- standalone 状态

不要猜测性修改整页。

---

# iOS 背景与安全区

保持：

index.html：

- --app-height
- --ios-bg-height
- --ios-standalone-bg-height

---

css/style.css：

使用：

- html.ios-safari
- html.ios-standalone

---

js/set.js：

保持：

```
--ios-wallpaper-image
```

同步。

---

不要随意修改：

- 壁纸 object-fit
- 背景缩放
- fixed 定位
- 安全区扩展

---

设置按钮、Toast、访客信息、页脚：

必须尊重：

```
safe-area-inset
```

---

sw.js：

只允许：

- 注销历史 Service Worker
- 清理旧 nav-cache

禁止重新加入：

- 离线缓存
- 安装能力

---

# 性能与安全边界

高配设备：

保留完整视觉效果。

降级：

只允许：

- perf-lite
- prefers-reduced-motion

---

不要：

仅根据：

```
hardwareConcurrency
```

判断设备性能。

---

/api/check：

只能检测：

data/sites.js

中的域名。

必须拦截：

- localhost
- 内网地址
- metadata 地址

---

当前不做：

- 复杂后台
- 严格 CSP
- 外部限流
- 用户认证

除非线上出现实际需求。

---

# AI 浏览器验证策略

涉及 UI 修改时：

不要每次执行完整视觉回归。

根据修改范围选择等级。

---

## Level 1：快速检查（日常）

适用于：

- 颜色修改
- 间距修改
- 字体修改
- 小动画修改

执行：

- 代码检查
- 基础页面确认

无需 Chrome MCP。

---

## Level 2：局部视觉验证（推荐）

适用于：

- Modal 修改
- 设置页面修改
- 搜索交互修改
- 组件布局修改

使用 Chrome 工具：

检查：

1. 打开相关页面
2. Console 错误
3. 当前功能截图
4. 布局
5. 圆角
6. 动画

只检查相关区域。

不要测试无关页面。

---

## Level 3：完整视觉回归（发布前）

适用于：

- 首页结构修改
- 首屏优化
- 移动端适配
- 大范围 UI 重构

执行：

1. 打开本地页面
2. Console 检查
3. Network 检查
4. 桌面截图
5. 移动端截图
6. 检查布局偏移
7. 修改后再次验证

---

## 浏览器工具原则

优先：

使用 Codex Chrome 工具。

不要：

- 伪造截图结果
- 伪造 Console 结果
- 伪造 Network 结果

如果浏览器不可用：

明确说明。

继续完成：

- 代码检查
- 静态分析

---

# 发布前检查

发布阻塞顺序：

1. 版本和更新日志已同步。
2. 功能提交已经完成。
3. `node scripts\upload-oss-assets.js` 在提交后运行并通过。
4. OSS 当前版本关键资源验证通过。
5. 才能推送并触发 Vercel。

必须：

```
node scripts\check.js
```

通过。

---

必须：

```
git diff --check
```

通过。

---

确认：

- data/app-version.json
- index.html 页脚版本

一致。

---

检查：

PC：

- 首页
- 搜索
- 收藏
- 设置

正常。

---

iPhone Safari：

检查：

- 搜索键盘
- 背景铺满
- 安全区

---

Android：

检查：

- 输入框
- 搜索建议
- 分类横向滚动

正常。
```
