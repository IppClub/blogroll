/**
 * scripts/gen.js
 * 核心生成脚本：读取 blogs.yaml，并行拉取 RSS，生成静态资产。
 */

"use strict";

const fs = require("fs");
const path = require("path");
const yaml = require("js-yaml");
const Parser = require("rss-parser");
const sanitizeHtml = require("sanitize-html");
const RSS = require("rss");

// ── 常量配置 ────────────────────────────────────────────────────────────────
const CONCURRENCY = 8;           // 每批并发数
const RSS_TIMEOUT_MS = 10000;    // 单个 RSS 请求超时（毫秒）
const MAX_ARTICLES = 100;        // 最多保留文章数
const MAX_SUMMARY_CHARS = 400;   // 摘要最大字符数

// ── 路径配置 ────────────────────────────────────────────────────────────────
const ROOT = path.resolve(__dirname, "..");
const BLOGS_YAML = path.join(ROOT, "blogs", "blogs.yaml");
const OUT_BLOGS_JSON = path.join(ROOT, "web", "public", "blogs.json");
const OUT_DATA_JSON = path.join(ROOT, "web", "public", "data.json");
const OUT_OPML = path.join(ROOT, "web", "public", "opml.xml");
const OUT_RSS = path.join(ROOT, "web", "public", "rss.xml");

const parser = new Parser({ timeout: RSS_TIMEOUT_MS });

// ── 工具函数 ─────────────────────────────────────────────────────────────────

/**
 * 将 HTML 字符串清理为安全纯文本摘要。
 * 先用 sanitize-html 保留少量安全标签，再剥离所有标签取纯文本，最后截断。
 */
function cleanSummary(raw) {
  if (!raw) return "";
  // 第一步：仅保留安全的行内/块级标签，去除所有属性
  const safe = sanitizeHtml(raw, {
    allowedTags: ["b", "i", "em", "strong", "p", "br"],
    allowedAttributes: {},
  });
  // 第二步：剥离所有 HTML 标签，得到纯文本
  const text = sanitizeHtml(safe, { allowedTags: [], allowedAttributes: {} });
  // 第三步：截断并去除多余空白
  return text.replace(/\s+/g, " ").trim().slice(0, MAX_SUMMARY_CHARS);
}

/**
 * 带超时的单个 RSS 拉取。
 * 通过 AbortController 实现超时，parser.parseURL 本身也有 timeout 选项作为兜底。
 */
async function fetchFeedWithTimeout(url) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(
      () => reject(new Error(`超时: ${url}`)),
      RSS_TIMEOUT_MS
    );
    parser
      .parseURL(url)
      .then((feed) => {
        clearTimeout(timer);
        resolve(feed);
      })
      .catch((err) => {
        clearTimeout(timer);
        reject(err);
      });
  });
}

/**
 * 分批并行拉取所有博客的 RSS。
 * 每批 CONCURRENCY 个并发，使用 Promise.allSettled 确保单个失败不影响整体。
 */
async function fetchAllFeeds(blogs) {
  const results = [];
  for (let i = 0; i < blogs.length; i += CONCURRENCY) {
    const batch = blogs.slice(i, i + CONCURRENCY);
    console.log(
      `  拉取第 ${i + 1}–${Math.min(i + CONCURRENCY, blogs.length)} 个 RSS...`
    );
    const settled = await Promise.allSettled(
      batch.map((blog) => fetchFeedWithTimeout(blog.rss))
    );
    results.push(...settled);
  }
  return results;
}

/**
 * 将 rss-parser 返回的 item 转换为标准化文章对象。
 */
function normalizeArticle(item, blog) {
  const pubDate = item.pubDate
    ? new Date(item.pubDate)
    : item.isoDate
    ? new Date(item.isoDate)
    : null;

  // 格式化为 YY/MM/DD
  let pubDateYYMMDD = "";
  if (pubDate && !isNaN(pubDate.getTime())) {
    const yy = String(pubDate.getFullYear()).slice(-2);
    const mm = String(pubDate.getMonth() + 1).padStart(2, "0");
    const dd = String(pubDate.getDate()).padStart(2, "0");
    pubDateYYMMDD = `${yy}/${mm}/${dd}`;
  }

  return {
    name: blog.name,
    htmlUrl: blog.html,
    title: item.title || "(无标题)",
    link: item.link || blog.html,
    summary: cleanSummary(item.content || item.contentSnippet || item.summary || ""),
    pubDate: pubDate ? pubDate.toISOString() : "",
    pubDateYYMMDD,
    tags: blog.tags || [],
  };
}

// ── 主流程 ───────────────────────────────────────────────────────────────────

async function main() {
  console.log("📖 读取 blogs.yaml...");
  const blogsRaw = yaml.load(fs.readFileSync(BLOGS_YAML, "utf8"));
  const blogs = (blogsRaw || []).filter((b) => b.active !== false);
  console.log(`  共 ${blogs.length} 个激活的博客`);

  // 1. 写出 blogs.json（不含构建时才有的 RSS 内容，前端用来展示博客列表）
  console.log("📝 写出 blogs.json...");
  fs.mkdirSync(path.dirname(OUT_BLOGS_JSON), { recursive: true });
  fs.writeFileSync(OUT_BLOGS_JSON, JSON.stringify(blogs, null, 2), "utf8");

  // 2. 过滤出有有效 RSS 地址的博客
  const blogsWithRss = blogs.filter(
    (b) => b.rss && b.rss !== "---"
  );
  console.log(`📡 开始并行拉取 ${blogsWithRss.length} 个 RSS 源...`);

  const feedResults = await fetchAllFeeds(blogsWithRss);

  // 3. 收集所有文章，拉取失败的只打印错误不中断
  const now = new Date();
  const articles = [];

  feedResults.forEach((result, idx) => {
    const blog = blogsWithRss[idx];
    if (result.status === "rejected") {
      console.log(`  ❌ 拉取失败 [${blog.name}]: ${result.reason.message}`);
      return;
    }
    const feed = result.value;
    console.log(
      `  ✅ 成功 [${blog.name}]: ${feed.items.length} 篇文章`
    );
    for (const item of feed.items) {
      const article = normalizeArticle(item, blog);
      // 过滤掉 pubDate 超过当前时间的文章（防止未来时间的文章）
      if (article.pubDate && new Date(article.pubDate) > now) continue;
      articles.push(article);
    }
  });

  // 4. 按发布时间降序排序，保留最近 MAX_ARTICLES 条
  articles.sort((a, b) => {
    if (!a.pubDate) return 1;
    if (!b.pubDate) return -1;
    return new Date(b.pubDate) - new Date(a.pubDate);
  });
  const topArticles = articles.slice(0, MAX_ARTICLES);
  console.log(`📊 共收集 ${articles.length} 篇文章，保留最近 ${topArticles.length} 篇`);

  // 5. 写出 data.json
  console.log("📝 写出 data.json...");
  fs.mkdirSync(path.dirname(OUT_DATA_JSON), { recursive: true });
  fs.writeFileSync(OUT_DATA_JSON, JSON.stringify(topArticles, null, 2), "utf8");

  // 6. 生成 OPML 2.0
  console.log("📝 生成 opml.xml...");
  const opmlOutlines = blogsWithRss
    .map(
      (b) =>
        `    <outline type="rss" text="${escapeXml(b.name)}" title="${escapeXml(
          b.name
        )}" xmlUrl="${escapeXml(b.rss)}" htmlUrl="${escapeXml(b.html)}"/>`
    )
    .join("\n");

  const opmlContent = `<?xml version="1.0" encoding="UTF-8"?>
<opml version="2.0">
  <head>
    <title>IppClub Blogroll</title>
    <dateCreated>${now.toUTCString()}</dateCreated>
  </head>
  <body>
${opmlOutlines}
  </body>
</opml>`;

  fs.mkdirSync(path.dirname(OUT_OPML), { recursive: true });
  fs.writeFileSync(OUT_OPML, opmlContent, "utf8");

  // 7. 生成聚合 RSS
  console.log("📝 生成 rss.xml...");
  const feed = new RSS({
    title: "IppClub Blogroll",
    description: "东南大学 I++ Club 收集同学们的博客",
    feed_url: "https://blogroll.ippclub.org/rss.xml",
    site_url: "https://blogroll.ippclub.org/",
    copyright: `${new Date().getFullYear()} IppClub`,
    language: "zh-CN",
    pubDate: now.toUTCString(),
  });

  for (const article of topArticles) {
    feed.item({
      title: article.title,
      url: article.link,
      description: article.summary,
      date: article.pubDate || now.toUTCString(),
      author: article.name,
    });
  }

  fs.mkdirSync(path.dirname(OUT_RSS), { recursive: true });
  fs.writeFileSync(OUT_RSS, feed.xml({ indent: true }), "utf8");

  console.log("✅ 所有文件生成完毕！");
}

/**
 * 转义 XML 特殊字符，用于 OPML 手动拼接。
 */
function escapeXml(str) {
  if (!str) return "";
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

main().catch((err) => {
  console.error("致命错误:", err);
  process.exit(1);
});
