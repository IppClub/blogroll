/**
 * scripts/validate.js
 * CI 校验脚本：验证 blogs/blogs.yaml 的格式和内容合法性。
 */

"use strict";

const fs = require("fs");
const path = require("path");
const yaml = require("js-yaml");

const BLOGS_YAML = path.resolve(__dirname, "..", "blogs", "blogs.yaml");

let hasError = false;

/**
 * 打印错误信息并标记失败。
 */
function fail(msg) {
  console.error(`❌ ${msg}`);
  hasError = true;
}

// ── 1. 解析 YAML ─────────────────────────────────────────────────────────────
let blogs;
try {
  blogs = yaml.load(fs.readFileSync(BLOGS_YAML, "utf8"));
} catch (err) {
  fail(`blogs.yaml 解析失败: ${err.message}`);
  process.exit(1);
}

if (!Array.isArray(blogs) || blogs.length === 0) {
  fail("blogs.yaml 应为非空数组");
  process.exit(1);
}

// ── 2. 校验每个条目 ───────────────────────────────────────────────────────────
const seenHtml = new Set();

blogs.forEach((blog, idx) => {
  const label = `条目 #${idx + 1}（${blog.name || "未命名"}）`;

  // 2.1 必填字段
  if (!blog.name) {
    fail(`${label}: 缺少 name 字段`);
  }
  if (!blog.html) {
    fail(`${label}: 缺少 html 字段`);
    return; // html 缺失则后续 URL 检验无意义
  }

  // 2.2 html 必须是合法的 HTTP/HTTPS URL
  try {
    const u = new URL(blog.html);
    if (u.protocol !== "http:" && u.protocol !== "https:") {
      fail(`${label}: html 必须是 http 或 https URL，当前: ${blog.html}`);
    }
  } catch {
    fail(`${label}: html 不是合法 URL: ${blog.html}`);
  }

  // 2.3 rss 如果不是 "---" 也必须是合法 URL
  if (blog.rss && blog.rss !== "---") {
    try {
      const u = new URL(blog.rss);
      if (u.protocol !== "http:" && u.protocol !== "https:") {
        fail(`${label}: rss 必须是 http 或 https URL，当前: ${blog.rss}`);
      }
    } catch {
      fail(`${label}: rss 不是合法 URL: ${blog.rss}`);
    }
  }

  // 2.4 检查重复的 html 地址（忽略大小写）
  const htmlLower = blog.html.toLowerCase();
  if (seenHtml.has(htmlLower)) {
    fail(`${label}: html 地址重复: ${blog.html}`);
  } else {
    seenHtml.add(htmlLower);
  }
});

// ── 3. 输出结果 ───────────────────────────────────────────────────────────────
if (hasError) {
  console.error("\n请修复上述错误后重新提交。");
  process.exit(1);
} else {
  console.log(`✅ blogs.yaml 验证通过，共 ${blogs.length} 个博客`);
}
