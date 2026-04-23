import { useEffect, useState } from 'react'
import { friendApi } from '@/api/friend'
import type { FriendMember } from '@/types'
import LazyImage from '@/components/LazyImage'
import MarkdownRenderer from '@/components/MarkdownRenderer'

interface CategoryGroup {
  key: string
  label: string
  members: FriendMember[]
}

const CATEGORY_CONFIG: Record<string, { label: string; icon: string }> = {
  high_school: { label: '高中', icon: '🏫' },
  undergraduate: { label: '本科', icon: '🎓' },
  internship: { label: '实习', icon: '💼' },
}

export default function Friends() {
  const [categories, setCategories] = useState<CategoryGroup[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedMember, setSelectedMember] = useState<FriendMember | null>(null)
  const [detail, setDetail] = useState<string>('')

  useEffect(() => {
    friendApi.getMembers().then((res) => {
      if (res.data.data?.categories) {
        setCategories(res.data.data.categories)
      }
    }).finally(() => setLoading(false))
  }, [])

  const openDetail = async (member: FriendMember) => {
    setSelectedMember(member)
    setDetail(member.bio_summary || '暂无简介')
    try {
      const res = await friendApi.getMemberDetail(member.id)
      if (res.data.data?.bio) {
        setDetail(res.data.data.bio)
      }
    } catch {
      // 使用已有的简介
    }
  }

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="animate-pulse space-y-12">
          {[1, 2, 3].map((i) => (
            <div key={i}>
              <div className="h-8 bg-gray-200 rounded w-32 mb-4" />
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {[1, 2, 3, 4, 5].map((j) => (
                  <div key={j} className="aspect-[3/4] bg-gray-200 rounded-xl" />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-3">我的朋友</h1>
        <p className="text-gray-500">记录一路走来的友谊</p>
      </div>

      {categories.map((cat) => (
        <section key={cat.key} className="mb-14">
          <div className="flex items-center gap-3 mb-6">
            <span className="text-2xl">{CATEGORY_CONFIG[cat.key]?.icon || '📷'}</span>
            <h2 className="text-xl font-bold text-gray-900">{CATEGORY_CONFIG[cat.key]?.label || cat.label}</h2>
            <span className="text-sm text-gray-400">({cat.members.length} 人)</span>
          </div>

          {cat.members.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {cat.members.map((member) => (
                <button
                  key={member.id}
                  onClick={() => openDetail(member)}
                  className="group text-left bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition"
                >
                  <div className="aspect-[3/4] relative">
                    {member.avatar ? (
                      <LazyImage
                        src={member.avatar.file_url}
                        alt={member.name}
                        className="w-full h-full"
                      />
                    ) : (
                      <div className="w-full h-full bg-primary-100 flex items-center justify-center text-primary-300 text-6xl">
                        👤
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-4">
                      <h3 className="text-white font-semibold text-lg">{member.name}</h3>
                    </div>
                  </div>
                  {member.bio_summary && (
                    <div className="p-4">
                      <p className="text-sm text-gray-600 line-clamp-2">{member.bio_summary}</p>
                    </div>
                  )}
                </button>
              ))}
            </div>
          ) : (
            <div className="text-center py-10 bg-gray-50 rounded-xl text-gray-400">
              暂无记录
            </div>
          )}
        </section>
      ))}

      {/* Detail Modal */}
      {selectedMember && (
        <div
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
          onClick={() => setSelectedMember(null)}
        >
          <div
            className="bg-white rounded-2xl max-w-lg w-full max-h-[85vh] overflow-y-auto shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative">
              {selectedMember.avatar ? (
                <div className="aspect-[4/3] relative">
                  <LazyImage
                    src={selectedMember.avatar.file_url}
                    alt={selectedMember.name}
                    className="w-full h-full rounded-t-2xl"
                  />
                </div>
              ) : (
                <div className="aspect-[4/3] bg-primary-100 flex items-center justify-center text-primary-300 text-8xl rounded-t-2xl">
                  👤
                </div>
              )}
              <button
                className="absolute top-3 right-3 w-8 h-8 bg-black/50 text-white rounded-full text-lg hover:bg-black/70 transition flex items-center justify-center"
                onClick={() => setSelectedMember(null)}
              >
                ✕
              </button>
            </div>
            <div className="p-6">
              <h3 className="text-2xl font-bold text-gray-900 mb-1">{selectedMember.name}</h3>
              <p className="text-sm text-primary-600 mb-4">
                {CATEGORY_CONFIG[selectedMember.category]?.label || selectedMember.category}
              </p>
              {detail ? (
                <div className="prose prose-sm max-w-none text-gray-700">
                  <MarkdownRenderer content={detail} />
                </div>
              ) : (
                <p className="text-gray-400 italic">暂无简介</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
