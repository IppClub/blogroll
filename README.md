# IppClub Blogroll

**东南大学 I++ Club 博客聚合**

[![License: MIT](https://img.shields.io/badge/License-MIT-purple.svg)](LICENSE)
[![Deploy](https://github.com/IppClub/blogroll/actions/workflows/deploy.yml/badge.svg)](https://github.com/IppClub/blogroll/actions/workflows/deploy.yml)

东南大学 I++ Club 的博客聚合平台，收集成员的个人博客，自动拉取 RSS 内容，在统一的页面上展示最新文章。

---

## 链接

| 资源 | 地址 |
|------|------|
| 🌐 **聚合页面** | https://ippclub.org/blogroll |
| 📡 **聚合 RSS** | https://ippclub.org/blogroll/rss.xml |
| 📋 **OPML** | https://ippclub.org/blogroll/opml.xml |

---

## 添加你的博客

有两种方式加入博客列表：

1. **推荐**：[提交 Issue](https://github.com/IppClub/blogroll/issues/new?template=add_blog.yml) 申请加入，填写模板后等待管理员审核
2. **备用**：Fork 仓库，编辑 `blogs/blogs.yaml`，提交 PR

详细说明见 [CONTRIBUTING.md](CONTRIBUTING.md)。

---

## 博客列表

| 名称 | RSS | 博客地址 |
|------|-----|----------|
| OrangeX4's Blog | [RSS](https://blog.orangex4.workers.dev/atom.xml) | [blog.orangex4.workers.dev](https://blog.orangex4.workers.dev/) |
| Manjusaka's Blog | [RSS](https://www.manjusaka.blog/atom.xml) | [manjusaka.blog](https://www.manjusaka.blog/) |
| 阮一峰的网络日志 | [RSS](https://www.ruanyifeng.com/blog/atom.xml) | [ruanyifeng.com/blog](https://www.ruanyifeng.com/blog/) |

---

## FAQ

**Q: 萌新也可以加吗？**

A: 可以！只要是东南大学在读学生或校友都欢迎，不限技术水平，个人博客、学习笔记都行。

**Q: 有些博客失效了怎么办？**

A: 请[提 Issue](https://github.com/IppClub/blogroll/issues/new) 报告，label 选 `broken-link`，管理员会处理。

**Q: 没有 RSS 可以加吗？**

A: 可以，RSS 字段填 `---` 即可，聚合页面仍会在博客列表中展示你的博客链接。

---

## 技术栈

- **前端**：Vue 3 + Vite 5（Composition API）
- **数据生成**：Node.js（js-yaml、rss-parser、sanitize-html）
- **CI/CD**：GitHub Actions
- **部署**：Cloudflare Pages

---

## 参考项目

- [nju-lug/blogroll](https://github.com/nju-lug/blogroll) — 南京大学 Linux 用户组的博客聚合，本项目的灵感来源

---

## License

[MIT](LICENSE) © 2025 IppClub
