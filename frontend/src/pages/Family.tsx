import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { familyApi } from '@/api/family'
import type { FamilyMember } from '@/types'
import LazyImage from '@/components/LazyImage'

export default function Family() {
  const [members, setMembers] = useState<FamilyMember[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    familyApi.getMembers().then((res) => {
      if (res.data.data) setMembers(res.data.data)
    }).finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="animate-pulse grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="aspect-[3/4] bg-gray-200 rounded-xl" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-3">我的家人</h1>
        <p className="text-gray-500">生命中最重要的人</p>
      </div>

      {members.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {members.map((member) => (
            <Link
              key={member.id}
              to={`/family/${member.id}`}
              className="group bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition"
            >
              <div className="aspect-[3/4] relative">
                {member.avatar ? (
                  <LazyImage
                    src={member.avatar.file_url}
                    alt={member.name}
                    className="w-full h-full"
                  />
                ) : (
                  <div className="w-full h-full bg-primary-100 flex items-center justify-center text-primary-300 text-5xl">
                    👤
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <h3 className="text-white font-semibold text-lg">{member.name}</h3>
                  <p className="text-white/80 text-sm">{member.relation}</p>
                </div>
              </div>
              {member.bio_summary && (
                <div className="p-4">
                  <p className="text-sm text-gray-600 line-clamp-2">{member.bio_summary}</p>
                  {member.photo_count > 0 && (
                    <p className="text-xs text-gray-400 mt-2">{member.photo_count} 张照片</p>
                  )}
                </div>
              )}
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 text-gray-500">暂无家庭成员信息</div>
      )}
    </div>
  )
}
