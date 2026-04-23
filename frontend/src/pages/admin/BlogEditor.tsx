import { useEffect, useState } from 'react'
import { blogApi } from '@/api/blog'
import type { Article, Category } from '@/types'

export default function AdminBlogEditor() {
  const [articles, setArticles] = useState<Article[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [editing, setEditing] = useState<Article | null>(null)
  const [form, setForm] = useState<Partial<Article>>({ status: 'draft' })
  const [activeTab, setActiveTab] = useState<'list' | 'edit'>('list')

  const fetchData = () => {
    blogApi.getArticles({ page: 1, page_size: 100 }).then((res) => {
      if (res.data.data) setArticles(res.data.data.items as Article[])
    })
    blogApi.getCategories().then((res) => {
      if (res.data.data) setCategories(res.data.data)
    })
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (editing) {
      await blogApi.updateArticle(editing.id, form)
    } else {
      await blogApi.createArticle(form)
    }
    setEditing(null)
    setForm({ status: 'draft' })
    setActiveTab('list')
    fetchData()
  }

  const handleDelete = async (id: number) => {
    if (confirm('确认删除该文章？')) {
      await blogApi.deleteArticle(id)
      fetchData()
    }
  }

  const startNew = () => {
    setEditing(null)
    setForm({ status: 'draft' })
    setActiveTab('edit')
  }

  const startEdit = (article: Article) => {
    setEditing(article)
    setForm(article)
    setActiveTab('edit')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 py-10">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">博客管理</h1>
          {activeTab === 'list' && (
            <button
              onClick={startNew}
              className="bg-primary-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-primary-700 transition"
            >
              + 新建文章
            </button>
          )}
        </div>

        {activeTab === 'list' ? (
          <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-gray-700">标题</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-700">状态</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-700">分类</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-700">阅读量</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-700">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {articles.map((article) => (
                  <tr key={article.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-900">{article.title}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        article.status === 'published'
                          ? 'bg-green-100 text-green-700'
                          : article.status === 'draft'
                          ? 'bg-gray-100 text-gray-600'
                          : 'bg-yellow-100 text-yellow-700'
                      }`}>
                        {article.status === 'published' ? '已发布' : article.status === 'draft' ? '草稿' : '归档'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-500">{article.category?.name || '-'}</td>
                    <td className="px-4 py-3 text-gray-500">{article.view_count}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-3">
                        <button onClick={() => startEdit(article)} className="text-primary-600 hover:text-primary-700">编辑</button>
                        <button onClick={() => handleDelete(article.id)} className="text-red-600 hover:text-red-700">删除</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border p-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">标题</label>
                <input
                  type="text"
                  value={form.title || ''}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Slug</label>
                <input
                  type="text"
                  value={form.slug || ''}
                  onChange={(e) => setForm({ ...form, slug: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">分类</label>
                <select
                  value={form.category_id || ''}
                  onChange={(e) => setForm({ ...form, category_id: e.target.value ? Number(e.target.value) : undefined })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                >
                  <option value="">无分类</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">状态</label>
                <select
                  value={form.status || 'draft'}
                  onChange={(e) => setForm({ ...form, status: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                >
                  <option value="draft">草稿</option>
                  <option value="published">发布</option>
                  <option value="archived">归档</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">摘要</label>
              <input
                type="text"
                value={form.summary || ''}
                onChange={(e) => setForm({ ...form, summary: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">内容 (Markdown)</label>
              <textarea
                value={form.content || ''}
                onChange={(e) => setForm({ ...form, content: e.target.value })}
                rows={15}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 outline-none font-mono text-sm"
                required
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="is_top"
                checked={form.is_top || false}
                onChange={(e) => setForm({ ...form, is_top: e.target.checked })}
                className="rounded"
              />
              <label htmlFor="is_top" className="text-sm text-gray-700">置顶</label>
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                className="bg-primary-600 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-primary-700 transition"
              >
                {editing ? '更新' : '发布'}
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('list')}
                className="border px-6 py-2.5 rounded-lg text-gray-600 hover:bg-gray-50 transition"
              >
                返回列表
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
