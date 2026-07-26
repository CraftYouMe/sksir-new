const assert = require("assert");
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const rootDir = path.resolve(__dirname, "..");

function runModule(relativePath, context) {
  vm.runInNewContext(
    fs.readFileSync(path.join(rootDir, relativePath), "utf8"),
    context,
    { filename: relativePath }
  );
}

function createCookieContext(initialCookies) {
  const cookies = { ...initialCookies };
  const context = {
    URL,
    Object,
    Array,
    Number,
    String,
    Math,
    JSON,
    Promise,
    Cookies: {
      get(key) {
        return cookies[key];
      },
      set(key, value) {
        cookies[key] = typeof value === "object" ? JSON.stringify(value) : String(value);
      }
    },
    document: {
      querySelector() {
        return null;
      }
    },
    iziToast: { show() {} }
  };
  context.window = context;
  return { context, cookies };
}

function testSearchEngines() {
  const fixture = createCookieContext({
    se_list: "{broken-json",
    se_default: "bing"
  });
  runModule("js/search-engines.js", fixture.context);

  const service = fixture.context.SksirSearchEngines;
  const engines = service.getList();
  assert.strictEqual(Object.keys(engines).length, 11);
  assert.strictEqual(service.getDefault(), "2");
  assert.strictEqual(fixture.cookies.se_default, "2");
  assert.doesNotThrow(() => JSON.parse(fixture.cookies.se_list));

  service.setList({
    "7": { title: "Test", url: "https://example.com/", name: "q", icon: "test" },
    "8": { title: "Unsafe", url: "javascript:alert(1)", name: "q", icon: "test" }
  });
  fixture.cookies.se_default = "missing";
  assert.strictEqual(service.getValidDefault(service.getList()), "7");
  assert.strictEqual(fixture.cookies.se_default, "7");
  assert.strictEqual(Object.keys(service.getList()).length, 1);
  assert.strictEqual(service.normalizeHttpUrl("javascript:alert(1)"), "");
  assert.strictEqual(service.normalizeHttpUrl("https://example.com/search"), "https://example.com/search");
}

function createQuickLaunchContext(initialStorage) {
  const storage = { ...initialStorage };
  const context = {
    URL,
    Object,
    Array,
    Number,
    String,
    Math,
    JSON,
    location: { href: "https://start.example/" },
    matchMedia() {
      return { matches: false };
    },
    SksirStorage: {
      readJson(key, fallback) {
        return Object.prototype.hasOwnProperty.call(storage, key) ? storage[key] : fallback;
      },
      writeJson(key, value) {
        storage[key] = value;
        return true;
      }
    }
  };
  context.window = context;
  return { context, storage };
}

function testQuickLaunchData() {
  const fixture = createQuickLaunchContext({
    "sksir-quick-launch-custom": [
      { name: "Safe", url: "https://example.com", icon: "javascript:alert(1)" },
      { name: "Duplicate", url: "https://example.com/" },
      { name: "Unsafe", url: "javascript:alert(1)" },
      null
    ],
    "sksir-quick-launch-clicks": {
      "https://example.com": 4.8,
      "javascript:alert(1)": 99,
      "https://invalid-count.example": "no"
    },
    "sksir-quick-launch-order": [
      "https://example.com",
      "https://example.com/",
      "file:///private"
    ]
  });
  runModule("js/quick-launch-data.js", fixture.context);

  const service = fixture.context.SksirQuickLaunchData;
  const custom = service.getCustomItems();
  assert.strictEqual(custom.length, 1);
  assert.strictEqual(custom[0].url, "https://example.com/");
  assert.strictEqual(custom[0].icon, "https://example.com/favicon.ico");

  service.repairStorage();
  assert.deepStrictEqual(
    Array.from(fixture.storage[service.orderKey]),
    ["https://example.com/"]
  );
  assert.strictEqual(fixture.storage["sksir-quick-launch-clicks"]["https://example.com/"], 4);

  service.recordClick("https://example.com");
  assert.strictEqual(fixture.storage["sksir-quick-launch-clicks"]["https://example.com/"], 5);
  assert.strictEqual(service.normalizeWebUrl("file:///private"), "");
  assert.strictEqual(service.clampLimit(100, 8, 12), 12);
}

testSearchEngines();
testQuickLaunchData();
console.log("Frontend module tests passed.");
