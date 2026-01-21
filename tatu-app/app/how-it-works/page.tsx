'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function HowItWorksRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/about');
  }, [router]);

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center">
      <p className="text-gray-400">Redirecting...</p>
    </div>
  );
}
