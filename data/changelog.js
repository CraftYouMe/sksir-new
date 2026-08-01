window.SKSIR_CHANGELOG = {
  "generatedAt": "2026-08-01T13:46:38.221Z",
  "source": "git",
  "entries": [
    {
      "hash": "本次更新",
      "date": "2026-08-01",
      "summary": "修正首页快捷入口图标的双层容器",
      "details": [
        "首页快捷入口保留按钮自身的玻璃容器，内部 favicon 恢复为无背景图片，消除框中框观感",
        "收藏中心继续使用 28px 圆形轻玻璃 favicon，按使用场景区分容器层级"
      ],
      "tags": [
        "fix"
      ]
    },
    {
      "hash": "09644c1",
      "date": "2026-08-01",
      "summary": "新增设计规范测试页并优化 favicon 轻玻璃容器",
      "details": [
        "从首页搜索、收藏卡片与分类、设置表单和壁纸弹窗中提炼统一变量及 ds- 共享组件，并覆盖交互状态与移动端布局",
        "在设计测试页使用彩色、黑白和透明边距 favicon 验证 28px 圆形轻玻璃容器，再同步到收藏卡片与首页快捷启动",
        "降低图标背景、描边和动画重量，移除独立投影与图标缩放，卡片悬浮时只轻微增强图标亮度",
        "取消收藏卡片与快捷启动 hover 的向上位移，避免顶部项目被容器边界裁切"
      ],
      "tags": [
        "new",
        "improve",
        "optimize"
      ]
    },
    {
      "hash": "c0a15e7",
      "date": "2026-08-01",
      "summary": "统一首页与设置中心的玻璃视觉细节",
      "details": [
        "收藏 favicon 使用一致的半透明圆角容器，透明图标和不同尺寸图标呈现更整齐",
        "搜索框增强背景透出、高光和悬浮层次，保持首屏结构与交互尺寸不变",
        "收藏卡片增加轻量抬升、边框高亮和图标联动反馈，仅在支持悬浮的设备启用",
        "设置中心的尺寸、顶栏、玻璃底色和选项卡片统一为收藏中心视觉语言"
      ],
      "tags": [
        "new",
        "improve",
        "optimize"
      ]
    },
    {
      "hash": "fb76bbf",
      "date": "2026-08-01",
      "summary": "稳定收藏卡片间隔区域的拖动换位",
      "details": [
        "拖动中心停留在卡片横向间隔或上下行间距时保持当前位置，不再反复切换相邻落点",
        "只有明确进入另一张卡片内部稳定区后才触发补位，保留原有实时动画与排序手感"
      ],
      "tags": [
        "improve"
      ]
    },
    {
      "hash": "de8840a",
      "date": "2026-08-01",
      "summary": "精修收藏卡片动态换位",
      "details": [
        "恢复上一版随拖动实时换位的动画与手感，不再冻结整张网格槽位",
        "长条形收藏卡片经过网格中间时使用不含动画偏移的布局坐标判定，减少目标反复切换造成的抽搐",
        "新增收藏的加号卡片固定在排序区域末尾，不参与收藏卡片换位"
      ],
      "tags": [
        "new"
      ]
    },
    {
      "hash": "8693caa",
      "date": "2026-08-01",
      "summary": "改善收藏卡片换位动画的连续性",
      "details": [
        "拖动开始时固定网格槽位，命中判断不再受正在补位的卡片动画影响，减少跨行拖动抖动",
        "卡片从当前可见位置连续补到新槽位，下一行卡片不会突然跳回后再移动",
        "自动滚动收藏区域时同步修正槽位坐标，保持拖动落点准确"
      ],
      "tags": [
        "fix"
      ]
    },
    {
      "hash": "d442202",
      "date": "2026-08-01",
      "summary": "将收藏卡片拖动改为手机桌面式网格换位",
      "details": [
        "拖动中心靠近哪个图标槽，占位卡就直接换到该槽位，不再按行边界和左右半区推算",
        "当前占位槽会保持锁定，只有拖动中心真正离开并靠近新图标时才换位，减少跨行跳格和抖动",
        "周围卡片继续平滑补位，松手前看到的网格顺序与最终结果一致"
      ],
      "tags": [
        "improve"
      ]
    },
    {
      "hash": "e84e5f1",
      "date": "2026-08-01",
      "summary": "解决收藏卡片垂直拖动时的列偏移",
      "details": [
        "落点改用被拖动卡片的中心位置计算，从卡片左侧、中心或右侧抓取都能保持目标列",
        "卡片中心与目标中心重合时优先落入当前列，避免误判到下一列边缘"
      ],
      "tags": [
        "fix"
      ]
    },
    {
      "hash": "b53f72a",
      "date": "2026-08-01",
      "summary": "精修收藏卡片拖动排序的命中与落点反馈",
      "details": [
        "相邻左右移动按卡片中点区分插入前后，不再需要多拖一个位置",
        "跨行拖动排除源卡片的错误坐标，落点不会先跳到边缘再偏向左侧",
        "使用真实网格占位卡展示松手后的最终位置，并让周围卡片平滑让位",
        "拖动被系统取消时恢复原顺序，避免误保存未完成的调整"
      ],
      "tags": [
        "fix",
        "improve"
      ]
    },
    {
      "hash": "11a40f3",
      "date": "2026-08-01",
      "summary": "将设置中心样式改为按需加载",
      "details": [
        "首屏样式体积减少约四成，缩短完整样式表对首次绘制的阻塞",
        "设置中心在打开前并行加载专用样式和控制脚本，首页、搜索、收藏及 iOS 样式保持原有加载方式"
      ],
      "tags": [
        "optimize"
      ]
    },
    {
      "hash": "74600fe",
      "date": "2026-08-01",
      "summary": "改善冷启动首屏反馈与启动完成时机",
      "details": [
        "浏览器解析页面后立即显示启动背景和加载动画，不再先经历无反馈黑屏",
        "首屏解除遮罩不再等待高清壁纸加载，版本检查等非首屏任务继续延后执行"
      ],
      "tags": [
        "optimize"
      ]
    },
    {
      "hash": "30b404f",
      "date": "2026-07-31",
      "summary": "解决首屏搜索框玻璃背景闪变",
      "details": [
        "开屏遮罩淡出时搜索框直接保持最终玻璃质感，不再从透明状态突然补上背景"
      ],
      "tags": [
        "fix",
        "optimize"
      ]
    },
    {
      "hash": "65ce664",
      "date": "2026-07-31",
      "summary": "改善开屏体验与本地预览流程",
      "details": [
        "首屏关键内容和壁纸准备完成后统一淡入，避免页面组件逐块拼接出现",
        "站点图标改用版本化 OSS 缓存，减少线上 Apple Touch Icon 的慢请求",
        "新增 npm run preview 命令并完整映射内置壁纸与图标，无需上传 OSS 即可测试当前工作区"
      ],
      "tags": [
        "new",
        "optimize"
      ]
    },
    {
      "hash": "e8091bb",
      "date": "2026-07-30",
      "summary": "回归首屏关键资源加载策略",
      "details": [
        "提前建立 OSS 连接，壁纸恢复立即高优先级加载，异常情况下首屏约 1.2 秒内显示"
      ],
      "tags": [
        "fix",
        "optimize"
      ]
    },
    {
      "hash": "3b03609",
      "date": "2026-07-30",
      "summary": "静态资源迁移并修复壁纸设置",
      "details": [
        "首页静态资源改为从阿里云 OSS 版本目录读取，减少国内访问跨境等待",
        "每日壁纸改为打开设置时从官方必应接口获取，避免旧接口失效导致图片破损",
        "手机端精选壁纸使用竖屏比例完整预览，避免横向卡片异常裁切"
      ],
      "tags": [
        "fix"
      ]
    },
    {
      "hash": "1716ee9",
      "date": "2026-07-30",
      "summary": "静态资源迁移至阿里云 OSS 直连",
      "details": [
        "首页 CSS、脚本、字体、收藏数据、图标和壁纸改为从北京 OSS 版本目录读取，减少国内访问 Vercel 跨境链路等待"
      ],
      "tags": [
        "improve"
      ]
    },
    {
      "hash": "d4f8d25",
      "date": "2026-07-30",
      "summary": "改善导航站首屏图片、壁纸、设置资源和缓存策略",
      "details": [
        "收藏图标统一使用 64×64 WebP，内置图片改为随站点同源部署，避免 OSS 默认域名强制下载",
        "移动端和桌面端按设备加载响应式壁纸，启动遮罩在样式就绪后揭示首屏，不再等待壁纸，壁纸继续低优先级加载",
        "设置中心与壁纸管理脚本改为使用时加载，减少首页请求与脚本解析",
        "字体启用 swap，并为带版本号的静态资源和不可覆盖的图片目录配置长期缓存"
      ],
      "tags": [
        "optimize"
      ]
    },
    {
      "hash": "7c7de82",
      "date": "2026-07-30",
      "summary": "精修移动端与桌面端关于页面布局",
      "details": [
        "放大品牌卡片并重新分配文字与版本信息空间，避免描述和版本重叠",
        "新增设计原则内容区，减少关于页面下半部分空白并保持玻璃拟态风格",
        "保持安卓设置卡片宽度与 Safari 更新日志防重叠修复"
      ],
      "tags": [
        "fix",
        "new",
        "improve"
      ]
    },
    {
      "hash": "349601b",
      "date": "2026-07-30",
      "summary": "解决移动端关于页面与更新日志布局",
      "details": [
        "iPhone Safari 中关于卡片恢复紧凑高度，长更新日志不再重叠",
        "安卓移动浏览器扩大设置卡片可用宽度，并拉开版本信息与简介的间距",
        "完善日志按应用版本刷新缓存，升级后可立即看到最新记录"
      ],
      "tags": [
        "fix",
        "improve",
        "optimize"
      ]
    },
    {
      "hash": "6cfb556",
      "date": "2026-07-29",
      "summary": "解决触摸设备收藏交互与关于卡片拉伸",
      "details": [
        "所有触摸型平板统一使用收藏中心外层纵向滚动，不再受屏幕宽度上限影响",
        "手机端收藏内容与分类标签拖动默认关闭，禁用时脚本和按压动画都不会触发小幅排序",
        "触摸设备横向滑动分类栏会取消拖动，只有开启设置并静止长按后才进入排序",
        "关于本站品牌卡片同时锁定高度和 flex 尺寸，避免 iPhone Safari 拉伸",
        "本站想法卡片使用内容高度和顶部对齐，不再填充关于页面剩余空间"
      ],
      "tags": [
        "fix"
      ]
    },
    {
      "hash": "1949aca",
      "date": "2026-07-29",
      "summary": "完善手机与平板收藏中心交互",
      "details": [
        "平板收藏中心改由外层内容区域统一纵向滚动，收藏较多时可以正常上下浏览",
        "平板和手机的收藏滚动条使用对称预留空间，不覆盖卡片且不产生横向溢出",
        "手机端收藏中心标题禁止压缩换行，并收窄搜索框避免与设置、关闭按钮争抢空间",
        "触摸设备的分类排序改为静止长按后启动，普通横向滑动不再误触拖动",
        "关于本站品牌卡片和本站想法卡片压缩高度、内边距与文字行距"
      ],
      "tags": [
        "improve"
      ]
    },
    {
      "hash": "185829a",
      "date": "2026-07-29",
      "summary": "解决移动端布局并统一搜索引擎设置页",
      "details": [
        "收藏中心改由内容区域统一纵向滚动并预留滚动条安全间距，较多收藏卡片不再被裁切或遮挡",
        "收藏拖动设置在移动端正确启停，关闭后恢复页面上下滑动手势",
        "重置收藏中心按钮恢复正常宽度，关于本站卡片压缩移动端高度",
        "搜索引擎列表移除多余外框，默认搜索引擎只保留一层选中边框",
        "重置搜索引擎沿用快捷入口样式，并重新平衡列表、分隔线和操作内容之间的间距"
      ],
      "tags": [
        "fix",
        "improve"
      ]
    },
    {
      "hash": "4247d25",
      "date": "2026-07-29",
      "summary": "完善收藏中心与首页快捷入口管理",
      "details": [
        "收藏卡片右键菜单新增删除收藏，内置收藏删除前提供确认并提示可通过重置恢复",
        "重置收藏中心会恢复被删除的默认收藏，同时重置分类、内容顺序、自定义收藏和拖动开关",
        "解决右键菜单位于收藏面板外部时触发全局关闭逻辑的问题，删除后保留当前分类和页面状态",
        "解决默认快捷入口被重复添加后需要多次删除的问题，一次删除会清理同网址的自定义、排序和默认显示记录",
        "收藏卡片右键添加到首页复用快捷入口数量扩充与重复检测逻辑"
      ],
      "tags": [
        "fix",
        "new",
        "improve",
        "optimize"
      ]
    },
    {
      "hash": "9b31bbf",
      "date": "2026-07-29",
      "summary": "完善收藏与搜索设置并精修首页快捷入口",
      "details": [
        "收藏内容拖动新增独立开关，收藏中心支持恢复默认内容并移除自定义收藏",
        "搜索建议和点击记录建议可分别控制在线联想与空搜索框推荐",
        "首页固定快捷入口在首屏阶段直接渲染，远程图标未就绪时显示稳定字母图标",
        "快捷入口图标改为主动加载，相同内容不再因收藏数据就绪而重复销毁重建",
        "快捷入口名称提示移到图标下方，避免覆盖搜索框"
      ],
      "tags": [
        "new",
        "improve",
        "optimize"
      ]
    },
    {
      "hash": "09fde1d",
      "date": "2026-07-29",
      "summary": "完善收藏排序设置、搜索建议控制与部署更新",
      "details": [
        "收藏内容拖动新增独立开关并默认开启，关闭后保留当前顺序但停止拖动",
        "收藏中心新增完整重置，可恢复默认内容和顺序并移除所有自定义收藏",
        "搜索建议新增总开关，关闭后不显示本地结果且不请求在线联想",
        "新增点击记录建议开关，可控制选中无内容搜索框时是否显示点击过的收藏",
        "收藏落点框首次定位直接出现，后续切换卡片时再平滑移动"
      ],
      "tags": [
        "new",
        "improve"
      ]
    },
    {
      "hash": "d5cec3b",
      "date": "2026-07-29",
      "summary": "解决更新日志生成流程并完善收藏内容拖动排序",
      "details": [
        "收藏页面中的网站卡片支持拖动排序，每个页面分别保存顺序",
        "拖动落点按卡片区域直接命中，起拖时保持当前卡片并在放手时使用最终指针位置",
        "拖动浮层保持横向卡片比例，加号不参与落点选择",
        "覆盖式落点框解决行尾阴影与首排卡片裁切",
        "上方分类拖动改为设置开关，默认关闭并可恢复原始顺序"
      ],
      "tags": [
        "fix",
        "new",
        "improve"
      ]
    },
    {
      "hash": "ac2bf6d",
      "date": "2026-07-29",
      "summary": "改进快捷入口与收藏导航的交互与显示细节",
      "details": [],
      "tags": [
        "new",
        "improve",
        "optimize"
      ]
    },
    {
      "hash": "7b5d728",
      "date": "2026-07-29",
      "summary": "新增重置快捷入口功能",
      "details": [
        "完善版本信息并优化更新日志生成"
      ],
      "tags": [
        "new",
        "improve",
        "optimize"
      ]
    },
    {
      "hash": "9fb695c",
      "date": "2026-07-29",
      "summary": "改进快捷入口与本机数据的交互与显示细节",
      "details": [],
      "tags": [
        "new",
        "improve"
      ]
    },
    {
      "hash": "2a58d4a",
      "date": "2026-07-29",
      "summary": "新增变更日志生成器并优化页面性能",
      "details": [],
      "tags": [
        "new",
        "improve",
        "optimize"
      ]
    },
    {
      "hash": "055b10d",
      "date": "2026-07-29",
      "summary": "改进页面性能与项目维护的交互与显示细节",
      "details": [],
      "tags": [
        "fix",
        "new",
        "improve",
        "optimize"
      ]
    },
    {
      "hash": "727ae3c",
      "date": "2026-07-29",
      "summary": "改善快捷入口和性能设置界面",
      "details": [
        "不再显示访客徽章，页面更加简洁"
      ],
      "tags": [
        "new",
        "improve",
        "optimize"
      ]
    },
    {
      "hash": "5fe8586",
      "date": "2026-07-28",
      "summary": "优化快捷入口设置页面，操作层级更加清晰",
      "details": [
        "新增快捷入口时不再显示大型提示卡，改用简洁的辅助说明",
        "精简设置页面中的重复标题，信息层级更加清楚",
        "快捷入口开关改为系统设置式布局，状态更直观",
        "桌面端与移动端可分别设置快捷入口数量",
        "快捷入口排序方式改为分段选择控件，并补充对应说明"
      ],
      "tags": [
        "fix",
        "new",
        "improve",
        "optimize"
      ]
    },
    {
      "hash": "cfcb354",
      "date": "2026-07-28",
      "summary": "改进快捷入口保存逻辑，设置结果更可靠",
      "details": [],
      "tags": [
        "new",
        "improve",
        "optimize"
      ]
    },
    {
      "hash": "60adfaa",
      "date": "2026-07-28",
      "summary": "完善快捷入口功能",
      "details": [
        "简化快捷入口的添加与管理流程"
      ],
      "tags": [
        "new",
        "improve",
        "optimize"
      ]
    },
    {
      "hash": "c8eddf1",
      "date": "2026-07-28",
      "summary": "改善设置菜单样式和功能",
      "details": [],
      "tags": [
        "new",
        "improve",
        "optimize"
      ]
    },
    {
      "hash": "f215135",
      "date": "2026-07-28",
      "summary": "完善设置中心样式",
      "details": [
        "改善壁纸选择功能"
      ],
      "tags": [
        "new",
        "improve",
        "optimize"
      ]
    },
    {
      "hash": "f36c567",
      "date": "2026-07-26",
      "summary": "增强搜索引擎列表的安全性",
      "details": [],
      "tags": [
        "new",
        "improve"
      ]
    },
    {
      "hash": "a62adba",
      "date": "2026-07-26",
      "summary": "拆分前端功能模块，降低功能之间的相互影响",
      "details": [
        "改进快捷入口与搜索引擎的交互与显示细节",
        "加强异常数据处理，损坏配置可自动回退"
      ],
      "tags": [
        "new",
        "improve",
        "optimize"
      ]
    },
    {
      "hash": "2ddf753",
      "date": "2026-07-26",
      "summary": "完善搜索引擎面板样式和动画",
      "details": [
        "取消搜索区域强制上移规则，避免布局跳动"
      ],
      "tags": [
        "new",
        "improve"
      ]
    },
    {
      "hash": "4f53d4c",
      "date": "2026-07-26",
      "summary": "新增必应搜索建议，输入时可获得更多联想结果",
      "details": [],
      "tags": [
        "new",
        "improve",
        "optimize"
      ]
    },
    {
      "hash": "4cccf7b",
      "date": "2026-07-26",
      "summary": "新增统一设置中心，可集中管理搜索、壁纸、性能和快捷入口",
      "details": [
        "拆分前端功能模块，降低功能之间的相互影响",
        "新增本机数据导出与重置功能",
        "新增收藏筛选与搜索，查找站点更加方便",
        "改进快捷入口与搜索引擎的交互与显示细节"
      ],
      "tags": [
        "new",
        "improve",
        "optimize"
      ]
    },
    {
      "hash": "7c5c3bc",
      "date": "2026-07-26",
      "summary": "新增本地书签管理工具，可添加、编辑和删除网站",
      "details": [
        "新增网站数据校验",
        "改善文件写入安全性",
        "新增书签中心，支持搜索、筛选和移动端布局",
        "新增书签搜索功能",
        "改善用户界面"
      ],
      "tags": [
        "new",
        "improve",
        "optimize"
      ]
    },
    {
      "hash": "b1f0266",
      "date": "2026-07-20",
      "summary": "完善快捷入口功能",
      "details": [],
      "tags": [
        "improve",
        "optimize"
      ]
    },
    {
      "hash": "66670a2",
      "date": "2026-07-20",
      "summary": "新增快捷入口功能",
      "details": [],
      "tags": [
        "new",
        "improve"
      ]
    },
    {
      "hash": "03f6749",
      "date": "2026-07-20",
      "summary": "改善搜索功能相关逻辑",
      "details": [],
      "tags": [
        "improve",
        "optimize"
      ]
    },
    {
      "hash": "5ddd3af",
      "date": "2026-07-20",
      "summary": "改善关闭搜索功能的事件处理",
      "details": [],
      "tags": [
        "improve",
        "optimize"
      ]
    },
    {
      "hash": "4c1865d",
      "date": "2026-07-20",
      "summary": "完善搜索功能",
      "details": [
        "精简取消搜索按钮并优化相关样式"
      ],
      "tags": [
        "improve",
        "optimize"
      ]
    },
    {
      "hash": "ceac32b",
      "date": "2026-07-20",
      "summary": "完善搜索功能",
      "details": [
        "新增取消搜索按钮并优化样式"
      ],
      "tags": [
        "new",
        "improve",
        "optimize"
      ]
    },
    {
      "hash": "f84d8f6",
      "date": "2026-07-20",
      "summary": "避免移动端键盘弹出时页面整体偏移",
      "details": [],
      "tags": [
        "improve"
      ]
    },
    {
      "hash": "cd84097",
      "date": "2026-07-19",
      "summary": "修复搜索层关闭控件，退出搜索更加可靠",
      "details": [],
      "tags": [
        "fix"
      ]
    },
    {
      "hash": "cdd96c6",
      "date": "2026-07-19",
      "summary": "改进搜索关闭按钮的键盘与无障碍操作",
      "details": [],
      "tags": [
        "improve"
      ]
    },
    {
      "hash": "edade10",
      "date": "2026-07-19",
      "summary": "修复搜索层的打开与关闭交互",
      "details": [],
      "tags": [
        "fix"
      ]
    },
    {
      "hash": "de31c4b",
      "date": "2026-07-19",
      "summary": "调整移动端搜索布局，键盘弹出时显示更稳定",
      "details": [],
      "tags": [
        "improve"
      ]
    },
    {
      "hash": "d64989f",
      "date": "2026-07-19",
      "summary": "修复 iOS 添加到主屏幕后页面无法正常滚动的问题",
      "details": [],
      "tags": [
        "fix",
        "improve"
      ]
    },
    {
      "hash": "5eb06cd",
      "date": "2026-07-19",
      "summary": "修复 iOS 键盘弹出时页面位置偏移的问题",
      "details": [],
      "tags": [
        "fix"
      ]
    },
    {
      "hash": "5163245",
      "date": "2026-07-19",
      "summary": "修复 iOS 独立模式下的搜索布局",
      "details": [],
      "tags": [
        "fix",
        "improve",
        "optimize"
      ]
    },
    {
      "hash": "3b94fce",
      "date": "2026-07-19",
      "summary": "修复 iOS 独立模式下壁纸高度和铺满显示",
      "details": [],
      "tags": [
        "fix"
      ]
    },
    {
      "hash": "d23fc32",
      "date": "2026-07-19",
      "summary": "修复 iOS 独立模式的页面显示",
      "details": [
        "调整添加到主屏幕后使用的主题颜色"
      ],
      "tags": [
        "fix",
        "improve"
      ]
    },
    {
      "hash": "d36eade",
      "date": "2026-07-19",
      "summary": "调整添加到主屏幕后使用的主题颜色",
      "details": [],
      "tags": [
        "improve",
        "optimize"
      ]
    },
    {
      "hash": "1fd98a1",
      "date": "2026-07-19",
      "summary": "修复 iOS 独立模式下的页面高度计算",
      "details": [],
      "tags": [
        "fix"
      ]
    },
    {
      "hash": "0f1fb77",
      "date": "2026-07-19",
      "summary": "访客信息适配手机安全区，避免被底部区域遮挡",
      "details": [],
      "tags": [
        "improve"
      ]
    },
    {
      "hash": "1845ff7",
      "date": "2026-07-19",
      "summary": "调整移动端提示消息位置，避免遮挡主要操作",
      "details": [],
      "tags": [
        "improve"
      ]
    },
    {
      "hash": "8867002",
      "date": "2026-07-19",
      "summary": "修复 iOS 独立模式识别，确保对应适配正确启用",
      "details": [],
      "tags": [
        "fix"
      ]
    },
    {
      "hash": "822d388",
      "date": "2026-07-19",
      "summary": "新增网页应用配置，支持将站点添加到主屏幕",
      "details": [],
      "tags": [
        "new"
      ]
    },
    {
      "hash": "23c5c06",
      "date": "2026-07-16",
      "summary": "改善搜索框和页脚样式",
      "details": [],
      "tags": [
        "fix",
        "improve",
        "optimize"
      ]
    },
    {
      "hash": "e68fd83",
      "date": "2026-07-16",
      "summary": "改善页脚样式",
      "details": [],
      "tags": [
        "fix",
        "improve",
        "optimize"
      ]
    },
    {
      "hash": "fe325b4",
      "date": "2026-07-16",
      "summary": "改善键盘导航和焦点体验",
      "details": [
        "调整无障碍支持"
      ],
      "tags": [
        "fix",
        "new",
        "improve",
        "optimize"
      ]
    },
    {
      "hash": "4863c1a",
      "date": "2026-07-16",
      "summary": "增强键盘导航和焦点体验",
      "details": [
        "改善无障碍支持"
      ],
      "tags": [
        "fix",
        "new",
        "improve",
        "optimize"
      ]
    },
    {
      "hash": "0fcc921",
      "date": "2026-07-16",
      "summary": "为MiSans UI添加构建和验证字体子集的脚本",
      "details": [
        "基于Unicode范围实现了字符收录规则",
        "新增了验证字体子集文件是否存在及其完整性的功能",
        "集成了基于Python的fontTools字体子集化工具",
        "提供了命令行使用说明以及缺失依赖时的错误处理"
      ],
      "tags": [
        "fix",
        "new"
      ]
    },
    {
      "hash": "cf77bac",
      "date": "2026-07-16",
      "summary": "整合关键资源预加载，减少首屏等待",
      "details": [
        "改善首屏加载性能",
        "精简冗余文件"
      ],
      "tags": [
        "fix",
        "improve",
        "optimize"
      ]
    },
    {
      "hash": "c711395",
      "date": "2026-07-16",
      "summary": "整合移动端样式至主样式",
      "details": [
        "精简冗余文件",
        "改善首屏加载请求",
        "提升性能"
      ],
      "tags": [
        "fix",
        "improve",
        "optimize"
      ]
    },
    {
      "hash": "edeec25",
      "date": "2026-07-15",
      "summary": "整合 JavaScript Cookie 脚本至设置脚本",
      "details": [
        "精简冗余文件",
        "改善首屏加载请求",
        "提升性能"
      ],
      "tags": [
        "fix",
        "improve",
        "optimize"
      ]
    },
    {
      "hash": "413daea",
      "date": "2026-07-15",
      "summary": "整合本地提示框脚本至主脚本",
      "details": [
        "精简冗余文件",
        "改善首屏加载请求",
        "提升性能"
      ],
      "tags": [
        "fix",
        "improve",
        "optimize"
      ]
    },
    {
      "hash": "5efb987",
      "date": "2026-07-15",
      "summary": "调整壁纸加载时机，让首屏更快显示",
      "details": [
        "提升首屏性能",
        "整合动画样式"
      ],
      "tags": [
        "fix",
        "improve",
        "optimize"
      ]
    },
    {
      "hash": "afba7a8",
      "date": "2026-07-15",
      "summary": "整合字体样式至主样式",
      "details": [
        "精简冗余文件",
        "改善缓存策略",
        "提升首屏加载性能"
      ],
      "tags": [
        "fix",
        "improve",
        "optimize"
      ]
    },
    {
      "hash": "82e40e2",
      "date": "2026-07-15",
      "summary": "改善首屏加载体验",
      "details": [
        "调整启动遮罩和搜索框表现"
      ],
      "tags": [
        "fix",
        "improve",
        "optimize"
      ]
    },
    {
      "hash": "a7373ac",
      "date": "2026-07-15",
      "summary": "降低搜索建议与分类指示器的重复布局计算",
      "details": [
        "提升移动端交互体验"
      ],
      "tags": [
        "fix",
        "improve",
        "optimize"
      ]
    },
    {
      "hash": "6248f3b",
      "date": "2026-07-15",
      "summary": "延后加载收藏资源，优先显示首屏内容",
      "details": [
        "提升首屏性能"
      ],
      "tags": [
        "fix",
        "improve",
        "optimize"
      ]
    },
    {
      "hash": "c6e4e13",
      "date": "2026-07-15",
      "summary": "整合动画样式",
      "details": [
        "解决移动端标签加载",
        "延后加载收藏资源，优先显示首屏内容",
        "精简未使用的动画文件",
        "增强首屏性能"
      ],
      "tags": [
        "fix",
        "improve",
        "optimize"
      ]
    },
    {
      "hash": "8f83a0e",
      "date": "2026-07-15",
      "summary": "延后加载收藏资源，优先显示首屏内容",
      "details": [
        "增强首屏性能",
        "调整设置面板打开逻辑"
      ],
      "tags": [
        "fix",
        "improve",
        "optimize"
      ]
    },
    {
      "hash": "bda352d",
      "date": "2026-07-15",
      "summary": "分批渲染收藏分组，降低首次打开时的页面压力",
      "details": [
        "减少首次启动 DOM 压力"
      ],
      "tags": [
        "fix",
        "improve",
        "optimize"
      ]
    },
    {
      "hash": "e59697b",
      "date": "2026-07-15",
      "summary": "为搜索建议增加输入防抖，减少连续请求",
      "details": [
        "改善用户体验"
      ],
      "tags": [
        "fix",
        "improve",
        "optimize"
      ]
    },
    {
      "hash": "dddab66",
      "date": "2026-07-15",
      "summary": "新增快速关闭搜索、书签和设置层的功能",
      "details": [
        "改善首屏加载体验"
      ],
      "tags": [
        "fix",
        "improve",
        "optimize"
      ]
    },
    {
      "hash": "47b2a0c",
      "date": "2026-07-15",
      "summary": "改善首屏启动遮罩过渡效果",
      "details": [
        "增强加载动画",
        "调整壁纸加载时机，让首屏更快显示"
      ],
      "tags": [
        "fix",
        "improve",
        "optimize"
      ]
    },
    {
      "hash": "ca09f93",
      "date": "2026-07-15",
      "summary": "改善 iOS Safari 壁纸铺满逻辑",
      "details": [
        "增强首屏加载性能",
        "改进动画效果",
        "调整移动端用户体验"
      ],
      "tags": [
        "improve",
        "optimize"
      ]
    },
    {
      "hash": "cf786b7",
      "date": "2026-07-14",
      "summary": "改善 iOS Safari 壁纸铺满逻辑",
      "details": [
        "调整性能模式",
        "解决首屏加载问题"
      ],
      "tags": [
        "fix",
        "improve",
        "optimize"
      ]
    },
    {
      "hash": "521bfbe",
      "date": "2026-07-14",
      "summary": "改善首屏加载策略",
      "details": [
        "增强启动遮罩效果",
        "调整壁纸加载时机，让首屏更快显示"
      ],
      "tags": [
        "improve",
        "optimize"
      ]
    },
    {
      "hash": "60badeb",
      "date": "2026-07-14",
      "summary": "将应用版本升级到 v2026.07.14.5",
      "details": [],
      "tags": [
        "improve"
      ]
    },
    {
      "hash": "ca08fe5",
      "date": "2026-07-14",
      "summary": "改善首屏启动遮罩效果",
      "details": [
        "调整首屏加载策略",
        "增强性能模式逻辑"
      ],
      "tags": [
        "improve",
        "optimize"
      ]
    },
    {
      "hash": "3d27c70",
      "date": "2026-07-14",
      "summary": "改善首屏过渡效果",
      "details": [
        "延迟非关键任务加载",
        "增强性能模式设置"
      ],
      "tags": [
        "improve",
        "optimize"
      ]
    },
    {
      "hash": "1f14149",
      "date": "2026-07-14",
      "summary": "调整首屏加载策略",
      "details": [
        "延迟非关键任务",
        "改善性能模式",
        "增强安全措施"
      ],
      "tags": [
        "new",
        "improve",
        "optimize"
      ]
    },
    {
      "hash": "f04665a",
      "date": "2026-07-14",
      "summary": "增强项目结构与安全措施",
      "details": [],
      "tags": [
        "new",
        "improve",
        "optimize"
      ]
    },
    {
      "hash": "8cc8bde",
      "date": "2026-07-03",
      "summary": "改善性能模式逻辑",
      "details": [
        "调整相关提示文本",
        "解决缓存版本"
      ],
      "tags": [
        "fix",
        "improve",
        "optimize"
      ]
    },
    {
      "hash": "4c2c869",
      "date": "2026-07-03",
      "summary": "修改相关文件以保持一致性",
      "details": [],
      "tags": [
        "improve"
      ]
    },
    {
      "hash": "7c76e82",
      "date": "2026-07-03",
      "summary": "新增性能模式设置",
      "details": [
        "改善低配设备的动态效果",
        "完善相关样式和脚本"
      ],
      "tags": [
        "new",
        "improve",
        "optimize"
      ]
    },
    {
      "hash": "ebb3dc8",
      "date": "2026-06-16",
      "summary": "改善类别指示器动画",
      "details": [
        "调整移动端样式",
        "解决滚动条样式"
      ],
      "tags": [
        "fix",
        "improve",
        "optimize"
      ]
    },
    {
      "hash": "c415db1",
      "date": "2026-06-16",
      "summary": "新增每日名言功能",
      "details": [
        "改善样式和布局"
      ],
      "tags": [
        "new",
        "improve",
        "optimize"
      ]
    },
    {
      "hash": "8bc77ee",
      "date": "2026-06-16",
      "summary": "完善 AI 项目简介",
      "details": [
        "改善 iOS Safari 高度和键盘处理逻辑",
        "调整更新检测和页脚信息显示"
      ],
      "tags": [
        "improve",
        "optimize"
      ]
    },
    {
      "hash": "b5a610d",
      "date": "2026-06-16",
      "summary": "改善 iOS Safari 适配逻辑",
      "details": [],
      "tags": [
        "improve",
        "optimize"
      ]
    },
    {
      "hash": "356a1ae",
      "date": "2026-06-16",
      "summary": "改善代码结构",
      "details": [
        "调整样式",
        "新增版本检测功能"
      ],
      "tags": [
        "new",
        "improve",
        "optimize"
      ]
    },
    {
      "hash": "7bd01e9",
      "date": "2026-06-15",
      "summary": "改善 iOS Safari 适配",
      "details": [
        "调整背景高度计算逻辑"
      ],
      "tags": [
        "improve",
        "optimize"
      ]
    },
    {
      "hash": "d9f6efc",
      "date": "2026-06-15",
      "summary": "改善 iOS Safari 适配",
      "details": [
        "调整字体加载逻辑"
      ],
      "tags": [
        "improve",
        "optimize"
      ]
    },
    {
      "hash": "4bcafb0",
      "date": "2026-06-15",
      "summary": "改善欢迎提示和更新检查逻辑",
      "details": [],
      "tags": [
        "improve",
        "optimize"
      ]
    },
    {
      "hash": "afa4f4f",
      "date": "2026-06-15",
      "summary": "改善移动端样式",
      "details": [
        "新增底部固定元素和更新检查功能",
        "调整密码输入框样式"
      ],
      "tags": [
        "new",
        "improve",
        "optimize"
      ]
    },
    {
      "hash": "671f129",
      "date": "2026-06-15",
      "summary": "新增更新检查功能",
      "details": [
        "改善服务工作者缓存逻辑"
      ],
      "tags": [
        "new",
        "improve",
        "optimize"
      ]
    },
    {
      "hash": "8fed908",
      "date": "2026-06-14",
      "summary": "改善样式",
      "details": [
        "新增工具栏高度变量",
        "增强响应式设计"
      ],
      "tags": [
        "new",
        "improve",
        "optimize"
      ]
    },
    {
      "hash": "8fd1192",
      "date": "2026-06-13",
      "summary": "改善样式以支持减少运动偏好",
      "details": [
        "完善背景图像和提示框样式"
      ],
      "tags": [
        "new",
        "improve",
        "optimize"
      ]
    },
    {
      "hash": "2a3af4d",
      "date": "2026-06-13",
      "summary": "简化函数名称",
      "details": [
        "精简不必要的 CDN 地址"
      ],
      "tags": [
        "improve",
        "optimize"
      ]
    },
    {
      "hash": "8ef393e",
      "date": "2026-06-13",
      "summary": "改善背景图片处理",
      "details": [
        "新增服务工作者以支持缓存功能"
      ],
      "tags": [
        "new",
        "optimize"
      ]
    },
    {
      "hash": "4892817",
      "date": "2026-06-13",
      "summary": "新增导航站点管理和背景图片处理",
      "details": [
        "完善了 setBgImgInit，使其能根据壁纸类型有条件地应用背景图像，并添加了备用机制"
      ],
      "tags": [
        "new",
        "improve",
        "optimize"
      ]
    },
    {
      "hash": "e3af8be",
      "date": "2026-06-12",
      "summary": "新增 MiSans 字体支持",
      "details": [
        "改善字体加载逻辑",
        "增强页面视觉效果"
      ],
      "tags": [
        "new",
        "improve",
        "optimize"
      ]
    },
    {
      "hash": "c3d9645",
      "date": "2026-06-12",
      "summary": "改善背景颜色和图像加载逻辑",
      "details": [
        "提升视觉效果和加载性能"
      ],
      "tags": [
        "improve",
        "optimize"
      ]
    },
    {
      "hash": "ebe76b6",
      "date": "2026-06-12",
      "summary": "改善背景样式",
      "details": [
        "调整背景图像加载逻辑",
        "增强视觉效果"
      ],
      "tags": [
        "improve",
        "optimize"
      ]
    },
    {
      "hash": "feb3a7e",
      "date": "2026-06-09",
      "summary": "改善密码获取逻辑",
      "details": [
        "增强元素检查",
        "重构状态卡片处理",
        "提升代码健壮性"
      ],
      "tags": [
        "improve",
        "optimize"
      ]
    },
    {
      "hash": "fb57940",
      "date": "2026-06-09",
      "summary": "重构 mobile 和 status-dot 样式",
      "details": [
        "增强链接状态检查功能",
        "重构 index.html，加入新的分类工具和状态检查按钮，以提升用户交互体验"
      ],
      "tags": [
        "new",
        "improve",
        "optimize"
      ]
    },
    {
      "hash": "90deb70",
      "date": "2026-06-09",
      "summary": "改善 toast-loader 样式",
      "details": [
        "调整通知外观和布局",
        "增强响应式设计"
      ],
      "tags": [
        "improve",
        "optimize"
      ]
    },
    {
      "hash": "6ebc2ef",
      "date": "2026-06-08",
      "summary": "新增新在线工具链接",
      "details": [
        "包括Freemodel AI和HERO SMS",
        "完善相关描述"
      ],
      "tags": [
        "new",
        "improve"
      ]
    },
    {
      "hash": "4ef24e5",
      "date": "2026-06-08",
      "summary": "重构搜索引擎设置并改进弹出通知",
      "details": [
        "完善了 index.html 中的搜索引擎按钮，改用数值以提高一致性"
      ],
      "tags": [
        "new",
        "improve",
        "optimize"
      ]
    },
    {
      "hash": "90313bb",
      "date": "2026-06-08",
      "summary": "完善字体样式",
      "details": [
        "改善背景图片加载逻辑",
        "调整壁纸设置说明"
      ],
      "tags": [
        "improve",
        "optimize"
      ]
    },
    {
      "hash": "a4c9ed1",
      "date": "2026-06-08",
      "summary": "新增 toast-loader 模块以动态管理 iziToast 通知",
      "details": [
        "现已支持了一个队列系统，用于在库完全加载完成前处理 toast 通知",
        "为 iziToast 方法创建了一个代理，以确保与加载过程兼容"
      ],
      "tags": [
        "new",
        "optimize"
      ]
    },
    {
      "hash": "237f69f",
      "date": "2026-06-04",
      "summary": "新增新在线工具链接",
      "details": [
        "包括AI抠图、批量重命名和dll缺失修复"
      ],
      "tags": [
        "fix",
        "new"
      ]
    },
    {
      "hash": "c000fb2",
      "date": "2026-06-02",
      "summary": "完善快速链接",
      "details": [
        "修正樱花动漫的URL并移除子子影院链接"
      ],
      "tags": [
        "fix",
        "improve"
      ]
    },
    {
      "hash": "5b09d1d",
      "date": "2026-06-02",
      "summary": "完善快速链接",
      "details": [
        "修正AGE动漫和哔咪动画的URL"
      ],
      "tags": [
        "fix",
        "improve"
      ]
    },
    {
      "hash": "41cd5e3",
      "date": "2026-06-02",
      "summary": "解决链接地址",
      "details": [
        "确保快速链接指向正确的URL"
      ],
      "tags": [
        "fix"
      ]
    },
    {
      "hash": "91ba874",
      "date": "2026-06-02",
      "summary": "调整分类顺序",
      "details": [
        "新增新工具和影视链接",
        "改善内容展示"
      ],
      "tags": [
        "new",
        "improve",
        "optimize"
      ]
    },
    {
      "hash": "24bd92d",
      "date": "2025-09-01",
      "summary": "解决弹窗提示",
      "details": [],
      "tags": [
        "fix"
      ]
    },
    {
      "hash": "5b68a8f",
      "date": "2025-06-26",
      "summary": "新增分类高亮及内容切换功能",
      "details": [
        "完善样式以改善用户体验"
      ],
      "tags": [
        "new",
        "improve"
      ]
    },
    {
      "hash": "1f5a689",
      "date": "2025-06-21",
      "summary": "完善快速链接",
      "details": [
        "新增新网站并移除不必要的链接"
      ],
      "tags": [
        "new",
        "improve"
      ]
    },
    {
      "hash": "b96836e",
      "date": "2025-06-20",
      "summary": "新增访问者徽章并引入 Busuanzi 脚本",
      "details": [],
      "tags": [
        "new"
      ]
    },
    {
      "hash": "3f968ae",
      "date": "2025-06-20",
      "summary": "完善页面标题为“导航酱 - 但行好事",
      "details": [
        "莫问前程”",
        "精简多余的脚本标签"
      ],
      "tags": [
        "improve"
      ]
    },
    {
      "hash": "06abbe5",
      "date": "2025-06-20",
      "summary": "重构问候语逻辑并改进时间处理",
      "details": [
        "完善了可见性更改处理，以正确重置保存时间",
        "重构了时间计算，以确保准确的时间跟踪",
        "将问候语逻辑提取到一个单独的函数中，以提高可读性和可维护性",
        "精简了不必要的控制台日志语句并清理了代码"
      ],
      "tags": [
        "improve"
      ]
    },
    {
      "hash": "d14d0a5",
      "date": "2025-05-26",
      "summary": "再次修改",
      "details": [],
      "tags": [
        "improve"
      ]
    },
    {
      "hash": "448da10",
      "date": "2025-05-26",
      "summary": "再次修改搜索引擎",
      "details": [],
      "tags": [
        "improve"
      ]
    },
    {
      "hash": "202e9e5",
      "date": "2025-05-26",
      "summary": "解决搜索引擎不安全问题",
      "details": [],
      "tags": [
        "fix"
      ]
    },
    {
      "hash": "37d62d9",
      "date": "2025-04-22",
      "summary": "修改跳过检测标签",
      "details": [],
      "tags": [
        "improve"
      ]
    },
    {
      "hash": "d320065",
      "date": "2025-04-22",
      "summary": "新增收藏和跳过检测",
      "details": [],
      "tags": [
        "new"
      ]
    },
    {
      "hash": "032eafd",
      "date": "2025-04-22",
      "summary": "删改书签",
      "details": [],
      "tags": [
        "improve"
      ]
    },
    {
      "hash": "03410ff",
      "date": "2025-04-22",
      "summary": "新增检测海外服务器",
      "details": [],
      "tags": [
        "new"
      ]
    },
    {
      "hash": "67e3534",
      "date": "2025-04-22",
      "summary": "4/22最终版本2",
      "details": [],
      "tags": [
        "improve"
      ]
    },
    {
      "hash": "2fa68e9",
      "date": "2025-04-22",
      "summary": "4/22最终版本",
      "details": [],
      "tags": [
        "improve"
      ]
    },
    {
      "hash": "1db348f",
      "date": "2025-04-22",
      "summary": "缓存和 30 分钟更新频率",
      "details": [],
      "tags": [
        "improve",
        "optimize"
      ]
    },
    {
      "hash": "40db1f2",
      "date": "2025-04-21",
      "summary": "再次优化",
      "details": [],
      "tags": [
        "optimize"
      ]
    },
    {
      "hash": "7e8af0a",
      "date": "2025-04-21",
      "summary": "更改api",
      "details": [],
      "tags": [
        "improve"
      ]
    },
    {
      "hash": "9fae222",
      "date": "2025-04-21",
      "summary": "重新修复动画",
      "details": [],
      "tags": [
        "fix"
      ]
    },
    {
      "hash": "3ea9907",
      "date": "2025-04-21",
      "summary": "重新修复",
      "details": [],
      "tags": [
        "fix"
      ]
    },
    {
      "hash": "f283e04",
      "date": "2025-04-21",
      "summary": "新增超时和慢选项",
      "details": [
        "仅loading闪烁"
      ],
      "tags": [
        "new",
        "optimize"
      ]
    },
    {
      "hash": "252be1d",
      "date": "2025-04-21",
      "summary": "解决网站不安全问题",
      "details": [],
      "tags": [
        "fix"
      ]
    },
    {
      "hash": "3f7b936",
      "date": "2025-04-21",
      "summary": "修改部分失效网页",
      "details": [],
      "tags": [
        "improve"
      ]
    },
    {
      "hash": "40d5fb2",
      "date": "2025-04-21",
      "summary": "完善部分页面",
      "details": [
        "新增网站存活"
      ],
      "tags": [
        "new",
        "improve"
      ]
    },
    {
      "hash": "b009180",
      "date": "2025-04-07",
      "summary": "解决搜索引擎",
      "details": [],
      "tags": [
        "fix"
      ]
    },
    {
      "hash": "f9fe270",
      "date": "2024-12-21",
      "summary": "完善uutools",
      "details": [],
      "tags": [
        "improve"
      ]
    },
    {
      "hash": "f90a032",
      "date": "2024-09-23",
      "summary": "完善全球通",
      "details": [],
      "tags": [
        "improve"
      ]
    },
    {
      "hash": "279fa51",
      "date": "2024-09-22",
      "summary": "完善大量标签",
      "details": [],
      "tags": [
        "improve"
      ]
    },
    {
      "hash": "2792c27",
      "date": "2024-08-30",
      "summary": "新增歌单转平台",
      "details": [],
      "tags": [
        "new"
      ]
    },
    {
      "hash": "44c93a4",
      "date": "2024-05-30",
      "summary": "完善标签的有效性",
      "details": [],
      "tags": [
        "improve"
      ]
    },
    {
      "hash": "fa32569",
      "date": "2024-04-02",
      "summary": "完善了pubscholar",
      "details": [],
      "tags": [
        "improve"
      ]
    },
    {
      "hash": "dfafa44",
      "date": "2024-02-27",
      "summary": "学习栏添加",
      "details": [],
      "tags": [
        "new"
      ]
    },
    {
      "hash": "dc266d0",
      "date": "2024-02-27",
      "summary": "新增可汗学院",
      "details": [],
      "tags": [
        "new"
      ]
    },
    {
      "hash": "984c407",
      "date": "2024-02-04",
      "summary": "完善奖励",
      "details": [],
      "tags": [
        "improve"
      ]
    },
    {
      "hash": "3980691",
      "date": "2024-02-02",
      "summary": "更新 E-Hentai 网站入口",
      "details": [],
      "tags": [
        "improve"
      ]
    },
    {
      "hash": "9ef0bc7",
      "date": "2023-12-29",
      "summary": "修复",
      "details": [],
      "tags": [
        "fix"
      ]
    },
    {
      "hash": "72a426e",
      "date": "2023-12-29",
      "summary": "修改jmcomic的图标",
      "details": [],
      "tags": [
        "improve"
      ]
    },
    {
      "hash": "218e5b3",
      "date": "2023-12-29",
      "summary": "新增jmcomic",
      "details": [],
      "tags": [
        "new"
      ]
    },
    {
      "hash": "899e2d8",
      "date": "2023-12-25",
      "summary": "新增漫画",
      "details": [],
      "tags": [
        "new"
      ]
    },
    {
      "hash": "d9602e0",
      "date": "2023-12-20",
      "summary": "便捷重新添加",
      "details": [],
      "tags": [
        "new"
      ]
    },
    {
      "hash": "4f2d4a4",
      "date": "2023-12-15",
      "summary": "交换位置",
      "details": [],
      "tags": [
        "improve"
      ]
    },
    {
      "hash": "9be41f2",
      "date": "2023-12-15",
      "summary": "将学习和下载栏目合并",
      "details": [
        "新增便捷和实用"
      ],
      "tags": [
        "new"
      ]
    },
    {
      "hash": "9f2c628",
      "date": "2023-12-13",
      "summary": "新增pixpin",
      "details": [],
      "tags": [
        "new"
      ]
    },
    {
      "hash": "c6bd2a3",
      "date": "2023-12-13",
      "summary": "新增异次元",
      "details": [],
      "tags": [
        "new"
      ]
    },
    {
      "hash": "a68fbb5",
      "date": "2023-12-13",
      "summary": "新增腾讯云",
      "details": [],
      "tags": [
        "new"
      ]
    },
    {
      "hash": "367e3e7",
      "date": "2023-12-13",
      "summary": "新增bitwarden",
      "details": [],
      "tags": [
        "new"
      ]
    },
    {
      "hash": "cea56d6",
      "date": "2023-12-11",
      "summary": "新增番番狗",
      "details": [],
      "tags": [
        "new"
      ]
    },
    {
      "hash": "05fa78b",
      "date": "2023-12-07",
      "summary": "新增maa标签",
      "details": [],
      "tags": [
        "new"
      ]
    },
    {
      "hash": "ab10825",
      "date": "2023-12-04",
      "summary": "新增adguard分类",
      "details": [],
      "tags": [
        "new"
      ]
    },
    {
      "hash": "642a7fc",
      "date": "2023-12-03",
      "summary": "更改位置",
      "details": [],
      "tags": [
        "improve"
      ]
    },
    {
      "hash": "0f2804f",
      "date": "2023-12-03",
      "summary": "修改icon图标",
      "details": [],
      "tags": [
        "improve"
      ]
    },
    {
      "hash": "7f5c6e7",
      "date": "2023-12-03",
      "summary": "新增翻译网站",
      "details": [],
      "tags": [
        "new"
      ]
    },
    {
      "hash": "2270e61",
      "date": "2023-12-03",
      "summary": "新增AI导航分类",
      "details": [],
      "tags": [
        "new"
      ]
    },
    {
      "hash": "c30a856",
      "date": "2023-12-02",
      "summary": "新增Copilot标签",
      "details": [],
      "tags": [
        "new"
      ]
    },
    {
      "hash": "8ee5dea",
      "date": "2023-11-30",
      "summary": "适配移动端",
      "details": [],
      "tags": [
        "improve"
      ]
    },
    {
      "hash": "302d927",
      "date": "2023-11-30",
      "summary": "解决stripchat图标",
      "details": [],
      "tags": [
        "fix"
      ]
    },
    {
      "hash": "130c384",
      "date": "2023-11-30",
      "summary": "解决图标",
      "details": [],
      "tags": [
        "fix"
      ]
    },
    {
      "hash": "a87fb12",
      "date": "2023-11-30",
      "summary": "完善宫下动漫和github图标",
      "details": [],
      "tags": [
        "improve"
      ]
    },
    {
      "hash": "e863043",
      "date": "2023-11-30",
      "summary": "将icon放置对象存储内",
      "details": [],
      "tags": [
        "improve"
      ]
    },
    {
      "hash": "40aad7f",
      "date": "2023-11-30",
      "summary": "测试对象存储",
      "details": [],
      "tags": [
        "improve"
      ]
    },
    {
      "hash": "55861e0",
      "date": "2023-11-30",
      "summary": "修改控制台信息",
      "details": [],
      "tags": [
        "improve"
      ]
    },
    {
      "hash": "b317b3d",
      "date": "2023-11-30",
      "summary": "查漏补缺删除快捷方式相关js",
      "details": [],
      "tags": [
        "improve"
      ]
    },
    {
      "hash": "a00e97f",
      "date": "2023-11-30",
      "summary": "精简关于快捷方式的js",
      "details": [],
      "tags": [
        "improve"
      ]
    },
    {
      "hash": "690458d",
      "date": "2023-11-30",
      "summary": "精简添加快捷方式和导出设置",
      "details": [],
      "tags": [
        "new"
      ]
    },
    {
      "hash": "0160652",
      "date": "2023-11-30",
      "summary": "修改bilibili图标和添加标签",
      "details": [],
      "tags": [
        "new"
      ]
    },
    {
      "hash": "066b28d",
      "date": "2023-11-30",
      "summary": "第四次添加标签和icon",
      "details": [],
      "tags": [
        "new"
      ]
    },
    {
      "hash": "dc16f92",
      "date": "2023-11-30",
      "summary": "第三次添加标签图标",
      "details": [],
      "tags": [
        "new"
      ]
    },
    {
      "hash": "82ba7c1",
      "date": "2023-11-30",
      "summary": "为标签添加图标",
      "details": [],
      "tags": [
        "new"
      ]
    },
    {
      "hash": "12d0600",
      "date": "2023-11-16",
      "summary": "新增yellow",
      "details": [],
      "tags": [
        "new"
      ]
    },
    {
      "hash": "5fb16d9",
      "date": "2023-11-14",
      "summary": "修改顺序",
      "details": [],
      "tags": [
        "improve"
      ]
    },
    {
      "hash": "ab16025",
      "date": "2023-09-18",
      "summary": "解决宫下",
      "details": [],
      "tags": [
        "fix"
      ]
    },
    {
      "hash": "59bfd53",
      "date": "2023-08-25",
      "summary": "字体传输至对象存储",
      "details": [],
      "tags": [
        "improve"
      ]
    },
    {
      "hash": "97c7f0d",
      "date": "2023-08-25",
      "summary": "将字体上传至对象存储",
      "details": [],
      "tags": [
        "improve"
      ]
    },
    {
      "hash": "44575fc",
      "date": "2023-08-25",
      "summary": "解决长时间加载字体bug",
      "details": [],
      "tags": [
        "fix",
        "optimize"
      ]
    },
    {
      "hash": "ef581ae",
      "date": "2023-08-25",
      "summary": "测试2",
      "details": [],
      "tags": [
        "improve"
      ]
    },
    {
      "hash": "ea35f2e",
      "date": "2023-08-11",
      "summary": "新增书签",
      "details": [],
      "tags": [
        "new"
      ]
    },
    {
      "hash": "075a1b1",
      "date": "2023-05-07",
      "summary": "新增页分类",
      "details": [
        "新增火热"
      ],
      "tags": [
        "new"
      ]
    },
    {
      "hash": "58a2b5c",
      "date": "2023-05-05",
      "summary": "适配手机",
      "details": [],
      "tags": [
        "improve"
      ]
    },
    {
      "hash": "eb2e9d6",
      "date": "2023-05-05",
      "summary": "修改",
      "details": [],
      "tags": [
        "improve"
      ]
    },
    {
      "hash": "7bf2079",
      "date": "2023-05-05",
      "summary": "取消修改",
      "details": [],
      "tags": [
        "improve"
      ]
    },
    {
      "hash": "9fc14c6",
      "date": "2023-05-05",
      "summary": "精简文件",
      "details": [],
      "tags": [
        "improve"
      ]
    },
    {
      "hash": "808da0a",
      "date": "2023-05-05",
      "summary": "恢复",
      "details": [],
      "tags": [
        "improve"
      ]
    },
    {
      "hash": "ecd9638",
      "date": "2023-05-05",
      "summary": "退回",
      "details": [],
      "tags": [
        "improve"
      ]
    },
    {
      "hash": "eea2ede",
      "date": "2023-05-04",
      "summary": "退回版本",
      "details": [],
      "tags": [
        "improve"
      ]
    },
    {
      "hash": "c6ef410",
      "date": "2023-05-04",
      "summary": "适配手机端",
      "details": [],
      "tags": [
        "improve"
      ]
    },
    {
      "hash": "d75217a",
      "date": "2023-05-04",
      "summary": "修改书签内容",
      "details": [],
      "tags": [
        "improve"
      ]
    },
    {
      "hash": "c9e1696",
      "date": "2023-05-03",
      "summary": "完善整体体验相关功能",
      "details": [],
      "tags": [
        "new",
        "improve"
      ]
    },
    {
      "hash": "92d01e2",
      "date": "2023-04-30",
      "summary": "奖励栏添加密码访问",
      "details": [
        "防君子不妨小人"
      ],
      "tags": [
        "new"
      ]
    },
    {
      "hash": "cfda640",
      "date": "2023-04-29",
      "summary": "新增常用",
      "details": [],
      "tags": [
        "new"
      ]
    },
    {
      "hash": "4429ad3",
      "date": "2023-04-22",
      "summary": "精简常用选项",
      "details": [],
      "tags": [
        "improve"
      ]
    },
    {
      "hash": "c7bce2e",
      "date": "2023-04-21",
      "summary": "退回原来的样式",
      "details": [],
      "tags": [
        "improve"
      ]
    },
    {
      "hash": "561f7e2",
      "date": "2023-04-21",
      "summary": "修改时间的显示",
      "details": [],
      "tags": [
        "improve"
      ]
    },
    {
      "hash": "404d5f8",
      "date": "2023-04-21",
      "summary": "修改favicon图标",
      "details": [],
      "tags": [
        "improve"
      ]
    },
    {
      "hash": "dfdd52b",
      "date": "2023-04-20",
      "summary": "新增ios图标适配",
      "details": [],
      "tags": [
        "new"
      ]
    },
    {
      "hash": "ab88f0a",
      "date": "2023-04-20",
      "summary": "新增阿里云",
      "details": [],
      "tags": [
        "new"
      ]
    },
    {
      "hash": "8dbe45c",
      "date": "2023-04-20",
      "summary": "新增下载软件",
      "details": [],
      "tags": [
        "new"
      ]
    },
    {
      "hash": "cc51683",
      "date": "2023-04-20",
      "summary": "将设置修改为后台可见",
      "details": [],
      "tags": [
        "improve"
      ]
    },
    {
      "hash": "af6d955",
      "date": "2023-04-20",
      "summary": "新增搜索栏交互动画",
      "details": [],
      "tags": [
        "new"
      ]
    },
    {
      "hash": "0bdbb68",
      "date": "2023-04-20",
      "summary": "修改搜索框样式",
      "details": [],
      "tags": [
        "improve"
      ]
    },
    {
      "hash": "a3cac24",
      "date": "2023-04-19",
      "summary": "解决刷新时间消失和分钟超过60的显示bug",
      "details": [],
      "tags": [
        "fix"
      ]
    },
    {
      "hash": "cb257b0",
      "date": "2023-04-18",
      "summary": "新增下载工具页面",
      "details": [],
      "tags": [
        "new"
      ]
    },
    {
      "hash": "b05fcd4",
      "date": "2023-04-17",
      "summary": "修改收藏",
      "details": [],
      "tags": [
        "improve"
      ]
    },
    {
      "hash": "7d341b7",
      "date": "2023-04-17",
      "summary": "修改默认壁纸",
      "details": [],
      "tags": [
        "improve"
      ]
    },
    {
      "hash": "753d105",
      "date": "2023-04-17",
      "summary": "新增本地上传壁纸模板",
      "details": [],
      "tags": [
        "new"
      ]
    },
    {
      "hash": "619b743",
      "date": "2023-04-17",
      "summary": "修改名字和关键字",
      "details": [],
      "tags": [
        "improve"
      ]
    },
    {
      "hash": "c42f893",
      "date": "2023-04-17",
      "summary": "解决bug",
      "details": [],
      "tags": [
        "fix"
      ]
    },
    {
      "hash": "82128f6",
      "date": "2023-04-17",
      "summary": "新增收藏",
      "details": [],
      "tags": [
        "new"
      ]
    },
    {
      "hash": "aea1373",
      "date": "2023-04-17",
      "summary": "修改背景",
      "details": [],
      "tags": [
        "improve"
      ]
    },
    {
      "hash": "1b69dce",
      "date": "2022-08-31",
      "summary": "改进访问安全相关体验",
      "details": [],
      "tags": [
        "fix"
      ]
    },
    {
      "hash": "a9110e9",
      "date": "2022-08-23",
      "summary": "解决一些样式 10",
      "details": [],
      "tags": [
        "fix"
      ]
    },
    {
      "hash": "6a3f531",
      "date": "2022-08-19",
      "summary": "鼠标中键点击事件",
      "details": [],
      "tags": [
        "improve"
      ]
    },
    {
      "hash": "35ba366",
      "date": "2022-08-19",
      "summary": "搜索框为空时阻止搜索",
      "details": [],
      "tags": [
        "improve"
      ]
    },
    {
      "hash": "6f48c6e",
      "date": "2022-08-19",
      "summary": "Fix 搜索框无法点击 2",
      "details": [],
      "tags": [
        "fix"
      ]
    },
    {
      "hash": "2930372",
      "date": "2022-08-19",
      "summary": "点击关闭的Div容器样式，新增时间z-index",
      "details": [],
      "tags": [
        "new",
        "improve"
      ]
    },
    {
      "hash": "99ca5ad",
      "date": "2022-08-19",
      "summary": "修改搜索框，搜索引擎选择等点击事件，且新增激活搜索框时可切换搜索引擎",
      "details": [],
      "tags": [
        "new",
        "improve"
      ]
    },
    {
      "hash": "a2c01f7",
      "date": "2022-08-19",
      "summary": "新增用于点击关闭的Div容器",
      "details": [],
      "tags": [
        "new",
        "improve"
      ]
    }
  ]
};
