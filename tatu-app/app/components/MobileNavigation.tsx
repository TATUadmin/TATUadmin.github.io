'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  HomeIcon,
  MagnifyingGlassIcon,
  CalendarIcon,
  UserCircleIcon,
  Bars3Icon
} from '@heroicons/react/24/outline'
import {
  HomeIcon as HomeSolid,
  MagnifyingGlassIcon as MagnifyingGlassSolid,
  CalendarIcon as CalendarSolid,
  UserCircleIcon as UserCircleSolid
} from '@heroicons/react/24/solid'

interface NavItem {
  name: string
  href: string
  icon: any
  iconSolid: any
}

const navigation: NavItem[] = [
  { name: 'Home', href: '/', icon: HomeIcon, iconSolid: HomeSolid },
  { name: 'Explore', href: '/explore', icon: MagnifyingGlassIcon, iconSolid: MagnifyingGlassSolid },
  { name: 'Bookings', href: '/bookings', icon: CalendarIcon, iconSolid: CalendarSolid },
  { name: 'Profile', href: '/profile', icon: UserCircleIcon, iconSolid: UserCircleSolid },
]

export default function MobileNavigation() {
  const pathname = usePathname()

  // Hide mobile navigation on dashboard pages (they have their own navigation)
  if (pathname?.startsWith('/dashboard')) {
    return null
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-black/95 backdrop-blur-sm border-t border-gray-700/50 lg:hidden z-50 focus:outline-none shadow-2xl">
      <div className="flex items-center justify-around h-16 px-2">
        {navigation.map((item) => {
          const isActive = pathname === item.href
          const Icon = isActive ? item.iconSolid : item.icon
          
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex flex-col items-center justify-center flex-1 h-full transition-all duration-200 focus:outline-none focus:ring-0 rounded-lg mx-1 ${
                isActive 
                  ? 'bg-gray-800/50 border border-gray-600/30 shadow-lg' 
                  : 'hover:bg-gray-800/30 border border-transparent'
              }`}
            >
              <Icon className={`w-6 h-6 transition-colors duration-200 ${
                isActive ? 'text-white' : 'text-gray-400 hover:text-gray-300'
              }`} />
              <span className={`text-xs mt-1 transition-colors duration-200 ${
                isActive ? 'text-white font-medium' : 'text-gray-400 hover:text-gray-300'
              }`}>
                {item.name}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}

// Mobile Header Component
interface MobileHeaderProps {
  title: string
  showBack?: boolean
  onBack?: () => void
  action?: {
    icon: React.ReactNode
    onClick: () => void
  }
}

export function MobileHeader({ title, showBack, onBack, action }: MobileHeaderProps) {
  return (
    <header className="sticky top-0 z-40 bg-black/95 backdrop-blur-sm border-b border-gray-700/50 lg:hidden shadow-lg">
      <div className="flex items-center justify-between h-14 px-4">
        {showBack && onBack ? (
          <button
            onClick={onBack}
            className="p-2 hover:bg-gray-800/50 rounded-lg transition-all duration-200 focus:outline-none focus:ring-0 border border-transparent hover:border-gray-600/30"
          >
            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        ) : (
          <div className="w-10" />
        )}
        
        <h1 className="text-lg font-semibold text-white truncate">{title}</h1>
        
        {action ? (
          <button
            onClick={action.onClick}
            className="p-2 hover:bg-gray-800/50 rounded-lg transition-all duration-200 focus:outline-none focus:ring-0 border border-transparent hover:border-gray-600/30"
          >
            {action.icon}
          </button>
        ) : (
          <div className="w-10" />
        )}
      </div>
    </header>
  )
}

// Mobile Drawer Menu
interface MobileDrawerProps {
  isOpen: boolean
  onClose: () => void
  children: React.ReactNode
}

export function MobileDrawer({ isOpen, onClose, children }: MobileDrawerProps) {
  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}
      
      {/* Drawer */}
      <div
        className={`fixed inset-y-0 left-0 w-80 max-w-[85vw] bg-gray-950 border-r border-gray-900 z-50 transform transition-transform duration-300 lg:hidden ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between h-14 px-4 border-b border-gray-900">
            <h2 className="text-lg font-semibold text-white">Menu</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-900 rounded-lg transition-colors"
            >
              <svg className="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          {/* Content */}
          <div className="flex-1 overflow-y-auto">
            {children}
          </div>
        </div>
      </div>
    </>
  )
}

// Mobile Bottom Sheet
interface MobileBottomSheetProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  children: React.ReactNode
  snapPoints?: number[] // Percentage heights
}

export function MobileBottomSheet({ 
  isOpen, 
  onClose, 
  title, 
  children,
  snapPoints = [90]
}: MobileBottomSheetProps) {
  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}
      
      {/* Bottom Sheet */}
      <div
        className={`fixed inset-x-0 bottom-0 bg-gray-900 rounded-t-2xl z-50 transform transition-transform duration-300 lg:hidden ${
          isOpen ? 'translate-y-0' : 'translate-y-full'
        }`}
        style={{ maxHeight: `${snapPoints[0]}vh` }}
      >
        {/* Handle */}
        <div className="flex items-center justify-center py-3">
          <div className="w-10 h-1 bg-gray-700 rounded-full" />
        </div>
        
        {/* Header */}
        {title && (
          <div className="px-6 pb-4">
            <h2 className="text-lg font-semibold text-white">{title}</h2>
          </div>
        )}
        
        {/* Content */}
        <div className="overflow-y-auto px-6 pb-6" style={{ maxHeight: `${snapPoints[0] - 10}vh` }}>
          {children}
        </div>
      </div>
    </>
  )
}

// Mobile Tabs Component
interface MobileTab {
  id: string
  label: string
  icon?: React.ReactNode
}

interface MobileTabsProps {
  tabs: MobileTab[]
  activeTab: string
  onChange: (tabId: string) => void
}

export function MobileTabs({ tabs, activeTab, onChange }: MobileTabsProps) {
  return (
    <div className="flex border-b border-gray-800 overflow-x-auto scrollbar-hide">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className={`flex items-center space-x-2 px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors ${
            activeTab === tab.id
              ? 'text-white border-b-2 border-white'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          {tab.icon}
          <span>{tab.label}</span>
        </button>
      ))}
    </div>
  )
}

// Touch-friendly Button Component
interface TouchButtonProps {
  children: React.ReactNode
  onClick: () => void
  variant?: 'primary' | 'secondary' | 'outline'
  size?: 'sm' | 'md' | 'lg'
  fullWidth?: boolean
  disabled?: boolean
  className?: string
}

export function TouchButton({ 
  children, 
  onClick, 
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  disabled = false,
  className = ''
}: TouchButtonProps) {
  const variantClasses = {
    primary: 'bg-white text-black hover:bg-gray-200 active:bg-gray-300',
    secondary: 'bg-gray-800 text-white hover:bg-gray-700 active:bg-gray-600 border border-gray-700',
    outline: 'bg-transparent text-white border-2 border-white hover:bg-white/10 active:bg-white/20'
  }

  const sizeClasses = {
    sm: 'px-4 py-2 text-sm min-h-[40px]',
    md: 'px-6 py-3 text-base min-h-[48px]',
    lg: 'px-8 py-4 text-lg min-h-[56px]'
  }

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        ${variantClasses[variant]}
        ${sizeClasses[size]}
        ${fullWidth ? 'w-full' : ''}
        rounded-lg font-semibold transition-all duration-150
        disabled:opacity-50 disabled:cursor-not-allowed
        active:scale-[0.98]
        ${className}
      `}
    >
      {children}
    </button>
  )
}
