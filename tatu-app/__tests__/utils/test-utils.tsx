import { render, RenderOptions } from '@testing-library/react'
import { ReactElement } from 'react'
import { SessionProvider } from 'next-auth/react'

// Mock session for testing
const mockSession = {
  user: {
    id: 'test-user-id',
    email: 'test@example.com',
    name: 'Test User',
    role: 'CUSTOMER',
  },
  expires: '2024-12-31T23:59:59.999Z',
}

// Custom render function that includes providers
const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => {
  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <SessionProvider session={mockSession}>
      {children}
    </SessionProvider>
  )

  return render(ui, { wrapper: Wrapper, ...options })
}

// Mock API responses
export const mockApiResponse = (data: any, status = 200) => {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: () => Promise.resolve(data),
    text: () => Promise.resolve(JSON.stringify(data)),
  }
}

// Mock fetch for API calls
export const mockFetch = (responses: Array<{ url: string; response: any; status?: number }>) => {
  const mockResponses = new Map(
    responses.map(({ url, response, status = 200 }) => [url, { response, status }])
  )

  global.fetch = jest.fn().mockImplementation((url: string) => {
    const mockResponse = mockResponses.get(url)
    if (mockResponse) {
      return Promise.resolve(mockApiResponse(mockResponse.response, mockResponse.status))
    }
    return Promise.resolve(mockApiResponse({ error: 'Not found' }, 404))
  })
}

// Test data factories
export const createMockUser = (overrides = {}) => ({
  id: 'user-123',
  name: 'Test User',
  email: 'test@example.com',
  role: 'CUSTOMER',
  ...overrides,
})

export const createMockArtist = (overrides = {}) => ({
  id: 'artist-123',
  name: 'Test Artist',
  email: 'artist@example.com',
  role: 'ARTIST',
  bio: 'Professional tattoo artist',
  specialties: ['Traditional', 'Realism'],
  rating: 4.8,
  reviewCount: 25,
  ...overrides,
})

export const createMockAppointment = (overrides = {}) => ({
  id: 'appointment-123',
  startTime: '2024-02-15T10:00:00Z',
  endTime: '2024-02-15T12:00:00Z',
  status: 'PENDING',
  clientId: 'client-123',
  artistId: 'artist-123',
  serviceId: 'service-123',
  ...overrides,
})

export const createMockPayment = (overrides = {}) => ({
  id: 'payment-123',
  amount: 5000,
  currency: 'usd',
  status: 'PENDING',
  type: 'CONSULTATION',
  clientId: 'client-123',
  artistId: 'artist-123',
  appointmentId: 'appointment-123',
  ...overrides,
})

// Wait for async operations
export const waitForAsync = () => new Promise(resolve => setTimeout(resolve, 0))

// Mock WebSocket
export const mockWebSocket = () => {
  const mockWs = {
    close: jest.fn(),
    send: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    readyState: WebSocket.OPEN,
  }
  
  global.WebSocket = jest.fn(() => mockWs as any)
  return mockWs
}

// Re-export everything from testing library
export * from '@testing-library/react'
export { customRender as render }
