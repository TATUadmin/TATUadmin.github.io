import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import PaymentForm from '@/app/components/PaymentForm'

// Mock the usePayment hook
jest.mock('@/lib/hooks/usePayment', () => ({
  usePayment: () => ({
    createPayment: jest.fn().mockResolvedValue({
      success: true,
      sessionUrl: 'https://checkout.stripe.com/test',
    }),
    isLoading: false,
  }),
}))

// Mock window.location
const mockLocation = {
  href: '',
}
Object.defineProperty(window, 'location', {
  value: mockLocation,
  writable: true,
})

describe('PaymentForm', () => {
  const defaultProps = {
    appointmentId: 'appointment_123',
    amount: 5000,
    type: 'CONSULTATION' as const,
    description: 'Test consultation',
    onSuccess: jest.fn(),
    onCancel: jest.fn(),
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should render payment form with correct amount', () => {
    render(<PaymentForm {...defaultProps} />)

    expect(screen.getByText('Payment Details')).toBeInTheDocument()
    expect(screen.getByText('$50.00')).toBeInTheDocument()
    expect(screen.getByText('Test consultation')).toBeInTheDocument()
  })

  it('should display payment method options', () => {
    render(<PaymentForm {...defaultProps} />)

    expect(screen.getByText('Payment Method')).toBeInTheDocument()
    expect(screen.getByText('Stripe Checkout (Recommended)')).toBeInTheDocument()
    expect(screen.getByText('Custom Form (Coming Soon)')).toBeInTheDocument()
  })

  it('should have Stripe Checkout selected by default', () => {
    render(<PaymentForm {...defaultProps} />)

    const stripeCheckoutRadio = screen.getByDisplayValue('checkout')
    expect(stripeCheckoutRadio).toBeChecked()
  })

  it('should show secure checkout notice for Stripe Checkout', () => {
    render(<PaymentForm {...defaultProps} />)

    expect(screen.getByText('Secure Checkout')).toBeInTheDocument()
    expect(
      screen.getByText(
        "You'll be redirected to Stripe's secure checkout page to complete your payment."
      )
    ).toBeInTheDocument()
  })

  it('should show coming soon notice for custom form', async () => {
    render(<PaymentForm {...defaultProps} />)

    const customFormRadio = screen.getByDisplayValue('card')
    await userEvent.click(customFormRadio)

    expect(screen.getByText('Custom Form')).toBeInTheDocument()
    expect(
      screen.getByText('This feature is coming soon. Please use Stripe Checkout for now.')
    ).toBeInTheDocument()
  })

  it('should disable custom form submit button', async () => {
    render(<PaymentForm {...defaultProps} />)

    const customFormRadio = screen.getByDisplayValue('card')
    await userEvent.click(customFormRadio)

    const submitButton = screen.getByText('Pay $50.00')
    expect(submitButton).toBeDisabled()
  })

  it('should call onCancel when cancel button is clicked', async () => {
    render(<PaymentForm {...defaultProps} />)

    const cancelButton = screen.getByText('Cancel')
    await userEvent.click(cancelButton)

    expect(defaultProps.onCancel).toHaveBeenCalledTimes(1)
  })

  it('should redirect to Stripe checkout when form is submitted', async () => {
    render(<PaymentForm {...defaultProps} />)

    const submitButton = screen.getByText('Pay $50.00')
    await userEvent.click(submitButton)

    await waitFor(() => {
      expect(mockLocation.href).toBe('https://checkout.stripe.com/test')
    })
  })

  it('should format different payment types correctly', () => {
    const depositProps = {
      ...defaultProps,
      type: 'DEPOSIT' as const,
      amount: 2500,
    }

    render(<PaymentForm {...depositProps} />)

    expect(screen.getByText('$25.00')).toBeInTheDocument()
  })

  it('should show security notice at bottom', () => {
    render(<PaymentForm {...defaultProps} />)

    expect(
      screen.getByText(
        'Your payment information is encrypted and secure. We use Stripe to process payments.'
      )
    ).toBeInTheDocument()
  })
})
