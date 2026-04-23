import { useEffect, useState } from 'react'
import { guestbookApi } from '@/api/guestbook'
import type { GuestbookMessage } from '@/types'

export default function Guestbook() {
  const [messages, setMessages] = useState<GuestbookMessage[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [form, setForm] = useState({ nickname: '', content: '', contact: '' })

  const fetchMessages = () => {
    guestbookApi.getMessages().then((res) => {
      if (res.data.data) setMessages(res.data.data)
    }).finally(() => setLoading(false))
  }

  useEffect(() => {
    fetchMessages()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    if (!form.nickname.trim() || !form.content.trim()) {
      setError('请填写昵称和留言内容')
      return
    }
    setSubmitting(true)
    try {
      await guestbookApi.createMessage({
        nickname: form.nickname,
        content: form.content,
        contact: form.contact || undefined,
      })
      setForm({ nickname: '', content: '', contact: '' })
      setSuccess('留言成功！')
      fetchMessages()
    } catch (err: any) {
      if (err.response?.status === 429) {
        setError('提交过于频繁，请10分钟后再试')
      } else {
        setError(err.response?.data?.detail || '提交失败，请重试')
      }
    } finally {
      setSubmitting(false)
    }
  }

  const formatTime = (t: string) => {
    const d = new Date(t)
    return d.toLocaleString('zh-CN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold text-gray-900 mb-3">留言板</h1>
        <p className="text-gray-500">欢迎留下你的想法和建议</p>
      </div>

      {/* Submit Form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border p-6 mb-10">
        {error && (
          <div className="p-3 rounded-lg mb-4 text-sm bg-red-50 text-red-600">{error}</div>
        )}
        {success && (
          <div className="p-3 rounded-lg mb-4 text-sm bg-green-50 text-green-600">{success}</div>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">昵称 *</label>
            <input
              type="text"
              value={form.nickname}
              onChange={(e) => setForm({ ...form, nickname: e.target.value })}
              maxLength={100}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">联系方式（可选）</label>
            <input
              type="text"
              value={form.contact}
              onChange={(e) => setForm({ ...form, contact: e.target.value })}
              maxLength={255}
              placeholder="邮箱、微信等"
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
            />
          </div>
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">留言内容 *</label>
          <textarea
            value={form.content}
            onChange={(e) => setForm({ ...form, content: e.target.value })}
            rows={4}
            maxLength={2000}
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
            required
          />
          <p className="text-xs text-gray-400 mt-1 text-right">{form.content.length}/2000</p>
        </div>
        <button
          type="submit"
          disabled={submitting}
          className="bg-primary-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-primary-700 transition disabled:opacity-50"
        >
          {submitting ? '提交中...' : '提交留言'}
        </button>
        <p className="text-xs text-gray-400 mt-2">每人10分钟内最多提交3次</p>
      </form>

      {/* Messages List */}
      <div>
        <h2 className="text-lg font-bold text-gray-900 mb-4">留言列表 ({messages.length})</h2>
        {loading ? (
          <div className="animate-pulse space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-xl border p-5">
                <div className="h-4 bg-gray-200 rounded w-24 mb-2" />
                <div className="h-3 bg-gray-200 rounded w-full" />
              </div>
            ))}
          </div>
        ) : messages.length > 0 ? (
          <div className="space-y-4">
            {messages.map((msg) => (
              <div key={msg.id} className="bg-white rounded-xl border p-5">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-gray-900">{msg.nickname}</span>
                  <span className="text-xs text-gray-400">{formatTime(msg.created_at)}</span>
                </div>
                <p className="text-gray-700 text-sm whitespace-pre-wrap">{msg.content}</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-gray-50 rounded-xl text-gray-400">
            还没有留言，来做第一个留言的人吧！
          </div>
        )}
      </div>
    </div>
  )
}
