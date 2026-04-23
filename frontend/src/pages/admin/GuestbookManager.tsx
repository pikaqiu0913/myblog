import { useEffect, useState } from 'react'
import { guestbookApi } from '@/api/guestbook'
import type { GuestbookMessage } from '@/types'

export default function AdminGuestbookManager() {
  const [messages, setMessages] = useState<GuestbookMessage[]>([])
  const [loading, setLoading] = useState(true)

  const fetchMessages = () => {
    setLoading(true)
    guestbookApi.getAllMessages().then((res) => {
      if (res.data.data) setMessages(res.data.data)
    }).finally(() => setLoading(false))
  }

  useEffect(() => {
    fetchMessages()
  }, [])

  const handleTogglePublic = async (msg: GuestbookMessage) => {
    await guestbookApi.updateMessage(msg.id, { is_public: !msg.is_public })
    fetchMessages()
  }

  const handleDelete = async (id: number) => {
    if (confirm('确认删除这条留言？')) {
      await guestbookApi.deleteMessage(id)
      fetchMessages()
    }
  }

  const formatTime = (t: string) => {
    const d = new Date(t)
    return d.toLocaleString('zh-CN')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 py-10">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">留言板管理</h1>

        {loading ? (
          <div className="animate-pulse space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-xl border p-4 h-20" />
            ))}
          </div>
        ) : messages.length > 0 ? (
          <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-gray-700">ID</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-700">昵称</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-700">内容</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-700">联系方式</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-700">时间</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-700">状态</th>
                  <th className="text-right px-4 py-3 font-medium text-gray-700">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {messages.map((msg) => (
                  <tr key={msg.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-gray-500">{msg.id}</td>
                    <td className="px-4 py-3 font-medium text-gray-900">{msg.nickname}</td>
                    <td className="px-4 py-3 text-gray-700 max-w-xs truncate">{msg.content}</td>
                    <td className="px-4 py-3 text-gray-500">{msg.contact || '-'}</td>
                    <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{formatTime(msg.created_at)}</td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => handleTogglePublic(msg)}
                        className={`px-2 py-1 rounded text-xs font-medium transition ${
                          msg.is_public
                            ? 'bg-green-100 text-green-700'
                            : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {msg.is_public ? '展示中' : '已隐藏'}
                      </button>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => handleDelete(msg.id)}
                        className="text-red-600 hover:text-red-700 text-xs"
                      >
                        删除
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-xl border text-gray-400">
            暂无留言
          </div>
        )}
      </div>
    </div>
  )
}
