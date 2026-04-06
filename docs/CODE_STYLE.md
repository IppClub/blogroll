# IppClub Blogroll 代码规范

## JavaScript / Node.js 规范

### 语法与风格

- 使用 **ES2022+** 语法，利用现代 JavaScript 特性（可选链 `?.`、空值合并 `??`、顶层 `await` 等）
- 优先使用 `const`，只有在需要重新赋值时才用 `let`，**禁止使用 `var`**
- 异步代码统一使用 `async/await`，不使用 `.then()` 链式调用（`Promise.allSettled` 等聚合操作除外）
- 使用 2 个空格缩进
- 字符串优先使用单引号 `'`，模板字符串需要插值时用反引号 `` ` ``

### 导入顺序

文件顶部统一使用 `require` 导入（Node.js 脚本），顺序为：

```javascript
// 1. Node.js 标准库
const fs = require('fs')
const path = require('path')

// 2. 第三方包（npm 依赖）
const yaml = require('js-yaml')
const sanitizeHtml = require('sanitize-html')

// 3. 本地模块（相对路径）
const utils = require('./utils')
```

### 命名规范

- **函数名**：`camelCase`（如 `fetchFeedWithTimeout`、`cleanSummary`）
- **常量名**：`UPPER_SNAKE_CASE`（如 `CONCURRENCY`、`RSS_TIMEOUT_MS`、`MAX_ARTICLES`）
- **变量名**：`camelCase`
- **文件名**：`kebab-case`（如 `gen.js`、`validate.js`）

### 函数设计

- 每个函数职责单一，只做一件事
- 函数超过 30 行时，考虑拆分为更小的函数
- 函数参数超过 3 个时，考虑改用对象参数

### 错误处理

- 错误必须被捕获和处理，**禁止空 `catch` 块**：

```javascript
// ❌ 错误示例：空 catch
try {
  doSomething()
} catch (err) {
  // 什么都不做
}

// ✅ 正确示例：至少打印错误
try {
  doSomething()
} catch (err) {
  console.error(`操作失败: ${err.message}`)
}
```

- 关键步骤（如文件读写、网络请求）必须有错误处理
- 脚本遇到无法继续的致命错误时，调用 `process.exit(1)` 以非零退出码退出

### 注释规范

- 重要逻辑步骤必须有**中文注释**，解释"为什么"而非"是什么"
- 函数如果有复杂参数或返回值，使用 JSDoc 注释
- 不需要对显而易见的代码添加注释

```javascript
// ✅ 好的注释（解释原因）
// 使用 Promise.allSettled 而非 Promise.all，确保单个失败不影响整体
const results = await Promise.allSettled(promises)

// ❌ 无意义的注释（重复代码含义）
// 将结果赋值给 results
const results = await Promise.allSettled(promises)
```

---

## Vue 3 规范

### Composition API

- 统一使用 `<script setup>` Composition API
- **禁止使用 Options API**（即 `export default { data() {...}, methods: {...} }` 形式）

```vue
<!-- ✅ 正确 -->
<script setup>
import { ref, computed } from 'vue'
const count = ref(0)
</script>

<!-- ❌ 错误 -->
<script>
export default {
  data() { return { count: 0 } }
}
</script>
```

### Props 与 Emits

- Props 必须用 `defineProps` 显式声明类型和 `required`：

```vue
<script setup>
const props = defineProps({
  article: {
    type: Object,
    required: true,
  },
})
</script>
```

- Emits 必须用 `defineEmits` 显式声明：

```vue
<script setup>
const emit = defineEmits(['filter'])
</script>
```

### 安全红线

**禁止使用 `v-html` 渲染任何外部或用户提供的内容。**

RSS 摘要、博客描述等来自外部数据源的内容，一律使用纯文本插值 `{{ }}` 渲染。Vue 会自动对内容进行 HTML 转义，防止 XSS。

```vue
<!-- ✅ 正确：纯文本插值 -->
<p>{{ article.summary }}</p>

<!-- ❌ 安全漏洞：v-html -->
<p v-html="article.summary"></p>
```

### 文件命名

- 组件文件名使用 `PascalCase`（如 `ArticleCard.vue`、`SearchBar.vue`）
- 每个组件只负责一个功能，不要在一个组件里塞太多逻辑

### 样式

- 组件内样式使用 `<style scoped>` 防止样式泄漏
- 不在组件内定义全局样式（全局样式放在 `base.css`）

---

## CSS 规范

### 全局变量

全局 CSS 变量统一定义在 `web/src/assets/base.css` 的 `:root` 中，组件内直接使用变量名：

```css
/* 全局变量（base.css） */
:root {
  --color-primary: #6B4EFF;
}

/* 组件内使用 */
.my-element {
  color: var(--color-primary);
}
```

### 命名规范

遵循 BEM（Block Element Modifier）风格：

```css
/* Block */
.article-card { ... }

/* Element（用双横线） */
.article-card__title { ... }

/* Modifier（用双横线） */
.article-card--featured { ... }
```

### 其他规范

- **避免使用 `!important`**，如果需要覆盖样式，应提高选择器权重或重构样式结构
- 响应式断点统一使用：
  - `768px`：移动端/桌面端分界线
  - `1024px`：平板/桌面端分界线
- 颜色值使用 CSS 变量，不直接写十六进制值

---

## YAML 规范（blogs.yaml）

- 字符串值统一加**双引号**（如 `name: "张三的博客"`）
- 布尔值用 `true`/`false` 小写（不用 `True`/`False` 或 `yes`/`no`）
- 第一个条目上方写注释说明各字段含义
- 列表缩进使用 2 个空格
- URL 值必须包含协议前缀（`https://` 或 `http://`）

```yaml
# ✅ 正确示例
- name: "示例博客"
  html: "https://example.com"
  rss: "https://example.com/feed.xml"
  github: "example-user"
  department: "计算机科学与工程学院"
  tags:
    - "技术"
    - "随笔"
  active: true
```
