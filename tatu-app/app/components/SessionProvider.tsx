'use client'

import { SessionProvider } from 'next-auth/react'
import { ReactNode } from 'react'

interface Props {
  children: ReactNode
}

export default function AuthProvider({ children }: Props) {
  return (
    <SessionProvider
      // Refetch session every 5 minutes
      refetchInterval={5 * 60}
      // Refetch session when window regains focus
      refetchOnWindowFocus={true}
      // Refetch session when network reconnects
      refetchWhenOffline={false}
    >
      {children}
    </SessionProvider>
  )
} 