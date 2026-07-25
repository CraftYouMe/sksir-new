# Phase 2 收藏数据模型与迁移报告

日期：2026-07-25  
版本：`2026.07.25.2`

## 数据源与发布格式

- `data/sites.json` 是规范化收藏源数据，日常维护不再编辑分类数组、`target` 或 `rel`。
- `data/sites.js` 是由 `node scripts/migrate-sites.js --generate-runtime` 生成的兼容发布文件。
- 线上仍按用户打开收藏后才加载 `data/sites.js`，没有给首屏增加 JSON 请求。
- `js/nav-render.js` 同时兼容规范化模型与旧 `tabs/items` 模型。
- `/api/check` 从 `data/sites.json` 提取允许域名。

## 字段语义

站点必填字段：`id`、`name`、`url`、`group`。

可选字段：

- `category`：组内分类，分类列表由条目首次出现顺序自动推导。
- `description`：站点简介。
- `icon`：`auto`、HTTP(S) 地址或项目内相对资源。
- `featured`：保留给后续快捷入口候选功能，本次迁移不猜测设置。
- `statusCheck`：设为 `false` 时跳过状态检测。
- `hidden`：隐藏内容标记。
- `searchKey`：兼容现有显式搜索关键字。

渲染器统一补充 `target="_blank"` 与 `rel="noopener noreferrer"`。

旧字段映射：

| 旧字段 | 新字段/行为 |
|---|---|
| tab `title` | group `name` / site `group` |
| item `desc` | `description` |
| item `category` | `category` |
| `skipCheck` | `statusCheck: false` |
| `favoriteCheck` | `statusCheck: false` |
| tab `lock` | group `hidden: true` 与原 `lock` |
| `target` / `rel` | 由运行时生成器统一提供 |
| tab `categories` | 从同组站点自动推导 |

`favoriteCheck` 的映射依据现有 `status-dot.js`：它与 `skipCheck` 都会跳过检测，并不代表首页推荐。

## 迁移结果

| 项目 | 迁移前 | 迁移后 |
|---|---:|---:|
| 分组 | 6 | 6 |
| 站点 | 86 | 86 |
| 唯一 ID | 无 | 86 |
| 隐藏站点 | 11 | 11 |
| 跳过状态检测 | 12 | 12 |

分组数量保持：

- 常用：17
- 影音：11
- 工具：13
- 收藏：30
- 装机：4
- 奖励：11

检测到 11 个跨分组重复 URL，均为原数据中同一站点被有意放入多个分组。没有同组重复 URL。生成运行时文件与规范化数据逐字一致性由校验脚本检查。

`奖励` 分组继续保留 `hidden: true`、原密码锁配置和 `visibility:hidden` 容器样式，11 个站点逐条标记为隐藏。

## 命令

```powershell
# 预览旧格式迁移统计，不写文件
node scripts\migrate-sites.js

# 首次生成规范化数据；已有文件时必须显式加 --force
node scripts\migrate-sites.js --write

# 从规范化数据刷新线上兼容文件
node scripts\migrate-sites.js --generate-runtime

# 严格校验规范化数据与发布文件
node scripts\validate-sites.js --strict
```

迁移写入使用临时文件后替换，不会在未显式指定写入参数时覆盖数据。

## 安全验证

`/api/check` 继续只允许收藏数据内的 HTTP(S) 公网域名。以下目标均返回 403：

- `127.0.0.1`
- `169.254.169.254`
- 不在收藏数据中的 `example.com`

环回、内网、link-local、metadata 和解析到私网地址的后续拦截逻辑未删除。
