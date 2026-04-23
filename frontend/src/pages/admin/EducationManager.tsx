import { useEffect, useState } from 'react'
import { profileApi } from '@/api/profile'
import type { Education } from '@/types'

export default function AdminEducationManager() {
  const [items, setItems] = useState<Education[]>([])
  const [editing, setEditing] = useState<Education | null>(null)
  const [form, setForm] = useState<Partial<Education>>({})

  const fetchItems = () => {
    profileApi.getEducationList().then((res) => {
      if (res.data.data) setItems(res.data.data)
    })
  }

  useEffect(() => {
    fetchItems()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (editing) {
      await profileApi.updateEducation(editing.id, form)
    } else {
      await profileApi.createEducation(form)
    }
    setEditing(null)
    setForm({})
    fetchItems()
  }

  const handleDelete = async (id: number) => {
    if (confirm('确认删除？')) {
      await profileApi.deleteEducation(id)
      fetchItems()
    }
  }

  const startEdit = (item: Education) => {
    setEditing(item)
    setForm(item)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-10">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">管理教育经历</h1>

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <input
              type="text"
              placeholder="学校名称"
              value={form.school_name || ''}
              onChange={(e) => setForm({ ...form, school_name: e.target.value })}
              className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
              required
            />
            <input
              type="text"
              placeholder="专业"
              value={form.major || ''}
              onChange={(e) => setForm({ ...form, major: e.target.value })}
              className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
            />
            <input
              type="text"
              placeholder="学位"
              value={form.degree || ''}
              onChange={(e) => setForm({ ...form, degree: e.target.value })}
              className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
            />
            <input
              type="date"
              placeholder="开始日期"
              value={form.start_date || ''}
              onChange={(e) => setForm({ ...form, start_date: e.target.value })}
              className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
              required
            />
            <input
              type="date"
              placeholder="结束日期"
              value={form.end_date || ''}
              onChange={(e) => setForm({ ...form, end_date: e.target.value || undefined })}
              className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
            />
            <input
              type="number"
              placeholder="排序"
              value={form.sort_order || 0}
              onChange={(e) => setForm({ ...form, sort_order: Number(e.target.value) })}
              className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
            />
          </div>
          <textarea
            placeholder="描述（可选）"
            value={form.description || ''}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            rows={3}
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 outline-none mb-4"
          />
          <div className="flex gap-3">
            <button
              type="submit"
              className="bg-primary-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-primary-700 transition"
            >
              {editing ? '更新' : '添加'}
            </button>
            {editing && (
              <button
                type="button"
                onClick={() => { setEditing(null); setForm({}) }}
                className="border px-6 py-2 rounded-lg text-gray-600 hover:bg-gray-50 transition"
              >
                取消
              </button>
            )}
          </div>
        </form>

        {/* List */}
        <div className="space-y-3">
          {items.map((item) => (
            <div key={item.id} className="bg-white rounded-xl shadow-sm border p-5 flex justify-between items-start">
              <div>
                <h3 className="font-semibold text-gray-900">{item.school_name}</h3>
                <p className="text-sm text-gray-500">
                  {item.major} {item.degree && `· ${item.degree}`}
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  {item.start_date} ~ {item.end_date || '至今'}
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => startEdit(item)}
                  className="text-sm text-primary-600 hover:text-primary-700"
                >
                  编辑
                </button>
                <button
                  onClick={() => handleDelete(item.id)}
                  className="text-sm text-red-600 hover:text-red-700"
                >
                  删除
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
