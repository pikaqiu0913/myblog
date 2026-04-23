import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { familyApi } from '@/api/family'
import type { FamilyMemberDetail } from '@/types'
import LazyImage from '@/components/LazyImage'
import PhotoGallery from '@/components/PhotoGallery'
import MarkdownRenderer from '@/components/MarkdownRenderer'

export default function FamilyDetail() {
  const { id } = useParams<{ id: string }>()
  const [member, setMember] = useState<FamilyMemberDetail | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (id) {
      familyApi.getMemberDetail(Number(id)).then((res) => {
        if (res.data.data) setMember(res.data.data)
      }).finally(() => setLoading(false))
    }
  }, [id])

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="animate-pulse space-y-4">
          <div className="h-64 bg-gray-200 rounded-xl" />
          <div className="h-8 bg-gray-200 rounded w-1/3" />
        </div>
      </div>
    )
  }

  if (!member) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 text-center text-gray-500">
        成员不存在
        <Link to="/family" className="block mt-4 text-primary-600">
          ← 返回家人列表
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <Link to="/family" className="text-sm text-gray-500 hover:text-primary-600 mb-6 inline-block">
        ← 返回家人列表
      </Link>

      {/* Header Card */}
      <div className="bg-white rounded-2xl shadow-sm border p-8 mb-8">
        <div className="flex flex-col md:flex-row items-center gap-8">
          {member.avatar && (
            <div className="w-32 h-32 md:w-40 md:h-40 flex-shrink-0">
              <LazyImage
                src={member.avatar.file_url}
                alt={member.name}
                className="w-full h-full rounded-full"
              />
            </div>
          )}
          <div className="text-center md:text-left">
            <h1 className="text-3xl font-bold text-gray-900 mb-1">{member.name}</h1>
            <p className="text-primary-600 font-medium text-lg mb-3">{member.relation}</p>
            {member.birth_date && (
              <p className="text-sm text-gray-500">
                🎂 {member.birth_date}
              </p>
            )}
            {member.hobbies && member.hobbies.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3 justify-center md:justify-start">
                {member.hobbies.map((hobby) => (
                  <span
                    key={hobby}
                    className="text-xs bg-primary-50 text-primary-700 px-3 py-1 rounded-full"
                  >
                    {hobby}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bio */}
      {member.bio && (
        <div className="bg-white rounded-2xl shadow-sm border p-8 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">关于 {member.name}</h2>
          <MarkdownRenderer content={member.bio} />
        </div>
      )}

      {/* Photos */}
      {member.photos.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm border p-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6">照片集锦</h2>
          <PhotoGallery photos={member.photos.map((p) => ({
            id: p.id,
            file_url: p.file_url,
            caption: p.caption,
          }))} />
        </div>
      )}
    </div>
  )
}
