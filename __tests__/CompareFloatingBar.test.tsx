
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import CompareFloatingBar from '@/app/components/CompareFloatingBar'
import { useCompare } from '@/app/context/CompareContext'

jest.mock('@/app/context/CompareContext', () => ({
  useCompare: jest.fn(),
}))

describe('CompareFloatingBar Component', () => {
  const mockRemoveFromCompare = jest.fn()
  const mockClearCompare = jest.fn()

  const mockProduct1 = {
    id: 1,
    title: 'Wireless Headphones',
    price: 99.99,
    category: 'Electronics',
    brand: 'AudioTech',
    thumbnail: 'https://example.com/headphones.jpg',
  }

  const mockProduct2 = {
    id: 2,
    title: 'Gaming Mouse',
    price: 49.99,
    category: 'Electronics',
    brand: 'LogiTech',
    thumbnail: 'https://example.com/mouse.jpg',
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders nothing when compareList is empty', () => {
    ; (useCompare as jest.Mock).mockReturnValue({
      compareList: [],
      removeFromCompare: mockRemoveFromCompare,
      clearCompare: mockClearCompare,
    })

    const { container } = render(<CompareFloatingBar />)
    expect(container).toBeEmptyDOMElement()
  })

  it('renders product chips and disables compare link when only 1 item is selected', () => {
    ; (useCompare as jest.Mock).mockReturnValue({
      compareList: [mockProduct1],
      removeFromCompare: mockRemoveFromCompare,
      clearCompare: mockClearCompare,
    })

    render(<CompareFloatingBar />)

    expect(screen.getByText('Compare Products (1/3)')).toBeInTheDocument()
    expect(screen.getByText('Select at least 2 products to compare')).toBeInTheDocument()
    expect(screen.getByText('Wireless Headphones')).toBeInTheDocument()

    const compareLink = screen.getByRole('link', { name: /Compare/i })
    expect(compareLink).toHaveAttribute('href', '/compare')
    expect(compareLink).toHaveClass('pointer-events-none')
  })

  it('enables compare link and updates copy when 2 or more items are selected', () => {
    ; (useCompare as jest.Mock).mockReturnValue({
      compareList: [mockProduct1, mockProduct2],
      removeFromCompare: mockRemoveFromCompare,
      clearCompare: mockClearCompare,
    })

    render(<CompareFloatingBar />)

    expect(screen.getByText('Compare Products (2/3)')).toBeInTheDocument()
    expect(screen.getByText('Ready to compare side-by-side')).toBeInTheDocument()
    expect(screen.getByText('Wireless Headphones')).toBeInTheDocument()
    expect(screen.getByText('Gaming Mouse')).toBeInTheDocument()

    const compareLink = screen.getByRole('link', { name: /Compare/i })
    expect(compareLink).not.toHaveClass('pointer-events-none')
  })

  it('calls removeFromCompare when item remove button is clicked', async () => {
    const user = userEvent.setup()
      ; (useCompare as jest.Mock).mockReturnValue({
        compareList: [mockProduct1],
        removeFromCompare: mockRemoveFromCompare,
        clearCompare: mockClearCompare,
      })

    render(<CompareFloatingBar />)

    const removeBtn = screen.getByRole('button', { name: /remove/i })
    await user.click(removeBtn)

    expect(mockRemoveFromCompare).toHaveBeenCalledWith(1)
  })

  it('calls clearCompare when Clear button is clicked', async () => {
    const user = userEvent.setup()
      ; (useCompare as jest.Mock).mockReturnValue({
        compareList: [mockProduct1, mockProduct2],
        removeFromCompare: mockRemoveFromCompare,
        clearCompare: mockClearCompare,
      })

    render(<CompareFloatingBar />)

    const clearBtn = screen.getByRole('button', { name: /clear/i })
    await user.click(clearBtn)

    expect(mockClearCompare).toHaveBeenCalledTimes(1)
  })
})
