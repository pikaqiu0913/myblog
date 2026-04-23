import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { blogApi } from '@/api/blog'
import type { Article } from '@/types'
import LazyImage from '@/components/LazyImage'
import MarkdownRenderer from '@/components/MarkdownRenderer'

export default function BlogDetail() {
  const { slug } = useParams<{ slug: string }>()
  const [article, setArticle] = useState<Article | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (slug) {
      blogApi.getArticleDetail(slug).then((res) => {
        if (res.data.data) setArticle(res.data.data)
      }).finally(() => setLoading(false))
    }
  }, [slug])

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-3/4" />
          <div className="h-4 bg-gray-200 rounded w-1/4" />
          <div className="h-64 bg-gray-200 rounded mt-6" />
        </div>
      </div>
    )
  }

  if (!article) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 text-center text-gray-500">
        文章不存在
        <Link to="/blog" className="block mt-4 text-primary-600">
          ← 返回博客列表
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <Link to="/blog" className="text-sm text-gray-500 hover:text-primary-600 mb-6 inline-block">
        ← 返回博客列表
      </Link>

      <article className="bg-white rounded-2xl shadow-sm border overflow-hidden">
        {article.cover && (
          <div className="aspect-video w-full">
            <LazyImage
              src={article.cover.file_url}
              alt={article.title}
              className="w-full h-full"
            />
          </div>
        )}

        <div className="p-8 md:p-12">
          <div className="flex items-center gap-2 mb-4">
            {article.is_top && (
              <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full">
                置顶
              </span>
            )}
            {article.category && (
              <span className="text-xs bg-primary-100 text-primary-700 px-2 py-0.5 rounded-full">
                {article.category.name}
              </span>
            )}
          </div>

          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            {article.title}
          </h1>

          <div className="flex items-center gap-4 text-sm text-gray-400 mb-8 pb-8 border-b">
            <span>{article.published_at?.split('T')[0]}</span>
            <span>·</span>
            <span>{article.view_count} 阅读</span>
          </div>

          <div className="prose-custom">
            {article.html_content ? (
              <div dangerouslySetInnerHTML={{ __html: article.html_content }} />
            ) : article.content ? (
              <MarkdownRenderer content={article.content} />
            ) : null}
          </div>
        </div>
      </article>
    </div>
  )
}
