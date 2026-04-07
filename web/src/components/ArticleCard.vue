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
      <span v-if="article.pubDateYYMMDD" class="meta-sep">·</span>
      <span v-if="article.pubDateYYMMDD" class="article-date">{{ article.pubDateYYMMDD }}</span>
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
  border: 1px solid var(--color-border);
  padding: 18px 20px;
  margin-bottom: 12px;
  transition: box-shadow var(--transition), border-color var(--transition), transform var(--transition);
  cursor: default;
}
.article-card:hover {
  box-shadow: var(--shadow-card-hover);
  border-color: rgba(22, 43, 91, 0.2);
  transform: translateY(-1px);
}
.article-title {
  font-size: 1rem;
  font-weight: 600;
  margin-bottom: 6px;
  line-height: 1.45;
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
  gap: 8px;
  font-size: 0.8rem;
  margin-bottom: 8px;
  color: var(--color-text-secondary);
}
.article-author {
  color: var(--color-primary);
  font-weight: 500;
  font-size: 0.8rem;
}
.meta-sep { color: var(--color-border); }
.article-date { color: var(--color-text-secondary); }
.article-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
  margin-bottom: 8px;
}
.tag {
  background: var(--color-accent-light);
  color: var(--color-primary);
  border-radius: 99px;
  padding: 2px 10px;
  font-size: 0.72rem;
  font-weight: 500;
}
.article-summary {
  font-size: 0.85rem;
  color: var(--color-text-secondary);
  line-height: 1.65;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
