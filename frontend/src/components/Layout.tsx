import { Outlet, Link, useLocation } from 'react-router-dom'
import { useAuthStore } from '@/stores/authStore'

const navItems = [
  { path: '/', label: '首页' },
  { path: '/profile', label: '关于我' },
  { path: '/education', label: '教育经历' },
  { path: '/photos', label: '生活相册' },
  { path: '/family', label: '家人' },
  { path: '/friends', label: '朋友' },
  { path: '/guestbook', label: '留言板' },
  { path: '/blog', label: '博客' },
]

export default function Layout() {
  const location = useLocation()
  const { isLoggedIn, logout } = useAuthStore()

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="text-xl font-bold text-primary-700">
              我的个人网站
            </Link>

            <nav className="hidden md:flex space-x-8">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`text-sm font-medium transition-colors ${
                    location.pathname === item.path
                      ? 'text-primary-600'
                      : 'text-gray-600 hover:text-primary-600'
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </nav>

            <div className="flex items-center space-x-4">
              {isLoggedIn ? (
                <div className="flex items-center space-x-3">
                  <Link
                    to="/admin"
                    className="text-sm text-gray-600 hover:text-primary-600"
                  >
                    管理后台
                  </Link>
                  <button
                    onClick={logout}
                    className="text-sm text-gray-500 hover:text-red-600"
                  >
                    退出
                  </button>
                </div>
              ) : (
                <Link
                  to="/admin/login"
                  className="text-sm text-gray-600 hover:text-primary-600"
                >
                  登录
                </Link>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Nav */}
      <nav className="md:hidden bg-white border-t">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex space-x-4 overflow-x-auto py-3">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`text-xs font-medium whitespace-nowrap px-3 py-1 rounded-full ${
                  location.pathname === item.path
                    ? 'bg-primary-100 text-primary-700'
                    : 'text-gray-600'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-8">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <p className="text-sm">我的个人网站. All rights reserved.</p>
          <p className="text-xs mt-2 text-gray-500">Built with React + FastAPI</p>
        </div>
      </footer>
    </div>
  )
}
