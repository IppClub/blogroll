<script setup>
import { ref, onMounted } from 'vue'
import SearchBar from './components/SearchBar.vue'
import ArticleCard from './components/ArticleCard.vue'
import BlogCard from './components/BlogCard.vue'
import logo from './assets/logo.svg'
import '../src/assets/base.css'

const articles = ref([])
const blogs = ref([])
const filteredArticles = ref([])
const loading = ref(true)
const error = ref(null)

onMounted(async () => {
  try {
    const base = import.meta.env.BASE_URL
    const [dataRes, blogsRes] = await Promise.all([
      fetch(`${base}data.json`),
      fetch(`${base}blogs.json`)
    ])
    if (!dataRes.ok || !blogsRes.ok) throw new Error('数据加载失败')
    articles.value = await dataRes.json()
    blogs.value = await blogsRes.json()
    filteredArticles.value = articles.value
  } catch (e) {
    error.value = e.message
  } finally {
    loading.value = false
  }
})

// SearchBar 的 filter 事件处理
function onFilter(result) {
  filteredArticles.value = result
}
</script>

<template>
  <!-- 顶部固定导航栏 -->
  <header id="header">
    <div id="header-inner">
      <div class="header-logo">
        <img :src="logo" alt="SEU Logo" class="logo-img" />
        <div>
          <div class="header-title">SEU-IppClub</div>
          <div class="header-subtitle">同学博客聚合</div>
        </div>
      </div>
      <a
        href="https://github.com/IppClub/blogroll"
        target="_blank"
        rel="noopener noreferrer"
        class="github-link"
        aria-label="GitHub 仓库"
      >
        <!-- GitHub SVG 图标 -->
        <svg height="24" width="24" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
          <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38
            0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13
            -.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66
            .07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15
            -.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0
            1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82
            1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01
            1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0 0 16 8c0-4.42-3.58-8-8-8z" />
        </svg>
      </a>
    </div>
  </header>

  <!-- 主体内容 -->
  <div id="container">
    <div class="two-column">
      <!-- 左侧：文章列表 -->
      <main class="main-column">
        <SearchBar :articles="articles" :blogs="blogs" @filter="onFilter" />
        <div v-if="loading" class="loading-tip">⏳ 正在加载文章...</div>
        <div v-else-if="error" class="error-tip">❌ {{ error }}</div>
        <template v-else>
          <div class="article-count">共 {{ filteredArticles.length }} 篇文章</div>
          <div v-if="filteredArticles.length === 0" class="empty-tip">
            暂无匹配的文章
          </div>
          <ArticleCard
            v-for="(article, idx) in filteredArticles"
            :key="idx"
            :article="article"
          />
        </template>
      </main>

      <!-- 右侧：博客列表 -->
      <aside class="side-column">
        <h2 class="sidebar-title">博客列表</h2>
        <BlogCard
          v-for="(blog, idx) in blogs"
          :key="idx"
          :blog="blog"
        />
      </aside>
    </div>
  </div>
</template>

<style scoped>
.header-logo {
  display: flex;
  align-items: center;
  gap: 12px;
}
.logo-img {
  height: 38px;
  width: 38px;
}
.header-title {
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--color-primary);
  letter-spacing: 0.02em;
}
.header-subtitle {
  font-size: 0.75rem;
  color: var(--color-text-secondary);
  margin-top: 1px;
}
.github-link {
  color: var(--color-text-secondary);
  display: flex;
  align-items: center;
  padding: 6px;
  border-radius: 8px;
  transition: background var(--transition), color var(--transition);
}
.github-link:hover {
  background: var(--color-accent-light);
  color: var(--color-primary);
}
.two-column {
  display: grid;
  grid-template-columns: 1fr 320px;
  gap: 24px;
  align-items: start;
}
.sidebar-title {
  font-size: 0.8rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--color-text-secondary);
  margin: 0 0 12px 4px;
}
.empty-tip {
  text-align: center;
  color: var(--color-text-secondary);
  padding: 60px 0;
  font-size: 0.9rem;
}
.loading-tip {
  text-align: center;
  color: var(--color-text-secondary);
  padding: 60px 0;
  font-size: 0.9rem;
}
.error-tip {
  text-align: center;
  color: #dc2626;
  padding: 60px 0;
  font-size: 0.9rem;
}
.article-count {
  font-size: 0.8rem;
  color: var(--color-text-secondary);
  margin-bottom: 12px;
  padding-left: 4px;
}
@media (max-width: 900px) {
  .two-column {
    grid-template-columns: 1fr;
  }
  .side-column { order: 2; }
  .main-column { order: 1; }
}
</style>
