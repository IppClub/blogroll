# 贡献指南

感谢你对 IppClub Blogroll 的关注！以下是参与贡献的方式。

---

## 申请加入博客列表（推荐方式）

最简单的方式是通过 **GitHub Issue** 提交申请：

1. 点击 [新建 Issue](https://github.com/IppClub/blogroll/issues/new?template=add_blog.yml)，选择「申请加入博客列表」模板
2. 填写博客名称、地址、RSS 地址（可选）、院系等信息
3. 提交 Issue 后，管理员会审核并将你的博客添加到列表

**要求**：
- 需要是东南大学在读学生或校友
- 博客内容健康合法，符合社区行为准则

---

## 通过 PR 直接提交（备用方式）

如果你熟悉 Git 操作，也可以直接编辑 `blogs/blogs.yaml` 提交 PR：

1. Fork 本仓库
2. 在 `blogs/blogs.yaml` 末尾添加你的博客条目（参考下方格式）
3. 运行 `npm run validate` 确认格式正确
4. 提交 PR，PR 标题格式为：`feat(blogs): 添加 <你的博客名称>`

YAML 条目格式示例：

```yaml
- name: "你的博客名"
  html: "https://your-blog.com"
  rss: "https://your-blog.com/feed.xml"
  github: "your-github-username"
  department: "计算机科学与工程学院"
  tags:
    - "技术"
    - "随笔"
  active: true
```

**字段说明**：
- `name`（必填）：博客展示名称
- `html`（必填）：博客 HTML 地址，必须是 `https://` 或 `http://` 开头的合法 URL
- `rss`（可选）：RSS/Atom 订阅地址；没有 RSS 则填 `"---"`
- `github`（可选）：博主 GitHub 用户名
- `department`（可选）：所在院系
- `tags`（可选）：标签列表
- `active`（默认 true）：是否激活；填 `false` 可临时暂停抓取

---

## 本地开发

```bash
# 克隆仓库
git clone https://github.com/IppClub/blogroll.git
cd blogroll

# 安装根目录依赖（gen.js 和 validate.js 用到的包）
npm install

# 生成静态资产（需要网络访问 RSS 源）
npm run gen

# 启动前端开发服务器（需要先运行 gen 生成 data.json）
npm run dev

# 校验 blogs.yaml 格式
npm run validate
```

前端开发服务器默认运行在 `http://localhost:5173`。

---

## 报告失效博客

如果你发现某个博客无法访问或 RSS 长期无法拉取，请：

1. 新建一个 [GitHub Issue](https://github.com/IppClub/blogroll/issues/new)
2. 在标题中注明博客名称
3. 将 label 设置为 `broken-link`

---

## 行为准则

我们致力于维护一个友好、包容的社区环境：

- **友好**：对新手友好，耐心回答问题
- **包容**：尊重不同技术方向、不同背景的成员
- **尊重**：不同意他人观点时，对事不对人

违反行为准则的行为（骚扰、歧视等）将导致 PR/Issue 被关闭，情节严重者将被封禁。
