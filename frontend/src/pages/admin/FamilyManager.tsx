import { useEffect, useState, useRef } from 'react'
import { familyApi } from '@/api/family'
import { uploadApi } from '@/api/upload'
import type { FamilyMember, FamilyMemberDetail, FamilyMemberPhoto } from '@/types'

export default function AdminFamilyManager() {
  const [members, setMembers] = useState<FamilyMember[]>([])
  const [editing, setEditing] = useState<FamilyMember | null>(null)
  const [form, setForm] = useState<Partial<FamilyMember>>({})
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const [memberPhotos, setMemberPhotos] = useState<FamilyMemberPhoto[]>([])
  const [uploadingPhoto, setUploadingPhoto] = useState(false)
  const avatarInputRef = useRef<HTMLInputElement>(null)
  const photoInputRef = useRef<HTMLInputElement>(null)

  const fetchMembers = () => {
    familyApi.getMembers().then((res) => {
      if (res.data.data) setMembers(res.data.data)
    })
  }

  useEffect(() => {
    fetchMembers()
  }, [])

  const loadMemberDetail = async (id: number) => {
    const res = await familyApi.getMemberDetail(id)
    if (res.data.data) {
      const detail = res.data.data as FamilyMemberDetail
      setMemberPhotos(detail.photos || [])
    }
  }

  const handleEdit = (member: FamilyMember) => {
    setEditing(member)
    setForm(member)
    setAvatarPreview(member.avatar?.file_url || null)
    loadMemberDetail(member.id)
  }

  const handleAvatarUpload = async (file: File) => {
    setUploadingAvatar(true)
    try {
      const res = await uploadApi.uploadImage(file, 'family')
      if (res.data.data?.media) {
        const media = res.data.data.media
        setForm((prev) => ({ ...prev, avatar_media_id: media.id, avatar: media }))
        setAvatarPreview(media.file_url)
      }
    } catch {
      alert('头像上传失败')
    } finally {
      setUploadingAvatar(false)
    }
  }

  const handlePhotoUpload = async (file: File) => {
    if (!editing) return
    setUploadingPhoto(true)
    try {
      const res = await uploadApi.uploadImage(file, 'family')
      if (res.data.data?.media) {
        const mediaId = res.data.data.media.id
        await familyApi.addPhoto(editing.id, mediaId)
        loadMemberDetail(editing.id)
      }
    } catch {
      alert('照片上传失败')
    } finally {
      setUploadingPhoto(false)
    }
  }

  const handleDeletePhoto = async (photoId: number) => {
    if (!editing) return
    if (!confirm('确认删除这张照片？')) return
    try {
      await familyApi.deletePhoto(editing.id, photoId)
      loadMemberDetail(editing.id)
    } catch {
      alert('删除失败')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (editing) {
      await familyApi.updateMember(editing.id, form)
    } else {
      await familyApi.createMember(form)
    }
    setEditing(null)
    setForm({})
    setAvatarPreview(null)
    setMemberPhotos([])
    fetchMembers()
  }

  const handleDelete = async (id: number) => {
    if (confirm('确认删除该成员？')) {
      await familyApi.deleteMember(id)
      fetchMembers()
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-10">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">管理家庭成员</h1>

        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border p-6 mb-8">
          <div className="flex items-start gap-6 mb-4">
            {/* 头像上传 */}
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
                  type="text"
                  placeholder="关系"
                  value={form.relation || ''}
                  onChange={(e) => setForm({ ...form, relation: e.target.value })}
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
              </div>
              <textarea
                placeholder="介绍（支持 Markdown）"
                value={form.bio || ''}
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
                    onClick={() => { setEditing(null); setForm({}); setAvatarPreview(null); setMemberPhotos([]) }}
                    className="border px-6 py-2 rounded-lg text-gray-600 hover:bg-gray-50 transition"
                  >
                    取消
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* 照片管理 */}
          {editing && (
            <div className="mt-6 pt-6 border-t">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900">照片集锦</h3>
                <div>
                  <input
                    ref={photoInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) handlePhotoUpload(file)
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => photoInputRef.current?.click()}
                    disabled={uploadingPhoto}
                    className="bg-primary-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary-700 transition disabled:opacity-50"
                  >
                    {uploadingPhoto ? '上传中...' : '添加照片'}
                  </button>
                </div>
              </div>
              {memberPhotos.length > 0 ? (
                <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
                  {memberPhotos.map((photo) => (
                    <div key={photo.id} className="relative group aspect-square rounded-lg overflow-hidden border">
                      <img src={photo.file_url} alt="" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => handleDeletePhoto(photo.id)}
                        className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full text-xs opacity-0 group-hover:opacity-100 transition flex items-center justify-center"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-400">暂无照片</p>
              )}
            </div>
          )}
        </form>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {members.map((member) => (
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
                  <p className="text-sm text-primary-600">{member.relation}</p>
                  <p className="text-xs text-gray-400 mt-1">{member.photo_count} 张照片</p>
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
      </div>
    </div>
  )
}
