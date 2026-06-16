import { create } from 'zustand'
import api from './api'

export const useAuthStore = create((set) => ({
  user: null,
  loading: true,
  login: async (username, password) => {
    const { data } = await api.post('/auth/token/', { username, password })
    localStorage.setItem('access_token', data.access)
    localStorage.setItem('refresh_token', data.refresh)
    const me = await api.get('/accounts/me/')
    set({ user: me.data, loading: false })
    return me.data
  },
  logout: () => {
    localStorage.clear()
    set({ user: null })
  },
  loadUser: async () => {
    const t = localStorage.getItem('access_token')
    if (!t) { set({ loading: false }); return }
    try {
      const { data } = await api.get('/accounts/me/')
      set({ user: data, loading: false })
    } catch { set({ loading: false }) }
  },
}))
