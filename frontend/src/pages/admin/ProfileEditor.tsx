import { useEffect, useState, useRef } from 'react'
import { profileApi } from '@/api/profile'
import { uploadApi } from '@/api/upload'
import type { Profile } from '@/types'

export default function AdminProfileEditor() {
  const [profile, setProfile] = useState<Partial<Profile>>({})
  const [loading, setLoading] = useState(false)
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const [message, setMessage] = useState('')
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    profileApi.getProfile().then((res) => {
      if (res.data.data && res.data.data.id !== 0) {
        setProfile(res.data.data)
        if (res.data.data.avatar) {
          setAvatarPreview(res.data.data.avatar.file_url)
        }
      }
    })
  }, [])

  const handleAvatarUpload = async (file: File) => {
    setUploadingAvatar(true)
    try {
      const res = await uploadApi.uploadImage(file, 'profile')
      if (res.data.data?.media) {
        const media = res.data.data.media
        setProfile((prev) => ({ ...prev, avatar_media_id: media.id, avatar: media }))
        setAvatarPreview(media.file_url)
        setMessage('头像上传成功')
      }
    } catch {
      setMessage('头像上传失败')
    } finally {
      setUploadingAvatar(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')
    try {
      const payload: Record<string, unknown> = {}
      Object.entries(profile).forEach(([key, val]) => {
        if (val !== undefined && val !== null && key !== 'avatar' && key !== 'id' && key !== 'view_count') {
          payload[key] = val
        }
      })
      await profileApi.updateProfile(payload as Partial<Profile>)
      setMessage('保存成功')
    } catch (err: any) {
      const detail = err.response?.data?.detail || err.message || '未知错误'
      setMessage(`保存失败: ${detail}`)
      console.error('Update profile error:', err.response?.data || err)
    } finally {
      setLoading(false)
    }
  }

  const updateField = (field: keyof Profile, value: string | boolean | undefined) => {
    setProfile((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-10">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">编辑个人介绍</h1>

        {message && (
          <div className={`p-3 rounded-lg mb-4 text-sm ${message.includes('成功') ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border p-6 space-y-4">
          {/* 头像上传 */}
          <div className="flex items-center gap-6">
            <div
              className="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden border-2 border-dashed border-gray-300 cursor-pointer hover:border-primary-400 transition"
              onClick={() => fileInputRef.current?.click()}
            >
              {avatarPreview ? (
                <img src={avatarPreview} alt="avatar" className="w-full h-full object-cover" />
              ) : (
                <span className="text-3xl">📷</span>
              )}
            </div>
            <div>
              <input
                ref={fileInputRef}
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
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingAvatar}
                className="bg-primary-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary-700 transition disabled:opacity-50"
              >
                {uploadingAvatar ? '上传中...' : '更换头像'}
              </button>
              <p className="text-xs text-gray-400 mt-1">点击头像或按钮上传</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">真实姓名</label>
              <input
                type="text"
                value={profile.real_name || ''}
                onChange={(e) => updateField('real_name', e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">昵称</label>
              <input
                type="text"
                value={profile.nick_name || ''}
                onChange={(e) => updateField('nick_name', e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">格言</label>
              <input
                type="text"
                value={profile.motto || ''}
                onChange={(e) => updateField('motto', e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">所在地</label>
              <input
                type="text"
                value={profile.location || ''}
                onChange={(e) => updateField('location', e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">公开邮箱</label>
              <input
                type="email"
                value={profile.email_public || ''}
                onChange={(e) => updateField('email_public', e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">GitHub</label>
              <input
                type="url"
                value={profile.github_url || ''}
                onChange={(e) => updateField('github_url', e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">个人介绍 (Markdown)</label>
            <textarea
              value={profile.bio || ''}
              onChange={(e) => updateField('bio', e.target.value)}
              rows={10}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 outline-none font-mono text-sm"
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="is_public"
              checked={profile.is_public !== false}
              onChange={(e) => updateField('is_public', e.target.checked)}
              className="rounded"
            />
            <label htmlFor="is_public" className="text-sm text-gray-700">对外公开</label>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="bg-primary-600 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-primary-700 transition disabled:opacity-50"
          >
            {loading ? '保存中...' : '保存'}
          </button>
        </form>
      </div>
    </div>
  )
}
