import { Inter } from 'next/font/google'
import { Toaster } from 'react-hot-toast'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import AuthProvider from './components/SessionProvider'
import './globals.css'
import { Toaster as UiToaster } from "@/components/ui/toaster"

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'TATU - Find Your Perfect Tattoo Artist',
  description: 'Discover and connect with talented tattoo artists in your area.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <div className="flex flex-col min-h-screen">
            <Navbar />
            <main className="flex-1">{children}</main>
            <Footer />
          </div>
          <Toaster />
          <UiToaster />
        </AuthProvider>
      </body>
    </html>
  )
}
