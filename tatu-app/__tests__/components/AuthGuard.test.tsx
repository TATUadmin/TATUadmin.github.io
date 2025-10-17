import { render, screen, waitFor } from '@testing-library/react'
import { useSession } from 'next-auth/react'
import AuthGuard from '@/app/components/AuthGuard'

// Mock Next.js router
const mockPush = jest.fn()
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}))

// Mock NextAuth
jest.mock('next-auth/react', () => ({
  useSession: jest.fn(),
}))

const mockUseSession = useSession as jest.MockedFunction<typeof useSession>

describe('AuthGuard', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should render children when user is authenticated', () => {
    mockUseSession.mockReturnValue({
      data: {
        user: {
          id: 'user_123',
          email: 'test@example.com',
          name: 'Test User',
          role: 'CUSTOMER',
        },
      },
      status: 'authenticated',
    })

    render(
      <AuthGuard>
        <div>Protected Content</div>
      </AuthGuard>
    )

    expect(screen.getByText('Protected Content')).toBeInTheDocument()
  })

  it('should redirect to login when user is not authenticated', async () => {
    mockUseSession.mockReturnValue({
      data: null,
      status: 'unauthenticated',
    })

    render(
      <AuthGuard>
        <div>Protected Content</div>
      </AuthGuard>
    )

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/login')
    })
  })

  it('should show loading state while session is loading', () => {
    mockUseSession.mockReturnValue({
      data: null,
      status: 'loading',
    })

    render(
      <AuthGuard>
        <div>Protected Content</div>
      </AuthGuard>
    )

    expect(screen.getByText('Loading...')).toBeInTheDocument()
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument()
  })

  it('should redirect to dashboard when user does not have required role', async () => {
    mockUseSession.mockReturnValue({
      data: {
        user: {
          id: 'user_123',
          email: 'test@example.com',
          name: 'Test User',
          role: 'CUSTOMER',
        },
      },
      status: 'authenticated',
    })

    render(
      <AuthGuard requiredRole="ADMIN">
        <div>Admin Content</div>
      </AuthGuard>
    )

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/dashboard')
    })
  })

  it('should render children when user has required role', () => {
    mockUseSession.mockReturnValue({
      data: {
        user: {
          id: 'user_123',
          email: 'test@example.com',
          name: 'Test User',
          role: 'ADMIN',
        },
      },
      status: 'authenticated',
    })

    render(
      <AuthGuard requiredRole="ADMIN">
        <div>Admin Content</div>
      </AuthGuard>
    )

    expect(screen.getByText('Admin Content')).toBeInTheDocument()
  })

  it('should render fallback when user does not have required role', () => {
    mockUseSession.mockReturnValue({
      data: {
        user: {
          id: 'user_123',
          email: 'test@example.com',
          name: 'Test User',
          role: 'CUSTOMER',
        },
      },
      status: 'authenticated',
    })

    const fallback = <div>Access Denied</div>

    render(
      <AuthGuard requiredRole="ADMIN" fallback={fallback}>
        <div>Admin Content</div>
      </AuthGuard>
    )

    expect(screen.getByText('Access Denied')).toBeInTheDocument()
    expect(screen.queryByText('Admin Content')).not.toBeInTheDocument()
  })
})
