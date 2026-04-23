import { useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/stores/authStore'

const adminLinks = [
  { to: '/admin/profile', title: '编辑个人介绍', desc: '修改个人简介、联系方式', icon: '👤' },
  { to: '/admin/education', title: '管理教育经历', desc: '添加、编辑学习历程', icon: '🎓' },
  { to: '/admin/family', title: '管理家庭成员', desc: '编辑家人信息与照片', icon: '👨‍👩‍👧‍👦' },
  { to: '/admin/friends', title: '管理朋友', desc: '按阶段添加朋友名片', icon: '🧑‍🤝‍🧑' },
  { to: '/admin/guestbook', title: '留言板管理', desc: '查看、审核访客留言', icon: '💬' },
  { to: '/admin/blog', title: '博客管理', desc: '发布、编辑文章', icon: '📝' },
  { to: '/admin/media', title: '媒体管理', desc: '上传、管理图片文件', icon: '🖼️' },
]

export default function AdminDashboard() {
  const navigate = useNavigate()
  const { isLoggedIn } = useAuthStore()

  useEffect(() => {
    if (!isLoggedIn) {
      navigate('/admin/login')
    }
  }, [isLoggedIn, navigate])

  if (!isLoggedIn) return null

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-900">管理后台</h1>
          <Link to="/" className="text-sm text-gray-500 hover:text-primary-600">
            ← 返回网站
          </Link>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {adminLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className="bg-white rounded-xl shadow-sm border p-6 hover:shadow-md transition group"
            >
              <div className="text-3xl mb-3">{link.icon}</div>
              <h3 className="font-semibold text-gray-900 group-hover:text-primary-600 transition">
                {link.title}
              </h3>
              <p className="text-sm text-gray-500 mt-1">{link.desc}</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
