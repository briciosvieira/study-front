import { create } from 'zustand'
import type { User } from '@/shared/types/api.types'

interface AuthState {
  accessToken: string | null
  user: User | null
  setSession: (accessToken: string, user: User) => void
  setAccessToken: (accessToken: string) => void
  clearSession: () => void
}

// Access token lives only in memory (never localStorage) to shrink the XSS
// attack surface — the refresh token is an httpOnly cookie the browser
// manages on its own, invisible to any JS running on the page.
export const useAuthStore = create<AuthState>((set) => ({
  accessToken: null,
  user: null,
  setSession: (accessToken, user) => set({ accessToken, user }),
  setAccessToken: (accessToken) => set({ accessToken }),
  clearSession: () => set({ accessToken: null, user: null }),
}))
