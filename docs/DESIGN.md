# IppClub Blogroll 设计思路

## 1. 项目目标

为东南大学 I++ Club 构建一个博客聚合平台。收集成员的个人博客，自动拉取 RSS 内容，在统一的页面上展示最新文章，同时提供 RSS 聚合订阅和 OPML 文件供 RSS 阅读器导入。

整体目标：**完全自托管、安全、可扩展**。不依赖任何第三方数据库或表单服务，所有数据存储在 Git 仓库中，通过 GitHub Actions 自动化定时更新，部署到 GitHub Pages。

---

## 2. 参考与改进

本项目参考了 [nju-lug/blogroll](https://github.com/nju-lug/blogroll)，该项目提供了很好的思路，展示了如何用 GitHub Actions + 静态前端构建博客聚合平台。但经过分析，我们发现它存在以下几个问题，并在本项目中逐一改进：

**① 串行拉取 RSS（性能问题）**

原项目使用 `for-await` 循环串行拉取 RSS，导致 N 个博客 × 每个超时时间的串行等待。若有 30 个博客，每个超时 10 秒，最坏情况需要等待 5 分钟。

本项目改用 `Promise.allSettled` + 分批并发拉取，每批同时拉取 8 个，速度提升明显。

**② XSS 安全漏洞**

原项目直接使用 `v-html` 渲染 RSS 摘要的 HTML 内容，存在跨站脚本攻击（XSS）风险。恶意博客只需在 RSS 摘要中注入 `<script>` 或 `<img onerror=...>` 即可攻击访客浏览器。

本项目采用双重防护：① 服务端（gen.js）用 `sanitize-html` 清洗 HTML，② 前端 `ArticleCard.vue` 使用纯文本插值（`{{ }}`）而非 `v-html`。

**③ 外部服务依赖（可用性问题）**

原项目的数据入口依赖第三方 SeaTable 表单服务，存在单点故障风险——若 SeaTable 服务中断，新博客申请流程就会瘫痪。

本项目改用 GitHub Issue 模板作为数据入口，完全自托管，零外部依赖，且申请历史可以通过 Git 追溯。

**④ 功能单一**

原项目前端没有搜索和筛选功能，文章多了之后用户体验差。

本项目增加了关键词实时搜索和院系筛选功能。

**⑤ 数据格式受限**

原项目使用 README.md 表格作为数据源，难以扩展字段（如院系、标签、active 状态）。

本项目改用结构化的 YAML 文件，易于扩展，可读性好，且可以用程序验证格式。

---

## 3. 数据流设计

```
用户通过 GitHub Issue 模板提交博客申请
  │
  ▼
管理员审核：合并 PR 或直接编辑 blogs/blogs.yaml
  │
  ▼
blogs/blogs.yaml（唯一数据源，存储在 Git 仓库）
  │
  ▼
GitHub Actions 定时触发（每小时一次）
  │
  ▼
scripts/gen.js 并行拉取所有有效 RSS
  ├── 每批 8 个并发，带 10s 超时
  ├── 拉取失败只打印错误，不中断整体流程
  └── 使用 sanitize-html 清洗摘要
  │
  ▼
生成静态资产：
  ├── web/public/data.json   （文章数据，运行时 fetch 加载）
  ├── web/public/blogs.json  （博客列表，运行时 fetch 加载）
  ├── web/public/rss.xml         （聚合 RSS，供 RSS 阅读器订阅）
  └── web/public/opml.xml        （OPML 文件，供 RSS 阅读器批量导入）
  │
  ▼
Vite 构建前端（Vue 3 + Vite 5）
  │
  ▼
部署到 GitHub Pages
  └── https://ippclub.github.io/blogroll
```

---

## 4. 技术选型与理由

### 数据格式：YAML vs Markdown 表格

选择 YAML（`blogs/blogs.yaml`）而非 Markdown 表格的理由：
- **结构化**：字段明确，程序可直接解析，不需要正则解析 Markdown
- **易于扩展**：新增字段（如 `active`、`department`、`tags`）只需在 YAML 中添加，不影响现有条目
- **可读性好**：YAML 对人类友好，比 JSON 可读性高
- **可验证**：有 `validate.js` CI 校验脚本，错误格式在合并前即可发现

### 数据入口：GitHub Issue 模板 vs 外部表单

选择 GitHub Issue 模板而非第三方表单服务的理由：
- **完全自托管**：不依赖任何外部服务，零单点故障
- **历史可追溯**：所有申请都是 GitHub Issue，可以查看历史、评论、关闭
- **权限管理**：天然与 GitHub 仓库权限集成，不需要额外鉴权

### 前端框架：Vue 3 + Vite 5

选择 Vue 3 + Vite 5（Composition API）的理由：
- **轻量**：打包体积小，纯静态站不需要 SSR
- **响应式**：Vue 的响应式系统非常适合实时搜索/筛选场景
- **生态成熟**：Vite 构建速度极快，`<script setup>` 语法简洁

### 并发控制：Promise.allSettled + 分批 vs 串行 await

选择并行拉取的理由：
- **速度**：30 个博客串行拉取最坏需要 5 分钟，并行只需约 40 秒
- **容错**：`Promise.allSettled` 确保单个失败不影响其他博客
- **可控**：分批（每批 8 个）避免一次性发出过多并发请求

### 安全：sanitize-html + 纯文本渲染 vs v-html

选择双重防护的理由：详见第 5 节。

### 部署：GitHub Pages

选择 GitHub Pages 的理由：
- **与现有基础设施一致**：IppClub 的其他项目也部署在 GitHub Pages，零额外账号和配置
- **更适合纯静态站**：GitHub Pages 就是为静态文件服务设计的
- **免费且无限制**：完全免费，无构建次数限制
- **无需额外 Secrets**：使用内置 `GITHUB_TOKEN`，不需要额外 API Token

### 数据加载：运行时 fetch vs 构建时 import

选择运行时 fetch 的理由：
- **数据实时性**：每次打开页面都会请求最新的 `data.json`，而非构建时打包进 bundle 的静态数据
- **前端与数据解耦**：`data.json` 作为独立静态文件存在，未来可接入 CDN 或更换数据源
- **加载状态体验**：支持 loading/error 状态展示，用户体验更好

### 站点配色：SEU 官方色系

- **主色 #162B5B**（SEU 深蓝）：用于标题、链接、强调
- **金黄 #FFCC00**（SEU 金黄）：用于标签、徽章背景

---

## 5. 安全设计

本项目对 RSS 摘要内容采用**双重防护**，彻底防止 XSS 攻击：

**第一层：服务端清洗（gen.js）**

在生成 `data.json` 时，使用 `sanitize-html` 库对每篇文章的摘要进行清洗：
- 只允许 `b/i/em/strong/p/br` 等安全的行内/块级标签
- 去除所有 HTML 属性（包括 `onclick`、`onerror` 等事件属性）
- 再次用 `sanitize-html` 剥离所有标签，得到纯文本
- 截断到最多 400 字符

即使 RSS 源包含恶意 HTML，经过清洗后存入 `data.json` 的内容已经是安全的纯文本。

**第二层：前端纯文本渲染（ArticleCard.vue）**

前端 `ArticleCard.vue` 使用 `{{ article.summary }}` 纯文本插值渲染摘要，Vue 会自动对内容进行 HTML 转义，完全杜绝 XSS。

这是本项目的**安全红线**：任何对 `ArticleCard.vue` 的修改都不允许改为 `v-html`。

---

## 6. 可扩展性设计

`blogs.yaml` 的字段设计为未来功能扩展预留了空间：

- **`department`（院系）**：用于前端院系筛选功能，未来可扩展为分组展示
- **`tags`（标签）**：用于前端标签筛选，未来可扩展为标签云
- **`active`（激活状态）**：允许临时暂停某个博客的 RSS 抓取，而无需删除条目。适用于博客迁移、临时关闭等场景
- **`github`（GitHub 用户名）**：预留字段，未来可用于展示 GitHub 头像或链接

这种设计意味着新增功能时不需要修改数据结构，只需在前端和生成脚本中利用已有字段即可。
