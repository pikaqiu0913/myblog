import { create } from 'zustand'

interface AuthState {
  isLoggedIn: boolean
  username: string | null
  login: (token: string, username: string) => void
  logout: () => void
  checkAuth: () => boolean
}

export const useAuthStore = create<AuthState>((set) => ({
  isLoggedIn: !!localStorage.getItem('access_token'),
  username: null,

  login: (token: string, username: string) => {
    localStorage.setItem('access_token', token)
    set({ isLoggedIn: true, username })
  },

  logout: () => {
    localStorage.removeItem('access_token')
    set({ isLoggedIn: false, username: null })
  },

  checkAuth: () => {
    const hasToken = !!localStorage.getItem('access_token')
    set({ isLoggedIn: hasToken })
    return hasToken
  },
}))
