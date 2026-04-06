<script setup>
import { ref } from 'vue'
import articles from './assets/data.json'
import blogs from './assets/blogs.json'
import SearchBar from './components/SearchBar.vue'
import ArticleCard from './components/ArticleCard.vue'
import BlogCard from './components/BlogCard.vue'
import logo from './assets/logo.svg'
import '../src/assets/base.css'

// 过滤后的文章列表，默认显示全部
const filteredArticles = ref(articles)

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
        <img :src="logo" alt="IppClub Logo" class="logo-img" />
        <span class="header-title">IppClub Blogroll</span>
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
        <div v-if="filteredArticles.length === 0" class="empty-tip">
          暂无匹配的文章
        </div>
        <ArticleCard
          v-for="(article, idx) in filteredArticles"
          :key="idx"
          :article="article"
        />
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
  gap: 10px;
}

.logo-img {
  height: 36px;
}

.header-title {
  font-size: 1.2rem;
  font-weight: 700;
  color: var(--color-primary);
}

.github-link {
  color: var(--color-text);
  display: flex;
  align-items: center;
  transition: color 0.2s;
}

.github-link:hover {
  color: var(--color-primary);
}

.two-column {
  display: grid;
  grid-template-columns: 65fr 35fr;
  gap: 20px;
  align-items: start;
}

.sidebar-title {
  font-size: 1rem;
  font-weight: 600;
  color: var(--color-text);
  margin: 0 0 12px 0;
}

.empty-tip {
  text-align: center;
  color: var(--color-text-secondary);
  padding: 40px 0;
}

@media (max-width: 768px) {
  .two-column {
    grid-template-columns: 1fr;
  }

  .side-column {
    order: 2;
  }

  .main-column {
    order: 1;
  }
}
</style>
