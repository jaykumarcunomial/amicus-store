import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import CartDrawer from '@/app/components/CartDrawer'
import { useCart } from '@/app/context/CartContext'

jest.mock('@/app/context/CartContext', () => ({
  useCart: jest.fn(),
}))

jest.mock('next/link', () => {
  return ({ children, href, onClick, ...rest }: any) => {
    return (
      <a
        href={href}
        onClick={(e) => {
          e.preventDefault()
          if (onClick) onClick(e)
        }}
        {...rest}
      >
        {children}
      </a>
    )
  }
})


describe('CartDrawer Component', () => {
  const mockSetIsDrawerOpen = jest.fn()
  const mockUpdateQuantity = jest.fn()
  const mockRemoveFromCart = jest.fn()
  const mockClearCart = jest.fn()

  const sampleCartItems = [
    {
      id: 1,
      title: 'Espresso Maker',
      price: 120.0,
      quantity: 2,
      thumbnail: 'https://example.com/espresso.jpg',
    },
    {
      id: 2,
      title: 'Coffee Beans 1kg',
      price: 25.0,
      quantity: 1,
      thumbnail: 'https://example.com/beans.jpg',
    },
  ]

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders nothing when isDrawerOpen is false', () => {
    ; (useCart as jest.Mock).mockReturnValue({
      isDrawerOpen: false,
      cartItems: [],
      totalItems: 0,
      subtotal: 0,
      setIsDrawerOpen: mockSetIsDrawerOpen,
      updateQuantity: mockUpdateQuantity,
      removeFromCart: mockRemoveFromCart,
      clearCart: mockClearCart,
    })

    const { container } = render(<CartDrawer />)
    expect(container).toBeEmptyDOMElement()
  })

  it('renders empty cart view when cartItems is empty', async () => {
    const user = userEvent.setup()
      ; (useCart as jest.Mock).mockReturnValue({
        isDrawerOpen: true,
        cartItems: [],
        totalItems: 0,
        subtotal: 0,
        setIsDrawerOpen: mockSetIsDrawerOpen,
        updateQuantity: mockUpdateQuantity,
        removeFromCart: mockRemoveFromCart,
        clearCart: mockClearCart,
      })

    render(<CartDrawer />)

    expect(screen.getByText('Shopping Cart (0)')).toBeInTheDocument()
    expect(screen.getByText('Your cart is empty')).toBeInTheDocument()

    const continueShoppingBtn = screen.getByRole('button', { name: /Continue Shopping/i })
    await user.click(continueShoppingBtn)

    expect(mockSetIsDrawerOpen).toHaveBeenCalledWith(false)
  })

  it('renders cart items and summary when cart has items', () => {
    ; (useCart as jest.Mock).mockReturnValue({
      isDrawerOpen: true,
      cartItems: sampleCartItems,
      totalItems: 3,
      subtotal: 265.0,
      setIsDrawerOpen: mockSetIsDrawerOpen,
      updateQuantity: mockUpdateQuantity,
      removeFromCart: mockRemoveFromCart,
      clearCart: mockClearCart,
    })

    render(<CartDrawer />)

    expect(screen.getByText('Shopping Cart (3)')).toBeInTheDocument()
    expect(screen.getByText('Espresso Maker')).toBeInTheDocument()
    expect(screen.getByText('Coffee Beans 1kg')).toBeInTheDocument()
    expect(screen.getByText('$265.00')).toBeInTheDocument()
  })

  it('triggers updateQuantity on increment and decrement', async () => {
    const user = userEvent.setup()
      ; (useCart as jest.Mock).mockReturnValue({
        isDrawerOpen: true,
        cartItems: [sampleCartItems[0]],
        totalItems: 2,
        subtotal: 240.0,
        setIsDrawerOpen: mockSetIsDrawerOpen,
        updateQuantity: mockUpdateQuantity,
        removeFromCart: mockRemoveFromCart,
        clearCart: mockClearCart,
      })

    const { container } = render(<CartDrawer />)

    // The quantity buttons are inside the item's quantity selector container
    const quantityContainer = container.querySelector('.border-gray-300')
    const buttons = quantityContainer ? quantityContainer.querySelectorAll('button') : []
    const minusBtn = buttons[0]
    const plusBtn = buttons[1]

    expect(minusBtn).toBeDefined()
    expect(plusBtn).toBeDefined()

    await user.click(minusBtn)
    expect(mockUpdateQuantity).toHaveBeenCalledWith(1, 1) // current qty is 2, 2 - 1 = 1

    await user.click(plusBtn)
    expect(mockUpdateQuantity).toHaveBeenCalledWith(1, 3) // current qty is 2, 2 + 1 = 3
  })

  it('triggers removeFromCart and clearCart', async () => {
    const user = userEvent.setup()
      ; (useCart as jest.Mock).mockReturnValue({
        isDrawerOpen: true,
        cartItems: sampleCartItems,
        totalItems: 3,
        subtotal: 265.0,
        setIsDrawerOpen: mockSetIsDrawerOpen,
        updateQuantity: mockUpdateQuantity,
        removeFromCart: mockRemoveFromCart,
        clearCart: mockClearCart,
      })

    render(<CartDrawer />)

    const removeButtons = screen.getAllByTitle('Remove item')
    await user.click(removeButtons[0])
    expect(mockRemoveFromCart).toHaveBeenCalledWith(1)

    const clearButton = screen.getByRole('button', { name: /Clear/i })
    await user.click(clearButton)
    expect(mockClearCart).toHaveBeenCalledTimes(1)
  })

  it('closes drawer when navigating to checkout link', async () => {
    const user = userEvent.setup()
      ; (useCart as jest.Mock).mockReturnValue({
        isDrawerOpen: true,
        cartItems: sampleCartItems,
        totalItems: 3,
        subtotal: 265.0,
        setIsDrawerOpen: mockSetIsDrawerOpen,
        updateQuantity: mockUpdateQuantity,
        removeFromCart: mockRemoveFromCart,
        clearCart: mockClearCart,
      })

    render(<CartDrawer />)

    const checkoutLink = screen.getByRole('link', { name: /View Cart & Checkout/i })
    expect(checkoutLink).toHaveAttribute('href', '/cart')
    await user.click(checkoutLink)

    expect(mockSetIsDrawerOpen).toHaveBeenCalledWith(false)
  })
})
