import axios from 'axios'

const apiClient = axios.create({
  baseURL: '/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
})

// 请求拦截器 - 添加认证和反爬签名
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  // 反爬虫请求头
  const timestamp = Math.floor(Date.now() / 1000)
  config.headers['X-Request-Time'] = timestamp
  config.headers['X-Request-ID'] = crypto.randomUUID()

  return config
})

// 响应拦截器
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('access_token')
      window.location.href = '/admin/login'
    }
    return Promise.reject(error)
  }
)

export default apiClient
