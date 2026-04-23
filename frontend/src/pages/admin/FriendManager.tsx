import { useEffect, useState, useRef } from 'react'
import { friendApi } from '@/api/friend'
import { uploadApi } from '@/api/upload'
import type { FriendMember } from '@/types'

const CATEGORIES = [
  { key: 'high_school', label: '高中' },
  { key: 'undergraduate', label: '本科' },
  { key: 'internship', label: '实习' },
]

export default function AdminFriendManager() {
  const [members, setMembers] = useState<FriendMember[]>([])
  const [selectedCategory, setSelectedCategory] = useState('high_school')
  const [editing, setEditing] = useState<FriendMember | null>(null)
  const [form, setForm] = useState<Partial<FriendMember>>({ category: 'high_school' })
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const avatarInputRef = useRef<HTMLInputElement>(null)

  const fetchMembers = () => {
    friendApi.getMembers().then((res) => {
      if (res.data.data?.categories) {
        const all: FriendMember[] = []
        res.data.data.categories.forEach((c: any) => all.push(...c.members))
        setMembers(all)
      }
    })
  }

  useEffect(() => {
    fetchMembers()
  }, [])

  const handleAvatarUpload = async (file: File) => {
    setUploadingAvatar(true)
    try {
      const res = await uploadApi.uploadImage(file, 'friends')
      if (res.data.data?.media) {
        const media = res.data.data.media
        setForm((prev) => ({ ...prev, avatar_media_id: media.id }))
        setAvatarPreview(media.file_url)
      }
    } catch {
      alert('头像上传失败')
    } finally {
      setUploadingAvatar(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const payload = { ...form, category: selectedCategory }
    if (editing) {
      await friendApi.updateMember(editing.id, payload)
      setEditing(null)
    } else {
      await friendApi.createMember(payload)
    }
    setForm({ category: selectedCategory })
    setAvatarPreview(null)
    fetchMembers()
  }

  const handleDelete = async (id: number) => {
    if (confirm('确认删除该朋友？')) {
      await friendApi.deleteMember(id)
      fetchMembers()
    }
  }

  const handleEdit = (member: FriendMember) => {
    setEditing(member)
    setForm(member)
    setAvatarPreview(member.avatar?.file_url || null)
    setSelectedCategory(member.category)
  }

  const filteredMembers = members.filter((m) => m.category === selectedCategory)

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 py-10">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">管理朋友</h1>

        {/* 分类切换 */}
        <div className="flex gap-2 mb-6">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.key}
              onClick={() => {
                setSelectedCategory(cat.key)
                setEditing(null)
                setForm({ category: cat.key })
                setAvatarPreview(null)
              }}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                selectedCategory === cat.key
                  ? 'bg-primary-600 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-100 border'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* 表单 */}
        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border p-6 mb-8">
          <div className="flex items-start gap-6 mb-4">
            <div className="flex-shrink-0">
              <div
                className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden border-2 border-dashed border-gray-300 cursor-pointer hover:border-primary-400 transition"
                onClick={() => avatarInputRef.current?.click()}
              >
                {avatarPreview ? (
                  <img src={avatarPreview} alt="avatar" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-2xl">👤</span>
                )}
              </div>
              <input
                ref={avatarInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) handleAvatarUpload(file)
                }}
              />
              <button
                type="button"
                onClick={() => avatarInputRef.current?.click()}
                disabled={uploadingAvatar}
                className="mt-2 w-full text-center text-xs text-primary-600 hover:text-primary-700 disabled:opacity-50"
              >
                {uploadingAvatar ? '上传中...' : '更换头像'}
              </button>
            </div>

            <div className="flex-1">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <input
                  type="text"
                  placeholder="姓名"
                  value={form.name || ''}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                  required
                />
                <input
                  type="number"
                  placeholder="排序"
                  value={form.sort_order || 0}
                  onChange={(e) => setForm({ ...form, sort_order: Number(e.target.value) })}
                  className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                />
                <div />
              </div>
              <textarea
                placeholder="简介（支持 Markdown）"
                value={(form as any).bio || ''}
                onChange={(e) => setForm({ ...form, bio: e.target.value })}
                rows={4}
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
                    onClick={() => { setEditing(null); setForm({ category: selectedCategory }); setAvatarPreview(null) }}
                    className="border px-6 py-2 rounded-lg text-gray-600 hover:bg-gray-50 transition"
                  >
                    取消
                  </button>
                )}
              </div>
            </div>
          </div>
        </form>

        {/* 列表 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredMembers.map((member) => (
            <div key={member.id} className="bg-white rounded-xl shadow-sm border p-5">
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden flex-shrink-0">
                  {member.avatar ? (
                    <img src={member.avatar.file_url} alt={member.name} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-xl">👤</span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900">{member.name}</h3>
                  <p className="text-sm text-gray-500 mt-1 line-clamp-2">{member.bio_summary || '暂无简介'}</p>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <button
                    onClick={() => handleEdit(member)}
                    className="text-sm text-primary-600"
                  >
                    编辑
                  </button>
                  <button
                    onClick={() => handleDelete(member.id)}
                    className="text-sm text-red-600"
                  >
                    删除
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
        {filteredMembers.length === 0 && (
          <div className="text-center py-12 bg-white rounded-xl border text-gray-400">
            该分类下暂无记录
          </div>
        )}
      </div>
    </div>
  )
}
