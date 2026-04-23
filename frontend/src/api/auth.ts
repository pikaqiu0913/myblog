import apiClient from './client'

export interface LoginData {
  username: string
  password: string
  captcha_id: string
  captcha_code: string
}

export interface TokenData {
  access_token: string
  refresh_token: string
  token_type: string
  expires_in: number
}

export const authApi = {
  getCaptcha: () => apiClient.get('/auth/captcha'),
  login: (data: LoginData) => apiClient.post('/auth/login', data),
  logout: () => {
    localStorage.removeItem('access_token')
  },
}
