import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { blogApi } from '@/api/blog'
import type { ArticleListItem, Category } from '@/types'
import LazyImage from '@/components/LazyImage'

export default function BlogList() {
  const [articles, setArticles] = useState<ArticleListItem[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [activeCategory, setActiveCategory] = useState<string>('')
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)

  const pageSize = 10

  useEffect(() => {
    blogApi.getCategories().then((res) => {
      if (res.data.data) setCategories(res.data.data)
    })
  }, [])

  useEffect(() => {
    setLoading(true)
    blogApi.getArticles({
      page,
      page_size: pageSize,
      category: activeCategory,
    }).then((res) => {
      if (res.data.data) {
        setArticles(res.data.data.items)
        setTotal(res.data.data.total)
      }
    }).finally(() => setLoading(false))
  }, [page, activeCategory])

  const totalPages = Math.ceil(total / pageSize)

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold text-gray-900 mb-3">我的博客</h1>
        <p className="text-gray-500">记录技术思考与生活感悟</p>
      </div>

      {/* Categories */}
      <div className="flex flex-wrap gap-2 justify-center mb-8">
        <button
          onClick={() => { setActiveCategory(''); setPage(1) }}
          className={`px-4 py-1.5 rounded-full text-sm font-medium transition ${
            activeCategory === ''
              ? 'bg-primary-600 text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          全部
        </button>
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => { setActiveCategory(cat.slug); setPage(1) }}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition ${
              activeCategory === cat.slug
                ? 'bg-primary-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-xl p-6 animate-pulse">
              <div className="h-6 bg-gray-200 rounded w-3/4 mb-3" />
              <div className="h-4 bg-gray-200 rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : (
        <>
          <div className="space-y-6">
            {articles.map((article) => (
              <Link
                key={article.id}
                to={`/blog/${article.slug}`}
                className="group block bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition"
              >
                <div className="flex flex-col md:flex-row">
                  {article.cover && (
                    <div className="md:w-64 h-48 md:h-auto flex-shrink-0">
                      <LazyImage
                        src={article.cover.file_url}
                        alt={article.title}
                        className="w-full h-full"
                      />
                    </div>
                  )}
                  <div className="p-6 flex-1">
                    <div className="flex items-center gap-2 mb-2">
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
                    <h2 className="text-xl font-semibold text-gray-900 group-hover:text-primary-600 transition mb-2">
                      {article.title}
                    </h2>
                    {article.summary && (
                      <p className="text-gray-500 text-sm line-clamp-2 mb-3">
                        {article.summary}
                      </p>
                    )}
                    <div className="flex items-center gap-3 text-xs text-gray-400">
                      <span>{article.published_at?.split('T')[0]}</span>
                      <span>·</span>
                      <span>{article.view_count} 阅读</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-10">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="px-4 py-2 rounded-lg bg-white border text-sm disabled:opacity-50"
              >
                上一页
              </button>
              <span className="px-4 py-2 text-sm text-gray-600">
                {page} / {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="px-4 py-2 rounded-lg bg-white border text-sm disabled:opacity-50"
              >
                下一页
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
