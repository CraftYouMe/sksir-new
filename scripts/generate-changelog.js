const fs = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");

const rootDir = path.resolve(__dirname, "..");
const outputPath = path.join(rootDir, "data", "changelog.js");
const checkOnly = process.argv.includes("--check");
const recordSeparator = "\x1e";
const fieldSeparator = "\x1f";

function runGitLog() {
  const result = spawnSync("git", [
    "log",
    "--no-merges",
    "--date=short",
    `--pretty=format:%h${fieldSeparator}%ad${fieldSeparator}%s${fieldSeparator}%b${recordSeparator}`
  ], {
    cwd: rootDir,
    encoding: "utf8",
    windowsHide: true
  });

  if (result.status !== 0) {
    console.error(result.stderr || "Unable to read Git history.");
    process.exit(1);
  }
  return result.stdout;
}

function cleanLine(value) {
  return String(value || "")
    .replace(/^[\s>*-]+/, "")
    .replace(/[`*_#]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function classify(subject, body) {
  const source = `${subject}\n${body}`.toLowerCase();
  const tags = [];
  const hasFix = /(^|\W)fix(?:ed|es)?(\W|$)|bug|修复|修正|解决|纠正|异常|错误/.test(source);
  const hasNew = /(^|\W)feat(?:ure)?(\W|$)|(^|\W)add(?:ed|s)?(\W|$)|新增|添加|实现|引入|创建|支持/.test(source);
  const hasOptimize = /(^|\W)(perf|performance|optimi[sz](?:e[ds]?|ation)|speed|loading|cache|lazy)(\W|$)|优化|性能|首屏|加载|缓存|延迟加载|按需加载|请求数量|响应速度/.test(source);
  const hasImprove = /(^|\W)(refactor|style|docs|chore|update|updated|enhance[ds]?|improve[ds]?)(\W|$)|改进|更新|调整|重构|提升|增强|完善|移除|精简/.test(source);

  if (hasFix) tags.push("fix");
  if (hasNew) tags.push("new");
  if (hasImprove) tags.push("improve");
  if (hasOptimize) tags.push("optimize");
  if (!tags.length) tags.push("improve");
  return tags;
}

const areaRules = [
  { pattern: /quick[\s-]?launch|快捷入口|快速启动/, label: "快捷入口" },
  { pattern: /search suggestion|search ui|搜索建议|搜索联想|搜索框/, label: "搜索体验" },
  { pattern: /search engine|搜索引擎/, label: "搜索引擎" },
  { pattern: /wallpaper|background|壁纸|背景图/, label: "壁纸设置" },
  { pattern: /bookmark|favorite|收藏|书签/, label: "收藏导航" },
  { pattern: /\bios\b|safari|iphone|mobile|移动端|手机端|键盘|安全区/, label: "移动端体验" },
  { pattern: /settings?|modal|dialog|设置中心|设置菜单|弹窗/, label: "设置中心" },
  { pattern: /performance|first[\s-]?screen|loading|cache|lazy|首屏|性能|加载|缓存|请求/, label: "页面性能" },
  { pattern: /status|health|api\/check|状态检测|存活检测/, label: "状态检测" },
  { pattern: /icon|favicon|图标/, label: "图标显示" },
  { pattern: /font|misans|字体/, label: "文字显示" },
  { pattern: /storage|import|export|数据导入|数据导出|本机数据/, label: "本机数据" },
  { pattern: /security|safe|url|安全|域名|内网/, label: "访问安全" },
  { pattern: /service worker|\bpwa\b|更新检测|版本提示/, label: "版本更新" },
  { pattern: /navigation|nav-|导航页|导航数据|网站数据/, label: "网站导航" },
  { pattern: /\bui\b|\bcss\b|layout|animation|style|界面|布局|样式|动画|视觉/, label: "界面体验" },
  { pattern: /docs?|readme|test|check|script|build|phase|文档|测试|脚本|检查/, label: "项目维护" }
];

function detectAreas(subject, body) {
  const source = `${subject}\n${body}`.toLowerCase();
  const areas = areaRules
    .filter((rule) => rule.pattern.test(source))
    .map((rule) => rule.label)
    .filter((label, index, labels) => labels.indexOf(label) === index)
    .slice(0, 2);
  return areas.length ? areas : ["整体体验"];
}

function joinAreas(areas) {
  return areas.join("与");
}

const englishFactRules = [
  [/optimize quick launch settings page/i, "优化快捷入口设置页面，操作层级更加清晰"],
  [/removed the large prompt card.*quick launch/i, "新增快捷入口时不再显示大型提示卡，改用简洁的辅助说明"],
  [/eliminated duplicate titles/i, "精简设置页面中的重复标题，信息层级更加清楚"],
  [/toggle area.*system settings style/i, "快捷入口开关改为系统设置式布局，状态更直观"],
  [/separated desktop and mobile quantity settings/i, "桌面端与移动端可分别设置快捷入口数量"],
  [/sorting method.*segmented control/i, "快捷入口排序方式改为分段选择控件，并补充对应说明"],
  [/quick launch settings logic.*distinct/i, "修复桌面端与移动端快捷入口配置互相显示的问题"],
  [/settings are only saved on the current device/i, "补充本机保存提示，明确设置不会跨设备同步"],
  [/wallpaper settings ui/i, "改进壁纸设置界面，选择和管理更加直观"],
  [/caching headers.*static assets/i, "调整静态资源缓存策略，减少重复加载"],
  [/search suggestions from bing/i, "新增必应搜索建议，输入时可获得更多联想结果"],
  [/drag-and-drop/i, "支持通过拖拽调整快捷入口顺序"],
  [/suppress click events during dragging/i, "拖拽快捷入口时避免误触打开网站"],
  [/error handling and data normalization/i, "加强异常数据处理，损坏配置可自动回退"],
  [/separate modules|module separation|new frontend modules/i, "拆分前端功能模块，降低功能之间的相互影响"],
  [/search overlay close element/i, "修复搜索层关闭控件，退出搜索更加可靠"],
  [/search overlay interaction/i, "修复搜索层的打开与关闭交互"],
  [/search close button accessibility/i, "改进搜索关闭按钮的键盘与无障碍操作"],
  [/mobile search layout/i, "调整移动端搜索布局，键盘弹出时显示更稳定"],
  [/ios standalone scrolling/i, "修复 iOS 添加到主屏幕后页面无法正常滚动的问题"],
  [/ios keyboard viewport offset/i, "修复 iOS 键盘弹出时页面位置偏移的问题"],
  [/ios standalone search layout/i, "修复 iOS 独立模式下的搜索布局"],
  [/ios standalone background height|ios standalone background rendering/i, "修复 iOS 独立模式下壁纸高度和铺满显示"],
  [/ios standalone viewport sizing/i, "修复 iOS 独立模式下的页面高度计算"],
  [/ios standalone mode detection/i, "修复 iOS 独立模式识别，确保对应适配正确启用"],
  [/ios standalone display/i, "修复 iOS 独立模式的页面显示"],
  [/visitor badge.*safe-area/i, "访客信息适配手机安全区，避免被底部区域遮挡"],
  [/mobile toast positioning/i, "调整移动端提示消息位置，避免遮挡主要操作"],
  [/web app manifest/i, "新增网页应用配置，支持将站点添加到主屏幕"],
  [/pwa theme colors/i, "调整添加到主屏幕后使用的主题颜色"],
  [/mobile keyboard viewport shifting/i, "避免移动端键盘弹出时页面整体偏移"],
  [/pc browser regression results/i, "完成桌面端浏览器回归检查"],
  [/obsolete.*documentation/i, "清理已经失效的项目说明"],
  [/data export and reset/i, "新增本机数据导出与重置功能"],
  [/bookmark filtering and search/i, "新增收藏筛选与搜索，查找站点更加方便"],
  [/local storage management/i, "改进本机设置存储，异常数据处理更加安全"],
  [/implement phase 5 settings center/i, "新增统一设置中心，可集中管理搜索、壁纸、性能和快捷入口"],
  [/support localhost domain and port/i, "支持带端口的本地网址"],
  [/^e-?hentai$/i, "更新 E-Hentai 网站入口"]
];

function stripReleaseNoise(value) {
  return cleanLine(value)
    .replace(/^(feat|fix|perf|refactor|style|docs|chore|build|ci|test)(\([^)]+\))?!?:\s*/i, "")
    .replace(/(?:更新|升级|同步|调整|提升|将)?\s*(?:应用|app|缓存|cache)?\s*版本(?:信息|号)?\s*(?:至|到|为)?\s*v?\d{4}[.\d]+/gi, "")
    .replace(/(?:update|bump)\s+(?:the\s+)?(?:app|cache)?\s*version\s+(?:to\s+)?v?\d{4}[.\d]+/gi, "")
    .replace(/(?:，|,)?\s*(?:修复|更新|调整)相关文档描述/gi, "")
    .replace(/(?:，|,)?\s*(?:and\s+)?(?:update|bump)(?:ed)?\s+(?:the\s+)?(?:app|cache)?\s*version/gi, "")
    .replace(/^[\s,，;；:：]+|[\s,，;；]+$/g, "")
    .trim();
}

function rewriteChineseFact(value) {
  let fact = cleanLine(value)
    .replace(/^(并|并且|以及|同时|且)\s*/, "")
    .replace(/^(功能|特性)\s*[:：]\s*/, "")
    .replace(/^(?:完成|进行)\s*/, "")
    .trim();
  if (!fact || !/[\u3400-\u9fff]/.test(fact)) return "";

  const specificRewrites = [
    [/^添加标签\s*(.+)/, "新增$1分类"],
    [/Phase 3 本地书签管理器/i, "新增本地书签管理工具，可添加、编辑和删除网站"],
    [/Phase 4 书签中心/i, "新增书签中心，支持搜索、筛选和移动端布局"],
    [/访客徽章功能/, "不再显示访客徽章，页面更加简洁"],
    [/快速启动项的保存逻辑/, "改进快捷入口保存逻辑，设置结果更可靠"],
    [/添加和管理界面/, "简化快捷入口的添加与管理流程"],
    [/历史强制上移规则/, "取消搜索区域强制上移规则，避免布局跳动"],
    [/搜索建议防抖/, "为搜索建议增加输入防抖，减少连续请求"],
    [/搜索建议框和分类指示器的高频布局更新/, "降低搜索建议与分类指示器的重复布局计算"],
    [/关键资源预加载/, "整合关键资源预加载，减少首屏等待"],
    [/壁纸加载时序/, "调整壁纸加载时机，让首屏更快显示"],
    [/书签分组渲染/, "分批渲染收藏分组，降低首次打开时的页面压力"],
    [/书签资源加载/, "延后加载收藏资源，优先显示首屏内容"],
    [/本地书签管理功能/, "新增本地书签管理工具，可添加、编辑和删除网站"],
    [/^删除网站$/, "删除网站"]
  ];
  for (const [pattern, replacement] of specificRewrites) {
    if (pattern.test(fact)) {
      return replacement.includes("$") ? fact.replace(pattern, replacement) : replacement;
    }
  }

  const rewrites = [
    [/^优化(.+)/, "改善$1"],
    [/^修复(.+)/, "解决$1"],
    [/^(?:添加|增加)(.+)/, "新增$1"],
    [/^实现(.+)/, "现已支持$1"],
    [/^(?:删除|移除)(.+)/, "精简$1"],
    [/^合并(.+)/, "整合$1"],
    [/^更新(.+)/, "完善$1"]
  ];
  for (const [pattern, replacement] of rewrites) {
    if (pattern.test(fact)) {
      fact = fact.replace(pattern, replacement);
      break;
    }
  }
  return fact
    .replace(/(?<!合)并\s*$|(?:以及|同时|且)\s*$/, "")
    .replace(/[。.!！]+$/, "")
    .trim();
}

function translateEnglishFact(value, subject, body) {
  const fact = cleanLine(value);
  for (const [pattern, translated] of englishFactRules) {
    if (pattern.test(fact)) return translated;
  }

  const area = joinAreas(detectAreas(`${fact}\n${subject}`, body));
  if (/^(fix|fixed)\b/i.test(fact)) return `修复${area}相关问题`;
  if (/^(add|added|implement|implemented|introduce|introduced|create|created)\b/i.test(fact)) {
    return `新增${area}相关功能`;
  }
  if (/^(remove|removed|eliminate|eliminated)\b/i.test(fact)) return `精简${area}中的过时内容`;
  if (/^(optimize|optimized|perf)\b/i.test(fact)) return `优化${area}的加载与响应表现`;
  if (/^(improve|improved|enhance|enhanced|adjust|adjusted)\b/i.test(fact)) {
    return `改进${area}的交互与显示细节`;
  }
  if (/^(update|updated|refactor|refactored)\b/i.test(fact)) return `完善${area}相关功能`;
  if (/^(revert|reverted)\b/i.test(fact)) return `撤回${area}中表现不稳定的调整`;
  if (/^(prevent|prevented)\b/i.test(fact)) return `避免${area}出现异常变化`;
  return "";
}

function splitSubject(value) {
  return stripReleaseNoise(value)
    .split(/\s*(?:[，,；;。]|\band\b)\s*/i)
    .map(stripReleaseNoise)
    .filter(Boolean);
}

function splitBody(value) {
  return String(value || "")
    .split(/\r?\n/)
    .map(stripReleaseNoise)
    .filter((line) => line && !/^(co-authored-by|signed-off-by):/i.test(line))
    .flatMap((line) => line.split(/\s*[；;]\s*/))
    .map(stripReleaseNoise)
    .filter(Boolean);
}

function isInternalNoise(value) {
  const candidate = cleanLine(value);
  return (
    /(?:documentation|readme|文档|说明文档|迁移报告|回归报告|数据迁移结果说明)/i.test(candidate) ||
    /\.(?:md|js|css|json|woff2?|ttf)\b/i.test(candidate) ||
    /(?:数据结构设计|必填字段|可选字段|验证命令|优化计划清单|简单 HTTP 服务)/i.test(candidate) ||
    /^(?:support|improve|enhance)\s+(?:the\s+)?user experience[.]?$/i.test(candidate) ||
    /^支持书签操作[:：]?$/i.test(candidate) ||
    /^(?:添加|新增|编辑|删除)网站$/i.test(candidate) ||
    /^(?:添加|新增|修改|更新|更换|调整|移动)?\s*(?:新?标签|标签图片|内容|图片|图标|文件|位置|标题)$/i.test(candidate) ||
    /^(?:更新|完善|调整|同步)?\s*(?:应用版本|缓存版本|版本信息)(?:和缓存版本)?(?:以保持一致性)?$/i.test(candidate) ||
    /^(?:提升|增强|改善)?用户体验$/i.test(candidate) ||
    /^(?:完善|改善|调整|优化|更新)?相关(?:样式|逻辑|文件|内容)(?:和逻辑)?$/i.test(candidate)
  );
}

function isDocumentationOnly(subject, body) {
  if (String(body || "").trim()) return false;
  const normalized = stripReleaseNoise(subject);
  return /^(?:docs?(?:\([^)]+\))?:\s*)?/i.test(subject) &&
    /(?:documentation|readme|文档|报告|regression results)/i.test(normalized);
}

function isLowInformationCommit(subject, body) {
  if (String(body || "").trim()) return false;
  const normalized = stripReleaseNoise(subject);
  const parts = splitSubject(subject);
  return (
    /^(?:(?:再次|第三次|第四次|第一次)\s*)?(?:添加|新增|修改|更新|优化|更换|调整|移动)?\s*(?:新?标签|标签图片|内容|图片|图标|文件|位置|标题)(?:和(?:添加|新增|修改|更新)?(?:标签|图标|图片))?$/i.test(normalized) ||
    /^(?:update (?:index\.html|set\.js)|fix(?: bug)?|new bug|wpa test|up link|优化check\.js|更新|测试)$/i.test(normalized)
    || (parts.length > 0 && parts.every(isInternalNoise))
  );
}

function createUserFacingContent(subject, body) {
  const candidates = [...splitSubject(subject), ...splitBody(body)];
  let facts = candidates
    .filter((candidate) => !isInternalNoise(candidate))
    .map((candidate) => /[\u3400-\u9fff]/.test(candidate)
      ? rewriteChineseFact(candidate)
      : translateEnglishFact(candidate, subject, body))
    .filter(Boolean)
    .filter((fact) => !/^(?:更新|完善)?(?:版本|文档|说明|报告)$/.test(fact))
    .filter((fact, index, items) => items.indexOf(fact) === index)
    .slice(0, 6);

  if (!facts.length) {
    const areas = detectAreas(subject, body);
    if (areas.length === 1 && areas[0] === "整体体验") return null;
    facts.push(`改进${joinAreas(areas)}相关体验`);
  }
  if (facts.some((fact) => !/(?:相关体验|相关功能|相关问题)$/.test(fact))) {
    facts = facts.filter((fact) => !/(?:相关体验|相关功能|相关问题)$/.test(fact));
  }
  return {
    summary: facts[0],
    details: facts.slice(1)
  };
}

function parseLog(raw) {
  return raw
    .split(recordSeparator)
    .map((record) => record.trim())
    .filter(Boolean)
    .map((record) => {
      const [hash, date, subject, ...bodyParts] = record.split(fieldSeparator);
      const body = bodyParts.join(fieldSeparator).trim();
      if (isDocumentationOnly(subject, body) || isLowInformationCommit(subject, body)) return null;
      const tags = classify(subject, body);
      const content = createUserFacingContent(subject, body);
      if (!content) return null;

      return {
        hash: cleanLine(hash),
        date: cleanLine(date),
        summary: content.summary,
        details: content.details,
        tags
      };
    })
    .filter(Boolean)
    .filter((entry, index, entries) => {
      const key = `${entry.date}\n${entry.summary}\n${entry.details.join("\n")}`;
      return entries.findIndex((candidate) => (
        `${candidate.date}\n${candidate.summary}\n${candidate.details.join("\n")}` === key
      )) === index;
    });
}

function serialize(entries) {
  const payload = {
    generatedAt: new Date().toISOString(),
    source: "git",
    entries
  };
  return `window.SKSIR_CHANGELOG = ${JSON.stringify(payload, null, 2)};\n`;
}

const entries = parseLog(runGitLog());
const nextOutput = serialize(entries);

if (checkOnly) {
  if (!fs.existsSync(outputPath)) {
    console.error("Missing data/changelog.js. Run node scripts/generate-changelog.js.");
    process.exit(1);
  }
  const currentOutput = fs.readFileSync(outputPath, "utf8");
  const jsonSource = currentOutput
    .replace(/^window\.SKSIR_CHANGELOG\s*=\s*/, "")
    .replace(/;\s*$/, "");
  let currentData;
  try {
    currentData = JSON.parse(jsonSource);
  } catch (error) {
    console.error("data/changelog.js does not contain valid changelog data.");
    process.exit(1);
  }
  const isValid = currentData.source === "git" &&
    Array.isArray(currentData.entries) &&
    currentData.entries.length > 0 &&
    currentData.entries.every((entry) => (
      typeof entry.hash === "string" &&
      /^\d{4}-\d{2}-\d{2}$/.test(entry.date) &&
      typeof entry.summary === "string" &&
      Array.isArray(entry.details) &&
      Array.isArray(entry.tags) &&
      entry.tags.every((tag) => ["fix", "new", "improve", "optimize"].includes(tag))
    ));
  if (!isValid) {
    console.error("data/changelog.js has an invalid entry structure.");
    process.exit(1);
  }
  console.log(`Changelog data is valid (${currentData.entries.length} entries).`);
  process.exit(0);
}

fs.writeFileSync(outputPath, nextOutput, "utf8");
console.log(`Generated ${path.relative(rootDir, outputPath)} with ${entries.length} entries.`);
