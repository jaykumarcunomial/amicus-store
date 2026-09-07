
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import DeleteProductDialog from '@/app/components/DeleteProductDialog'
import { deleteProduct } from '@/app/actions'

const mockPush = jest.fn()

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}))

jest.mock('@/app/actions', () => ({
  deleteProduct: jest.fn(),
}))

describe('DeleteProductDialog Component', () => {
  const defaultProps = {
    productId: 42,
    productTitle: 'Vintage Leather Jacket',
    isOpen: true,
    onClose: jest.fn(),
  }

  beforeEach(() => {
    jest.clearAllMocks()
    jest.useFakeTimers()
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  it('renders nothing when isOpen is false', () => {
    const { container } = render(
      <DeleteProductDialog {...defaultProps} isOpen={false} />
    )
    expect(container).toBeEmptyDOMElement()
  })

  it('renders dialog details and action buttons when open', () => {
    render(<DeleteProductDialog {...defaultProps} />)

    expect(screen.getByRole('heading', { name: /Delete Product #42\?/i })).toBeInTheDocument()
    expect(screen.getByText(/Vintage Leather Jacket/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Cancel/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Confirm Delete/i })).toBeInTheDocument()
  })

  it('calls onClose when Cancel button is clicked', async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime })
    render(<DeleteProductDialog {...defaultProps} />)

    const cancelButton = screen.getByRole('button', { name: /Cancel/i })
    await user.click(cancelButton)

    expect(defaultProps.onClose).toHaveBeenCalledTimes(1)
  })

  it('handles successful deletion by showing success message and navigating to home', async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime })
      ; (deleteProduct as jest.Mock).mockResolvedValueOnce({ success: true })

    render(<DeleteProductDialog {...defaultProps} />)

    const confirmButton = screen.getByRole('button', { name: /Confirm Delete/i })
    await user.click(confirmButton)

    expect(deleteProduct).toHaveBeenCalledWith(42)

    // Check success message is displayed
    await waitFor(() => {
      expect(screen.getByText(/Product deleted successfully/i)).toBeInTheDocument()
    })

    // Advance 1200ms timer
    jest.advanceTimersByTime(1200)

    expect(defaultProps.onClose).toHaveBeenCalledTimes(1)
    expect(mockPush).toHaveBeenCalledWith('/')
  })

  it('displays error message when delete action fails', async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime })
      ; (deleteProduct as jest.Mock).mockResolvedValueOnce({
        success: false,
        error: 'Product not found on server.',
      })

    render(<DeleteProductDialog {...defaultProps} />)

    const confirmButton = screen.getByRole('button', { name: /Confirm Delete/i })
    await user.click(confirmButton)

    await waitFor(() => {
      expect(screen.getByText('Product not found on server.')).toBeInTheDocument()
    })

    expect(defaultProps.onClose).not.toHaveBeenCalled()
    expect(mockPush).not.toHaveBeenCalled()
  })
})
