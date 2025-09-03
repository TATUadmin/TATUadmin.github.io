'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function AuthSignInPage() {
  const router = useRouter()

  useEffect(() => {
    // Redirect to the main login page
    router.replace('/login')
  }, [router])

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center">
      <div className="text-center">
        <p className="text-gray-400">Redirecting to sign in...</p>
      </div>
    </div>
  )
} 