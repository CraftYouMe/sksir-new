# Phase 5 设置中心

日期：2026-07-26  
版本：`2026.07.26.2`

## 设置分组

- 搜索：默认搜索引擎及新增、编辑、删除、重置。
- 背景：随机壁纸、每日必应和自定义壁纸。
- 性能及数据：自动、完整、轻量模式，本机数据导出与确认重置，当前版本。
- 快捷入口：显示开关、桌面/手机数量、自动顺序、自定义入口。

快捷入口从性能概念中独立，但原控件 ID、事件绑定和 localStorage 键全部保留。

## 数据兼容

- 搜索引擎继续使用 `se_list`、`se_default` Cookie。
- 壁纸继续使用 `bg_img` Cookie 与 `bg_img_last_src` localStorage。
- 性能继续使用 `sksir-performance-mode`。
- 快捷入口继续使用原 `sksir-quick-launch-*` 键。
- 没有格式迁移，也没有清空旧配置。

导出功能下载包含站点相关 localStorage 和三个配置 Cookie 的 JSON 文件。重置功能有确认步骤，只清理站点命名空间数据和对应 Cookie，然后刷新页面。

## 移动端

- 四个设置 tab 在窄屏横向滚动。
- 设置内容继续在原面板内部滚动。
- 控件继续使用既有安全区和至少 16px 的输入字号规则。

## 验证

- 原设置控件 ID 和事件选择器保留。
- 页脚 `#app-version` 与 `.footer-separator` 保留。
- `node scripts/check.js` 与 `git diff --check` 通过。
