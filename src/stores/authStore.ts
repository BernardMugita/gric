import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import { getMe, login as apiLogin } from '@/api/auth'
import { setAuthTokenGetter } from '@/api/client'
import type { Me } from '@/types/user'

type AuthStatus = 'idle' | 'loading' | 'authenticated' | 'unauthenticated'

interface AuthState {
  token: string | null
  user: Me | null
  status: AuthStatus
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  /** Re-derives `user` from a persisted token on app start (RequireAuth calls this lazily). */
  hydrate: () => Promise<void>
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      token: null,
      user: null,
      status: 'idle',

      async login(email, password) {
        set({ status: 'loading' })
        const { data } = await apiLogin(email, password)
        set({ token: data.token, user: data.user, status: 'authenticated' })
      },

      logout() {
        set({ token: null, user: null, status: 'unauthenticated' })
      },

      async hydrate() {
        if (get().status !== 'idle') return
        const token = get().token
        if (!token) {
          set({ status: 'unauthenticated' })
          return
        }
        set({ status: 'loading' })
        try {
          const { data } = await getMe()
          set({ user: data, status: 'authenticated' })
        } catch {
          set({ token: null, user: null, status: 'unauthenticated' })
        }
      },
    }),
    {
      name: 'gric-auth',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ token: state.token }),
    },
  ),
)

// The API client has no React context of its own — this is the one place
// it reaches into the store to attach the current token to every request.
setAuthTokenGetter(() => useAuthStore.getState().token)
