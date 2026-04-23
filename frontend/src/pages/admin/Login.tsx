import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { authApi } from '@/api/auth'
import { useAuthStore } from '@/stores/authStore'

export default function Login() {
  const navigate = useNavigate()
  const { login } = useAuthStore()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [captchaId, setCaptchaId] = useState('')
  const [captchaCode, setCaptchaCode] = useState('')
  const [captchaImage, setCaptchaImage] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const fetchCaptcha = async () => {
    try {
      const res = await authApi.getCaptcha()
      if (res.data.data) {
        setCaptchaId(res.data.data.captcha_id)
        setCaptchaImage(res.data.data.captcha_image)
      }
    } catch {
      setError('Failed to load captcha')
    }
  }

  useEffect(() => {
    fetchCaptcha()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const res = await authApi.login({ username, password, captcha_id: captchaId, captcha_code: captchaCode })
      if (res.data.data) {
        login(res.data.data.access_token, username)
        navigate('/admin')
      }
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Login failed')
      fetchCaptcha()
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-md">
        <h1 className="text-2xl font-bold text-center text-gray-900 mb-2">管理员登录</h1>
        <p className="text-gray-500 text-center text-sm mb-8">请输入您的账号信息</p>

        {error && (
          <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">用户名</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">密码</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">验证码</label>
            <div className="flex gap-3">
              <input
                type="text"
                value={captchaCode}
                onChange={(e) => setCaptchaCode(e.target.value)}
                className="flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                placeholder="输入验证码"
                required
              />
              {captchaImage && (
                <img
                  src={captchaImage}
                  alt="captcha"
                  className="h-10 cursor-pointer rounded border"
                  onClick={fetchCaptcha}
                />
              )}
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary-600 text-white py-2.5 rounded-lg font-medium hover:bg-primary-700 transition disabled:opacity-50"
          >
            {loading ? '登录中...' : '登录'}
          </button>
        </form>
      </div>
    </div>
  )
}
