import { Inter } from 'next/font/google'
import { Toaster } from 'react-hot-toast'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import AuthProvider from './components/SessionProvider'
import MobileNavigation from './components/MobileNavigation'
import PWAInstallPrompt from './components/PWAInstallPrompt'
import MobilePerformanceMonitor from './components/MobilePerformanceMonitor'
import './globals.css'
import { Toaster as UiToaster } from "@/components/ui/toaster"

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'TATU - Find Your Perfect Tattoo Artist',
  description: 'Discover and connect with talented tattoo artists in your area.',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'TATU',
  },
  formatDetection: {
    telephone: false,
  },
  icons: {
    icon: [
      { url: '/icon-192x192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icon-512x512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#4f46e5',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {/* Simple black background */}
        <div 
          className="fixed inset-0 z-0 bg-black"
        />
        <AuthProvider>
          <div className="flex flex-col min-h-screen relative z-10">
            <Navbar />
            <MobileNavigation />
            <main className="flex-1">{children}</main>
            <Footer />
          </div>
          <PWAInstallPrompt />
          <MobilePerformanceMonitor />
          <Toaster />
          <UiToaster />
        </AuthProvider>
      </body>
    </html>
  )
}
