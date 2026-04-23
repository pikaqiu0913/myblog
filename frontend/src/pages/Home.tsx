import { Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { profileApi } from '@/api/profile'
import { blogApi } from '@/api/blog'
import { guestbookApi } from '@/api/guestbook'
import type { Profile, ArticleListItem, GuestbookMessage } from '@/types'
import LazyImage from '@/components/LazyImage'
import MarkdownRenderer from '@/components/MarkdownRenderer'

export default function Home() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [articles, setArticles] = useState<ArticleListItem[]>([])
  const [messages, setMessages] = useState<GuestbookMessage[]>([])

  useEffect(() => {
    profileApi.getProfile().then((res) => {
      if (res.data.data) setProfile(res.data.data)
    })
    blogApi.getArticles({ page: 1, page_size: 3 }).then((res) => {
      if (res.data.data) setArticles(res.data.data.items)
    })
    guestbookApi.getMessages().then((res) => {
      if (res.data.data) setMessages(res.data.data.slice(0, 3))
    })
  }, [])

  return (
    <div>
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-600 to-primary-800 text-white py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col md:flex-row items-center gap-10">
            {profile?.avatar && (
              <div className="w-40 h-40 md:w-48 md:h-48 flex-shrink-0">
                <LazyImage
                  src={profile.avatar.file_url}
                  alt={profile.real_name}
                  className="w-full h-full rounded-full border-4 border-white/30"
                />
              </div>
            )}
            <div className="text-center md:text-left">
              <h1 className="text-3xl md:text-5xl font-bold mb-3">
                你好，我是 {profile?.real_name || '...'}
              </h1>
              {profile?.motto && (
                <p className="text-lg md:text-xl text-primary-100 mb-4">
                  {profile.motto}
                </p>
              )}
              {profile?.bio && (
                <div className="text-primary-100 max-w-xl line-clamp-3 mb-6">
                  <MarkdownRenderer content={profile.bio} />
                </div>
              )}
              <div className="flex flex-wrap gap-3 justify-center md:justify-start">
                <Link
                  to="/profile"
                  className="bg-white text-primary-700 px-5 py-2 rounded-lg font-medium hover:bg-primary-50 transition"
                >
                  了解更多
                </Link>
                <Link
                  to="/blog"
                  className="border border-white/50 text-white px-5 py-2 rounded-lg font-medium hover:bg-white/10 transition"
                >
                  我的博客
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Links */}
      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
            {[
              { to: '/education', title: '教育经历', icon: '🎓', desc: '我的学习历程' },
              { to: '/family', title: '家庭成员', icon: '👨‍👩‍👧‍👦', desc: '温馨的家庭' },
              { to: '/friends', title: '我的朋友', icon: '🧑‍🤝‍🧑', desc: '一路的伙伴' },
              { to: '/photos', title: '生活相册', icon: '📸', desc: '记录美好瞬间' },
              { to: '/blog', title: '技术博客', icon: '📝', desc: '分享与思考' },
            ].map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className="group bg-gray-50 rounded-xl p-6 text-center hover:bg-primary-50 transition-colors"
              >
                <div className="text-4xl mb-3">{item.icon}</div>
                <h3 className="font-semibold text-gray-900 group-hover:text-primary-700 transition">
                  {item.title}
                </h3>
                <p className="text-sm text-gray-500 mt-1">{item.desc}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Latest Articles */}
      {articles.length > 0 && (
        <section className="py-16 bg-gray-50">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900">最新文章</h2>
              <Link
                to="/blog"
                className="text-primary-600 hover:text-primary-700 font-medium"
              >
                查看全部 →
              </Link>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              {articles.map((article) => (
                <Link
                  key={article.id}
                  to={`/blog/${article.slug}`}
                  className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition group"
                >
                  {article.cover && (
                    <div className="aspect-video">
                      <LazyImage
                        src={article.cover.file_url}
                        alt={article.title}
                        className="w-full h-full"
                      />
                    </div>
                  )}
                  <div className="p-5">
                    <h3 className="font-semibold text-gray-900 group-hover:text-primary-600 transition line-clamp-2">
                      {article.title}
                    </h3>
                    {article.summary && (
                      <p className="text-sm text-gray-500 mt-2 line-clamp-2">
                        {article.summary}
                      </p>
                    )}
                    <div className="flex items-center gap-3 mt-3 text-xs text-gray-400">
                      <span>{article.published_at?.split('T')[0]}</span>
                      <span>·</span>
                      <span>{article.view_count} 阅读</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Guestbook Preview */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900">留言板</h2>
            <Link
              to="/guestbook"
              className="text-primary-600 hover:text-primary-700 font-medium"
            >
              去留言 →
            </Link>
          </div>
          {messages.length > 0 ? (
            <div className="grid md:grid-cols-3 gap-4">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className="bg-white rounded-xl border p-5 hover:shadow-sm transition"
                >
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 text-sm font-bold">
                      {msg.nickname.charAt(0)}
                    </div>
                    <span className="font-medium text-gray-900 text-sm">
                      {msg.nickname}
                    </span>
                  </div>
                  <p className="text-gray-600 text-sm line-clamp-3">
                    {msg.content}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-xl border p-8 text-center">
              <p className="text-gray-400 mb-4">还没有留言，来做第一个留言的人吧！</p>
              <Link
                to="/guestbook"
                className="inline-block bg-primary-600 text-white px-5 py-2 rounded-lg font-medium hover:bg-primary-700 transition"
              >
                写留言
              </Link>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
