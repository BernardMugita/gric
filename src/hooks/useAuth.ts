import { useShallow } from 'zustand/react/shallow'
import { useAuthStore } from '@/stores/authStore'

export function useAuth() {
  return useAuthStore(
    useShallow((state) => ({
      user: state.user,
      status: state.status,
      isAuthenticated: state.status === 'authenticated',
      login: state.login,
      logout: state.logout,
    })),
  )
}
