<script setup>
// ArticleCard 组件：展示单篇文章卡片
// 摘要使用纯文本插值（{{ }}），严禁 v-html，防止 XSS 攻击

const props = defineProps({
  article: {
    type: Object,
    required: true,
    // 期望字段：name, htmlUrl, title, link, summary, pubDateYYMMDD, tags
  },
})
</script>

<template>
  <article class="article-card">
    <!-- 文章标题：外链，新标签页打开 -->
    <h3 class="article-title">
      <a :href="article.link" target="_blank" rel="noopener noreferrer">
        {{ article.title }}
      </a>
    </h3>

    <!-- 元信息：博主名 + 发布日期 -->
    <div class="article-meta">
      <a :href="article.htmlUrl" target="_blank" rel="noopener noreferrer" class="article-author">
        {{ article.name }}
      </a>
      <span v-if="article.pubDateYYMMDD" class="article-date">
        {{ article.pubDateYYMMDD }}
      </span>
    </div>

    <!-- 标签列表 -->
    <div v-if="article.tags && article.tags.length > 0" class="article-tags">
      <span v-for="tag in article.tags" :key="tag" class="tag">{{ tag }}</span>
    </div>

    <!-- 摘要：纯文本渲染，严禁使用 v-html -->
    <p v-if="article.summary" class="article-summary">{{ article.summary }}</p>
  </article>
</template>

<style scoped>
.article-card {
  background: var(--color-card);
  border-radius: var(--radius-card);
  box-shadow: var(--shadow-card);
  padding: 16px 20px;
  margin-bottom: 16px;
  transition: transform 0.2s, box-shadow 0.2s;
}

.article-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
}

.article-title {
  font-size: 1rem;
  font-weight: 600;
  margin-bottom: 8px;
  line-height: 1.4;
}

.article-title a {
  color: var(--color-text);
}

.article-title a:hover {
  color: var(--color-primary);
}

.article-meta {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 0.85rem;
  margin-bottom: 8px;
}

.article-author {
  color: var(--color-primary);
  font-weight: 500;
}

.article-date {
  color: var(--color-text-secondary);
}

.article-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 8px;
}

.tag {
  background: rgba(107, 78, 255, 0.08);
  color: var(--color-primary);
  border-radius: 4px;
  padding: 2px 8px;
  font-size: 0.75rem;
}

.article-summary {
  font-size: 0.875rem;
  color: var(--color-text-secondary);
  line-height: 1.6;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
