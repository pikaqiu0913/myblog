import { useEffect, useState } from 'react'
import { profileApi } from '@/api/profile'
import type { Profile as ProfileType } from '@/types'
import LazyImage from '@/components/LazyImage'
import MarkdownRenderer from '@/components/MarkdownRenderer'

export default function Profile() {
  const [profile, setProfile] = useState<ProfileType | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    profileApi.getProfile().then((res) => {
      if (res.data.data) setProfile(res.data.data)
    }).finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3" />
          <div className="h-64 bg-gray-200 rounded" />
        </div>
      </div>
    )
  }

  if (!profile || profile.id === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 text-center text-gray-500">
        暂无个人介绍
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      {/* Header */}
      <div className="bg-white rounded-2xl shadow-sm border p-8 mb-8">
        <div className="flex flex-col md:flex-row items-center gap-8">
          {profile.avatar && (
            <div className="w-32 h-32 md:w-40 md:h-40 flex-shrink-0">
              <LazyImage
                src={profile.avatar.file_url}
                alt={profile.real_name}
                className="w-full h-full rounded-full"
              />
            </div>
          )}
          <div className="text-center md:text-left flex-1">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {profile.real_name}
              {profile.nick_name && (
                <span className="text-lg text-gray-500 font-normal ml-2">
                  ({profile.nick_name})
                </span>
              )}
            </h1>
            {profile.motto && (
              <p className="text-primary-600 italic mb-4">{profile.motto}</p>
            )}
            <div className="flex flex-wrap gap-4 justify-center md:justify-start text-sm text-gray-600">
              {profile.location && (
                <span className="flex items-center gap-1">
                  <span>📍</span> {profile.location}
                </span>
              )}
              {profile.birth_date && (
                <span className="flex items-center gap-1">
                  <span>🎂</span> {profile.birth_date}
                </span>
              )}
              {profile.email_public && (
                <span className="flex items-center gap-1">
                  <span>✉️</span>
                  <span className="select-all">{profile.email_public}</span>
                </span>
              )}
            </div>
            <div className="flex flex-wrap gap-3 mt-4 justify-center md:justify-start">
              {profile.github_url && (
                <a
                  href={profile.github_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm bg-gray-900 text-white px-4 py-1.5 rounded-lg hover:bg-gray-800 transition"
                >
                  GitHub
                </a>
              )}
              {profile.linkedin_url && (
                <a
                  href={profile.linkedin_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm bg-primary-600 text-white px-4 py-1.5 rounded-lg hover:bg-primary-700 transition"
                >
                  LinkedIn
                </a>
              )}
              {profile.resume_url && (
                <a
                  href={profile.resume_url}
                  className="text-sm border border-gray-300 text-gray-700 px-4 py-1.5 rounded-lg hover:bg-gray-50 transition"
                >
                  下载简历
                </a>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Bio */}
      {profile.bio && (
        <div className="bg-white rounded-2xl shadow-sm border p-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">关于我</h2>
          <MarkdownRenderer content={profile.bio} />
        </div>
      )}
    </div>
  )
}
