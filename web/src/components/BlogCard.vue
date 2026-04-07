<script setup>
// BlogCard 组件：侧边栏博客列表卡片（紧凑样式）

const props = defineProps({
  blog: {
    type: Object,
    required: true,
    // 期望字段：name, html, rss, department, tags
  },
})

/**
 * 截断 URL 显示，去掉协议前缀并限制长度。
 */
function truncateUrl(url) {
  if (!url) return ''
  return url.replace(/^https?:\/\//, '').replace(/\/$/, '').slice(0, 40)
}
</script>

<template>
  <div class="blog-card">
    <!-- 博客名称链接 -->
    <a :href="blog.html" target="_blank" rel="noopener noreferrer" class="blog-name">
      {{ blog.name }}
    </a>

    <!-- URL 截断显示 -->
    <div class="blog-url">{{ truncateUrl(blog.html) }}</div>

    <!-- 院系（可选） -->
    <div v-if="blog.department" class="blog-department">
      {{ blog.department }}
    </div>

    <!-- 标签与 RSS 图标行 -->
    <div class="blog-footer">
      <div v-if="blog.tags && blog.tags.length > 0" class="blog-tags">
        <span v-for="tag in blog.tags" :key="tag" class="blog-tag">{{ tag }}</span>
      </div>
      <!-- RSS 订阅图标（有效 RSS 才显示） -->
      <a
        v-if="blog.rss && blog.rss !== '---'"
        :href="blog.rss"
        target="_blank"
        rel="noopener noreferrer"
        class="rss-link"
        aria-label="RSS 订阅"
        title="RSS 订阅"
      >
        <!-- RSS 橙色图标 -->
        <svg width="14" height="14" viewBox="0 0 24 24" fill="#F0861A" aria-hidden="true">
          <circle cx="6.18" cy="17.82" r="2.18"/>
          <path d="M4 4.44v2.83c7.03 0 12.73 5.7 12.73 12.73h2.83c0-8.59-6.97-15.56-15.56-15.56zm0 5.66v2.83c3.9 0 7.07 3.17 7.07 7.07h2.83c0-5.47-4.43-9.9-9.9-9.9z"/>
        </svg>
      </a>
    </div>
  </div>
</template>

<style scoped>
.blog-card {
  background: var(--color-card);
  border-radius: 10px;
  border: 1px solid var(--color-border);
  padding: 12px 14px;
  margin-bottom: 8px;
  transition: box-shadow var(--transition), border-color var(--transition);
}
.blog-card:hover {
  box-shadow: 0 2px 8px rgba(22,43,91,0.08);
  border-color: rgba(22,43,91,0.2);
}
.blog-name {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--color-text);
  display: block;
  margin-bottom: 2px;
}
.blog-name:hover { color: var(--color-primary); }
.blog-url {
  font-size: 0.72rem;
  color: var(--color-text-secondary);
  margin-bottom: 4px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.blog-department {
  font-size: 0.72rem;
  color: var(--color-primary);
  margin-bottom: 6px;
  background: var(--color-accent-light);
  display: inline-block;
  padding: 1px 8px;
  border-radius: 99px;
}
.blog-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 6px;
}
.blog-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}
.blog-tag {
  background: var(--color-accent-light);
  color: var(--color-primary);
  border-radius: 99px;
  padding: 1px 7px;
  font-size: 0.68rem;
  font-weight: 500;
}
.rss-link {
  display: flex;
  align-items: center;
  flex-shrink: 0;
  opacity: 0.7;
  transition: opacity var(--transition);
}
.rss-link:hover { opacity: 1; }
</style>
