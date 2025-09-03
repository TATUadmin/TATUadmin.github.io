'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function AuthSignUpPage() {
  const router = useRouter()

  useEffect(() => {
    // Redirect to the main signup page
    router.replace('/signup')
  }, [router])

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center">
      <div className="text-center">
        <p className="text-gray-400">Redirecting to sign up...</p>
      </div>
    </div>
  )
} 