# IppClub Blogroll 工程实践原则

## 1. 分支策略

`main` 为唯一保护分支，所有变更必须通过 Pull Request 合入，**严禁直接 push to main**。

具体规则：
- 每个功能或修复创建独立的 feature/fix 分支（如 `feat/add-search`、`fix/rss-timeout`）
- PR 必须通过所有 CI 检查才能合并
- PR 合并后及时删除对应的临时分支
- 禁止 force push 到 main 分支

---

## 2. 提交规范

遵循 [Conventional Commits](https://www.conventionalcommits.org/) 规范，每条提交信息格式为：

```
<type>(<scope>): <subject>
```

常用前缀及示例：

| 前缀 | 用途 | 示例 |
|------|------|------|
| `feat` | 新功能 | `feat(web): 添加院系筛选功能` |
| `fix` | 修复 Bug | `fix(gen): 修复 RSS 超时未正确处理的问题` |
| `docs` | 文档变更 | `docs(readme): 更新博客列表` |
| `chore` | 构建/依赖/配置 | `chore(deps): 升级 vite 到 5.2.0` |
| `refactor` | 重构（不改变行为） | `refactor(gen): 提取 cleanSummary 为独立函数` |
| `style` | 代码格式（不改变逻辑） | `style(web): 统一组件缩进` |
| `test` | 测试相关 | `test(validate): 添加重复 URL 测试用例` |

提交信息应简洁明了，用中文或英文均可，但同一 PR 内保持一致。

---

## 3. CI 门禁

以下 CI 检查必须全部通过才允许合并 PR：

- **涉及 `blogs/blogs.yaml` 的 PR**：必须通过 `validate.yml` CI，即 `npm run validate` 无错误
- **所有 PR**：GitHub Actions 中的所有 check 必须为绿色

CI 失败时，PR 作者应：
1. 查看 CI 日志，找到具体错误信息
2. 修复问题后 push 新的提交
3. 不允许通过 `--force` 或绕过 CI 的方式合并

---

## 4. 自动化优先原则

凡是能自动化的操作，绝不手动执行：

- **定时更新**：通过 GitHub Actions cron（UTC 4:00 和 16:00）自动拉取 RSS 并重新部署
- **自动部署**：每次构建成功后自动部署到 Cloudflare Pages，无需手动操作
- **PR 格式校验**：`validate.yml` 在每次涉及 `blogs.yaml` 的 PR 时自动校验格式
- **依赖审计**：定期运行 `npm audit` 检查依赖漏洞（可设置为 CI 步骤）

---

## 5. 依赖管理

- 使用 `package-lock.json` 锁定所有依赖版本，确保构建可重复
- 定期运行 `npm audit` 检查已知安全漏洞，发现高危漏洞必须立即修复
- 只引入**必要的**依赖，避免引入不必要的包增加攻击面
- 每次添加新依赖前，评估是否真的需要，是否可以用已有依赖或原生 API 实现
- 当前根目录依赖：`js-yaml`（YAML 解析）、`rss-parser`（RSS 拉取）、`sanitize-html`（XSS 防护）、`rss`（RSS 生成）

---

## 6. 错误处理原则

- **RSS 拉取失败不影响整体流程**：单个 RSS 源失败时，`gen.js` 只打印错误信息，继续处理其他博客
- **CI 失败必须有清晰的错误信息**：`validate.js` 输出的错误信息必须包含具体条目和字段名，方便定位问题
- **致命错误以非零退出码退出**：脚本遇到无法继续的错误（如 YAML 解析失败）时，必须调用 `process.exit(1)` 触发 CI 失败
- **禁止空 catch**：所有 `try/catch` 块必须处理错误（至少打印日志），不允许静默吞掉异常

---

## 7. 零外部服务依赖原则

本项目的数据和流程完全自托管，不依赖任何第三方数据库、表单或云服务：

- **数据存储**：博客列表存储在 Git 仓库的 `blogs/blogs.yaml` 中
- **数据入口**：通过 GitHub Issue 模板收集博客申请，不使用外部表单
- **CI/CD**：使用 GitHub Actions，不依赖外部 CI 服务
- **唯一例外**：Cloudflare Pages 用于静态站托管，这是必要的外部服务

---

## 8. 文档原则

- **所有设计决策记录在 `docs/` 目录**：重要的架构决策、技术选型原因都应在文档中说明
- **代码中的非显而易见逻辑必须有中文注释**：例如 RSS 并发控制逻辑、XSS 防护措施等
- **文档与代码同步更新**：修改代码时，检查相关文档是否需要同步更新
- **README 应始终可读**：README.md 面向新用户，应简洁、完整、包含所有必要信息

---

## 9. 构建产物不入库

以下文件是构建产物，由 CI 每次运行时重新生成，不提交到 Git 仓库：

- `web/src/assets/data.json`（文章数据）
- `web/src/assets/blogs.json`（博客列表）
- `web/public/rss.xml`（聚合 RSS）
- `web/public/opml.xml`（OPML 文件）

这些文件已在 `.gitignore` 中排除。这样做的好处：
- 避免每次 RSS 更新都产生大量 Git diff
- 减小仓库体积
- 确保每次部署都拿到最新的 RSS 内容
