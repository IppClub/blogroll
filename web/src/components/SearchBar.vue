<script setup>
// SearchBar 组件：关键词搜索 + 院系筛选
import { ref, computed, watch } from 'vue'

const props = defineProps({
  articles: {
    type: Array,
    required: true,
  },
  blogs: {
    type: Array,
    required: true,
  },
})

const emit = defineEmits(['filter'])

// 搜索关键词
const keyword = ref('')
// 选中的院系
const selectedDepartment = ref('')

/**
 * 从 blogs 数组中提取所有非空的院系值（去重、排序）。
 */
const departments = computed(() => {
  const set = new Set()
  props.blogs.forEach((b) => {
    if (b.department) set.add(b.department)
  })
  return Array.from(set).sort()
})

/**
 * 根据关键词和院系过滤文章列表。
 */
const filteredArticles = computed(() => {
  const kw = keyword.value.trim().toLowerCase()
  const dept = selectedDepartment.value

  return props.articles.filter((article) => {
    // 关键词匹配：标题、摘要、博主名
    const matchKeyword =
      !kw ||
      article.title.toLowerCase().includes(kw) ||
      article.summary.toLowerCase().includes(kw) ||
      article.name.toLowerCase().includes(kw)

    // 院系匹配：找到 blogs 中对应博客的院系
    let matchDept = true
    if (dept) {
      // 根据博主名或博客 HTML 地址找到对应博客
      const blog = props.blogs.find((b) => b.name === article.name || b.html === article.htmlUrl)
      matchDept = blog ? blog.department === dept : false
    }

    return matchKeyword && matchDept
  })
})

// 过滤结果变化时向父组件 emit
watch(
  filteredArticles,
  (val) => {
    emit('filter', val)
  },
  { immediate: true }
)
</script>

<template>
  <div class="search-bar">
    <input v-model="keyword" type="text" class="search-input"
      placeholder="🔍 搜索文章标题、摘要、博主名..." aria-label="搜索文章" />
    <div class="divider"></div>
    <select v-model="selectedDepartment" class="dept-select" aria-label="按院系筛选">
      <option value="">全部院系</option>
      <option v-for="dept in departments" :key="dept" :value="dept">{{ dept }}</option>
    </select>
  </div>
</template>

<style scoped>
.search-bar {
  display: flex;
  gap: 10px;
  margin-bottom: 16px;
  flex-wrap: wrap;
  background: var(--color-card);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-card);
  padding: 10px 14px;
}
.search-input {
  flex: 1;
  min-width: 180px;
  padding: 6px 0;
  border: none;
  font-size: 0.9rem;
  color: var(--color-text);
  background: transparent;
  outline: none;
}
.search-input::placeholder {
  color: #9ca3af;
}
.divider {
  width: 1px;
  background: var(--color-border);
  align-self: stretch;
  margin: 2px 0;
}
.dept-select {
  padding: 4px 8px;
  border: none;
  font-size: 0.85rem;
  color: var(--color-text-secondary);
  background: transparent;
  outline: none;
  cursor: pointer;
}
@media (max-width: 768px) {
  .search-bar { flex-direction: column; }
  .divider { display: none; }
  .search-input, .dept-select { width: 100%; }
}
</style>
